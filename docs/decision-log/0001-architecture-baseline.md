# ADR 0001: Initial Architecture Baseline

## Status

Accepted

## Context

HealthScope starts as an empty workspace. The implementation needs a practical, secure baseline for a multi-tenant healthcare analytics platform while keeping the initial stack simple enough for rapid delivery.

## Decision

- Use a monorepo with `apps/` and `packages/` boundaries.
- Build on Next.js 14, Supabase, Vercel, and REST APIs.
- Optimize MVP for FHIR-first integrations and hourly batch analytics.
- Use shared Postgres with tenant-aware row-level security instead of schema-per-tenant or database-per-tenant.
- Keep AI and predictive modeling as later phases built on curated warehouse outputs.

## Consequences

- Tenant isolation depends on strict RLS, service-role discipline, and audit coverage.
- Analytics performance must be managed through marts, materialized views, and job scheduling.
- Some enterprise customers may later require stronger isolation, so contracts should avoid hard-coding assumptions that block schema-per-tenant or database-per-tenant evolution.

