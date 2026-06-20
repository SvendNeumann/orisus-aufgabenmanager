import { NextResponse } from "next/server";
import { hashPin, requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request) {
  await requireUser("admin");
  const form = await request.formData();
  const firstName = String(form.get("first_name") || "").trim();
  const lastName = String(form.get("last_name") || "").trim();
  const functionTitle = String(form.get("function_title") || "").trim();
  const locationId = String(form.get("location_id") || "").trim();
  const role = String(form.get("role") || "employee") === "admin" ? "admin" : "employee";
  const pin = String(form.get("pin") || "").trim();
  const db = supabaseAdmin();

  if (db && firstName && lastName && locationId && /^\d{6}$/.test(pin)) {
    await db.from("employees").insert({
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      location_id: locationId,
      function_title: functionTitle || null,
      role,
      pin_hash: await hashPin(pin),
      active: true
    });
  }

  return NextResponse.redirect(new URL("/admin/employees", request.url));
}
