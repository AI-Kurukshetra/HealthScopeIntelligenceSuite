import { createBrowserClient } from "@supabase/ssr";
import {
  hasSupabaseEnv,
  requirePublicSupabaseAnonKey,
  requirePublicSupabaseUrl
} from "@healthscope/config";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return createBrowserClient(requirePublicSupabaseUrl(), requirePublicSupabaseAnonKey());
}
