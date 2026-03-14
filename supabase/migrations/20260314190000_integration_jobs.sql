create table if not exists public.integration_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  data_source_id uuid not null references public.data_sources(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  triggered_by_user_id uuid references public.users(id) on delete set null,
  attempts int not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_sync_checkpoints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  data_source_id uuid not null references public.data_sources(id) on delete cascade,
  resource_type text not null,
  cursor jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (tenant_id, data_source_id, resource_type)
);

create table if not exists public.integration_job_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  job_id uuid not null references public.integration_sync_jobs(id) on delete cascade,
  level text not null default 'info' check (level in ('info', 'warn', 'error')),
  message text not null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_sync_jobs_tenant_status on public.integration_sync_jobs (tenant_id, status, created_at desc);
create index if not exists idx_sync_jobs_source on public.integration_sync_jobs (tenant_id, data_source_id, created_at desc);
create index if not exists idx_job_events_job on public.integration_job_events (job_id, occurred_at desc);
create index if not exists idx_checkpoints_source on public.integration_sync_checkpoints (tenant_id, data_source_id);

drop trigger if exists set_updated_at_sync_jobs on public.integration_sync_jobs;
create trigger set_updated_at_sync_jobs
before update on public.integration_sync_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_sync_checkpoints on public.integration_sync_checkpoints;
create trigger set_updated_at_sync_checkpoints
before update on public.integration_sync_checkpoints
for each row execute function public.set_updated_at();

alter table public.integration_sync_jobs enable row level security;
alter table public.integration_sync_checkpoints enable row level security;
alter table public.integration_job_events enable row level security;

drop policy if exists sync_jobs_select on public.integration_sync_jobs;
create policy sync_jobs_select
on public.integration_sync_jobs
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists sync_jobs_manage on public.integration_sync_jobs;
create policy sync_jobs_manage
on public.integration_sync_jobs
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists sync_checkpoints_select on public.integration_sync_checkpoints;
create policy sync_checkpoints_select
on public.integration_sync_checkpoints
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists sync_checkpoints_manage on public.integration_sync_checkpoints;
create policy sync_checkpoints_manage
on public.integration_sync_checkpoints
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists job_events_select on public.integration_job_events;
create policy job_events_select
on public.integration_job_events
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists job_events_manage on public.integration_job_events;
create policy job_events_manage
on public.integration_job_events
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));
