import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

const roleRoutes: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/physician", roles: ["physician"] },
  { prefix: "/queries", roles: ["physician"] },
  { prefix: "/cdi", roles: ["cdi"] },
  { prefix: "/coder", roles: ["coder"] },
  { prefix: "/suggestions", roles: ["coder"] },
  { prefix: "/templates", roles: ["admin"] },
  { prefix: "/analytics", roles: ["admin"] },
  { prefix: "/compliance", roles: ["admin"] },
  { prefix: "/audit", roles: ["admin"] },
  { prefix: "/encounters", roles: ["physician", "cdi"] },
  { prefix: "/documents", roles: ["physician", "cdi"] },
];

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const headers = new Headers(request.headers);

  headers.set("x-request-id", requestId);

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api")
  ) {
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("x-request-id", requestId);
    return response;
  }

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("x-request-id", requestId);

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: Record<string, unknown>) {
          response.cookies.set({ name, value, ...(options ?? {}) });
        },
        remove(name: string, options?: Record<string, unknown>) {
          response.cookies.set({
            name,
            value: "",
            ...(options ?? {}),
            expires: new Date(0),
          });
        },
      },
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("x-request-id", requestId);
    return redirectResponse;
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userData.user.id)
    .single<{ role: string }>();

  if (profileError || !profile?.role) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("x-request-id", requestId);
    return redirectResponse;
  }

  const matched = roleRoutes.find((route) =>
    pathname.startsWith(route.prefix)
  );

  if (matched && !matched.roles.includes(profile.role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized";
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("x-request-id", requestId);
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
