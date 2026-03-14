-- Base tenancy + users + helper functions + RLS policies

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  role text not null check (role in ('admin','cdi','coder','physician')),
  display_name text,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select organization_id from public.users where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_user_role() = 'admin';
$$;

alter table public.organizations enable row level security;
alter table public.facilities enable row level security;
alter table public.departments enable row level security;
alter table public.users enable row level security;

-- organizations
create policy "org_select" on public.organizations
  for select using (id = public.current_user_org_id());

create policy "org_insert_admin" on public.organizations
  for insert with check (public.is_admin());

create policy "org_update_admin" on public.organizations
  for update using (public.is_admin()) with check (public.is_admin());

create policy "org_delete_admin" on public.organizations
  for delete using (public.is_admin());

-- facilities
create policy "facilities_select" on public.facilities
  for select using (organization_id = public.current_user_org_id());

create policy "facilities_admin_write" on public.facilities
  for insert with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "facilities_admin_update" on public.facilities
  for update using (public.is_admin()) with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "facilities_admin_delete" on public.facilities
  for delete using (public.is_admin());

-- departments
create policy "departments_select" on public.departments
  for select using (organization_id = public.current_user_org_id());

create policy "departments_admin_write" on public.departments
  for insert with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "departments_admin_update" on public.departments
  for update using (public.is_admin()) with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "departments_admin_delete" on public.departments
  for delete using (public.is_admin());

-- users
create policy "users_select" on public.users
  for select using (organization_id = public.current_user_org_id());

create policy "users_admin_insert" on public.users
  for insert with check (public.is_admin() and organization_id = public.current_user_org_id());

create policy "users_self_update" on public.users
  for update using (id = auth.uid() or public.is_admin())
  with check (organization_id = public.current_user_org_id());

create policy "users_admin_delete" on public.users
  for delete using (public.is_admin());
