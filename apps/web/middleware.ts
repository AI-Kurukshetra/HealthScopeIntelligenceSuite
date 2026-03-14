import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@healthscope/auth/supabase";
import { hasSupabaseEnv } from "@healthscope/config";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!hasSupabaseEnv()) {
    return response;
  }

  const supabase = createSupabaseMiddlewareClient(request, response);

  if (!supabase) {
    return response;
  }

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

