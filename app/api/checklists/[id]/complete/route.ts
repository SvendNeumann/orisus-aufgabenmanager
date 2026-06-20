import { NextResponse } from "next/server";
import { canWorkAtLocation, requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser("employee");
  const form = await request.formData();
  const returnTo = safeReturnTo(form.get("return_to"), "/app/checklists");
  const db = supabaseAdmin();
  if (!db) return NextResponse.redirect(new URL(returnTo, request.url));

  const { data: occurrence } = await db.from("checklist_occurrences").select("*, checklists(id)").eq("id", params.id).single();
  const checklist = Array.isArray((occurrence as any)?.checklists) ? (occurrence as any).checklists[0] : (occurrence as any)?.checklists;
  if (!occurrence || !checklist) return NextResponse.redirect(new URL("/app/checklists", request.url));
  if (!canWorkAtLocation(user, occurrence.location_id)) return NextResponse.redirect(new URL("/app/checklists", request.url));

  const [{ data: requiredItems }, { data: completions }] = await Promise.all([
    db.from("checklist_items").select("id").eq("checklist_id", checklist.id).eq("active", true),
    db.from("checklist_item_completions").select("checklist_item_id").eq("checklist_occurrence_id", params.id)
  ]);

  const completedIds = new Set((completions || []).map((row) => row.checklist_item_id));
  const missing = (requiredItems || []).some((item) => !completedIds.has(item.id));
  if (missing) return NextResponse.redirect(new URL(`${returnTo}/${params.id}?error=required`, request.url));

  await db.from("checklist_occurrences").update({ status: "completed", completed_at: new Date().toISOString(), completed_by_employee_id: user.id }).eq("id", params.id);
  return NextResponse.redirect(new URL(returnTo, request.url));
}

function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  const path = String(value || "");
  if (path === "/app/checklists" || path === "/app/abendcheck") return path;
  return fallback;
}
