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
