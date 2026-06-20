import { NextResponse } from "next/server";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const proofType = String(form.get("proof_type") || "none").trim();
  const db = supabaseAdmin();

  if (db && title) {
    const { data: checklist } = await db.from("checklists").select("id, active").eq("id", params.id).eq("active", true).single();
    if (checklist) {
      await db.from("checklist_items").insert({
        checklist_id: params.id,
        title,
        sort_order: Date.now(),
        proof_type: proofType,
        photo_required: proofType === "photo",
        comment_required: proofType === "text",
        value_required: proofType === "number",
        active: true
      });
    }
  }

  return NextResponse.redirect(new URL("/admin/checklists", request.url));
}
