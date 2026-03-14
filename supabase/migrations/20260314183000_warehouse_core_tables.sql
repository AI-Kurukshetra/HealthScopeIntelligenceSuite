create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  external_id text,
  mrn text,
  first_name text,
  last_name text,
  birth_date date,
  sex text check (sex in ('female', 'male', 'other', 'unknown')),
  status text not null default 'active' check (status in ('active', 'inactive', 'deceased')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id),
  unique (tenant_id, mrn)
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  external_id text,
  npi text,
  full_name text not null,
  specialty text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id),
  unique (tenant_id, npi)
);

create table if not exists public.clinical_encounters (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  external_id text,
  encounter_type text not null check (encounter_type in ('inpatient', 'outpatient', 'emergency', 'telehealth')),
  status text not null default 'completed' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  encounter_at timestamptz not null,
  discharged_at timestamptz,
  length_of_stay_days numeric(8,2),
  primary_diagnosis_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, external_id)
);

create table if not exists public.insurance_claims (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  encounter_id uuid references public.clinical_encounters(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  payer_name text not null,
  claim_status text not null check (claim_status in ('draft', 'submitted', 'paid', 'denied', 'appealed')),
  billed_amount numeric(12,2) not null default 0,
  allowed_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  denial_reason text,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quality_measure_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  encounter_id uuid references public.clinical_encounters(id) on delete set null,
  measure_code text not null,
  measure_name text not null,
  measure_status text not null check (measure_status in ('met', 'not_met', 'excluded')),
  measured_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  metric_key text not null,
  metric_group text not null,
  metric_label text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  value_numeric numeric(14,2) not null default 0,
  dimensions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, organization_id, facility_id, metric_key, period_start, period_end)
);

create index if not exists idx_patients_tenant_status
  on public.patients (tenant_id, status);

create index if not exists idx_patients_tenant_org_facility
  on public.patients (tenant_id, organization_id, facility_id);

create index if not exists idx_providers_tenant_status
  on public.providers (tenant_id, status);

create index if not exists idx_encounters_tenant_encounter_at
  on public.clinical_encounters (tenant_id, encounter_at desc);

create index if not exists idx_encounters_tenant_org_facility
  on public.clinical_encounters (tenant_id, organization_id, facility_id);

create index if not exists idx_claims_tenant_submitted_at
  on public.insurance_claims (tenant_id, submitted_at desc);

create index if not exists idx_claims_tenant_org_facility
  on public.insurance_claims (tenant_id, organization_id, facility_id);

create index if not exists idx_quality_tenant_measured_at
  on public.quality_measure_results (tenant_id, measured_at desc);

create index if not exists idx_metric_snapshots_tenant_period
  on public.analytics_metric_snapshots (tenant_id, period_end desc, metric_key);

drop trigger if exists set_updated_at_patients on public.patients;
create trigger set_updated_at_patients
before update on public.patients
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_providers on public.providers;
create trigger set_updated_at_providers
before update on public.providers
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_clinical_encounters on public.clinical_encounters;
create trigger set_updated_at_clinical_encounters
before update on public.clinical_encounters
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_insurance_claims on public.insurance_claims;
create trigger set_updated_at_insurance_claims
before update on public.insurance_claims
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_quality_measure_results on public.quality_measure_results;
create trigger set_updated_at_quality_measure_results
before update on public.quality_measure_results
for each row execute function public.set_updated_at();

alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.clinical_encounters enable row level security;
alter table public.insurance_claims enable row level security;
alter table public.quality_measure_results enable row level security;
alter table public.analytics_metric_snapshots enable row level security;

drop policy if exists patients_select on public.patients;
create policy patients_select
on public.patients
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists patients_manage on public.patients;
create policy patients_manage
on public.patients
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists providers_select on public.providers;
create policy providers_select
on public.providers
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists providers_manage on public.providers;
create policy providers_manage
on public.providers
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists clinical_encounters_select on public.clinical_encounters;
create policy clinical_encounters_select
on public.clinical_encounters
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists clinical_encounters_manage on public.clinical_encounters;
create policy clinical_encounters_manage
on public.clinical_encounters
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists insurance_claims_select on public.insurance_claims;
create policy insurance_claims_select
on public.insurance_claims
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists insurance_claims_manage on public.insurance_claims;
create policy insurance_claims_manage
on public.insurance_claims
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists quality_measure_results_select on public.quality_measure_results;
create policy quality_measure_results_select
on public.quality_measure_results
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists quality_measure_results_manage on public.quality_measure_results;
create policy quality_measure_results_manage
on public.quality_measure_results
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists analytics_metric_snapshots_select on public.analytics_metric_snapshots;
create policy analytics_metric_snapshots_select
on public.analytics_metric_snapshots
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists analytics_metric_snapshots_manage on public.analytics_metric_snapshots;
create policy analytics_metric_snapshots_manage
on public.analytics_metric_snapshots
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));
