import { NextResponse } from "next/server";
import { INSTANCE_LOCATIONS } from "@/lib/instance";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const locationId = String(form.get("location_id") || "").trim();
  const intervalType = String(form.get("interval_type") || "daily").trim();
  const dueTime = String(form.get("due_time") || "").trim();
  const db = supabaseAdmin();

  if (db && name && locationId) {
    const { data: location } = await db.from("locations").select("id, name, active").eq("id", locationId).eq("active", true).in("name", INSTANCE_LOCATIONS).single();
    if (location) {
      await db.from("checklists").update({ name, location_id: locationId, interval_type: intervalType, due_time: dueTime || null }).eq("id", params.id);
      await db.from("checklist_occurrences").update({ location_id: locationId }).eq("checklist_id", params.id).neq("status", "completed");
    }
  }

  return NextResponse.redirect(new URL("/admin/checklists", request.url));
}
