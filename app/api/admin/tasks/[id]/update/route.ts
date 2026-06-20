import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const area = String(form.get("area") || "").trim();
  const dueTime = String(form.get("due_time") || "").trim();
  const status = String(form.get("status") || "open").trim();
  const db = supabaseAdmin();

  if (db) {
    await db.from("tasks").update({ title, area, due_time: dueTime || null }).eq("id", params.id);
    await db.from("task_occurrences").update({ status }).or(`id.eq.${params.id},task_id.eq.${params.id}`);
  }

  return NextResponse.redirect(new URL("/admin/tasks", request.url));
}
