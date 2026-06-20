import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { checklistId: string } }) {
  const user = await requireUser("employee");
  const db = supabaseAdmin();
  if (!db) return NextResponse.redirect(new URL("/app/checklists", request.url));

  const { data: occurrence } = await db.from("checklist_occurrences").select("*, checklists(id)").eq("id", params.checklistId).eq("location_id", user.location_id).single();
  const checklist = Array.isArray((occurrence as any)?.checklists) ? (occurrence as any).checklists[0] : (occurrence as any)?.checklists;
  if (!occurrence || !checklist) return NextResponse.redirect(new URL("/app/checklists", request.url));

  const [{ data: requiredItems }, { data: completions }] = await Promise.all([
    db.from("checklist_items").select("id").eq("checklist_id", checklist.id).eq("active", true).eq("required", true),
    db.from("checklist_item_completions").select("checklist_item_id").eq("checklist_occurrence_id", params.checklistId)
  ]);

  const completedIds = new Set((completions || []).map((row) => row.checklist_item_id));
  const missing = (requiredItems || []).some((item) => !completedIds.has(item.id));
  if (missing) return NextResponse.redirect(new URL(`/app/checklists/${params.checklistId}?error=required`, request.url));

  await db.from("checklist_occurrences").update({ status: "completed", completed_at: new Date().toISOString(), completed_by_employee_id: user.id }).eq("id", params.checklistId);
  return NextResponse.redirect(new URL("/app/checklists", request.url));
}
