export const CORE_DOMAINS = [
  "auth",
  "tenancy",
  "compliance",
  "integrations",
  "warehouse",
  "analytics"
] as const;

export const CORE_API_ROUTES = [
  {
    path: "/api/v1/auth/session",
    summary: "Resolve user, tenant, and role context."
  },
  {
    path: "/api/v1/analytics/overview",
    summary: "Return tenant-scoped clinical, financial, and operational summary metrics."
  },
  {
    path: "/api/v1/organizations",
    summary: "List tenant organizations and core metadata."
  },
  {
    path: "/api/v1/health",
    summary: "Expose service status and architecture baseline."
  },
  {
    path: "/api/v1/compliance/audit-events",
    summary: "Review audit trails for PHI-sensitive actions."
  }
] as const;

export const organizationSeed = [
  {
    id: "org_demo",
    tenantId: "tenant_demo",
    name: "Northwind Regional Health",
    status: "onboarding",
    facilities: 1
  }
];
