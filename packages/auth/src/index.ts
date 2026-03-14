export const PLATFORM_ROLES = [
  "platform_admin",
  "tenant_admin",
  "executive",
  "clinical_analyst",
  "finance_analyst",
  "compliance_admin",
  "integration_engineer"
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type TenantContext = {
  tenantId: string;
  organizationId: string;
  facilityIds: string[];
};

export type AuthenticatedActor = {
  id: string;
  email: string;
  fullName: string | null;
};

export type MembershipRecord = {
  tenantId: string;
  organizationId: string | null;
  facilityId: string | null;
  roleName: PlatformRole;
  status: "active" | "suspended";
};

export type SessionContext = {
  actor: AuthenticatedActor;
  memberships: MembershipRecord[];
  activeTenant: TenantContext | null;
};

export const ACTIVE_TENANT_COOKIE_NAME = "healthscope_active_tenant";

export const DEFAULT_TENANT_CONTEXT: TenantContext = {
  tenantId: "tenant_demo",
  organizationId: "org_demo",
  facilityIds: ["facility_demo"]
};

export function buildRoleSummary(roles: PlatformRole[]) {
  return {
    roles,
    canManageTenant: roles.includes("tenant_admin") || roles.includes("platform_admin"),
    canReviewCompliance:
      roles.includes("compliance_admin") || roles.includes("platform_admin")
  };
}

export function isPlatformRole(value: string): value is PlatformRole {
  return PLATFORM_ROLES.includes(value as PlatformRole);
}

export function selectActiveMembership(
  memberships: MembershipRecord[],
  requestedTenantId?: string | null
): MembershipRecord | null {
  if (requestedTenantId) {
    return (
      memberships.find(
        (membership) =>
          membership.tenantId === requestedTenantId && membership.status === "active"
      ) ?? null
    );
  }

  return memberships.find((membership) => membership.status === "active") ?? null;
}

export function buildTenantContextFromMembership(
  membership: MembershipRecord | null,
  memberships: MembershipRecord[]
): TenantContext | null {
  if (!membership) {
    return null;
  }

  const organizationId =
    membership.organizationId ??
    memberships.find(
      (candidate) =>
        candidate.tenantId === membership.tenantId &&
        candidate.status === "active" &&
        candidate.organizationId
    )?.organizationId;

  if (!organizationId) {
    return null;
  }

  return {
    tenantId: membership.tenantId,
    organizationId,
    facilityIds: memberships
      .filter(
        (candidate) =>
          candidate.tenantId === membership.tenantId &&
          candidate.organizationId === organizationId &&
          candidate.facilityId
      )
      .map((candidate) => candidate.facilityId as string)
  };
}

export function buildSessionPayload(context: SessionContext) {
  const uniqueRoles = Array.from(new Set(context.memberships.map((membership) => membership.roleName)));

  return {
    authenticated: true,
    user: {
      id: context.actor.id,
      email: context.actor.email,
      fullName: context.actor.fullName,
      roles: buildRoleSummary(uniqueRoles)
    },
    tenant: context.activeTenant
  };
}

export function getTenantRoles(context: SessionContext, tenantId: string) {
  return context.memberships
    .filter((membership) => membership.tenantId === tenantId && membership.status === "active")
    .map((membership) => membership.roleName);
}

export function canManageTenantContext(context: SessionContext, tenantId: string) {
  const roles = getTenantRoles(context, tenantId);

  return roles.includes("platform_admin") || roles.includes("tenant_admin");
}

export function canReviewComplianceContext(context: SessionContext, tenantId: string) {
  const roles = getTenantRoles(context, tenantId);

  return (
    roles.includes("platform_admin") ||
    roles.includes("tenant_admin") ||
    roles.includes("compliance_admin")
  );
}

export function getAccessibleTenantIds(context: SessionContext) {
  return Array.from(new Set(context.memberships.map((membership) => membership.tenantId)));
}
