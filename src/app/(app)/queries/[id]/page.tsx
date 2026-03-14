type QueryDetailProps = {
  params: { id: string };
};

export default function QueryDetailPage({ params }: QueryDetailProps) {
  return (
    <section>
      <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
        Query Detail · {params.id}
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Draft query content, neutral tone checks, and response options go here.
      </p>
      <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
        Timeline placeholder for query lifecycle + audit trail.
      </div>
    </section>
  );
}
