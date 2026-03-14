import { createSupabaseAdminClient } from "@healthscope/auth/supabase";
import type { SessionContext } from "@healthscope/auth";

async function snapshotMetric(tenantId: string, metricKey: string, metricGroup: string, label: string, value: number) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");
  const now = new Date();
  const periodEnd = now.toISOString();
  const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await client.from("analytics_metric_snapshots").upsert(
    {
      tenant_id: tenantId,
      organization_id: null,
      facility_id: null,
      metric_key: metricKey,
      metric_group: metricGroup,
      metric_label: label,
      period_start: periodStart,
      period_end: periodEnd,
      value_numeric: value,
      dimensions: {}
    },
    {
      onConflict: "tenant_id,organization_id,facility_id,metric_key,period_start,period_end"
    }
  );

  if (error) throw new Error(error.message);
}

async function fetchQueuedJobs(tenantId: string) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");

  const { data, error } = await client
    .from("integration_sync_jobs")
    .select("id, data_source_id, attempts")
    .eq("tenant_id", tenantId)
    .eq("status", "queued")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function markRunning(jobId: string, tenantId: string) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");
  const started = new Date().toISOString();
  const { error } = await client
    .from("integration_sync_jobs")
    .update({ status: "running", started_at: started })
    .eq("tenant_id", tenantId)
    .eq("id", jobId);
  if (error) throw new Error(error.message);
}

async function markFinished(params: {
  tenantId: string;
  jobId: string;
  dataSourceId: string;
  attempts: number;
  status: "succeeded" | "failed";
  message: string;
}) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");
  const finished = new Date().toISOString();
  const { error } = await client
    .from("integration_sync_jobs")
    .update({
      status: params.status,
      attempts: params.attempts + 1,
      finished_at: finished,
      message: params.message
    })
    .eq("tenant_id", params.tenantId)
    .eq("id", params.jobId);
  if (error) throw new Error(error.message);

  const { error: eventErr } = await client.from("integration_job_events").insert({
    tenant_id: params.tenantId,
    job_id: params.jobId,
    level: params.status === "succeeded" ? "info" : "error",
    message: params.message,
    details: { demo: true },
    occurred_at: finished
  });
  if (eventErr) throw new Error(eventErr.message);

  if (params.status === "succeeded") {
    await client
      .from("data_sources")
      .update({ last_sync_at: finished, status: "active" })
      .eq("tenant_id", params.tenantId)
      .eq("id", params.dataSourceId);
  }
}

async function insertDemoData(tenantId: string) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");

  // Insert a lightweight patient + encounter row to show movement
  const patientId = crypto.randomUUID();
  const encounterId = crypto.randomUUID();

  await client.from("patients").upsert(
    {
      id: patientId,
      tenant_id: tenantId,
      organization_id: null,
      facility_id: null,
      external_id: `demo-pat-${patientId.slice(0, 8)}`,
      mrn: `DEMO-${patientId.slice(0, 6)}`,
      first_name: "Demo",
      last_name: "Patient",
      birth_date: "1980-01-01",
      sex: "other",
      status: "active"
    },
    { onConflict: "tenant_id,external_id" }
  );

  await client.from("clinical_encounters").upsert(
    {
      id: encounterId,
      tenant_id: tenantId,
      organization_id: null,
      facility_id: null,
      patient_id: patientId,
      provider_id: null,
      external_id: `demo-enc-${encounterId.slice(0, 8)}`,
      encounter_type: "telehealth",
      status: "completed",
      encounter_at: new Date().toISOString(),
      length_of_stay_days: 0,
      primary_diagnosis_code: "Z00.0"
    },
    { onConflict: "tenant_id,external_id" }
  );

  // Refresh snapshot counts
  const [{ count: patientCount }, { count: encounterCount }] = await Promise.all([
    client.from("patients").select("id", { head: true, count: "exact" }).eq("tenant_id", tenantId),
    client
      .from("clinical_encounters")
      .select("id", { head: true, count: "exact" })
      .eq("tenant_id", tenantId)
  ]);

  await snapshotMetric(tenantId, "patients.total", "clinical", "Total patients", patientCount ?? 0);
  await snapshotMetric(
    tenantId,
    "encounters.total",
    "clinical",
    "Total encounters",
    encounterCount ?? 0
  );
}

export async function processQueuedJobs(context: SessionContext) {
  const tenantId = context.activeTenant?.tenantId;
  if (!tenantId) {
    throw new Error("Active tenant is required.");
  }

  const jobs = await fetchQueuedJobs(tenantId);
  if (!jobs.length) {
    return { processed: 0 };
  }

  for (const job of jobs) {
    await markRunning(job.id, tenantId);
    try {
      await insertDemoData(tenantId);
      await markFinished({
        tenantId,
        jobId: job.id,
        dataSourceId: job.data_source_id,
        attempts: job.attempts ?? 0,
        status: "succeeded",
        message: "Demo run completed."
      });
    } catch (err) {
      await markFinished({
        tenantId,
        jobId: job.id,
        dataSourceId: job.data_source_id,
        attempts: job.attempts ?? 0,
        status: "failed",
        message: err instanceof Error ? err.message : "Job failed"
      });
    }
  }

  return { processed: jobs.length };
}
