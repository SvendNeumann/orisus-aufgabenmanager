import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser("employee");
  const form = await request.formData();
  const status = String(form.get("status")) === "accepted" ? "accepted" : "rejected";
  const db = supabaseAdmin();
  if (db) {
    const { data } = await db.from("delegation_requests").select("*").eq("id", params.id).eq("requested_to_employee_id", user.id).single();
    if (data) {
      await db.from("delegation_requests").update({ status, responded_at: new Date().toISOString() }).eq("id", params.id);
      await db.from("task_occurrences").update(status === "accepted" ? { assigned_employee_id: user.id, status: "delegated" } : { status: "rejected" }).eq("id", data.task_occurrence_id);
    }
  }
  return NextResponse.redirect(new URL("/app/delegations", request.url));
}
