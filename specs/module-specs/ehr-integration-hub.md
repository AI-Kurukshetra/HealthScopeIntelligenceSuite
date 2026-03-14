# EHR Integration Hub Module

## Responsibilities

- Register and manage external data sources
- Execute extraction jobs and checkpoint tracking
- Normalize source payloads into canonical warehouse inputs

## Key Domain Concepts

- Source registration
- Connector lifecycle
- Sync checkpoints
- Mapping errors and retry handling

## Inputs

- Source credentials and configuration
- FHIR resources
- Later HL7/file payloads

## Outputs

- Raw landing records
- Normalized entity payloads
- Sync run logs and health status

## REST Endpoints

- `GET /api/v1/integrations`
- `POST /api/v1/integrations`
- `PATCH /api/v1/integrations/:id`
- `POST /api/v1/integrations/:id/sync`
- `GET /api/v1/integrations/:id/runs`

## Internal Dependencies

- User management
- Compliance and auditing
- Data warehouse
- Config package for secrets and schedules

## Data Model Touchpoints

- `data_sources`
- Future sync run, raw payload, and mapping issue tables

## Scaling Considerations

- Use per-source checkpointing and backfill windows
- Rate-limit connector calls per source system
- Run normalization asynchronously and idempotently

## Security and Compliance Notes

- Credentials must be stored in managed secrets
- Raw payload access is tightly restricted and auditable
- Integration changes are privileged admin actions

## Test and Acceptance Criteria

- Connector retries do not duplicate canonical records
- Mapping failures are observable and recoverable
- Sync job status reflects partial and full failures correctly

