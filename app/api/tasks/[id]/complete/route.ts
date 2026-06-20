import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser("employee");
  const form = await request.formData();
  const db = supabaseAdmin();
  if (!db) return NextResponse.redirect(new URL("/app/tasks", request.url));

  const { data: occurrence } = await db.from("task_occurrences").select("*, tasks(*)").eq("id", params.id).eq("assigned_employee_id", user.id).single();
  const task = Array.isArray((occurrence as any)?.tasks) ? (occurrence as any).tasks[0] : (occurrence as any)?.tasks;
  if (!occurrence || !task) return NextResponse.redirect(new URL("/app/tasks?error=missing", request.url));

  const comment = String(form.get("comment") || "").trim();
  const valueNumber = form.get("value_number") ? Number(form.get("value_number")) : null;
  const photo = form.get("photo");
  let photoUrl: string | null = null;

  if (task.proof_type === "text" && !comment) return NextResponse.redirect(new URL(`/app/tasks/${params.id}?error=proof`, request.url));
  if (task.proof_type === "number" && valueNumber === null) return NextResponse.redirect(new URL(`/app/tasks/${params.id}?error=proof`, request.url));

  if (task.proof_type === "photo") {
    if (!(photo instanceof File) || photo.size === 0) return NextResponse.redirect(new URL(`/app/tasks/${params.id}?error=proof`, request.url));
    const ext = photo.type.split("/")[1] || "jpg";
    const path = `${user.id}/${params.id}-${Date.now()}.${ext}`;
    const { error } = await db.storage.from("task-proofs").upload(path, photo, { contentType: photo.type, upsert: false });
    if (error) return NextResponse.redirect(new URL(`/app/tasks/${params.id}?error=save`, request.url));
    photoUrl = db.storage.from("task-proofs").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await db.from("task_occurrences").update({
    status: "completed",
    completed_at: new Date().toISOString(),
    completed_by_employee_id: user.id,
    comment: comment || null,
    value_number: valueNumber,
    photo_url: photoUrl
  }).eq("id", params.id).eq("assigned_employee_id", user.id);

  if (error) return NextResponse.redirect(new URL(`/app/tasks/${params.id}?error=save`, request.url));
  return NextResponse.redirect(new URL("/app/tasks?tab=done", request.url));
}
