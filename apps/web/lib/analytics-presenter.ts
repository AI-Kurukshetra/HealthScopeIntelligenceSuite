export type AnalyticsOverview = {
  tenantId: string;
  windowDays: number;
  filters: {
    organizationId: string | null;
    facilityId: string | null;
  };
  summary: {
    totalPatients: number;
    encountersInWindow: number;
    inpatientAdmissionsInWindow: number;
    claimsInWindow: number;
    paidAmountInWindow: number;
    denialRate: number;
    qualityAdherenceRate: number;
    activeSources: number;
  };
  clinical: {
    averageLengthOfStayDays: number;
    emergencyVisitsInWindow: number;
    telehealthVisitsInWindow: number;
  };
  financial: {
    billedAmountInWindow: number;
    allowedAmountInWindow: number;
    deniedClaimsInWindow: number;
  };
  quality: {
    measuresEvaluatedInWindow: number;
    measuresMetInWindow: number;
  };
  operational: {
    totalSources: number;
    sourcesInError: number;
    sourcesPaused: number;
  };
};

export function buildEmptyAnalyticsOverview(
  tenantId: string,
  windowDays: number,
  filters: AnalyticsOverview["filters"]
): AnalyticsOverview {
  return {
    tenantId,
    windowDays,
    filters,
    summary: {
      totalPatients: 0,
      encountersInWindow: 0,
      inpatientAdmissionsInWindow: 0,
      claimsInWindow: 0,
      paidAmountInWindow: 0,
      denialRate: 0,
      qualityAdherenceRate: 0,
      activeSources: 0
    },
    clinical: {
      averageLengthOfStayDays: 0,
      emergencyVisitsInWindow: 0,
      telehealthVisitsInWindow: 0
    },
    financial: {
      billedAmountInWindow: 0,
      allowedAmountInWindow: 0,
      deniedClaimsInWindow: 0
    },
    quality: {
      measuresEvaluatedInWindow: 0,
      measuresMetInWindow: 0
    },
    operational: {
      totalSources: 0,
      sourcesInError: 0,
      sourcesPaused: 0
    }
  };
}

export function formatAnalyticsNumber(value: number, variant: "integer" | "currency" | "percent") {
  if (variant === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  if (variant === "percent") {
    return `${value.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);
}
