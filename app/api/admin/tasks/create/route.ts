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
  const title = String(form.get("title") || "").trim();
  const area = String(form.get("area") || "").trim();
  const locationId = String(form.get("location_id") || "").trim();
  const employeeId = String(form.get("assigned_employee_id") || "").trim();
  const intervalType = String(form.get("interval_type") || "daily").trim();
  const dueTime = String(form.get("due_time") || "").trim();
  const proofType = String(form.get("proof_type") || "none").trim();
  const db = supabaseAdmin();

  if (db && title && locationId && employeeId) {
    const { data: employee } = await db.from("employees").select("id, location_id, works_across_locations, active").eq("id", employeeId).eq("active", true).single();
    const { data: location } = await db.from("locations").select("id, name, active").eq("id", locationId).eq("active", true).in("name", INSTANCE_LOCATIONS).single();

    if (!employee || !location || (!employee.works_across_locations && employee.location_id !== locationId)) {
      return NextResponse.redirect(new URL("/admin/tasks", request.url));
    }

    const isOneTime = intervalType === "custom";
    const { data: task } = await db.from("tasks").insert({
      title,
      description: isOneTime ? `${title} einmalig erledigen und bei Auffälligkeiten kommentieren.` : `${title} sauber dokumentieren und bei Auffälligkeiten kommentieren.`,
      area: area || (isOneTime ? "Einmalige Aufgabe" : null),
      location_id: locationId,
      assigned_employee_id: employeeId,
      interval_type: intervalType,
      due_time: dueTime || null,
      proof_type: proofType,
      photo_required: proofType === "photo",
      comment_required: proofType === "text",
      value_required: proofType === "number",
      active: !isOneTime
    }).select("id").single();

    if (task?.id) {
      await db.from("task_occurrences").insert({
        task_id: task.id,
        occurrence_date: new Date().toISOString().slice(0, 10),
        assigned_employee_id: employeeId,
        original_employee_id: employeeId,
        status: "open",
        due_at: dueAt(dueTime)
      });
    }
  }

  return NextResponse.redirect(new URL("/admin/tasks", request.url));
}
