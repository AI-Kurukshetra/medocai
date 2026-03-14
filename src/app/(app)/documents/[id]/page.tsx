"use client";

import { useEffect, useMemo, useState } from "react";
import { GapBadge } from "@/components/GapBadge";

type DocumentEditorProps = {
  params: { id: string };
};

type GapItem = {
  id: string;
  gap_type: string;
  severity: "low" | "medium" | "high" | string;
  description: string | null;
  status: "open" | "converted" | "closed" | string;
};

type SaveState = "idle" | "saving" | "success" | "error";

export default function DocumentEditorPage({ params }: DocumentEditorProps) {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("progress_note");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("Not started");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [gapsLoading, setGapsLoading] = useState(false);

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

  useEffect(() => {
    void fetchGaps();
  }, [params.id]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState("saving");
    setSaveMessage(null);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          title,
          document_type: documentType,
          status,
          content,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error ?? "Save failed");
      }

      setSaveState("success");
      setSaveMessage("Document saved. Analysis queued.");
      setAnalysisStatus("Queued");
      void fetchGaps();
    } catch (error) {
      setSaveState("error");
      setSaveMessage(
        error instanceof Error ? error.message : "Unable to save document."
      );
    }
  }

  return (
    <section style={{ display: "grid", gap: "16px" }}>
      <header>
        <h1 style={{ fontSize: "26px", marginBottom: "8px" }}>
          Document Editor · {params.id}
        </h1>
        <p style={{ color: "#4a5a5a" }}>
          Draft clinical note with analysis status and gap review.
        </p>
      </header>

      <form
        onSubmit={handleSave}
        style={{
          display: "grid",
          gap: "12px",
          padding: "16px",
          border: "1px solid #d9e0df",
          borderRadius: "12px",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr 1fr" }}>
          <input
            type="text"
            placeholder="Document title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d9e0df",
            }}
          />
          <input
            type="text"
            placeholder="Document type (e.g. progress_note)"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
            required
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d9e0df",
            }}
          />
        </div>
        <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "160px 1fr" }}>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d9e0df",
            }}
          >
            <option value="draft">Draft</option>
            <option value="final">Final</option>
          </select>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#4a5a5a",
              fontSize: "14px",
            }}
          >
            Analysis status: <strong>{analysisStatus}</strong>
          </div>
        </div>
        <textarea
          placeholder="Document content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={10}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d9e0df",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            type="submit"
            disabled={saveState === "saving"}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#0f2a2a",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            {saveState === "saving" ? "Saving..." : "Save document"}
          </button>
          {saveMessage ? (
            <span
              style={{
                fontSize: "13px",
                color: saveState === "error" ? "#8a2b2b" : "#1b5a3b",
              }}
            >
              {saveMessage}
            </span>
          ) : null}
        </div>
      </form>

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
              Documentation gaps
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
    </section>
  );
}
