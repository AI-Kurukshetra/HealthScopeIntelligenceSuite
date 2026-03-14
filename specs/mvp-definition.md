# MVP Definition

## Minimal Launch Scope

The initial launch should include only the capabilities needed to onboard a tenant, ingest a basic healthcare data footprint, and deliver actionable clinical and financial reporting.

### Required Components

- Authentication via Supabase Auth
- Tenant membership and role-based access control
- Organization and facility administration
- Basic FHIR integration hub
- Core canonical warehouse
- Clinical dashboards
- Financial dashboards
- Basic report generation and scheduled delivery
- Compliance basics: audit trail, access log, export log

## Interaction Model

1. Tenant admins configure organizations, facilities, users, and source systems.
2. Integration jobs pull FHIR resources and finance-related source data on an hourly schedule.
3. Normalization jobs upsert canonical warehouse entities and refresh analytics marts.
4. Dashboard and reporting APIs serve curated KPIs and approved drill-down datasets.
5. Audit services record user access, exports, and configuration changes.

## Explicit Exclusions

- Advanced AI and predictive models
- Real-time streaming analytics
- Patient-facing workflows
- Extensive external benchmarking
- Broad HL7 v2 or custom file integration beyond designed extension points

## Launch Readiness Criteria

- One tenant can complete setup without manual database intervention
- Initial source sync can populate the core warehouse successfully
- Clinical and financial dashboard packs work across at least one organization and facility hierarchy
- Standard report export is available and auditable
- Tenant isolation and role restrictions are validated through tests

