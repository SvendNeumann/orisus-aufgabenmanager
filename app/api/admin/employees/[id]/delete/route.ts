import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const db = supabaseAdmin();

  if (db) {
    await db.from("sessions").delete().eq("employee_id", params.id);
    await db.from("employees").update({ active: false }).eq("id", params.id);
  }

  return NextResponse.redirect(new URL("/admin/employees", request.url));
}
