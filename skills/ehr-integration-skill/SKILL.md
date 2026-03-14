---
name: ehr-integration-skill
description: Use when implementing or modifying HealthScope source connectors, FHIR ingestion, checkpointing, normalization, or integration operational workflows.
---

# EHR Integration Skill

## Purpose

Implement and maintain source registration, extraction, normalization, and sync observability for healthcare data integrations.

## Inputs

- Source type and authentication method
- Resource mapping requirements
- Sync frequency and backfill expectations

## Outputs

- Connector changes
- Normalized payload contracts
- Sync run and error handling updates

## Tools Required

- Repository specs in `specs/module-specs/ehr-integration-hub.md`
- Data model definitions in `specs/data-model.md`
- API contracts in `specs/api-spec.md`

## Typical Tasks

- Add a FHIR resource fetcher
- Define a normalization mapping
- Add sync status tracking
- Harden retries and idempotency

## Guardrails

- Never store credentials in source control
- Preserve source lineage for canonical writes
- Keep protocol details inside the integration boundary

