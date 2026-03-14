import { createSupabaseAdminClient } from "@healthscope/auth/supabase";
import type { SessionContext } from "@healthscope/auth";
import {
  buildEmptyAnalyticsOverview,
  type AnalyticsOverview
} from "./analytics-presenter";

type AnalyticsFilters = {
  days?: number;
  organizationId?: string | null;
  facilityId?: string | null;
};

export type TenantReferenceData = {
  organizations: Array<{
    id: string;
    name: string;
  }>;
  facilities: Array<{
    id: string;
    name: string;
    organization_id: string | null;
  }>;
};

type EncounterRow = {
  encounter_type: string;
  length_of_stay_days: number | null;
};

type ClaimRow = {
  claim_status: string;
  billed_amount: number | null;
  allowed_amount: number | null;
  paid_amount: number | null;
};

type QualityRow = {
  measure_status: string;
};

type SourceRow = {
  status: string;
};

function requireAdminClient() {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  return client;
}

function getTenantId(context: SessionContext) {
  const tenantId = context.activeTenant?.tenantId ?? context.memberships[0]?.tenantId;

  if (!tenantId) {
    throw new Error("Active tenant context is required.");
  }

  return tenantId;
}

function clampWindowDays(value: number | undefined) {
  if (!value || Number.isNaN(value)) {
    return 30;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 365);
}

function isMissingRelationTable(error: { code?: string } | null) {
  return error?.code === "42P01";
}

