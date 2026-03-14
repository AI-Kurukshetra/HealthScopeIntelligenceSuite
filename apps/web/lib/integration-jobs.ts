import { createSupabaseAdminClient } from "@healthscope/auth/supabase";
import { createAuditEvent } from "@healthscope/compliance";
import { SessionContext } from "@healthscope/auth";

export type IntegrationJobRow = {
  id: string;
  data_source_id: string;
  status: string;
  attempts: number;
  started_at: string | null;
  finished_at: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
};

export type IntegrationJobEvent = {
  id: string;
  job_id: string;
  level: string;
  message: string;
  occurred_at: string;
  details: Record<string, unknown>;
};

export async function createSyncJob(params: {
  tenantId: string;
  dataSourceId: string;
  triggeredByUserId: string;
}) {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const { data, error } = await client
    .from("integration_sync_jobs")
    .insert({
      tenant_id: params.tenantId,
      data_source_id: params.dataSourceId,
      status: "queued",
      triggered_by_user_id: params.triggeredByUserId,
      attempts: 0
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const audit = await client.from("audit_events").insert({
    tenant_id: params.tenantId,
    actor_user_id: params.triggeredByUserId,
    action: "integration.sync.job.created",
    target_type: "integration_sync_job",
    target_id: data.id,
    outcome: "success",
    metadata: createAuditEvent({
      action: "integration.sync.job.created",
      actorId: params.triggeredByUserId,
      tenantId: params.tenantId,
      targetType: "integration_sync_job",
      targetId: data.id,
      outcome: "success"
    })
  });

  if (audit.error) {
    throw new Error(audit.error.message);
  }
}

export async function getRecentJobs(context: SessionContext, limit = 10) {
  const tenantId = context.activeTenant?.tenantId;

  if (!tenantId) {
    throw new Error("Active tenant is required.");
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const { data, error } = await client
    .from("integration_sync_jobs")
    .select("id, data_source_id, status, attempts, started_at, finished_at, message, created_at, updated_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IntegrationJobRow[];
}

export async function getQueuedJobs(context: SessionContext) {
  const tenantId = context.activeTenant?.tenantId;

  if (!tenantId) {
    throw new Error("Active tenant is required.");
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const { data, error } = await client
    .from("integration_sync_jobs")
    .select("id, data_source_id, attempts")
    .eq("tenant_id", tenantId)
    .eq("status", "queued")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getRecentJobEvents(context: SessionContext, limit = 20) {
  const tenantId = context.activeTenant?.tenantId;

  if (!tenantId) {
    throw new Error("Active tenant is required.");
  }

  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const { data, error } = await client
    .from("integration_job_events")
    .select("id, job_id, level, message, details, occurred_at")
    .eq("tenant_id", tenantId)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IntegrationJobEvent[];
}

export async function simulateRunJob(params: {
  tenantId: string;
  jobId: string;
  dataSourceId: string;
  attempts: number;
}) {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const started = new Date();
  const finished = new Date();

  const { error: updateErr } = await client
    .from("integration_sync_jobs")
    .update({
      status: "succeeded",
      attempts: params.attempts + 1,
      started_at: started.toISOString(),
      finished_at: finished.toISOString(),
      message: "Demo sync completed."
    })
    .eq("tenant_id", params.tenantId)
    .eq("id", params.jobId);

  if (updateErr) {
    throw new Error(updateErr.message);
  }

  const { error: eventErr } = await client.from("integration_job_events").insert({
    tenant_id: params.tenantId,
    job_id: params.jobId,
    level: "info",
    message: "Demo sync processed 50 resources.",
    details: { resources: ["Patient", "Encounter"] },
    occurred_at: finished.toISOString()
  });

  if (eventErr) {
    throw new Error(eventErr.message);
  }

  await client
    .from("data_sources")
    .update({ last_sync_at: finished.toISOString(), status: "active" })
    .eq("tenant_id", params.tenantId)
    .eq("id", params.dataSourceId);
}
