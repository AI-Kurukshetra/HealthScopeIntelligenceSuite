# QA Checklist

## Purpose

Use this checklist to validate the current HealthScope admin slice after schema pushes, auth changes, or deployment updates.

## Prerequisites

- The hosted Supabase project is linked with `supabase link --project-ref <PROJECT_REF>`.
- Latest migrations have been applied with `supabase db push`.
- The tester has a valid account with at least one active tenant membership.
- For tenant-switch validation, the tester belongs to more than one tenant.

## 1. Schema Readiness

- Run `supabase db push` from the repo root.
- Confirm the `public.data_sources` table exists in the hosted project.
- Confirm existing core tables are present: `tenants`, `organizations`, `facilities`, `users`, `tenant_memberships`, `audit_events`.

## 2. Authentication

- Open `/sign-in`.
- Sign in with a valid account.
- Confirm redirect to `/app`.
- Confirm `/api/v1/auth/session` returns an authenticated user and active tenant payload.

## 3. Tenant Switching

- If the signed-in user has multiple tenant memberships, use the sidebar tenant selector.
- Confirm the app redirects back to `/app`.
- Confirm a success message appears.
- Confirm the displayed tenant changes in the sidebar.
- Confirm `/api/v1/auth/session` reflects the newly active tenant.

## 4. Tenant Admin Overview

- Open `/app/admin`.
- Confirm the page renders without errors.
- Confirm metrics display for organizations, facilities, memberships, and FHIR sources.
- Confirm existing organizations, facilities, and memberships are visible.

## 5. Organization and Facility Creation

- Create a new organization.
- Confirm a success message appears.
- Confirm the organization appears in the organizations table.
- Create a new facility under that organization.
- Confirm a success message appears.
- Confirm the facility appears in the facilities table.

## 6. User Invitation and Membership Assignment

- Invite a new user from `/app/admin`.
- Confirm a success message appears.
- Confirm the membership appears in the memberships table.
- Confirm the user appears in `auth.users` and `public.users`.
- If email confirmation is enabled, confirm the invited user cannot sign in until confirmation.

## 7. User Edit and Suspension Flow

- Edit an existing membership row.
- Change the full name and save.
- Confirm the updated full name persists after reload.
- Change the role and save.
- Confirm the new role persists after reload.
- Change the scope to a valid organization/facility combination and save.
- Confirm the scope persists after reload.
- Change the status to `suspended` and save.
- Confirm the membership row shows `suspended` after reload.
- Confirm sibling memberships for the same user inside the active tenant are also suspended.
- Attempt an invalid org/facility combination and confirm an error message appears.

## 8. FHIR Source Registration

- Open `/app/integrations`.
- Register a new FHIR source using an existing organization.
- Confirm a success message appears.
- Confirm the source appears in the table.
- Change the source status and save.
- Confirm the new status persists after reload.

## 9. Audit Trail Validation

- Open `/api/v1/compliance/audit-events`.
- Confirm recent audit rows exist for the actions you performed.
- Validate presence of these actions where applicable:
  - `tenant.organization.created`
  - `tenant.facility.created`
  - `tenant.membership.upserted`
  - `tenant.membership.updated`
  - `integration.fhir_source.created`
  - `integration.source.status_updated`

## 10. Build Validation

- Run `pnpm --filter @healthscope/web build`.
- Confirm the build completes successfully.

## 11. SQL Validation Queries

Run these in the Supabase SQL editor when needed:

```sql
select * from public.tenant_memberships order by created_at desc;
```

```sql
select id, email, full_name, status, tenant_id
from public.users
order by created_at desc;
```

```sql
select id, tenant_id, organization_id, name, source_type, status
from public.data_sources
order by created_at desc;
```

```sql
select action, target_id, occurred_at
from public.audit_events
order by occurred_at desc
limit 50;
```

## Expected Known Behaviors

- Users can be created before email confirmation is complete if Supabase email confirmation is enabled.
- Sign-in will fail with `Email not confirmed` until confirmation occurs.
- `/app/integrations` can render with an empty source list if `data_sources` has not been populated yet.
