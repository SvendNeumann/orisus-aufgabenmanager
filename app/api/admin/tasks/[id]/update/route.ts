import { NextResponse } from "next/server";
import { INSTANCE_LOCATIONS } from "@/lib/instance";
import { requireUser, supabaseAdmin } from "@/lib/orisus";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await requireUser("admin");
  const form = await request.formData();
  const taskId = String(form.get("task_id") || params.id).trim();
  const title = String(form.get("title") || "").trim();
  const area = String(form.get("area") || "").trim();
  const locationId = String(form.get("location_id") || "").trim();
  const employeeId = String(form.get("assigned_employee_id") || "").trim();
  const dueTime = String(form.get("due_time") || "").trim();
  const status = String(form.get("status") || "open").trim();
  const db = supabaseAdmin();

  if (db) {
    const { data: employee } = await db.from("employees").select("id, location_id, active").eq("id", employeeId).eq("active", true).single();
    const { data: location } = await db.from("locations").select("id, name, active").eq("id", locationId).eq("active", true).in("name", INSTANCE_LOCATIONS).single();

    if (!employee || !location || employee.location_id !== locationId) {
      return NextResponse.redirect(new URL("/admin/tasks", request.url));
    }

    await db.from("tasks").update({ title, area, location_id: locationId, assigned_employee_id: employeeId, due_time: dueTime || null }).eq("id", taskId);
    await db.from("task_occurrences").update({ status, assigned_employee_id: employeeId, original_employee_id: employeeId }).or(`id.eq.${params.id},task_id.eq.${taskId}`);
  }

  return NextResponse.redirect(new URL("/admin/tasks", request.url));
}
