import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser("employee");
  const form = await request.formData();
  const requestedTo = String(form.get("requested_to_employee_id") || "");
  const comment = String(form.get("comment") || "");
  const db = supabaseAdmin();
  if (db && requestedTo) {
    await db.from("delegation_requests").insert({ task_occurrence_id: params.id, requested_by_employee_id: user.id, requested_to_employee_id: requestedTo, status: "pending", comment: comment || null });
    await db.from("task_occurrences").update({ status: "delegation_requested" }).eq("id", params.id).eq("assigned_employee_id", user.id);
  }
  return NextResponse.redirect(new URL("/app/delegations", request.url));
}
