import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const taskId = String(form.get("task_id") || params.id).trim();
  const db = supabaseAdmin();

  if (db) {
    await db.from("task_occurrences").delete().or(`id.eq.${params.id},task_id.eq.${taskId}`);
    await db.from("tasks").delete().eq("id", taskId);
  }

  return NextResponse.redirect(new URL("/admin/tasks", request.url));
}
