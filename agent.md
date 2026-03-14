# HealthScope Agent Guide

## Purpose

This repository is a planning-first monorepo for HealthScope Analytics Suite, a multi-tenant healthcare analytics and BI platform for hospitals and provider groups. The first implementation priority is a secure, HIPAA-aware data and analytics core, not UI breadth.

## Architecture Rules

- Treat the system as modular: integrations, data model, analytics, reporting, compliance, and UI should evolve independently behind documented contracts.
- Keep runtime boundaries explicit: `apps/web` for product UI, `apps/api` for REST application logic when route complexity justifies separation, `packages/*` for shared domain capabilities.
- Default to REST under `/api/v1`; avoid introducing GraphQL or RPC layers unless a design doc justifies the change.
- Treat the hosted Supabase cloud project as the primary development database and auth provider. Do not design local-only workflows around Dockerized Supabase.
- Prefer FHIR R4 as the first-class clinical integration model. Add HL7 v2 adapters behind the integration hub instead of leaking protocol details into analytics or UI code.
- Build for hourly batch analytics first. Any near-real-time path must remain additive and not break batch correctness.
- Every tenant-bound table, cache key, job, and audit record must carry tenant context.

## Coding Standards

- Use TypeScript everywhere in application and shared package code.
- Validate all external input at the API boundary with explicit schemas.
- Keep modules cohesive. If a change touches multiple subsystems, define or update an interface contract rather than coupling implementations.
- Name files with kebab-case, exported types/interfaces with PascalCase, variables/functions with camelCase, database tables with snake_case.
- Encapsulate SQL and access policies near the owning package instead of scattering them through UI code.
- Avoid adding dependencies without a concrete need. Prefer platform features and well-supported libraries.

## Folder Structure

```text
/apps
  /web              Next.js 14 UI
  /api              REST application layer and background entrypoints
/packages
  /analytics        KPI logic, measures, marts, model contracts
  /auth             Auth adapters, RBAC helpers, session utilities
  /compliance       Audit logging, policy checks, retention helpers
  /config           Shared config loaders and environment schemas
  /data-model       SQL migrations, ERDs, types, warehouse contracts
  /integrations     Connector framework, source mappings, ingestion jobs
  /ui               Reusable dashboard and reporting components
/docs               Cross-cutting analysis and ADRs
/prd                Product requirements
/architecture       Architecture docs and diagrams
/specs              Technical specs and module-level contracts
/skills             Reusable agent capability modules
/infra              Deployment, platform, and environment automation
```

## Feature Implementation Workflow

1. Start from the relevant spec in `specs/` and confirm that the requested behavior is already defined.
2. If the behavior changes public contracts, update the PRD/spec/API doc first.
3. Implement the owning package before wiring UI or external integrations.
4. Add tenant scoping, auth checks, and audit logging before exposing a new endpoint or admin action.
5. Apply schema changes through Supabase CLI migrations in `supabase/migrations/`, linked to the remote cloud project with `supabase link --project-ref <PROJECT_REF>` and deployed with `supabase db push`.
6. Do not rely on `supabase start`, `supabase stop`, or `supabase db reset`; those are out of scope for this repository.
7. Add tests at the lowest useful layer first, then add integration coverage around critical flows.
8. Document any architecture change in `docs/decision-log/`.

## Environment and Database Workflow

- Required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Source those values from the hosted Supabase project dashboard, not from a local container.
- Authenticate the CLI with `supabase login`.
- Link the repo to the hosted project with `supabase link --project-ref <PROJECT_REF>`.
- Apply migrations to the linked remote database with `supabase db push`.
- Keep `supabase/migrations/` authoritative for database changes so cloud and CI environments stay consistent.

## Testing Requirements

- Unit tests for pure analytics logic, transformations, and validation.
- Integration tests for API handlers, RLS-sensitive queries, connector normalization, and report generation.
- Contract tests for external integrations and exported REST shapes.
- Security-focused tests for authz failures, tenant isolation, and PHI redaction.
- Performance tests for heavy warehouse queries, export jobs, and alert evaluations before production rollout.

## HIPAA Compliance Rules

- Never log PHI, tokens, credentials, or full payloads from source systems.
- Store source credentials in managed secrets, not repo files or plaintext tables.
- All PHI access paths must create audit records.
- Default to least privilege for service roles and administrative features.
- Mask identifiers in UI and logs unless a workflow explicitly requires full detail.
- Use retention and deletion workflows that preserve legal/audit needs without silently removing clinical facts.

## Adding New Modules

When adding a new module:

1. Create or update a module spec in `specs/module-specs/`.
2. Define ownership boundaries, tables, APIs, and events.
3. Add package-level contracts and tests.
4. Register compliance expectations: tenant scope, PHI handling, audit requirements.
5. Update `specs/api-spec.md` and `specs/data-model.md` if public interfaces or schemas change.

## Adding New Skills

- Add a new folder under `skills/` with a `SKILL.md`.
- Keep the skill concise and procedural.
- Include trigger conditions, inputs, outputs, tools, and safety checks.
- Put long references in `references/` only when the workflow truly needs them.
