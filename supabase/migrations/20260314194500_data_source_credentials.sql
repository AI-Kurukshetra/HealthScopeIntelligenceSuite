create table if not exists public.data_source_credentials (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  data_source_id uuid not null references public.data_sources(id) on delete cascade,
  auth_type text not null default 'oauth2' check (auth_type in ('oauth2', 'basic', 'api-key', 'none')),
  client_id text,
  client_secret text,
  token_url text,
  api_key text,
  basic_username text,
  basic_password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, data_source_id)
);

create index if not exists idx_credentials_tenant_source
  on public.data_source_credentials (tenant_id, data_source_id);

drop trigger if exists set_updated_at_source_credentials on public.data_source_credentials;
create trigger set_updated_at_source_credentials
before update on public.data_source_credentials
for each row execute function public.set_updated_at();

alter table public.data_source_credentials enable row level security;

drop policy if exists data_source_credentials_select on public.data_source_credentials;
create policy data_source_credentials_select
on public.data_source_credentials
for select
to authenticated
using (public.has_compliance_access(tenant_id));

drop policy if exists data_source_credentials_manage on public.data_source_credentials;
create policy data_source_credentials_manage
on public.data_source_credentials
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));
