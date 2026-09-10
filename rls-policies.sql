-- =============================================
-- Row Level Security (RLS) Policies
-- منصة ملف (malaf.site)
-- =============================================
-- هذا الملف يُطبّق سياسات أمان صارمة على مستوى الصفوف
-- بحيث كل مكتب محاماة (Tenant) يرى بياناته فقط
-- =============================================

-- تأكيد UNIQUE على auth_id لمنع إنشاء أكثر من صف مستخدم لنفس حساب المصادقة
-- (مطلوب هنا بالإضافة إلى schema.sql لأن هذا الملف قد يُشغَّل على مشروع
-- Supabase تم إنشاء جدول users فيه بالفعل قبل هذا التعديل)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_auth_id_key'
  ) then
    alter table public.users add constraint users_auth_id_key unique (auth_id);
  end if;
end $$;

-- أولاً: دالة مساعدة لجلب tenant_id الخاص بالمستخدم الحالي
create or replace function public.get_my_tenant_id()
returns uuid
language sql
stable
security definer
as $$
  select tenant_id from public.users where auth_id = auth.uid() limit 1;
$$;

-- =============================================
-- 1. حذف جميع السياسات القديمة والجديدة (إن وُجدت)
-- =============================================
drop policy if exists "Enable read access for authenticated users" on public.users;
drop policy if exists "Enable read access for authenticated users" on public.clients;
drop policy if exists "Enable read access for authenticated users" on public.cases;
drop policy if exists "users_select_same_tenant" on public.users;
drop policy if exists "users_update_own_profile" on public.users;
drop policy if exists "users_insert_same_tenant" on public.users;
drop policy if exists "users_insert_own_profile" on public.users;
drop policy if exists "clients_select_same_tenant" on public.clients;
drop policy if exists "clients_insert_same_tenant" on public.clients;
drop policy if exists "clients_update_same_tenant" on public.clients;
drop policy if exists "clients_delete_same_tenant" on public.clients;
drop policy if exists "cases_select_same_tenant" on public.cases;
drop policy if exists "cases_insert_same_tenant" on public.cases;
drop policy if exists "cases_update_same_tenant" on public.cases;
drop policy if exists "cases_delete_same_tenant" on public.cases;

-- =============================================
-- 2. تفعيل RLS على جميع الجداول
-- =============================================
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.cases enable row level security;

-- =============================================
-- 3. سياسات جدول المستخدمين (users)
-- =============================================

-- المستخدم يقدر يشوف بيانات زملائه في نفس المكتب فقط
create policy "users_select_same_tenant"
  on public.users for select
  using (tenant_id = public.get_my_tenant_id());

-- المستخدم يقدر يعدّل بياناته الشخصية فقط (باستثناء role و tenant_id، محميين بالـ trigger أدناه)
create policy "users_update_own_profile"
  on public.users for update
  using (auth_id = auth.uid())
  with check (auth_id = auth.uid());

-- مدير المكتب يقدر يضيف مستخدمين جدد لمكتبه
create policy "users_insert_same_tenant"
  on public.users for insert
  with check (tenant_id = public.get_my_tenant_id());

-- =============================================
-- 4. سياسات جدول الموكلين (clients)
-- =============================================

-- القراءة: فقط موكلين نفس المكتب
create policy "clients_select_same_tenant"
  on public.clients for select
  using (tenant_id = public.get_my_tenant_id());

-- الإضافة: فقط لنفس المكتب
create policy "clients_insert_same_tenant"
  on public.clients for insert
  with check (tenant_id = public.get_my_tenant_id());

-- التعديل: فقط موكلين نفس المكتب
create policy "clients_update_same_tenant"
  on public.clients for update
  using (tenant_id = public.get_my_tenant_id());

-- الحذف: فقط موكلين نفس المكتب
create policy "clients_delete_same_tenant"
  on public.clients for delete
  using (tenant_id = public.get_my_tenant_id());

-- =============================================
-- 5. سياسات جدول القضايا (cases)
-- =============================================

-- القراءة: فقط قضايا نفس المكتب
create policy "cases_select_same_tenant"
  on public.cases for select
  using (tenant_id = public.get_my_tenant_id());

-- الإضافة: فقط لنفس المكتب
create policy "cases_insert_same_tenant"
  on public.cases for insert
  with check (tenant_id = public.get_my_tenant_id());

-- التعديل: فقط قضايا نفس المكتب
create policy "cases_update_same_tenant"
  on public.cases for update
  using (tenant_id = public.get_my_tenant_id());

-- الحذف: فقط قضايا نفس المكتب
create policy "cases_delete_same_tenant"
  on public.cases for delete
  using (tenant_id = public.get_my_tenant_id());

-- =============================================
-- 6. سياسة خاصة: السماح للمستخدم الجديد بإنشاء حسابه
-- =============================================
-- دالة مساعدة (security definer لتتجاوز RLS، لأن فحص EXISTS داخل WITH CHECK
-- بدون هذا يخضع هو نفسه لسياسة القراءة users_select_same_tenant، والمستخدم
-- الجديد لسه معندوش tenant_id يشوف بيه أي صف — يعني الفحص هيرجع دايماً
-- "مفيش تعارض" حتى لو الـ tenant_id فعلاً مُستخدم من مكتب تاني)
create or replace function public.tenant_id_already_taken(check_tenant_id uuid, exclude_auth_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.users
    where tenant_id = check_tenant_id and auth_id <> exclude_auth_id
  );
