# Security Architecture

## Security Objectives

- Prevent cross-tenant data exposure
- Protect PHI in storage, transit, and application workflows
- Ensure complete traceability for user and system actions involving sensitive data
- Support minimum necessary access across product and operational tooling

## Identity and Access

- Supabase Auth manages user identity and session issuance.
- Internal tables manage tenant membership, organization/facility scope, roles, and permissions.
- All API calls resolve both identity and tenant context before any data operation.
- Administrative and break-glass capabilities require elevated roles and additional auditing.

## Data Protection

- Encrypt all network traffic with TLS.
- Use managed encryption at rest for Postgres and object storage.
- Store credentials and signing secrets in managed secret stores, never in source control or plaintext config tables.
- Separate raw payload storage from curated analytics tables and minimize raw payload retention.

## HIPAA Controls

- Log every PHI access path, report export, privileged configuration change, and source sync action.
- Avoid PHI in logs, monitoring tags, and client error payloads.
- Apply data minimization to dashboard and report responses.
- Use role- and scope-based authorization for facility and organization boundaries.
- Support retention policy automation and legal hold aware deletion workflows for operational records.

## Application Safeguards

- Schema validation on every external request
- Default-deny authorization model
- RLS on all tenant-bound tables
- Rate limiting and abuse controls on sensitive endpoints
- Signed job execution context for background tasks
- Export jobs treated as auditable privileged actions

## Security Monitoring

- Failed login monitoring
- High-volume export monitoring
- Integration credential rotation and access tracking
- Alerting on repeated authorization failures or unusual data access patterns

