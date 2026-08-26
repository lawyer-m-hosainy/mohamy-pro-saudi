-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  auth_id uuid references auth.users(id) unique, -- Links to Supabase Auth; UNIQUE so one auth user can't hold multiple profile rows
  email text not null unique,
  name text not null,
  role text check (role in ('مدير مكتب', 'محامي شريك', 'محامي مستشار', 'محامي متدرب', 'مساعد إداري')),
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

