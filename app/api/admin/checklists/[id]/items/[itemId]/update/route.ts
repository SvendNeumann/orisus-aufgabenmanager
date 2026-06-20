import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string; itemId: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const proofType = String(form.get("proof_type") || "none").trim();
  const db = supabaseAdmin();

  if (db && title) {
    await db.from("checklist_items").update({
      title,
      proof_type: proofType,
      photo_required: proofType === "photo",
      comment_required: proofType === "text",
      value_required: proofType === "number"
    }).eq("id", params.itemId).eq("checklist_id", params.id);
  }

  return NextResponse.redirect(new URL("/admin/checklists", request.url));
}
