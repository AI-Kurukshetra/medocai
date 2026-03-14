import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getAuthedProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, organization_id")
    .eq("id", userData.user.id)
    .single<{ id: string; organization_id: string }>();

  if (profileError || !profile) {
    return { error: "User profile not found", status: 403 as const };
  }

  return { supabase, profile };
}

export async function GET(request: NextRequest) {
  const result = await getAuthedProfile();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { supabase, profile } = result;
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("document_id");

  if (!documentId) {
    return NextResponse.json(
      { error: "Missing document_id" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("documentation_gaps")
    .select("*")
    .eq("document_id", documentId)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Unable to load gaps" },
      { status: 500 }
    );
  }

  return NextResponse.json({ gaps: data ?? [] }, { status: 200 });
}
