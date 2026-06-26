-- =============================================
-- Row Level Security (RLS) Policies
-- منصة ملف (malaf.site)
-- =============================================
-- هذا الملف يُطبّق سياسات أمان صارمة على مستوى الصفوف
-- بحيث كل مكتب محاماة (Tenant) يرى بياناته فقط
-- =============================================

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

-- المستخدم يقدر يعدّل بياناته الشخصية فقط
create policy "users_update_own_profile"
  on public.users for update
  using (auth_id = auth.uid());

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
-- عند التسجيل لأول مرة، المستخدم ليس لديه tenant_id بعد
-- لذلك نسمح لأي مستخدم مسجل بإنشاء سطر واحد لنفسه
create policy "users_insert_own_profile"
  on public.users for insert
  with check (auth_id = auth.uid());
