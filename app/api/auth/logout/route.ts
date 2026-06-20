import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin, tokenHash } from "@/lib/orisus";

export async function POST(request: Request) {
  const token = cookies().get("orisus_session")?.value;
  const db = supabaseAdmin();
  if (token && db) await db.from("sessions").delete().eq("token_hash", tokenHash(token));
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete("orisus_session");
  return response;
}
