export const DEFAULT_APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "HealthScope Intelligence Suite";
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string): string | null {
  return process.env[name] ?? null;
}

export function hasSupabaseEnv() {
  return Boolean(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function requirePublicSupabaseUrl(): string {
  if (!NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  return NEXT_PUBLIC_SUPABASE_URL;
}

export function requirePublicSupabaseAnonKey(): string {
  if (!NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function getPlatformSummary() {
  return {
    interopStrategy: "FHIR-first with extension points for HL7 v2",
    tenancyModel: "Shared Postgres with strict row-level security",
    analyticsFreshness: "Hourly batch",
    complianceBaseline: "HIPAA-aligned with full audit coverage"
  };
}
