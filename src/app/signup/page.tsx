import Link from "next/link";
import { redirect } from "next/navigation";
import { Fraunces, Manrope } from "next/font/google";
import { getCurrentUser, signUpWithProfile } from "@/lib/auth";
import { roleLanding, roleLabels, type UserRole } from "@/lib/roles";
import { DEMO_ORG_ID } from "@/lib/demo";

const headingFont = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"] });

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

const roleOptions: UserRole[] = ["physician", "cdi", "coder", "admin"];

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect(roleLanding[user.role]);
  }

  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;
  const success = resolvedSearchParams?.success;

  async function signUp(formData: FormData) {
    "use server";
    const displayName = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const role = formData.get("role")?.toString() as UserRole | undefined;

    if (!displayName || !email || !password || !role) {
      redirect("/signup?error=Missing%20required%20fields");
    }

    if (!roleOptions.includes(role)) {
      redirect("/signup?error=Invalid%20role%20selection");
    }

    const result = await signUpWithProfile({
      email,
      password,
      displayName,
      role,
      organizationId: DEMO_ORG_ID,
    });

    if ("error" in result) {
      redirect(`/signup?error=${encodeURIComponent(result.error ?? "Unknown error")}`);
    }

    redirect("/login?success=Account%20created.%20Sign%20in%20to%20continue.");
  }

  return (
    <main
      className={bodyFont.className}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background:
          "radial-gradient(circle at top, rgba(15,42,42,0.12), transparent 45%), linear-gradient(135deg, #f1efe9 0%, #e6eceb 55%, #f9f7f4 100%)",
      }}
    >
      <section
        style={{
          width: "min(560px, 92vw)",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(15, 42, 42, 0.15)",
          border: "1px solid rgba(15, 42, 42, 0.08)",
        }}
      >
        <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
          <span
            style={{
              letterSpacing: "0.2em",
              fontSize: "11px",
              textTransform: "uppercase",
              color: "#5b6b6b",
              fontWeight: 600,
            }}
          >
            Medocai Access
          </span>
          <h1
            className={headingFont.className}
            style={{ fontSize: "34px", color: "#0f2a2a" }}
          >
            Create your workspace login
          </h1>
          <p style={{ color: "#455352", fontSize: "15px", lineHeight: 1.6 }}>
            Set up a demo account inside the shared health system. You can select
            your role to land in the right workflow.
          </p>
        </div>

        {error ? (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#fbe9e9",
              color: "#7a2e2e",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#e7f5ef",
              color: "#1b5a3b",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        ) : null}

        <form action={signUp} style={{ display: "grid", gap: "12px" }}>
          <input
            name="name"
            type="text"
            placeholder="Full name"
            required
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d7dddc",
              fontSize: "15px",
            }}
          />
          <input
            name="email"
            type="email"
            placeholder="Work email"
            required
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d7dddc",
              fontSize: "15px",
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Create password"
            required
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d7dddc",
              fontSize: "15px",
            }}
          />
          <select
            name="role"
            required
            defaultValue=""
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d7dddc",
              fontSize: "15px",
              background: "#ffffff",
              color: "#2b3c3b",
            }}
          >
            <option value="" disabled>
              Select role
            </option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              background: "#0f2a2a",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Create account
          </button>
        </form>

        <div
          style={{
            marginTop: "16px",
            fontSize: "14px",
            color: "#4a5a5a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span>Already have access?</span>
          <Link
            href="/login"
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid #0f2a2a",
              color: "#0f2a2a",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Go to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
