---
name: analytics-model-skill
description: Use when implementing or updating HealthScope predictive analytics, model registry behavior, feature dataset contracts, or batch scoring workflows.
---

# Analytics Model Skill

## Purpose

Guide implementation of model metadata, feature pipelines, scoring outputs, and model governance hooks.

## Inputs

- Prediction use case
- Feature dataset definition
- Scoring cadence
- Validation and explainability requirements

## Outputs

- Model registry changes
- Scoring pipeline contracts
- Prediction output schemas

## Tools Required

- `specs/module-specs/ai-analytics-models.md`
- `specs/data-model.md`
- `architecture/security-architecture.md`

## Typical Tasks

- Add a new model type
- Version prediction outputs
- Record evaluation metrics
- Integrate predictions into alerts or dashboards

## Guardrails

- Keep training and scoring off request paths
- Track model version and data provenance
- Do not surface opaque predictions without validation metadata

