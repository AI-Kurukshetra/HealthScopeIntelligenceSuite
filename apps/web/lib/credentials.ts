import { createSupabaseAdminClient } from "@healthscope/auth/supabase";
import type { SessionContext } from "@healthscope/auth";

export type SourceCredential = {
  id: string;
  data_source_id: string;
  auth_type: string;
  client_id: string | null;
  client_secret: string | null;
  token_url: string | null;
  api_key: string | null;
  basic_username: string | null;
  basic_password: string | null;
  updated_at: string;
};

export async function getCredentialsForSources(context: SessionContext) {
  const tenantId = context.activeTenant?.tenantId;

  if (!tenantId) {
    return [];
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const { data, error } = await client
    .from("data_source_credentials")
    .select(
      "id, data_source_id, auth_type, client_id, client_secret, token_url, api_key, basic_username, basic_password, updated_at"
    )
    .eq("tenant_id", tenantId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as SourceCredential[];
}

export async function upsertSourceCredentials(params: {
  tenantId: string;
  dataSourceId: string;
  authType: string;
  clientId?: string | null;
  clientSecret?: string | null;
  tokenUrl?: string | null;
  apiKey?: string | null;
  basicUsername?: string | null;
  basicPassword?: string | null;
}) {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error("Supabase service role environment is not configured.");
  }

  const { error } = await client.from("data_source_credentials").upsert(
    {
      tenant_id: params.tenantId,
      data_source_id: params.dataSourceId,
      auth_type: params.authType,
      client_id: params.clientId ?? null,
      client_secret: params.clientSecret ?? null,
      token_url: params.tokenUrl ?? null,
      api_key: params.apiKey ?? null,
      basic_username: params.basicUsername ?? null,
      basic_password: params.basicPassword ?? null
    },
    { onConflict: "tenant_id,data_source_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
