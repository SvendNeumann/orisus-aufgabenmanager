import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const db = supabaseAdmin();
  if (db) {
    await db.from("employees").update({ pin_hash: null, failed_login_attempts: 0, locked_until: null }).eq("id", params.id);
  }
  return NextResponse.redirect(new URL("/admin/employees", request.url));
}
