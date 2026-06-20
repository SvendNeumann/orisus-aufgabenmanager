import { NextResponse } from "next/server";
import { hashPin, requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const pin = String(form.get("pin") || "");
  const db = supabaseAdmin();
  if (db && /^\d{6}$/.test(pin)) await db.from("employees").update({ pin_hash: await hashPin(pin), failed_login_attempts: 0, locked_until: null }).eq("id", params.id);
  return NextResponse.redirect(new URL("/admin/employees", request.url));
}
