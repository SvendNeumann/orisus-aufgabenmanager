import { NextResponse } from "next/server";
import { canWorkAtLocation, requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const user = await requireUser("employee");
  const form = await request.formData();
  const returnTo = safeReturnTo(form.get("return_to"), `/app/checklists/${params.id}`);
  const db = supabaseAdmin();
  if (!db) return NextResponse.redirect(new URL(returnTo, request.url));

  const { data: occurrence } = await db.from("checklist_occurrences").select("*, checklists(id)").eq("id", params.id).single();
  const checklist = Array.isArray((occurrence as any)?.checklists) ? (occurrence as any).checklists[0] : (occurrence as any)?.checklists;
  if (!occurrence || !checklist) return NextResponse.redirect(new URL("/app/checklists", request.url));
  if (!canWorkAtLocation(user, occurrence.location_id)) return NextResponse.redirect(new URL("/app/checklists", request.url));

  const { data: item } = await db.from("checklist_items").select("*").eq("id", params.itemId).eq("checklist_id", checklist.id).eq("active", true).single();
  if (!item) return NextResponse.redirect(new URL(returnTo, request.url));

  const comment = String(form.get("comment") || "").trim();
  const photo = form.get("photo");
  let photoUrl: string | null = null;

  if (item.proof_type === "text" && !comment) {
    return NextResponse.redirect(new URL(`${returnTo}?error=proof`, request.url));
  }

  if (item.proof_type === "photo") {
    if (!(photo instanceof File) || photo.size === 0) return NextResponse.redirect(new URL(`${returnTo}?error=proof`, request.url));
    const ext = photo.type.split("/")[1] || "jpg";
    const path = `${user.id}/checklist-${params.itemId}-${Date.now()}.${ext}`;
    const { error } = await db.storage.from("task-proofs").upload(path, photo, { contentType: photo.type, upsert: false });
    if (error) return NextResponse.redirect(new URL(`${returnTo}?error=save`, request.url));
    photoUrl = db.storage.from("task-proofs").getPublicUrl(path).data.publicUrl;
  }

  await db.from("checklist_item_completions").upsert({
    checklist_occurrence_id: params.id,
    checklist_item_id: params.itemId,
    completed_at: new Date().toISOString(),
    completed_by_employee_id: user.id,
    comment: comment || null,
    photo_url: photoUrl
  }, { onConflict: "checklist_occurrence_id,checklist_item_id" });

  await db.from("checklist_occurrences").update({ status: "in_progress" }).eq("id", params.id).neq("status", "completed");
  return NextResponse.redirect(new URL(returnTo, request.url));
}

function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  const path = String(value || "");
  if (path.startsWith("/app/checklists") || path.startsWith("/app/abendcheck")) return path;
  return fallback;
}
