create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'onboarding' check (status in ('onboarding', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  type text not null default 'hospital',
  status text not null default 'active' check (status in ('onboarding', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  facility_type text not null default 'hospital',
  timezone text not null default 'America/Chicago',
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  email text not null,
  full_name text,
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete cascade,
  role_name text not null,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id, role_name, organization_id, facility_id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_user_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text not null,
  outcome text not null check (outcome in ('success', 'failure')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_organizations_tenant_status
  on public.organizations (tenant_id, status);

create index if not exists idx_facilities_tenant_org
  on public.facilities (tenant_id, organization_id);

create index if not exists idx_users_tenant_email
  on public.users (tenant_id, email);

create index if not exists idx_tenant_memberships_tenant_user
  on public.tenant_memberships (tenant_id, user_id, status);

create index if not exists idx_audit_events_tenant_occurred
  on public.audit_events (tenant_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_tenants on public.tenants;
create trigger set_updated_at_tenants
before update on public.tenants
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_organizations on public.organizations;
create trigger set_updated_at_organizations
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_facilities on public.facilities;
create trigger set_updated_at_facilities
before update on public.facilities
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_users on public.users;
create trigger set_updated_at_users
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_tenant_memberships on public.tenant_memberships;
create trigger set_updated_at_tenant_memberships
before update on public.tenant_memberships
for each row execute function public.set_updated_at();

create or replace function public.is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = check_tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  );
$$;

create or replace function public.has_compliance_access(check_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = check_tenant_id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
      and tm.role_name in ('platform_admin', 'tenant_admin', 'compliance_admin')
  );
$$;

alter table public.tenants enable row level security;
alter table public.organizations enable row level security;
alter table public.facilities enable row level security;
alter table public.users enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists tenants_select on public.tenants;
create policy tenants_select
on public.tenants
for select
to authenticated
using (public.is_tenant_member(id));

drop policy if exists organizations_select on public.organizations;
create policy organizations_select
on public.organizations
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists facilities_select on public.facilities;
create policy facilities_select
on public.facilities
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists users_select on public.users;
create policy users_select
on public.users
for select
to authenticated
using (
  auth.uid() = id
  or public.has_compliance_access(tenant_id)
);

drop policy if exists memberships_select on public.tenant_memberships;
create policy memberships_select
on public.tenant_memberships
for select
to authenticated
using (
  auth.uid() = user_id
  or public.has_compliance_access(tenant_id)
);

drop policy if exists audit_events_select on public.audit_events;
create policy audit_events_select
on public.audit_events
for select
to authenticated
using (public.has_compliance_access(tenant_id));

drop policy if exists audit_events_insert on public.audit_events;
create policy audit_events_insert
on public.audit_events
for insert
to authenticated
with check (public.is_tenant_member(tenant_id));

