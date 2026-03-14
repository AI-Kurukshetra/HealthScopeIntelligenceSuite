# ADR 0002: Supabase Cloud Development Workflow

## Status

Accepted

## Context

This repository will not use `supabase start`, `supabase stop`, or other Docker-backed local Supabase workflows. Development and integration should target a hosted Supabase project created on supabase.com.

## Decision

- Use the hosted Supabase project as the primary development database and auth provider.
- Configure the application with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard.
- Authenticate the CLI with `supabase login`.
- Link the repository to the hosted project with `supabase link --project-ref <PROJECT_REF>`.
- Apply migration files in `supabase/migrations/` with `supabase db push`.

## Consequences

- Migration discipline matters more because schema changes target the hosted environment directly.
- Developers should stage risky changes in separate migrations rather than relying on local database resets.
- Repository guidance, automation, and onboarding must avoid assuming local Supabase containers exist.
