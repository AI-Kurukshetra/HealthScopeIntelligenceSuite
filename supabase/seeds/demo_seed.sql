-- Demo seed data for HealthScope (run in Supabase SQL editor or `supabase db execute`)
-- Idempotent: all inserts use ON CONFLICT DO NOTHING where unique constraints exist.

-- Tenants
insert into public.tenants (id, slug, name, status)
values (
  '11111111-1111-4111-8111-111111111111',
  'northwind-health-demo',
  'Northwind Health Demo',
  'active'
)
on conflict (id) do nothing;

-- Organizations
insert into public.organizations (id, tenant_id, name, type, status)
values
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Northwind Regional Health', 'hospital', 'active'),
  ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'Northwind Specialty Clinics', 'clinic-group', 'active')
on conflict (id) do nothing;

-- Facilities
insert into public.facilities (id, tenant_id, organization_id, name, facility_type, timezone, external_id)
values
  ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Northwind Main Campus', 'hospital', 'America/Chicago', 'fac-main'),
  ('55555555-5555-4555-8555-555555555555', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'Northwind Specialty Center', 'clinic', 'America/Chicago', 'fac-specialty')
on conflict (id) do nothing;

-- Optional demo users/memberships: only inserts if matching auth.users already exist
do $$
declare
  admin_rec record;
  analyst_rec record;
begin
  select id, email into admin_rec from auth.users where email = 'admin@northwind.demo' limit 1;
  select id, email into analyst_rec from auth.users where email = 'analyst@northwind.demo' limit 1;

  if admin_rec.id is not null then
    insert into public.users (id, tenant_id, email, full_name, status)
    values (admin_rec.id, '11111111-1111-4111-8111-111111111111', admin_rec.email, 'Alex Admin', 'active')
    on conflict (id) do nothing;

    insert into public.tenant_memberships (id, tenant_id, user_id, role_name, status, organization_id, facility_id)
    values ('88888888-8888-4888-8888-888888888888', '11111111-1111-4111-8111-111111111111', admin_rec.id, 'tenant_admin', 'active', null, null)
    on conflict (id) do nothing;
  end if;

  if analyst_rec.id is not null then
    insert into public.users (id, tenant_id, email, full_name, status)
    values (analyst_rec.id, '11111111-1111-4111-8111-111111111111', analyst_rec.email, 'Carmen Analyst', 'active')
    on conflict (id) do nothing;

    insert into public.tenant_memberships (id, tenant_id, user_id, role_name, status, organization_id, facility_id)
    values ('99999999-9999-4999-8999-999999999999', '11111111-1111-4111-8111-111111111111', analyst_rec.id, 'clinical_analyst', 'active', '22222222-2222-4222-8222-222222222222', null)
    on conflict (id) do nothing;
  end if;
end $$;

-- Patients
insert into public.patients (id, tenant_id, organization_id, facility_id, external_id, mrn, first_name, last_name, birth_date, sex, status)
values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444', 'pat-001', 'MRN-1001', 'Jordan', 'Lee', '1985-02-14', 'female', 'active'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444', 'pat-002', 'MRN-1002', 'Taylor', 'Smith', '1978-08-23', 'male', 'active'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-555555555555', 'pat-003', 'MRN-2001', 'Riley', 'Patel', '1990-12-05', 'other', 'active');

-- Providers
insert into public.providers (id, tenant_id, organization_id, facility_id, external_id, npi, full_name, specialty, status)
values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444', 'prov-001', '1000000001', 'Morgan Alvarez, MD', 'Hospitalist', 'active'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-555555555555', 'prov-002', '1000000002', 'Casey Young, NP', 'Primary Care', 'active');

-- Encounters
insert into public.clinical_encounters (id, tenant_id, organization_id, facility_id, patient_id, provider_id, external_id, encounter_type, status, encounter_at, discharged_at, length_of_stay_days, primary_diagnosis_code)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '44444444-4444-4444-8444-444444444444',
  p1.id,
  pr1.id,
  'enc-001',
  'inpatient',
  'completed',
  now() - interval '10 days',
  now() - interval '7 days',
  3.0,
  'I10'
from public.patients p1, public.providers pr1
where p1.mrn = 'MRN-1001' and pr1.npi = '1000000001'
limit 1;

