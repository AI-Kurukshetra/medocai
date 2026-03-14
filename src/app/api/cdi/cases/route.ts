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

type GapRow = {
  document_id: string;
  status: "open" | "converted" | "closed" | string;
};

export async function GET(request: NextRequest) {
  const result = await getAuthedProfile();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { supabase, profile } = result;
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");

  let limit = 25;
  if (limitParam) {
    const parsed = Number.parseInt(limitParam, 10);
    if (Number.isNaN(parsed) || parsed <= 0 || parsed > 100) {
      return NextResponse.json(
        { error: "Invalid limit value" },
        { status: 400 }
      );
    }
    limit = parsed;
  }

  const { data: documents, error: documentsError } = await supabase
    .from("clinical_documents")
    .select("id, title, document_type, status, updated_at, encounter_id")
    .eq("organization_id", profile.organization_id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (documentsError) {
    return NextResponse.json(
      { error: documentsError.message ?? "Unable to load cases" },
      { status: 500 }
    );
  }

  const documentIds = (documents ?? []).map((doc) => doc.id);
  if (documentIds.length === 0) {
    return NextResponse.json({ cases: [] }, { status: 200 });
  }

  const { data: gaps, error: gapsError } = await supabase
    .from("documentation_gaps")
    .select("document_id, status")
    .in("document_id", documentIds)
    .eq("organization_id", profile.organization_id);

  if (gapsError) {
    return NextResponse.json(
      { error: gapsError.message ?? "Unable to load gaps" },
      { status: 500 }
    );
  }

  const gapCounts = new Map<string, { total: number; open: number }>();
  (gaps as GapRow[] | null | undefined)?.forEach((gap) => {
    const existing = gapCounts.get(gap.document_id) ?? { total: 0, open: 0 };
    existing.total += 1;
    if (gap.status === "open") {
      existing.open += 1;
    }
    gapCounts.set(gap.document_id, existing);
  });

  const cases = (documents ?? []).map((doc) => {
    const counts = gapCounts.get(doc.id) ?? { total: 0, open: 0 };
    return {
      document_id: doc.id,
      title: doc.title,
      document_type: doc.document_type,
      status: doc.status,
      updated_at: doc.updated_at,
      encounter_id: doc.encounter_id,
      gap_total: counts.total,
      gap_open: counts.open,
    };
  });

  return NextResponse.json({ cases }, { status: 200 });
}
