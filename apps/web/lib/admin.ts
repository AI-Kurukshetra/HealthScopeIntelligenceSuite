import { canManageTenantContext, getTenantRoles, type SessionContext } from "@healthscope/auth";
import { createSupabaseAdminClient } from "@healthscope/auth/supabase";
import { createAuditEvent } from "@healthscope/compliance";

type OrganizationRow = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  status: string;
};

type FacilityRow = {
  id: string;
  tenant_id: string;
  organization_id: string;
  name: string;
  facility_type: string;
  timezone: string;
  external_id: string | null;
};

type UserRow = {
  id: string;
  tenant_id: string | null;
  email: string;
  full_name: string | null;
  status: string;
};

type MembershipRow = {
  id: string;
  tenant_id: string;
  user_id: string;
  organization_id: string | null;
  facility_id: string | null;
  role_name: string;
  status: string;
  created_at: string;
};

type DataSourceRow = {
  id: string;
  tenant_id: string;
  organization_id: string;
  source_type: string;
  name: string;
  base_url: string;
  auth_type: string;
  sync_frequency: string;
  last_sync_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AdminOverview = {
  tenantId: string;
  tenantRoles: string[];
  organizations: OrganizationRow[];
  facilities: FacilityRow[];
  users: UserRow[];
  dataSources: DataSourceRow[];
  memberships: Array<
    MembershipRow & {
      user: UserRow | null;
      organization: OrganizationRow | null;
      facility: FacilityRow | null;
    }
  >;
};

function requireAdminClient() {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  return client;
}

function requireTenantAdmin(context: SessionContext) {
  const tenantId = context.activeTenant?.tenantId;

  if (!tenantId || !canManageTenantContext(context, tenantId)) {
    throw new Error("Active tenant admin access is required.");
  }

  return tenantId;
}

export async function getAdminOverview(context: SessionContext): Promise<AdminOverview> {
  const tenantId = requireTenantAdmin(context);
  const client = requireAdminClient();

  const [orgResult, facilityResult, membershipResult, dataSourceResult] = await Promise.all([
    client
      .from("organizations")
      .select("id, tenant_id, name, type, status")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true }),
    client
      .from("facilities")
      .select("id, tenant_id, organization_id, name, facility_type, timezone, external_id")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true }),
    client
      .from("tenant_memberships")
      .select("id, tenant_id, user_id, organization_id, facility_id, role_name, status, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false }),
    client
      .from("data_sources")
      .select(
        "id, tenant_id, organization_id, source_type, name, base_url, auth_type, sync_frequency, last_sync_at, status, created_at, updated_at"
      )
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
  ]);

  if (orgResult.error) {
    throw new Error(orgResult.error.message);
  }

  if (facilityResult.error) {
    throw new Error(facilityResult.error.message);
  }

  if (membershipResult.error) {
    throw new Error(membershipResult.error.message);
  }

  if (dataSourceResult.error && dataSourceResult.error.code !== "42P01") {
    throw new Error(dataSourceResult.error.message);
  }

  const organizations = (orgResult.data ?? []) as OrganizationRow[];
  const facilities = (facilityResult.data ?? []) as FacilityRow[];
  const memberships = (membershipResult.data ?? []) as MembershipRow[];
  const dataSources =
    dataSourceResult.error?.code === "42P01"
      ? []
      : ((dataSourceResult.data ?? []) as DataSourceRow[]);
  const userIds = Array.from(new Set(memberships.map((membership) => membership.user_id)));

  const usersResult =
    userIds.length > 0
      ? await requireAdminClient()
          .from("users")
          .select("id, tenant_id, email, full_name, status")
          .in("id", userIds)
      : { data: [], error: null };

  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }

  const userMap = new Map((usersResult.data ?? []).map((user) => [user.id, user as UserRow]));
  const orgMap = new Map(organizations.map((organization) => [organization.id, organization]));
  const facilityMap = new Map(facilities.map((facility) => [facility.id, facility]));

  return {
    tenantId,
    tenantRoles: getTenantRoles(context, tenantId),
    organizations,
    facilities,
    users: (usersResult.data ?? []) as UserRow[],
    dataSources,
    memberships: memberships.map((membership) => ({
      ...membership,
      user: userMap.get(membership.user_id) ?? null,
      organization: membership.organization_id
        ? orgMap.get(membership.organization_id) ?? null
        : null,
      facility: membership.facility_id ? facilityMap.get(membership.facility_id) ?? null : null
    }))
  };
}

export type IntegrationOverview = {
  tenantId: string;
  organizations: OrganizationRow[];
  dataSources: DataSourceRow[];
};

export async function getIntegrationOverview(context: SessionContext): Promise<IntegrationOverview> {
  const overview = await getAdminOverview(context);

  return {
    tenantId: overview.tenantId,
    organizations: overview.organizations,
    dataSources: overview.dataSources
  };
}

export async function insertAuditEvent(context: SessionContext, action: string, targetId: string) {
  const tenantId = requireTenantAdmin(context);
  const client = requireAdminClient();

  const { error } = await client.from("audit_events").insert({
    tenant_id: tenantId,
    actor_user_id: context.actor.id,
    action,
    target_type: "tenant_admin_action",
    target_id: targetId,
    outcome: "success",
    metadata: createAuditEvent({
      action,
      actorId: context.actor.id,
      tenantId,
      targetType: "tenant_admin_action",
      targetId,
      outcome: "success"
    })
  });

  if (error) {
    throw new Error(error.message);
  }
}
