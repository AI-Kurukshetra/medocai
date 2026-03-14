import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DocumentRow = {
  id: string;
  title: string | null;
  document_type: string;
  status: string;
  updated_at: string;
};

export default async function PhysicianDashboard() {
  const supabase = await createSupabaseServerClient();
  const { data: documents } = await supabase
    .from("clinical_documents")
    .select("id, title, document_type, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(6)
    .returns<DocumentRow[]>();

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
          <div style={{ fontWeight: 600 }}>Recent documents</div>
          {!documents || documents.length === 0 ? (
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
