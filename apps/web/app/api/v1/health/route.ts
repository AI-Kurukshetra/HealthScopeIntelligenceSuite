import { NextResponse } from "next/server";
import { getPlatformSummary } from "@healthscope/config";

export function GET() {
  return NextResponse.json({
    data: {
      status: "ok",
      service: "healthscope-web",
      summary: getPlatformSummary()
    },
    pagination: null,
    meta: {
      version: "v1"
    },
    error: null
  });
}

