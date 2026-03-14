import Link from "next/link";
import { redirect } from "next/navigation";
import { Fraunces, Manrope } from "next/font/google";
import { getCurrentUser, signInWithPassword } from "@/lib/auth";
import { roleLanding } from "@/lib/roles";

const headingFont = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"] });

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect(roleLanding[user.role]);
  }
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;
  const success = resolvedSearchParams?.success;

  async function signIn(formData: FormData) {
    "use server";
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      redirect("/login?error=Missing%20credentials");
    }

    const result = await signInWithPassword(email, password);

    if ("error" in result) {
      redirect(`/login?error=${encodeURIComponent(result.error ?? "Unknown error")}`);
    }

    redirect(roleLanding[result.profile.role]);
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
            Welcome back
          </h1>
          <p style={{ color: "#455352", fontSize: "15px", lineHeight: 1.6 }}>
            Sign in with your demo credentials to enter the MVP experience.
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
        <form
          action={signIn}
          style={{ display: "grid", gap: "12px", marginBottom: "20px" }}
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
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
            placeholder="Password"
            required
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #d7dddc",
              fontSize: "15px",
            }}
          />
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
            Continue
          </button>
        </form>
        <div style={{ fontSize: "14px", color: "#4a5a5a" }}>
          Demo seed uses `password` for all accounts (e.g. `admin@demo.local`).
        </div>
        <div
          style={{
            marginTop: "18px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            fontSize: "13px",
            color: "#4a5a5a",
          }}
        >
          <Link
            href="/signup"
            style={{
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid #0f2a2a",
              color: "#0f2a2a",
              fontWeight: 600,
            }}
          >
            Create account
          </Link>
          <Link href="/unauthorized">View unauthorized state</Link>
        </div>
      </section>
    </main>
  );
}