insert into public.clinical_encounters (id, tenant_id, organization_id, facility_id, patient_id, provider_id, external_id, encounter_type, status, encounter_at, discharged_at, length_of_stay_days, primary_diagnosis_code)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333',
  '55555555-5555-4555-8555-555555555555',
  p2.id,
  pr2.id,
  'enc-002',
  'telehealth',
  'completed',
  now() - interval '3 days',
  now() - interval '3 days' + interval '30 minutes',
  0.02,
  'E11.9'
from public.patients p2, public.providers pr2
where p2.mrn = 'MRN-2001' and pr2.npi = '1000000002'
limit 1;

-- Claims
insert into public.insurance_claims (id, tenant_id, organization_id, facility_id, encounter_id, patient_id, payer_name, claim_status, billed_amount, allowed_amount, paid_amount, submitted_at)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '44444444-4444-4444-8444-444444444444',
  e1.id,
  e1.patient_id,
  'Aetna',
  'paid',
  12500.00,
  9800.00,
  9500.00,
  now() - interval '6 days'
from public.clinical_encounters e1
where e1.external_id = 'enc-001'
limit 1;

insert into public.insurance_claims (id, tenant_id, organization_id, facility_id, encounter_id, patient_id, payer_name, claim_status, billed_amount, allowed_amount, paid_amount, submitted_at)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333',
  '55555555-5555-4555-8555-555555555555',
  e2.id,
  e2.patient_id,
  'Blue Cross',
  'denied',
  350.00,
  0,
  0,
  now() - interval '2 days'
from public.clinical_encounters e2
where e2.external_id = 'enc-002'
limit 1;

-- Quality measures
insert into public.quality_measure_results (id, tenant_id, organization_id, facility_id, patient_id, encounter_id, measure_code, measure_name, measure_status, measured_at)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '44444444-4444-4444-8444-444444444444',
  e1.patient_id,
  e1.id,
  'VTE-1',
  'Venous Thromboembolism Prophylaxis',
  'met',
  now() - interval '7 days'
from public.clinical_encounters e1
where e1.external_id = 'enc-001'
limit 1;

insert into public.quality_measure_results (id, tenant_id, organization_id, facility_id, patient_id, encounter_id, measure_code, measure_name, measure_status, measured_at)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333',
  '55555555-5555-4555-8555-555555555555',
  e2.patient_id,
  e2.id,
  'DM-A1C',
  'Diabetes A1C Control',
  'not_met',
  now() - interval '2 days'
from public.clinical_encounters e2
where e2.external_id = 'enc-002'
limit 1;

-- Data sources
insert into public.data_sources (id, tenant_id, organization_id, source_type, name, base_url, auth_type, sync_frequency, status)
values
  ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'fhir', 'Epic FHIR Production', 'https://ehr.northwind.demo/fhir/R4', 'oauth2', 'hourly', 'active'),
  ('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', 'fhir', 'Cerner FHIR Sandbox', 'https://cerner.northwind.demo/fhir/R4', 'api-key', 'daily', 'paused')
on conflict (id) do nothing;

-- Integration sync jobs (example history)
insert into public.integration_sync_jobs (id, tenant_id, data_source_id, status, attempts, started_at, finished_at, message)
values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'succeeded', 1, now() - interval '3 hours', now() - interval '2 hours 45 minutes', 'Completed patient/encounter pull.'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'failed', 2, now() - interval '1 day', now() - interval '23 hours 50 minutes', 'Auth error: invalid API key')
on conflict (id) do nothing;

-- Checkpoints
insert into public.integration_sync_checkpoints (id, tenant_id, data_source_id, resource_type, cursor, updated_at)
values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Patient', jsonb_build_object('since', (now() - interval '7 days')), now() - interval '2 hours'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Encounter', jsonb_build_object('since', (now() - interval '7 days')), now() - interval '2 hours')
on conflict (tenant_id, data_source_id, resource_type) do nothing;

-- Job events
insert into public.integration_job_events (id, tenant_id, job_id, level, message, details, occurred_at)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  j.id,
  'info',
  'Fetched 250 patients (page 1)',
  jsonb_build_object('resource', 'Patient', 'count', 250),
  now() - interval '2 hours 50 minutes'
from public.integration_sync_jobs j
where j.message like 'Completed patient/encounter pull.%'
limit 1;

insert into public.integration_job_events (id, tenant_id, job_id, level, message, details, occurred_at)
select
  gen_random_uuid(),
  '11111111-1111-4111-8111-111111111111',
  j.id,
  'error',
  'API key rejected',
  jsonb_build_object('status', 401),
  now() - interval '23 hours 55 minutes'
from public.integration_sync_jobs j
where j.message like 'Auth error:%'
limit 1;
