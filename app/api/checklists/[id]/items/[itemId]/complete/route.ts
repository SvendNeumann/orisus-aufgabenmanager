import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string; itemId: string } }) {
  const user = await requireUser("employee");
  const db = supabaseAdmin();
  if (db) {
    await db.from("checklist_item_completions").insert({ checklist_occurrence_id: params.id, checklist_item_id: params.itemId, completed_by_employee_id: user.id, completed_at: new Date().toISOString() });
    await db.from("checklist_occurrences").update({ status: "in_progress" }).eq("id", params.id).eq("location_id", user.location_id);
  }
  return NextResponse.redirect(new URL(`/app/checklists/${params.id}`, request.url));
}
