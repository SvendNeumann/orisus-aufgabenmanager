import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { INSTANCE_LOCATIONS } from "@/lib/instance";
import { canUseAdminArea, homePathFor, requireUser, supabaseAdmin } from "@/lib/orisus";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function dueAt(date: string, time: string) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(`${date}T00:00:00`);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value.toISOString();
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!canUseAdminArea(user)) {
    return NextResponse.redirect(new URL(`${homePathFor(user)}?error=unauthorized`, request.url));
  }

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const area = String(form.get("area") || "").trim();
  const employeeId = String(form.get("assigned_employee_id") || "").trim();
  const dueDate = String(form.get("due_date") || todayISO()).trim() || todayISO();
  const dueTime = String(form.get("due_time") || "").trim();
  const proofType = String(form.get("proof_type") || "none").trim();
  const returnTo = String(form.get("return_to") || "/admin/tasks");
  const db = supabaseAdmin();

  if (!db || !title || !employeeId) {
    return NextResponse.redirect(new URL(`${returnTo}?error=save`, request.url));
  }

  const { data: target } = await db.from("employees").select("id, location_id, active, locations(name)").eq("id", employeeId).eq("active", true).single();
  const locationName = Array.isArray((target as any)?.locations) ? (target as any).locations[0]?.name : (target as any)?.locations?.name;

  if (!target || !INSTANCE_LOCATIONS.includes(locationName || "")) {
    return NextResponse.redirect(new URL(`${returnTo}?error=target`, request.url));
  }

  const { data: task } = await db.from("tasks").insert({
    title,
    description: `${title} einmalig erledigen und bei Auffälligkeiten kommentieren.`,
    area: area || "Einmalige Aufgabe",
    location_id: target.location_id,
    assigned_employee_id: employeeId,
    interval_type: "custom",
    due_time: dueTime || null,
    proof_type: ["none", "photo", "text", "number"].includes(proofType) ? proofType : "none",
    photo_required: proofType === "photo",
    comment_required: proofType === "text",
    value_required: proofType === "number",
    active: false
  }).select("id").single();

  if (!task?.id) {
    return NextResponse.redirect(new URL(`${returnTo}?error=save`, request.url));
  }

  await db.from("task_occurrences").insert({
    task_id: task.id,
    occurrence_date: dueDate,
    assigned_employee_id: employeeId,
    original_employee_id: employeeId,
    status: "open",
    due_at: dueAt(dueDate, dueTime)
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/app");
  revalidatePath("/app/tasks");

  return NextResponse.redirect(new URL(`${returnTo}?created=1`, request.url));
}
