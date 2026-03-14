type TemplateEditorProps = {
  params: { id: string };
};

export default function TemplateEditorPage({ params }: TemplateEditorProps) {
  return (
    <section>
      <h1 style={{ fontSize: "26px", marginBottom: "12px" }}>
        Template Editor · {params.id}
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Section builder and version notes placeholder.
      </p>
      <div style={{ padding: "16px", border: "1px solid #d9e0df" }}>
        Template editor placeholder.
      </div>
    </section>
  );
}
