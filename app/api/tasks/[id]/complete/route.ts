import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser("employee");
  const form = await request.formData();
  const db = supabaseAdmin();
  let photoUrl: string | null = null;
  const photo = form.get("photo");
  if (db && photo instanceof File && photo.size > 0) {
    const ext = photo.type.split("/")[1] || "jpg";
    const path = `${user.id}/${params.id}-${Date.now()}.${ext}`;
    await db.storage.from("task-proofs").upload(path, photo, { contentType: photo.type, upsert: false });
    photoUrl = db.storage.from("task-proofs").getPublicUrl(path).data.publicUrl;
  }
  if (db) await db.from("task_occurrences").update({ status: "completed", completed_at: new Date().toISOString(), completed_by_employee_id: user.id, comment: String(form.get("comment") || "") || null, value_number: form.get("value_number") ? Number(form.get("value_number")) : null, photo_url: photoUrl }).eq("id", params.id).eq("assigned_employee_id", user.id);
  return NextResponse.redirect(new URL("/app/tasks?tab=done", request.url));
}
