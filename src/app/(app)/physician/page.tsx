"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DocumentRow = {
  id: string;
  title: string | null;
  document_type: string;
  status: string;
  updated_at: string;
};

export default function PhysicianDashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/documents?limit=6", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Unable to load documents.");
        }
        const payload = await response.json();
        const items = Array.isArray(payload)
          ? payload
          : (payload.documents ?? []);
        if (!cancelled) {
          setDocuments(
            items.map((doc: DocumentRow) => ({
              id: doc.id,
              title: doc.title ?? null,
              document_type: doc.document_type ?? "unknown",
              status: doc.status ?? "draft",
              updated_at: doc.updated_at ?? "",
            }))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load.");
          setDocuments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDocuments();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
        Physician Dashboard
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Pending queries and documentation tasks will appear here.
      </p>
      <div style={{ display: "grid", gap: "12px", maxWidth: "720px" }}>
        <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
          KPI strip placeholder: pending queries, suggestions, response time.
        </div>
        <div
          style={{
            padding: "16px",
            border: "1px solid #d9e0df",
            display: "grid",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ fontWeight: 600 }}>Recent documents</div>
            <button
              type="button"
              onClick={() => {
                const nextId =
                  typeof crypto?.randomUUID === "function"
                    ? crypto.randomUUID()
                    : `${Date.now()}`;
                router.push(`/documents/${nextId}`);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: "1px solid #0f2a2a",
                background: "#ffffff",
                color: "#0f2a2a",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: "pointer",
              }}
            >
              Create document
            </button>
          </div>
          {loading ? (
            <div style={{ color: "#4a5a5a", fontSize: "14px" }}>
              Loading documents...
            </div>
          ) : error ? (
            <div style={{ color: "#8a2b2b", fontSize: "14px" }}>{error}</div>
          ) : documents.length === 0 ? (
            <div style={{ color: "#4a5a5a", fontSize: "14px" }}>
              No documents found yet. Open a document editor to create one.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
