"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CdiCaseRow = {
  document_id: string;
  title: string | null;
  document_type: string;
  status: string;
  updated_at: string;
  gaps_open?: number;
  gaps_total?: number;
};

export default function CdiQueuePage() {
  const [cases, setCases] = useState<CdiCaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/cdi/cases?limit=8", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Unable to load CDI cases.");
        }
        const payload = await response.json();
        const items = Array.isArray(payload)
          ? payload
          : (payload.cases ?? []);
        if (!cancelled) {
          setCases(
            items.map((item: CdiCaseRow) => ({
              document_id: item.document_id ?? item.id,
              title: item.title ?? null,
              document_type: item.document_type ?? "unknown",
              status: item.status ?? "draft",
              updated_at: item.updated_at ?? "",
              gaps_open: item.gaps_open ?? 0,
              gaps_total: item.gaps_total ?? 0,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load.");
          setCases([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCases();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>CDI Queue</h1>
      <p style={{ marginBottom: "16px" }}>
        Cases requiring documentation review and gap follow-up.
      </p>
      <div
        style={{
          padding: "16px",
          border: "1px solid #d9e0df",
          display: "grid",
          gap: "12px",
          maxWidth: "720px",
        }}
      >
        <div style={{ fontWeight: 600 }}>Recent cases</div>
        {loading ? (
          <div style={{ color: "#4a5a5a", fontSize: "14px" }}>
            Loading cases...
          </div>
        ) : error ? (
          <div style={{ color: "#8a2b2b", fontSize: "14px" }}>{error}</div>
        ) : cases.length === 0 ? (
          <div style={{ color: "#4a5a5a", fontSize: "14px" }}>
            No documents found yet. Ask a physician to create a note first.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {cases.map((doc) => (
              <Link
                key={doc.document_id}
                href={`/cdi/cases/${doc.document_id}`}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #e2e6e5",
                  display: "grid",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <strong>{doc.title ?? "Untitled document"}</strong>
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontSize: "11px",
                      color: "#4a5a5a",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {doc.status}
                  </span>
                </div>
                <div style={{ color: "#4a5a5a", fontSize: "13px" }}>
                  Type: {doc.document_type}
                </div>
                <div style={{ color: "#4a5a5a", fontSize: "12px" }}>
                  Gaps: {doc.gaps_open ?? 0} open · {doc.gaps_total ?? 0} total
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
