import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const requestId = request.headers.get("x-request-id") ?? "unknown";
    return NextResponse.json({
      ok: true,
      requestId,
      env: {
        nodeEnv: env.NODE_ENV,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
