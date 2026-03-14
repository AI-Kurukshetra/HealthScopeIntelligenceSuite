# User Management Module

## Responsibilities

- Manage users, memberships, roles, permissions, and organizational scope
- Resolve active tenant context for authenticated sessions
- Support future SSO/SAML-ready identity boundaries

## Key Domain Concepts

- User identity
- Tenant membership
- Role assignment
- Organization/facility scope

## Inputs

- Supabase auth identity
- Tenant administration actions
- Organization and facility structures

## Outputs

- User profiles
- Membership and role records
- Auth scope resolution for downstream APIs

## REST Endpoints

- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`
- `GET /api/v1/auth/session`
- `POST /api/v1/auth/switch-tenant`

## Internal Dependencies

- Auth package
- Compliance and auditing
- Organizations/facilities data

## Data Model Touchpoints

- `users`
- `roles_permissions`
- `organizations`
- `facilities`

## Scaling Considerations

- Separate identity records from role assignments to support multi-tenant memberships
- Cache resolved permission sets per session where safe
- Preserve scoped role evaluation in server-side logic

## Security and Compliance Notes

- Invitation, suspension, and role change flows are privileged
- Role changes should be audited
- Session scope switching must re-evaluate authorization context

## Test and Acceptance Criteria

- Users cannot access tenants without membership
- Facility- and organization-scoped roles behave correctly
- Suspended users lose access promptly

