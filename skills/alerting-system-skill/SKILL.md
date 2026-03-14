---
name: alerting-system-skill
description: Use when implementing HealthScope alert rules, evaluation windows, notification delivery, or alert suppression and history behavior.
---

# Alerting System Skill

## Purpose

Implement rule evaluation and notification delivery for curated analytics conditions.

## Inputs

- Rule definition
- Metric or cohort source
- Notification channels

## Outputs

- Alert rule behavior
- Trigger and delivery records
- Notification templates and routing

## Tools Required

- `specs/module-specs/alerting-system.md`
- `specs/api-spec.md`
- `architecture/data-flow-diagrams.md`

## Typical Tasks

- Add a threshold rule type
- Implement suppression windows
- Add webhook delivery
- Expose alert history

## Guardrails

- Avoid noisy repeated triggers
- Keep PHI out of notification payloads by default
- Separate rule evaluation from delivery retries

