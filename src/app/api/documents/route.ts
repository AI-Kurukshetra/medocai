import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DocumentPayload = {
  id?: string;
  encounter_id?: string;
  title?: string | null;
  document_type?: string;
  status?: "draft" | "final";
  content?: string | null;
  version?: number;
};

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

export async function POST(request: NextRequest) {
  const result = await getAuthedProfile();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { supabase, profile } = result;

  let body: DocumentPayload;
  try {
    body = (await request.json()) as DocumentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const status = body.status;
  if (status && status !== "draft" && status !== "final") {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  if (!body.id) {
    if (!body.encounter_id || !body.document_type || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("clinical_documents")
      .insert({
        organization_id: profile.organization_id,
        encounter_id: body.encounter_id,
        author_user_id: profile.id,
        document_type: body.document_type,
        status: body.status,
        title: body.title ?? null,
        content: body.content ?? null,
        version: body.version ?? 1,
        is_demo: true,
        data_source: "synthetic",
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to create document" },
        { status: 500 }
      );
    }

    await enqueueAnalysisJob(supabase, profile.organization_id, data.id);

    return NextResponse.json({ document: data }, { status: 201 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("clinical_documents")
    .select("id, version, encounter_id, organization_id")
    .eq("id", body.id)
    .single<{ id: string; version: number; encounter_id: string; organization_id: string }>();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  if (existing.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatePayload = {
    encounter_id: body.encounter_id ?? existing.encounter_id,
    document_type: body.document_type ?? undefined,
    status: body.status ?? undefined,
    title: body.title ?? undefined,
    content: body.content ?? undefined,
    version: body.version ?? existing.version,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("clinical_documents")
    .update(updatePayload)
    .eq("id", body.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Unable to update document" },
      { status: 500 }
    );
  }

  await enqueueAnalysisJob(supabase, profile.organization_id, updated.id);

  return NextResponse.json({ document: updated }, { status: 200 });
}

async function enqueueAnalysisJob(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  organizationId: string,
  documentId: string
) {
  const { error } = await supabase.from("analysis_jobs").insert({
    organization_id: organizationId,
    document_id: documentId,
    status: "queued",
    attempts: 0,
  });

  if (!error) {
    return;
  }

  if (
    error.message?.includes("analysis_jobs") ||
    error.message?.includes("relation") ||
    error.code === "42P01"
  ) {
    return;
  }

  console.error("Failed to enqueue analysis job", {
    message: error.message,
    code: error.code,
  });
}
