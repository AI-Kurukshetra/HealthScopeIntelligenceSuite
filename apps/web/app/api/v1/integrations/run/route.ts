import { NextResponse } from "next/server";
import { requireSession } from "@healthscope/auth/server";
import { processQueuedJobs } from "../../../../../lib/job-runner";

export async function POST() {
  const session = await requireSession();

  if (!session.ok) {
    return NextResponse.json(
      {
        data: null,
        pagination: null,
        meta: { version: "v1" },
        error: { code: session.code, message: session.message }
      },
      { status: session.status }
    );
  }

  try {
    const result = await processQueuedJobs(session.context);

    return NextResponse.json({
      data: result,
      pagination: null,
      meta: { version: "v1" },
      error: null
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        pagination: null,
        meta: { version: "v1" },
        error: {
          code: "JOB_RUN_FAILED",
          message: error instanceof Error ? error.message : "Unable to run jobs."
        }
      },
      { status: 500 }
    );
  }
}
