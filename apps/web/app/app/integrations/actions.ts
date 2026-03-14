"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@healthscope/auth/supabase";
import { requireTenantAdminSession } from "../../../lib/auth-guards";
import { insertAuditEvent } from "../../../lib/admin";

function readValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function integrationsRedirect(kind: "success" | "error", message: string) {
  const params = new URLSearchParams({
    [kind]: message
  });

  redirect(`/app/integrations?${params.toString()}`);
}

export async function createFhirSourceAction(formData: FormData) {
  try {
    const session = await requireTenantAdminSession();
    const client = createSupabaseAdminClient();

    if (!client) {
      throw new Error("Supabase service role environment is not configured.");
    }

    const tenantId = session.context.activeTenant?.tenantId;
    const organizationId = readValue(formData, "organizationId");
    const name = readValue(formData, "name");
    const baseUrl = readValue(formData, "baseUrl");
    const authType = readValue(formData, "authType") || "oauth2";
    const syncFrequency = readValue(formData, "syncFrequency") || "hourly";

    if (!tenantId || !organizationId || !name || !baseUrl) {
      throw new Error("Organization, source name, and base URL are required.");
    }

    const { data: organization, error: organizationError } = await client
      .from("organizations")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      throw new Error(organizationError.message);
    }

    if (!organization) {
      throw new Error("Selected organization is outside the active tenant.");
    }

    const { data, error } = await client
      .from("data_sources")
      .insert({
        tenant_id: tenantId,
        organization_id: organizationId,
        source_type: "fhir",
        name,
        base_url: baseUrl,
        auth_type: authType,
        sync_frequency: syncFrequency,
        status: "active"
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await insertAuditEvent(session.context, "integration.fhir_source.created", data.id);
    revalidatePath("/app/integrations");
  } catch (error) {
    integrationsRedirect(
      "error",
      error instanceof Error ? error.message : "Unable to create FHIR source."
    );
  }

  integrationsRedirect("success", "FHIR source registered.");
}

export async function updateDataSourceStatusAction(formData: FormData) {
  try {
    const session = await requireTenantAdminSession();
    const client = createSupabaseAdminClient();

    if (!client) {
      throw new Error("Supabase service role environment is not configured.");
    }

    const tenantId = session.context.activeTenant?.tenantId;
    const sourceId = readValue(formData, "sourceId");
    const status = readValue(formData, "status") || "active";

    if (!tenantId || !sourceId) {
      throw new Error("Source update is missing required fields.");
    }

    const { error } = await client
      .from("data_sources")
      .update({
        status
      })
      .eq("tenant_id", tenantId)
      .eq("id", sourceId);

    if (error) {
      throw new Error(error.message);
    }

    await insertAuditEvent(session.context, "integration.source.status_updated", sourceId);
    revalidatePath("/app/integrations");
  } catch (error) {
    integrationsRedirect(
      "error",
      error instanceof Error ? error.message : "Unable to update source status."
    );
  }

  integrationsRedirect("success", "Source status updated.");
}
