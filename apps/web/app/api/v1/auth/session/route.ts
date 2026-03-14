import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@healthscope/auth/server";

export async function GET(request: NextRequest) {
  const result = await requireSession(request);

  if (!result.ok) {
    return NextResponse.json(
      {
        data: {
          authenticated: false,
          user: null,
          tenant: null
        },
        pagination: null,
        meta: {
          version: "v1"
        },
        error: {
          code: result.code,
          message: result.message
        }
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    data: result.payload,
    pagination: null,
    meta: {
      version: "v1"
    },
    error: null
  });
}
