"use client";

import { useEffect, useMemo, useState } from "react";
import { GapBadge } from "@/components/GapBadge";

type CdiCaseProps = {
  params: { id: string };
};

type GapItem = {
  id: string;
  gap_type: string;
  severity: "low" | "medium" | "high" | string;
  description: string | null;
  status: "open" | "converted" | "closed" | string;
};

export default function CdiCaseDetailPage({ params }: CdiCaseProps) {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("Awaiting run");

  const gapSummary = useMemo(() => {
    const total = gaps.length;
    const open = gaps.filter((gap) => gap.status === "open").length;
    return { total, open };
  }, [gaps]);

  async function fetchGaps() {
    setGapsLoading(true);
    try {
      const response = await fetch(`/api/gaps?document_id=${params.id}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load gaps");
      }
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.gaps ?? []);
      setGaps(
        items.map((item: GapItem) => ({
          id: item.id,
          gap_type: item.gap_type ?? "unspecified",
          severity: item.severity ?? "medium",
          description: item.description ?? "No description provided.",
          status: item.status ?? "open",
        }))
      );
    } catch (error) {
      setGaps([]);
    } finally {
      setGapsLoading(false);
    }
  }

  async function fetchDocument() {
    setDocLoading(true);
    setDocError(null);
    try {
      const response = await fetch(`/api/documents?id=${params.id}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Unable to load document.");
      }
      const payload = await response.json();
      const doc = Array.isArray(payload) ? payload[0] : payload?.document ?? payload;
      setDocumentTitle(doc?.title ?? "Untitled document");
      setDocumentType(doc?.document_type ?? "unknown");
      setDocumentStatus(doc?.status ?? "draft");
      setDocumentContent(doc?.content ?? "");
      setAnalysisStatus(doc?.analysis_status ?? "Awaiting run");
    } catch (error) {
      setDocError(error instanceof Error ? error.message : "Unable to load document.");
      setDocumentContent(null);
    } finally {
      setDocLoading(false);
    }
  }

  useEffect(() => {
    void fetchGaps();
    void fetchDocument();
  }, [params.id]);

  return (
    <section style={{ display: "grid", gap: "16px" }}>
      <header>
        <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
          CDI Case · {params.id}
        </h1>
        <p style={{ color: "#4a5a5a" }}>
          Review the document and evaluate documentation gaps.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
        }}
      >
        <section
          style={{
            padding: "16px",
            border: "1px solid #d9e0df",
            borderRadius: "12px",
            background: "#ffffff",
            display: "grid",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px" }}>Document preview</h2>
              <div style={{ fontSize: "13px", color: "#4a5a5a" }}>
                ID: <strong>{params.id}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchDocument}
              disabled={docLoading}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d9e0df",
                background: "#f6f7f7",
                cursor: "pointer",
                height: "fit-content",
              }}
            >
              {docLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div style={{ fontSize: "13px", color: "#4a5a5a" }}>
            <strong>{documentTitle ?? "Untitled document"}</strong> ·{" "}
            {documentType ?? "unknown"} ·{" "}
            {(documentStatus ?? "draft").toUpperCase()}
          </div>
          <div
            style={{
              border: "1px solid #e2e6e5",
              borderRadius: "10px",
              padding: "12px",
              minHeight: "180px",
              background: "#f9faf9",
              whiteSpace: "pre-wrap",
              fontSize: "14px",
              color: "#2b3c3b",
            }}
          >
            {docLoading
              ? "Loading document..."
              : docError
                ? docError
                : documentContent && documentContent.length > 0
                  ? documentContent
                  : "No document content available yet."}
          </div>
          <div style={{ fontSize: "13px", color: "#4a5a5a" }}>
            Analysis status: <strong>{analysisStatus}</strong>
          </div>
        </section>

        <section
          style={{
            padding: "16px",
            border: "1px solid #d9e0df",
            borderRadius: "12px",
            background: "#ffffff",
            display: "grid",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>
                Gap review
              </h2>
              <p style={{ fontSize: "13px", color: "#4a5a5a" }}>
                {gapSummary.total} gaps • {gapSummary.open} open
              </p>
            </div>
            <button
              type="button"
              onClick={fetchGaps}
              disabled={gapsLoading}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d9e0df",
                background: "#f6f7f7",
                cursor: "pointer",
              }}
            >
              {gapsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {gaps.length === 0 ? (
            <div style={{ fontSize: "14px", color: "#4a5a5a" }}>
              {gapsLoading
                ? "Loading gaps..."
                : "No gaps returned yet for this document."}
            </div>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {gaps.map((gap) => (
                <div
                  key={gap.id}
                  style={{
                    border: "1px solid #e2e6e5",
                    borderRadius: "10px",
                    padding: "12px",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <strong style={{ textTransform: "capitalize" }}>
                      {gap.gap_type.replace(/_/g, " ")}
                    </strong>
                    <GapBadge value={gap.severity} tone="severity" />
                    <GapBadge value={gap.status} tone="status" />
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#4a5a5a" }}>
                    {gap.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
