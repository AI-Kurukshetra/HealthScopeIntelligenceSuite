---
name: compliance-audit-skill
description: Use when implementing HealthScope audit logging, compliance review features, access tracing, export logging, or HIPAA-sensitive policy enforcement.
---

# Compliance Audit Skill

## Purpose

Implement immutable audit coverage and compliance-facing workflows across the platform.

## Inputs

- Sensitive action to be logged
- Retention or policy requirement
- Compliance review use case

## Outputs

- Audit schema or event changes
- Compliance query interfaces
- Policy enforcement updates

## Tools Required

- `specs/module-specs/compliance-auditing.md`
- `architecture/security-architecture.md`
- `agent.md`

## Typical Tasks

- Add an audit event for a new endpoint
- Expose export history to compliance users
- Enforce masking or minimum-necessary access
- Add retention-aware cleanup behavior

## Guardrails

- Audit the audit-sensitive paths consistently
- Do not log raw PHI unnecessarily
- Treat compliance datasets as sensitive and access-controlled

