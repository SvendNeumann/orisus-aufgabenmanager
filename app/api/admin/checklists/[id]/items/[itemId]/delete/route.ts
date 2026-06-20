import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string; itemId: string } }) {
  await requireUser("admin");
  const db = supabaseAdmin();
  if (db) {
    await db.from("checklist_items").update({ active: false }).eq("id", params.itemId).eq("checklist_id", params.id);
  }
  return NextResponse.redirect(new URL("/admin/checklists", request.url));
}
