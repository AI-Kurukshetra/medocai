import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main style={{ padding: "48px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
        Unauthorized
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Your current role does not have access to this page in the MVP.
      </p>
      <Link href="/login">Return to login</Link>
    </main>
  );
}
