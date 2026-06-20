import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const db = supabaseAdmin();
  if (db) {
    await db.from("checklists").update({ active: false }).eq("id", params.id);
    await db.from("checklist_occurrences").update({ status: "completed", completed_at: new Date().toISOString() }).eq("checklist_id", params.id).neq("status", "completed");
  }
  return NextResponse.redirect(new URL("/admin/checklists", request.url));
}
