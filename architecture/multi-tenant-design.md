# Multi-Tenant Design

## Chosen Model

HealthScope uses a shared Postgres deployment with strict tenant-aware row-level security. This keeps MVP operational overhead manageable while still supporting strong isolation when paired with disciplined service-layer access and audit logging.

## Tenant Boundaries

- `tenant_id` exists on every tenant-bound table.
- Organization and facility records are scoped to a single tenant.
- Users may belong to multiple tenants, but each session resolves an active tenant context.
- Caches, jobs, exports, and notifications must include tenant context in identifiers and storage paths.

## Access Pattern

1. User authenticates through Supabase Auth.
2. API resolves active tenant membership and role grants.
3. Queries run with tenant-aware policies and optional facility constraints.
4. Audit records capture tenant, actor, action, target, and outcome.

## Design Rules

- Never infer tenant scope from user input alone; derive it from authenticated membership.
- Avoid cross-tenant joins in application code.
- Use shared global lookup tables only for non-sensitive reference data.
- Keep tenant configuration and tenant facts in separate but consistently scoped domains.

## Evolution Path

If enterprise isolation demands increase, preserve compatibility with schema-per-tenant or database-per-tenant migrations by:

- avoiding tenant-specific logic in client code
- keeping connector configuration per tenant
- encapsulating storage and query helpers in shared packages

