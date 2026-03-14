# Data Warehouse Module

## Responsibilities

- Store canonical healthcare entities
- Maintain lineage from source systems to curated analytics tables
- Publish marts and materialized aggregates for product consumption

## Key Domain Concepts

- Canonical entity model
- Source lineage
- Measure-ready marts
- Refresh orchestration

## Inputs

- Normalized connector outputs
- Administrative dimensions
- Measure definitions

## Outputs

- Canonical fact and dimension tables
- Materialized views
- Feature datasets for downstream analytics

## REST Endpoints

- Not exposed directly except through approved analytics and admin APIs

## Internal Dependencies

- EHR integration hub
- Analytics modules
- Compliance and auditing

## Data Model Touchpoints

- All core tables in `specs/data-model.md`

## Scaling Considerations

- Partition high-volume fact tables by time where appropriate
- Use incremental refresh for marts
- Keep raw payload retention bounded to control storage growth

## Security and Compliance Notes

- Warehouse access must go through authorized services
- Raw landing data receives stricter retention review than curated facts
- Every background refresh job should record tenant and dataset scope

## Test and Acceptance Criteria

- Source lineage is traceable for each canonical record
- Incremental refreshes produce the same result as a full rebuild for test windows
- Tenant filters remain intact under all warehouse query paths

