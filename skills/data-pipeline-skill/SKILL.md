---
name: data-pipeline-skill
description: Use when implementing HealthScope warehouse transforms, measure refresh jobs, lineage tracking, or other scheduled analytics pipeline behavior.
---

# Data Pipeline Skill

## Purpose

Guide work on normalization, warehouse refreshes, curated marts, and data quality checks.

## Inputs

- Source-normalized entities
- Target warehouse or mart contract
- Refresh cadence and operational constraints

## Outputs

- Transform logic
- Warehouse refresh jobs
- Data quality and lineage updates

## Tools Required

- `specs/module-specs/data-warehouse.md`
- `specs/module-specs/clinical-analytics.md`
- `specs/module-specs/financial-analytics.md`

## Typical Tasks

- Add a new mart
- Refine an incremental refresh
- Add data quality validation
- Publish a feature table for models

## Guardrails

- Make transforms idempotent
- Preserve tenant scope and source lineage
- Prefer incremental updates over full rebuilds where feasible

