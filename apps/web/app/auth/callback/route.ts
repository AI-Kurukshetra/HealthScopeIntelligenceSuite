import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@healthscope/auth/supabase";
import { hasSupabaseEnv } from "@healthscope/config";

export async function GET(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next") ?? "/app";
  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/app";
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(signInUrl);
  }

  if (!hasSupabaseEnv()) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "error",
      "Supabase environment variables are not configured for OAuth sign-in."
    );
    return NextResponse.redirect(signInUrl);
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("error", "OAuth provider did not return an authorization code.");
    return NextResponse.redirect(signInUrl);
  }

  const supabase = createSupabaseServerClient(await cookies());

  if (!supabase) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("error", "Unable to initialize Supabase server client.");
    return NextResponse.redirect(signInUrl);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.redirect(new URL(safeNextPath, request.url));
}
