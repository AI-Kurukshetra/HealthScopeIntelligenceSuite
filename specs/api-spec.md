# API Specification

## Conventions

- Base path: `/api/v1`
- Authentication: bearer token backed by Supabase session/JWT
- Response envelope:

```json
{
  "data": {},
  "pagination": {
    "nextCursor": null
  },
  "meta": {
    "requestId": "req_123",
    "tenantId": "tenant_123"
  },
  "error": null
}
```

- Cursor pagination for high-volume list endpoints
- Filtering via query params such as `facilityId`, `organizationId`, `from`, `to`, `status`, `payer`, `measureCode`
- Versioning via URL path

## Authentication Rules

- All endpoints except login/session bootstrap require an authenticated user.
- Tenant scope is derived from membership, not request body.
- Facility- or org-level access requires matching role grants.
- Export and compliance endpoints create audit events on success and failure.

## Endpoints

### `/auth`

- `POST /auth/login`: start authenticated session flow
- `POST /auth/logout`: end session
- `GET /auth/session`: return current user, active tenant, and role summary
- `POST /auth/switch-tenant`: switch active tenant if user has membership

### `/users`

- `GET /users`: list users by tenant, org, facility, status, or role
- `POST /users`: invite/create tenant user
- `GET /users/:id`: fetch user profile and memberships
- `PATCH /users/:id`: update status, name, or scoped access

### `/organizations`

- `GET /organizations`: list tenant organizations
- `POST /organizations`: create organization
- `GET /organizations/:id`: fetch organization with facilities summary
- `PATCH /organizations/:id`: update organization metadata

### `/patients`

- `GET /patients`: search patients by external ID, MRN, DOB, facility, or cohort
- `GET /patients/:id`: patient profile with recent encounters and measures
- `GET /patients/:id/timeline`: encounter/lab/medication timeline

### `/providers`

- `GET /providers`: list providers by facility, specialty, or NPI
- `GET /providers/:id`: provider profile and encounter summary

### `/clinical-data`

- `GET /clinical-data/encounters`: list encounter facts with filters
- `GET /clinical-data/labs`: list lab results by patient/facility/date/code
- `GET /clinical-data/vitals`: list vital signs by patient/facility/date/type
- `GET /clinical-data/diagnoses`: list diagnoses by code/date/facility
- `GET /clinical-data/procedures`: list procedures by code/date/facility

### `/financial-data`

- `GET /financial-data/claims`: list claims by payer, status, date range
- `GET /financial-data/transactions`: list financial transactions
- `GET /financial-data/summary`: aggregate collections, denials, payer mix, reimbursement metrics

### `/quality-metrics`

- `GET /quality-metrics`: list measure results and gaps by measure, facility, period
- `GET /quality-metrics/cohorts/:id`: return quality summary for a saved cohort

### `/dashboards`

- `GET /dashboards`: list accessible dashboards
- `POST /dashboards`: create dashboard definition
- `GET /dashboards/:id`: fetch dashboard config and data
- `PATCH /dashboards/:id`: update dashboard metadata or layout

### `/reports`

- `GET /reports`: list report templates and recent runs
- `POST /reports`: create report template
- `POST /reports/:id/run`: queue report generation
- `GET /reports/:id/runs/:runId`: check status and download metadata

### `/analytics`

- `GET /analytics/clinical-summary`: aggregated clinical KPIs
- `GET /analytics/financial-summary`: aggregated financial KPIs
- `GET /analytics/population-health`: cohort and quality rollups
- `GET /analytics/models`: model registry list and status

### `/alerts`

- `GET /alerts`: list alert rules and recent notifications
- `POST /alerts`: create alert rule
- `PATCH /alerts/:id`: update rule state or thresholds
- `GET /alerts/history`: delivery and trigger history

### `/integrations`

- `GET /integrations`: list data sources and health
- `POST /integrations`: register source
- `PATCH /integrations/:id`: update source config or schedule
- `POST /integrations/:id/sync`: queue a sync job
- `GET /integrations/:id/runs`: list sync runs and mapping issues

### `/admin`

- `GET /admin/tenants`: platform-scoped tenant inventory
- `GET /admin/jobs`: job status and failure views
- `POST /admin/reprocess`: re-run failed normalization or report jobs

### `/compliance`

- `GET /compliance/audit-events`: query audit trail
- `GET /compliance/access-log`: query PHI access events
- `GET /compliance/export-log`: review report/export activity
- `POST /compliance/policy-review`: record policy review outcomes

## Request and Response Notes

- Accept JSON request bodies for create/update endpoints.
- Use async job responses for sync, export, and scoring endpoints:

```json
{
  "data": {
    "jobId": "job_123",
    "status": "queued"
  },
  "pagination": null,
  "meta": {
    "requestId": "req_123",
    "tenantId": "tenant_123"
  },
  "error": null
}
```

- Validation errors return `400` with structured field details.
- Auth failures return `401`; authorization failures return `403`; missing tenant-scoped objects return `404`.

