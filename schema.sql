-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  auth_id uuid references auth.users(id) unique, -- Links to Supabase Auth; UNIQUE so one auth user can't hold multiple profile rows
  email text not null unique,
  name text not null,
  -- 'client' (English, lowercase) is intentional and distinct from the
  -- Arabic office-staff roles: it's how src/views/PortalManagement.tsx and
  -- ClientPortal.tsx tag client-portal accounts, which never go through
  -- the main dashboard's UserRole/hasPermission() system — they're routed
  -- straight to the client-only portal view instead.
  role text check (role in ('مدير مكتب', 'محامي شريك', 'محامي مستشار', 'محامي متدرب', 'مساعد إداري', 'client')),
  avatar_url text,
  tenant_id uuid, -- For multi-tenancy
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLIENTS TABLE
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid,
  type text check (type in ('فرد', 'منشأة')) not null,
  name text not null,
  national_id text,
  commercial_registration text,
  vat_number text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CASES TABLE
create table public.cases (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid,
  client_id uuid references public.clients(id) on delete cascade not null,
  client_role text check (client_role in ('مدعي', 'مدعى عليه')),
  workflow_stage text,
  court text not null, -- Stores CourtType value
  circuit text,
  title text,
  automated_number text,
  circulation_code text,
  archive_code text,
  type text check (type in ('تجاري', 'عمالي', 'عام', 'جزائي', 'أحوال شخصية', 'إداري')) not null,
  plaintiff text not null,
  defendant text not null,
  power_of_attorney_ref text,
  status text check (status in ('متداولة', 'مغلقة', 'تحت الدراسة', 'محفوظة')) not null,
  external_platform_ref text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Setup
-- Enabled here, but the actual policies are defined in rls-policies.sql —
-- always run that file right after this one. (This file used to also create
-- "Enable read access for authenticated users" policies scoped to nothing but
-- auth.role() = 'authenticated', i.e. any signed-in user could read every
-- tenant's users/clients/cases. Removed: real tenant-scoped policies belong
-- in rls-policies.sql only, so there's no window where the permissive
-- policies are active without the strict ones.)
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.cases enable row level security;

-- =====================================================================
-- MIGRATION 001 — core fixes (idempotent, safe to re-run on the 3-table
-- DB above or on a fresh database). See docs/qa/review-2026/P3-database.md
-- for the findings this addresses.
-- =====================================================================

-- Soft delete: legal records must never be hard-deleted (audit/compliance
-- requirement). Application code (server.ts, legalDataService.ts) sets
-- deleted_at instead of issuing DELETE, and every SELECT filters it out.
alter table public.users add column if not exists deleted_at timestamptz;
alter table public.clients add column if not exists deleted_at timestamptz;
alter table public.cases add column if not exists deleted_at timestamptz;

-- Deleting a client used to cascade-delete every one of their cases
-- (on delete cascade), wiping financial/legal audit trails. Replaced with
-- restrict: a client with cases can only be soft-deleted, never hard-deleted.
alter table public.cases drop constraint if exists cases_client_id_fkey;
alter table public.cases add constraint cases_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete restrict;

-- Case.memorandums (src/types/case.ts) was never persisted — the column
-- didn't exist, so saveCases()/mapCaseRow() silently dropped it.
alter table public.cases add column if not exists memorandums jsonb not null default '[]'::jsonb;

-- Same gap for Case.najizReferenceStatus (used by src/views/Cases.tsx,
-- NewCaseDialog.tsx, useCases.ts) — never had a column, so it was lost on
-- every save/reload round-trip through Supabase.
alter table public.cases add column if not exists najiz_reference_status text
  check (najiz_reference_status in ('مربوط بناجز', 'غير مربوط'));

-- The manually-entered case file reference (e.g. "45-123-ت") used to be
-- stored directly in the uuid `id` column via NewCaseDialog.tsx, which
-- fails against a uuid column — every case creation was silently broken.
alter table public.cases add column if not exists case_reference text;
create index if not exists idx_cases_case_reference on public.cases (tenant_id, case_reference);

-- Blind-index columns for searching encrypted PII (national_id,
-- commercial_registration, vat_number are stored client-side-encrypted and
-- unsearchable as-is). The app computes a deterministic HMAC-SHA256 of the
-- plaintext (see src/lib/encryption.ts: hashForSearch) and searches this
-- column instead of the encrypted value.
alter table public.clients add column if not exists national_id_hash text;
alter table public.clients add column if not exists commercial_registration_hash text;
alter table public.clients add column if not exists vat_number_hash text;
create index if not exists idx_clients_national_id_hash on public.clients (national_id_hash);
create index if not exists idx_clients_commercial_registration_hash on public.clients (commercial_registration_hash);
create index if not exists idx_clients_vat_number_hash on public.clients (vat_number_hash);

-- Indexes P3 flagged as missing on the columns every RLS policy filters by.
create index if not exists idx_users_tenant_id on public.users (tenant_id);
create index if not exists idx_users_auth_id on public.users (auth_id);
create index if not exists idx_clients_tenant_id on public.clients (tenant_id);
create index if not exists idx_cases_tenant_id on public.cases (tenant_id);
create index if not exists idx_cases_client_id on public.cases (client_id);
create index if not exists idx_cases_status on public.cases (status);

-- users.tenant_id was nullable with no uniqueness guarantee tying a tenant
-- to its owning row; team-member fields let `users` double as the `team`
-- table the frontend expects (TeamMember = UserProfile + these fields)
-- instead of a separate, duplicated table.
alter table public.users add column if not exists active_cases integer not null default 0;
alter table public.users add column if not exists pending_tasks integer not null default 0;
alter table public.users add column if not exists completed_tasks integer not null default 0;
alter table public.users add column if not exists join_date date not null default current_date;
alter table public.users add column if not exists status text not null default 'نشط'
  check (status in ('نشط', 'في إجازة', 'غير نشط'));

-- Client-portal accounts (role = 'client') link back to the client record
-- they represent; PortalManagement.tsx/ClientPortal.tsx read/write this.
alter table public.users add column if not exists linked_client_id uuid references public.clients(id) on delete cascade;

-- =====================================================================
-- MIGRATION 002 — the remaining ~35 business tables documented in
-- README.md but never created (P3-database.md, Critical finding #1).
-- All of them: tenant-scoped (tenant_id not null), RLS'd identically in
-- rls-policies.sql, indexed on tenant_id. Nested list fields that the
-- frontend already treats as embedded arrays on the parent object
-- (actions/orders/assets/versions/approvals/obligations/checklist/steps)
-- are stored as jsonb rather than normalized into another 15 join tables —
-- matches the existing data shape in src/types/*.ts and keeps this
-- migration reviewable; can be normalized later if querying inside them
-- becomes a real need.
-- =====================================================================

-- ---------- Finance ----------
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  -- Human-readable ZATCA-style number (e.g. INV-2609-0001), separate from
  -- the uuid id — the frontend used to use that display string AS the id,
  -- which fails against this uuid column (P4-report finding).
  invoice_number text,
  client_id uuid references public.clients(id) on delete restrict,
  client_name text not null,
  base numeric(14,2) not null check (base >= 0),
  vat numeric(14,2) not null check (vat >= 0),
  total numeric(14,2) not null check (total >= 0),
  status text not null check (status in ('مدفوعة', 'غير مدفوعة', 'مسودة')),
  date timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_invoices_invoice_number on public.invoices (tenant_id, invoice_number);

create table if not exists public.expenses (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete set null,
  case_name text,
  category text not null check (category in ('رسوم قضائية', 'أتعاب خبراء', 'تنقلات', 'أخرى')),
  amount numeric(14,2) not null check (amount >= 0),
  date timestamptz not null default now(),
  status text not null check (status in ('تم السداد', 'معلق', 'مسترد من العميل')),
  description text
);

create table if not exists public.time_entries (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  lawyer_id uuid references public.users(id) on delete set null,
  case_id uuid references public.cases(id) on delete set null,
  description text,
  duration integer not null check (duration >= 0), -- minutes
  date timestamptz not null default now(),
  is_billed boolean not null default false
);

create table if not exists public.trust_accounts (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  client_id uuid references public.clients(id) on delete restrict,
  client_name text not null,
  case_id uuid references public.cases(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  type text not null check (type in ('أمانة', 'مقدم أتعاب', 'مبلغ تنفيذ')),
  status text not null check (status in ('نشط', 'تم الصرف', 'مسترد')),
  description text,
  date timestamptz not null default now()
);

create table if not exists public.pricing_models (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  type text not null check (type in ('ساعة', 'مقطوع', 'شهري', 'مرحلي')),
  rate numeric(14,2),
  retainer_amount numeric(14,2),
  description text,
  phases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.receivable_accounts (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete set null,
  client_id uuid references public.clients(id) on delete restrict,
  client_name text not null,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  collected_amount numeric(14,2) not null default 0 check (collected_amount >= 0),
  outstanding_amount numeric(14,2) not null check (outstanding_amount >= 0),
  due_date timestamptz not null,
  status text not null check (status in ('مفتوح', 'متأخر', 'تحت التحصيل', 'مسوى', 'مغلق')),
  is_reconciled boolean not null default false,
  actions jsonb not null default '[]'::jsonb,
  payment_plan jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Enforcement ----------
create table if not exists public.enforcement_cases (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  file_number text not null,
  source text not null check (source in ('قضية_مكتب', 'حكم_خارجي')),
  case_id uuid references public.cases(id) on delete set null,
  client_id uuid references public.clients(id) on delete restrict,
  client_name text not null,
  debtor_name text not null,
  amount_claimed numeric(14,2) not null check (amount_claimed >= 0),
  amount_collected numeric(14,2) not null default 0 check (amount_collected >= 0),
  status text not null check (status in ('مفتوح', 'تحت إجراء 46', 'حجز/منع', 'محصل جزئي', 'مغلق')),
  stage_deadline timestamptz,
  execution_type text not null check (execution_type in ('حكم قضائي', 'شيك', 'كمبيالة', 'عقد موثق', 'محضر صلح', 'أخرى')),
  judgment_number text,
  judgment_date timestamptz,
  judgment_court text,
  linked_case_id uuid references public.cases(id) on delete set null,
  linked_case_ref text,
  actions jsonb not null default '[]'::jsonb,
  orders jsonb not null default '[]'::jsonb,
  assets jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, file_number)
);

-- ---------- Compliance / GRC ----------
create table if not exists public.risk_registers (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  category text not null check (category in ('تشغيلي', 'قانوني', 'تقني', 'مالي', 'امتثال')),
  severity text not null check (severity in ('High', 'Medium', 'Low')),
  status text not null check (status in ('مفتوح', 'قيد المعالجة', 'مغلق')),
  owner_id uuid references public.users(id) on delete set null,
  mitigation_plan text,
  due_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.controls (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  control_type text not null check (control_type in ('وقائي', 'كاشف', 'تصحيحي')),
  owner_id uuid references public.users(id) on delete set null,
  frequency text not null check (frequency in ('يومي', 'أسبوعي', 'شهري', 'ربع سنوي')),
  status text not null check (status in ('فعال', 'بحاجة تحسين', 'متوقف')),
  last_review_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_issues (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  description text,
  severity text not null check (severity in ('High', 'Medium', 'Low')),
  status text not null check (status in ('جديد', 'قيد المعالجة', 'مغلق')),
  owner_id uuid references public.users(id) on delete set null,
  due_date timestamptz,
  evidence_urls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.regulatory_obligations (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  regulator text not null,
  due_date timestamptz not null,
  status text not null check (status in ('ملتزم', 'قريب الاستحقاق', 'متأخر')),
  owner_id uuid references public.users(id) on delete set null,
  notes text
);

create table if not exists public.compliance_records (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  type text not null check (type in ('سجل تجاري', 'ترخيص استثمار', 'شهادة زكاة', 'أخرى')),
  expiry_date timestamptz not null,
  status text not null check (status in ('ساري', 'منتهي', 'قريب الانتهاء')),
  reminder_days integer not null default 30
);

create table if not exists public.legal_precedents (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  category text,
  summary text,
  tags jsonb not null default '[]'::jsonb,
  file_url text,
  date timestamptz not null default now()
);

create table if not exists public.qa_reviews (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete set null,
  document_id uuid,
  reviewer_id uuid references public.users(id) on delete set null,
  status text not null check (status in ('Pending', 'Approved', 'Rejected', 'RequiresChanges')),
  checklist jsonb not null default '[]'::jsonb,
  overall_comment text,
  completed_at timestamptz,
  partner_override boolean not null default false
);

create table if not exists public.conflict_check_records (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  query text not null,
  checked_at timestamptz not null default now(),
  checked_by text,
  status text not null check (status in ('Clear', 'DirectConflict', 'IndirectConflict', 'Waived')),
  matches jsonb not null default '[]'::jsonb,
  resolution_notes text,
  resolution_date timestamptz,
  resolved_by text
);

create table if not exists public.knowledge_assets (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  category text not null check (category in ('Research', 'Precedent', 'Procedure', 'Template')),
  tags jsonb not null default '[]'::jsonb,
  content_url text,
  version integer not null default 1,
  author_id uuid references public.users(id) on delete set null,
  is_verified boolean not null default false,
  verified_by text,
  linked_case_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.specialized_tracks (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete cascade,
  case_type text not null check (case_type in ('عمالي', 'جزائي')),
  stage text not null,
  sla_due_at timestamptz,
  status text not null check (status in ('نشط', 'متأخر', 'مغلق')),
  checklist jsonb not null default '[]'::jsonb,
  document_templates jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.training_pathways (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  modules jsonb not null default '[]'::jsonb,
  mentor_id uuid references public.users(id) on delete set null,
  overall_progress integer not null default 0 check (overall_progress between 0 and 100),
  start_date timestamptz not null default now(),
  end_date timestamptz
);

create table if not exists public.ksa_assessments (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  pathway_id uuid references public.training_pathways(id) on delete cascade,
  title text not null,
  questions jsonb not null default '[]'::jsonb,
  passing_score integer not null default 60,
  user_score integer,
  is_passed boolean
);

-- ---------- Contract Lifecycle Management (CLM) ----------
create table if not exists public.contract_requests (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  client_name text not null,
  stage text not null check (stage in ('طلب', 'تفاوض', 'مراجعة', 'اعتماد', 'توقيع', 'متابعة التزامات', 'تجديد/إنهاء')),
  status text not null check (status in ('مسودة', 'قيد التنفيذ', 'معتمد', 'موقع', 'مغلق')),
  created_by text,
  created_at timestamptz not null default now(),
  renewal_date timestamptz,
  versions jsonb not null default '[]'::jsonb,
  approvals jsonb not null default '[]'::jsonb,
  obligations jsonb not null default '[]'::jsonb
);

create table if not exists public.contract_templates (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  description text,
  content text,
  category text not null check (category in ('تجاري', 'عمالي', 'عقاري', 'أحوال شخصية'))
);

create table if not exists public.rfp_submissions (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  proposal_id uuid,
  authority text not null,
  deadline timestamptz not null,
  submission_date timestamptz,
  requirements jsonb not null default '[]'::jsonb,
  status text not null check (status in ('تحت الإعداد', 'تم التقديم', 'مستبعد', 'فوز'))
);

create table if not exists public.esignature_requests (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  document_name text not null,
  recipient_name text not null,
  recipient_email text not null,
  status text not null check (status in ('بانتظار التوقيع', 'تم التوقيع', 'منتهي الصلاحية')),
  sent_date timestamptz not null default now(),
  signed_date timestamptz
);

-- ---------- Intellectual Property ----------
create table if not exists public.ip_records (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  type text not null check (type in ('علامة تجارية', 'براءة اختراع', 'حق مؤلف')),
  owner text not null,
  registration_number text,
  expiry_date timestamptz,
  status text not null check (status in ('مسجلة', 'تحت الفحص', 'منتهية'))
);

create table if not exists public.ip_filings (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  ip_record_id uuid references public.ip_records(id) on delete cascade,
  client_name text not null,
  type text not null check (type in ('علامة تجارية', 'براءة اختراع', 'حق مؤلف')),
  filing_date timestamptz not null default now(),
  authority text,
  status text not null check (status in ('قيد التقديم', 'قيد الفحص', 'مقبول', 'مرفوض')),
  fee_amount numeric(14,2),
  document_urls jsonb not null default '[]'::jsonb
);

create table if not exists public.ip_renewals (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  ip_record_id uuid references public.ip_records(id) on delete cascade,
  due_date timestamptz not null,
  status text not null check (status in ('قادم', 'مكتمل', 'متأخر')),
  fee_amount numeric(14,2),
  paid boolean not null default false,
  receipt_url text
);

create table if not exists public.ip_oppositions (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  ip_record_id uuid references public.ip_records(id) on delete cascade,
  against_party text not null,
  reason text,
  filed_at timestamptz not null default now(),
  status text not null check (status in ('مسجل', 'قيد النظر', 'محسوم')),
  document_urls jsonb not null default '[]'::jsonb
);

create table if not exists public.ip_enforcement_actions (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  ip_record_id uuid references public.ip_records(id) on delete cascade,
  action_type text not null check (action_type in ('إنذار', 'دعوى', 'تسوية', 'تنفيذ حكم')),
  description text,
  action_date timestamptz not null default now(),
  status text not null check (status in ('مفتوح', 'قيد المتابعة', 'مغلق')),
  fee_amount numeric(14,2),
  document_urls jsonb not null default '[]'::jsonb
);

-- ---------- Team / Tasks ----------
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete cascade,
  title text not null,
  assigned_to uuid references public.users(id) on delete set null,
  due_date timestamptz,
  status text not null check (status in ('pending', 'completed')) default 'pending',
  priority text not null check (priority in ('low', 'medium', 'high')) default 'medium'
);

-- ---------- CRM ----------
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  name text not null,
  phone text,
  email text,
  source text not null check (source in ('موقع إلكتروني', 'توصية', 'وسائل تواصل', 'أخرى')),
  interest text,
  status text not null check (status in ('جديد', 'قيد التواصل', 'تم تحديد موعد', 'تحول لعميل', 'مستبعد')),
  created_at timestamptz not null default now()
);

create table if not exists public.key_accounts (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  client_id uuid references public.clients(id) on delete cascade,
  account_manager_id uuid references public.users(id) on delete set null,
  strategic_value text not null check (strategic_value in ('High', 'Medium', 'Low')),
  industry text,
  annual_target_revenue numeric(14,2) not null default 0,
  current_pipe_value numeric(14,2) not null default 0,
  growth_plan text,
  notes text
);

create table if not exists public.proposals (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  key_account_id uuid references public.key_accounts(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  status text not null check (status in ('مسودة', 'مرسلة', 'قيد التفاوض', 'مقبولة', 'مرفوضة', 'ملغاة')),
  value numeric(14,2) not null default 0,
  pricing_model_id uuid references public.pricing_models(id) on delete set null,
  valid_until timestamptz,
  assigned_lawyer_id uuid references public.users(id) on delete set null,
  win_probability integer not null default 0 check (win_probability between 0 and 100),
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Misc platform tables ----------
create table if not exists public.documents (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete cascade,
  name text not null,
  url text not null,
  -- Free text: user-entered document type in the upload dialog, not a fixed taxonomy.
  type text not null,
  storage_path text,
  size_bytes bigint,
  uploaded_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('info', 'warning', 'success', 'error')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.office_settings (
  tenant_id uuid primary key,
  name text not null,
  vat_number text,
  address text,
  phone text,
  email text,
  logo text
);

-- Append-only audit trail: no update/delete policy is granted below on
-- purpose (see rls-policies.sql) — rows are permanent once written.
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  user_id uuid references public.users(id) on delete set null,
  user_name text,
  action text not null,
  module text not null,
  details text,
  ip_address text,
  timestamp timestamptz not null default now()
);

create table if not exists public.wiki_articles (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  content text not null,
  category text not null check (category in ('أبحاث', 'إجراءات', 'نماذج', 'أنظمة')),
  author text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wiki_articles_tenant on public.wiki_articles (tenant_id);

create table if not exists public.workflows (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  name text not null,
  description text,
  trigger text,
  steps jsonb not null default '[]'::jsonb,
  is_active boolean not null default true
);

create table if not exists public.advisory_requests (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  title text not null,
  client_name text,
  requested_by text,
  assigned_to text,
  status text not null check (status in ('جديد', 'قيد المراجعة', 'مسودة رأي', 'اعتماد شريك', 'مغلق')),
  priority text not null check (priority in ('منخفض', 'متوسط', 'عالي')),
  sla_due_at timestamptz,
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  opinions jsonb not null default '[]'::jsonb,
  approvals jsonb not null default '[]'::jsonb
);

create table if not exists public.sessions (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete cascade,
  case_name text,
  date timestamptz not null,
  time text,
  court text,
  notes text,
  status text not null check (status in ('قادمة', 'منتهية', 'مؤجلة'))
);

-- One row per tenant: current subscription plan/status, updated by the
-- Moyasar webhook handler in server.ts (never trust the client to report
-- its own payment as successful — see subscriptionService.ts history).
create table if not exists public.subscriptions (
  tenant_id uuid primary key,
  plan text not null check (plan in ('basic', 'advanced', 'enterprise')) default 'basic',
  status text not null check (status in ('active', 'trial', 'expired', 'cancelled')) default 'trial',
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')) default 'monthly',
  start_date timestamptz not null default now(),
  end_date timestamptz,
  moyasar_payment_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.deadlines (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid not null,
  case_id uuid references public.cases(id) on delete cascade,
  title text not null,
  date timestamptz not null,
  type text not null check (type in ('تقديم مذكرة', 'موعد جلسة', 'انتهاء مدة استئناف', 'أخرى')),
  status text not null check (status in ('pending', 'completed', 'overdue')) default 'pending',
  priority text not null check (priority in ('low', 'medium', 'high')) default 'medium'
);

