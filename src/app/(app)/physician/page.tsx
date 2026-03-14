export default function PhysicianDashboard() {
  return (
    <section>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
        Physician Dashboard
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Pending queries and documentation tasks will appear here.
      </p>
      <div style={{ display: "grid", gap: "12px", maxWidth: "560px" }}>
        <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
          KPI strip placeholder: pending queries, suggestions, response time.
        </div>
        <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
          Task list placeholder with filters and due dates.
        </div>
      </div>
    </section>
  );
}
