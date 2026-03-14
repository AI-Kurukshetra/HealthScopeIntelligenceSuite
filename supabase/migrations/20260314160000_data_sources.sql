create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null default 'fhir' check (source_type in ('fhir', 'hl7', 'claims', 'file')),
  name text not null,
  base_url text not null,
  auth_type text not null default 'oauth2' check (auth_type in ('oauth2', 'basic', 'api-key', 'none')),
  sync_frequency text not null default 'hourly' check (sync_frequency in ('hourly', 'daily', 'manual')),
  last_sync_at timestamptz,
  status text not null default 'active' check (status in ('active', 'paused', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_data_sources_tenant_status
  on public.data_sources (tenant_id, status);

create index if not exists idx_data_sources_tenant_org
  on public.data_sources (tenant_id, organization_id);

drop trigger if exists set_updated_at_data_sources on public.data_sources;
create trigger set_updated_at_data_sources
before update on public.data_sources
for each row execute function public.set_updated_at();

alter table public.data_sources enable row level security;

drop policy if exists data_sources_select on public.data_sources;
create policy data_sources_select
on public.data_sources
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists data_sources_manage on public.data_sources;
create policy data_sources_manage
on public.data_sources
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));
