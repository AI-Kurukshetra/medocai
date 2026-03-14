type CompliancePageProps = {
  params: { encounter_id: string };
};

export default function ComplianceChecklistPage({
  params,
}: CompliancePageProps) {
  return (
    <section>
      <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
        Compliance Checklist · {params.encounter_id}
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Compliance checklist with evidence tracking placeholder.
      </p>
      <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
        Checklist placeholder.
      </div>
    </section>
  );
}
