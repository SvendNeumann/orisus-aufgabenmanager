import { NextResponse } from "next/server";
import { sessionToken, supabaseAdmin, tokenHash, verifyLogin } from "@/lib/orisus";

export async function POST(request: Request) {
  const form = await request.formData();
  const employeeId = String(form.get("employee_id") || "");
  const pin = String(form.get("pin") || "");
  const employee = await verifyLogin(employeeId, pin);
  if (!employee) return NextResponse.redirect(new URL(`/login/${employeeId}?error=1`, request.url));
  const db = supabaseAdmin();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 12);
  const token = db ? sessionToken() : Buffer.from(JSON.stringify({ employee_id: employee.id, role: employee.role })).toString("base64url");
  if (db) await db.from("sessions").insert({ employee_id: employee.id, token_hash: tokenHash(token), expires_at: expires.toISOString() });
  const response = NextResponse.redirect(new URL(employee.role === "admin" ? "/admin" : "/app", request.url));
  response.cookies.set("orisus_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires, path: "/" });
  return response;
}