$$;

-- عند التسجيل لأول مرة، المستخدم ليس لديه tenant_id بعد
-- لذلك نسمح لأي مستخدم مسجل بإنشاء سطر واحد لنفسه — لكن فقط بـ tenant_id
-- جديد لم يستخدمه أحد من قبل، لمنع أي مستخدم من انتحال tenant_id مكتب آخر
-- والانضمام إلى بياناته عند التسجيل (كانت هذه السياسة سابقاً بلا أي قيد على
-- tenant_id على الإطلاق).
create policy "users_insert_own_profile"
  on public.users for insert
  with check (
    auth_id = auth.uid()
    and tenant_id is not null
    and not public.tenant_id_already_taken(tenant_id, auth.uid())
  );

-- =============================================
-- 7. حماية أعمدة role و tenant_id من التصعيد الذاتي للصلاحيات
-- =============================================
-- سياسة "users_update_own_profile" تسمح للمستخدم بتعديل صف بياناته، لكن RLS
-- لا يستطيع تقييد أعمدة بعينها ضمن نفس الصف. بدون هذا الـ trigger، يقدر أي
-- مستخدم يبعت طلب تعديل مباشر لـ Supabase REST API ويغيّر role بتاعه لـ
-- "مدير مكتب" أو "محامي شريك" (صلاحية كاملة *) بنفسه، أو يغيّر tenant_id
-- وينتقل لبيانات مكتب تاني.
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role or new.tenant_id is distinct from old.tenant_id then
    if not exists (
      select 1 from public.users
      where auth_id = auth.uid() and role in ('مدير مكتب', 'محامي شريك')
    ) then
      raise exception 'غير مسموح بتعديل الدور أو المكتب لنفسك مباشرة';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_privilege_escalation on public.users;
create trigger trg_prevent_self_privilege_escalation
  before update on public.users
  for each row
  execute function public.prevent_self_privilege_escalation();

-- =============================================
-- 8. سياسات الجداول الجديدة (Migration 002 في schema.sql)
-- =============================================
-- كل هذه الجداول تتبع نفس نمط العزل بالضبط (tenant_id = get_my_tenant_id()
-- لكل من SELECT/INSERT/UPDATE/DELETE)، لذلك نطبّقها عبر حلقة بدلاً من تكرار
-- ~150 سياسة يدوياً (35 جدول × 4 عمليات) — أقل عرضة للخطأ ولنسيان جدول.
do $$
declare
  t text;
  tables text[] := array[
    'invoices','expenses','time_entries','trust_accounts','pricing_models','receivable_accounts',
    'enforcement_cases',
    'risk_registers','controls','compliance_issues','regulatory_obligations','compliance_records',
    'legal_precedents','qa_reviews','conflict_check_records','knowledge_assets','specialized_tracks',
    'training_pathways','ksa_assessments',
    'contract_requests','contract_templates','rfp_submissions','esignature_requests',
    'ip_records','ip_filings','ip_renewals','ip_oppositions','ip_enforcement_actions',
    'tasks','leads','key_accounts','proposals',
    'documents','notifications','office_settings','workflows','advisory_requests',
    'sessions','deadlines','wiki_articles'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_tenant_all" on public.%I', t, t);
    execute format(
      'create policy "%s_tenant_all" on public.%I for all using (tenant_id = public.get_my_tenant_id()) with check (tenant_id = public.get_my_tenant_id())',
      t, t
    );
    execute format('create index if not exists idx_%s_tenant_id on public.%I (tenant_id)', t, t);
  end loop;
end $$;

-- audit_logs is intentionally NOT in the loop above: it must stay
-- append-only. Users can read and write their own tenant's audit trail but
-- can never update or delete an existing entry (no such policy exists, and
-- RLS defaults to deny when no policy matches).
alter table public.audit_logs enable row level security;
drop policy if exists "audit_logs_select_tenant" on public.audit_logs;
drop policy if exists "audit_logs_insert_tenant" on public.audit_logs;
create policy "audit_logs_select_tenant"
  on public.audit_logs for select
  using (tenant_id = public.get_my_tenant_id());
create policy "audit_logs_insert_tenant"
  on public.audit_logs for insert
  with check (tenant_id = public.get_my_tenant_id());
create index if not exists idx_audit_logs_tenant_id on public.audit_logs (tenant_id);

-- subscriptions is also NOT in the generic loop: a tenant user must be able
-- to see their own plan/status, but must never be able to write to this
-- table directly — that would let anyone grant themselves an 'enterprise'
-- plan with 'active' status over the REST API with no payment at all. Only
-- the Moyasar webhook handler in server.ts (using the service-role key,
-- which bypasses RLS entirely) writes to this table.
alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions_select_tenant" on public.subscriptions;
create policy "subscriptions_select_tenant"
  on public.subscriptions for select
  using (tenant_id = public.get_my_tenant_id());
