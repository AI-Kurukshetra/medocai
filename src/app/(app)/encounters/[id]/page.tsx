type EncounterDetailProps = {
  params: { id: string };
};

export default function EncounterDetailPage({ params }: EncounterDetailProps) {
  return (
    <section>
      <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
        Encounter · {params.id}
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Encounter summary and linked documents placeholder.
      </p>
      <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
        Document list and status cards placeholder.
      </div>
    </section>
  );
}
