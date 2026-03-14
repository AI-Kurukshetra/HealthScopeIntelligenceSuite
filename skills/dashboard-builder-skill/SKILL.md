---
name: dashboard-builder-skill
description: Use when implementing HealthScope dashboard definitions, widget rendering, report templates, or reusable clinical and financial visualizations.
---

# Dashboard Builder Skill

## Purpose

Implement dashboard, widget, and report behavior on top of curated metrics and stable visualization contracts.

## Inputs

- Dashboard or report requirement
- Metric definitions
- Role and scope rules

## Outputs

- Dashboard configs
- Report templates
- Visualization bindings

## Tools Required

- `specs/module-specs/dashboards-reporting.md`
- `specs/module-specs/data-visualization.md`
- `specs/api-spec.md`

## Typical Tasks

- Add a KPI card or chart widget
- Create a report template
- Wire filter state to analytics endpoints
- Enforce export permissions

## Guardrails

- Use curated metrics, not raw tables
- Preserve tenant and role scope at widget level
- Keep PHI masked unless explicitly required

