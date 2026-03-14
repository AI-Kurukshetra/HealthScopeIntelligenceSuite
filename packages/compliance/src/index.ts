export type AuditEvent = {
  action: string;
  actorId: string;
  tenantId: string;
  targetType: string;
  targetId: string;
  outcome: "success" | "failure";
  occurredAt: string;
};

export function createAuditEvent(input: Omit<AuditEvent, "occurredAt">): AuditEvent {
  return {
    ...input,
    occurredAt: new Date().toISOString()
  };
}