export async function getAnalyticsOverview(
  context: SessionContext,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsOverview> {
  const tenantId = getTenantId(context);
  const client = requireAdminClient();
  const organizationId = filters.organizationId ?? null;
  const facilityId = filters.facilityId ?? null;
  const windowDays = clampWindowDays(filters.days);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - windowDays);
  const sinceIso = since.toISOString();

  let patientsQuery: any = client
    .from("patients")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  let encountersQuery: any = client
    .from("clinical_encounters")
    .select("encounter_type, length_of_stay_days")
    .eq("tenant_id", tenantId)
    .gte("encounter_at", sinceIso);
  let claimsQuery: any = client
    .from("insurance_claims")
    .select("claim_status, billed_amount, allowed_amount, paid_amount")
    .eq("tenant_id", tenantId)
    .gte("submitted_at", sinceIso);
  let qualityQuery: any = client
    .from("quality_measure_results")
    .select("measure_status")
    .eq("tenant_id", tenantId)
    .gte("measured_at", sinceIso);
  let sourcesQuery: any = client.from("data_sources").select("status").eq("tenant_id", tenantId);

  if (organizationId) {
    patientsQuery = patientsQuery.eq("organization_id", organizationId);
    encountersQuery = encountersQuery.eq("organization_id", organizationId);
    claimsQuery = claimsQuery.eq("organization_id", organizationId);
    qualityQuery = qualityQuery.eq("organization_id", organizationId);
    sourcesQuery = sourcesQuery.eq("organization_id", organizationId);
  }

  if (facilityId) {
    patientsQuery = patientsQuery.eq("facility_id", facilityId);
    encountersQuery = encountersQuery.eq("facility_id", facilityId);
    claimsQuery = claimsQuery.eq("facility_id", facilityId);
    qualityQuery = qualityQuery.eq("facility_id", facilityId);
  }

  const [patientsResult, encountersResult, claimsResult, qualityResult, sourcesResult] =
    await Promise.all([
      patientsQuery,
      encountersQuery,
      claimsQuery,
      qualityQuery,
      sourcesQuery
    ]);

  const filtersState = {
    organizationId,
    facilityId
  };

  if (isMissingRelationTable(patientsResult.error)) {
    return buildEmptyAnalyticsOverview(tenantId, windowDays, filtersState);
  }

  if (patientsResult.error) {
    throw new Error(patientsResult.error.message);
  }

  if (encountersResult.error) {
    throw new Error(encountersResult.error.message);
  }

  if (claimsResult.error) {
    throw new Error(claimsResult.error.message);
  }

  if (qualityResult.error) {
    throw new Error(qualityResult.error.message);
  }

  if (sourcesResult.error && !isMissingRelationTable(sourcesResult.error)) {
    throw new Error(sourcesResult.error.message);
  }

  const encounters = (encountersResult.data ?? []) as EncounterRow[];
  const claims = (claimsResult.data ?? []) as ClaimRow[];
  const qualityResults = (qualityResult.data ?? []) as QualityRow[];
  const sources = (sourcesResult.data ?? []) as SourceRow[];

  const inpatientAdmissions = encounters.filter(
    (encounter) => encounter.encounter_type === "inpatient"
  ).length;
  const emergencyVisits = encounters.filter(
    (encounter) => encounter.encounter_type === "emergency"
  ).length;
  const telehealthVisits = encounters.filter(
    (encounter) => encounter.encounter_type === "telehealth"
  ).length;
  const losValues = encounters
    .map((encounter) => Number(encounter.length_of_stay_days ?? 0))
    .filter((value) => value > 0);

  const deniedClaims = claims.filter((claim) => claim.claim_status === "denied").length;
  const billedAmount = claims.reduce((total, claim) => total + Number(claim.billed_amount ?? 0), 0);
  const allowedAmount = claims.reduce(
    (total, claim) => total + Number(claim.allowed_amount ?? 0),
    0
  );
  const paidAmount = claims.reduce((total, claim) => total + Number(claim.paid_amount ?? 0), 0);
  const measuresMet = qualityResults.filter((measure) => measure.measure_status === "met").length;
  const evaluatedMeasures = qualityResults.filter(
    (measure) => measure.measure_status !== "excluded"
  ).length;
  const activeSources = sources.filter((source) => source.status === "active").length;
  const pausedSources = sources.filter((source) => source.status === "paused").length;
  const sourcesInError = sources.filter((source) => source.status === "error").length;

  return {
    tenantId,
    windowDays,
    filters: filtersState,
    summary: {
      totalPatients: patientsResult.count ?? 0,
      encountersInWindow: encounters.length,
      inpatientAdmissionsInWindow: inpatientAdmissions,
      claimsInWindow: claims.length,
      paidAmountInWindow: paidAmount,
      denialRate: claims.length > 0 ? (deniedClaims / claims.length) * 100 : 0,
      qualityAdherenceRate:
        evaluatedMeasures > 0 ? (measuresMet / evaluatedMeasures) * 100 : 0,
      activeSources
    },
    clinical: {
      averageLengthOfStayDays:
        losValues.length > 0 ? losValues.reduce((a, b) => a + b, 0) / losValues.length : 0,
      emergencyVisitsInWindow: emergencyVisits,
      telehealthVisitsInWindow: telehealthVisits
    },
    financial: {
      billedAmountInWindow: billedAmount,
      allowedAmountInWindow: allowedAmount,
      deniedClaimsInWindow: deniedClaims
    },
    quality: {
      measuresEvaluatedInWindow: evaluatedMeasures,
      measuresMetInWindow: measuresMet
    },
    operational: {
      totalSources: sources.length,
      sourcesInError,
      sourcesPaused: pausedSources
    }
  };
}

export async function getTenantReferenceData(
  context: SessionContext
): Promise<TenantReferenceData> {
  const tenantId = getTenantId(context);
  const client = requireAdminClient();

  const [organizationsResult, facilitiesResult] = await Promise.all([
    client
      .from("organizations")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true }),
    client
      .from("facilities")
      .select("id, name, organization_id")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true })
  ]);

  if (organizationsResult.error) {
    throw new Error(organizationsResult.error.message);
  }

  if (facilitiesResult.error) {
    throw new Error(facilitiesResult.error.message);
  }

  return {
    organizations: organizationsResult.data ?? [],
    facilities: facilitiesResult.data ?? []
  };
}
