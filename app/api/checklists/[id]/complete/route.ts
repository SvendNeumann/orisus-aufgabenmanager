import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireUser("employee");
  const db = supabaseAdmin();
  if (db) await db.from("checklist_occurrences").update({ status: "completed", completed_at: new Date().toISOString(), completed_by_employee_id: user.id }).eq("id", params.id).eq("location_id", user.location_id);
  return NextResponse.redirect(new URL("/app/checklists", request.url));
}
