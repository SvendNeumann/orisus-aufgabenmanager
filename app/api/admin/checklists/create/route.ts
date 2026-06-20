import { NextResponse } from "next/server";
import { INSTANCE_LOCATIONS } from "@/lib/instance";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

function dueAt(time: string) {
  if (!time) return null;
  const date = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date.toISOString();
}

export async function POST(request: Request) {
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
      const { data: checklist } = await db.from("checklists").insert({ name, location_id: locationId, interval_type: intervalType, due_time: dueTime || null, active: true }).select("id").single();
      if (checklist?.id) {
        await db.from("checklist_occurrences").insert({ checklist_id: checklist.id, occurrence_date: new Date().toISOString().slice(0, 10), location_id: locationId, status: "open", due_at: dueAt(dueTime) });
      }
    }
  }

  return NextResponse.redirect(new URL("/admin/checklists", request.url));
}
