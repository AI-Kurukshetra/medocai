import type { UserRole } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SessionUser = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
};

type UserProfileRow = {
  id: string;
  role: UserRole;
  display_name: string | null;
  email: string | null;
};

async function fetchUserProfile(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from("users")
    .select("id, role, display_name, email")
    .eq("id", id)
    .single<UserProfileRow>();

  if (error) {
    return null;
  }

  return data ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const profile = await fetchUserProfile(supabase, data.user.id);
  if (!profile?.role) {
    return null;
  }

  return {
    id: profile.id,
    role: profile.role,
    name: profile.display_name ?? data.user.email ?? "User",
    email: profile.email ?? data.user.email ?? "",
  };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    console.error("Auth sign-in failed", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });
    return { error: error?.message ?? "Unable to sign in." };
  }

  const profile = await fetchUserProfile(supabase, data.user.id);

  if (!profile?.role) {
    console.error("Auth profile missing after sign-in", {
      userId: data.user.id,
    });
    return { error: "User profile not found." };
  }

  return { profile };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

type SignUpProfileInput = {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  organizationId: string;
  facilityId?: string | null;
  departmentId?: string | null;
};

export async function signUpWithProfile(input: SignUpProfileInput) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      display_name: input.displayName,
      role: input.role,
    },
  });

  if (error || !data.user) {
    console.error("Auth sign-up failed", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });
    return { error: error?.message ?? "Unable to create user." };
  }

  const { error: profileError } = await supabase.from("users").insert({
    id: data.user.id,
    organization_id: input.organizationId,
    facility_id: input.facilityId ?? null,
    department_id: input.departmentId ?? null,
    role: input.role,
    display_name: input.displayName,
    email: input.email,
  });

  if (profileError) {
    console.error("Auth profile insert failed", {
      message: profileError.message,
      code: profileError.code,
    });
    await supabase.auth.admin.deleteUser(data.user.id);
    return { error: "Unable to create user profile." };
  }

  return { userId: data.user.id };
}
