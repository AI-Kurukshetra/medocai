import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.status }
    );
  }

  logger.error("Unhandled API error", { error });
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "internal_error",
        message: "Unexpected server error.",
      },
    },
    { status: 500 }
  );
}
