import { createSupabaseAdminClient } from "@healthscope/auth/supabase";

export type MetricSnapshotInput = {
  tenantId: string;
  metricKey: string;
  metricGroup: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  value: number;
};

export async function upsertSnapshot(input: MetricSnapshotInput) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");

  const { error } = await client.from("analytics_metric_snapshots").upsert(
    {
      tenant_id: input.tenantId,
      organization_id: null,
      facility_id: null,
      metric_key: input.metricKey,
      metric_group: input.metricGroup,
      metric_label: input.label,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      value_numeric: input.value,
      dimensions: {}
    },
    {
      onConflict: "tenant_id,organization_id,facility_id,metric_key,period_start,period_end"
    }
  );

  if (error) throw new Error(error.message);
}

export async function loadSnapshots(tenantId: string) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase service role environment is not configured.");

  const { data, error } = await client
    .from("analytics_metric_snapshots")
    .select("metric_key, metric_label, metric_group, value_numeric, period_start, period_end")
    .eq("tenant_id", tenantId)
    .order("period_end", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
