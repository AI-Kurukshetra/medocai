type SuggestionDetailProps = {
  params: { id: string };
};

export default function SuggestionDetailPage({ params }: SuggestionDetailProps) {
  return (
    <section>
      <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
        Code Suggestion · {params.id}
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Evidence, confidence, and decision capture placeholder.
      </p>
      <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
        Accept / Reject decision panel placeholder.
      </div>
    </section>
  );
}
