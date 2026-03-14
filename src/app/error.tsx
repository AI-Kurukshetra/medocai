"use client";

import { useEffect } from "react";

import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("App error boundary", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Something went wrong.</h2>
      <p>We logged the issue and will investigate.</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
