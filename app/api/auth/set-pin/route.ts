import { NextResponse } from "next/server";
import { hashPin, homePathFor, isDemoEmployeeId, sessionToken, supabaseAdmin, tokenHash } from "@/lib/orisus";
import { INSTANCE_LOCATIONS } from "@/lib/instance";

export async function POST(request: Request) {
  const form = await request.formData();
  const employeeId = String(form.get("employee_id") || "").trim();
  const pin = String(form.get("pin") || "").trim();
  const pinConfirm = String(form.get("pin_confirm") || "").trim();

  if (!/^\d{6}$/.test(pin) || pin !== pinConfirm || isDemoEmployeeId(employeeId)) {
    return NextResponse.redirect(new URL(`/login/${employeeId}/set-pin?error=1`, request.url));
  }

  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.redirect(new URL(`/login/${employeeId}?error=1`, request.url));
  }

  const { data, error } = await db.from("employees").select("*, locations(name)").eq("id", employeeId).eq("active", true).single();
  const locationName = (data as any)?.locations?.name || "";

  if (error || !data || !INSTANCE_LOCATIONS.includes(locationName) || data.pin_hash) {
    return NextResponse.redirect(new URL(`/login/${employeeId}?error=1`, request.url));
  }

  await db.from("employees").update({ pin_hash: await hashPin(pin), failed_login_attempts: 0, locked_until: null, last_login_at: new Date().toISOString() }).eq("id", employeeId);

  const expires = new Date(Date.now() + 1000 * 60 * 60 * 12);
  const token = sessionToken();

  await db.from("sessions").insert({
    employee_id: data.id,
    token_hash: tokenHash(token),
    expires_at: expires.toISOString()
  });

  const response = NextResponse.redirect(new URL(homePathFor(data), request.url));
  response.cookies.set("orisus_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return response;
}
