import { getEmployees, getLocations, supabaseAdmin, tasks } from "@/lib/orisus";
import { ensureTodayWork } from "@/lib/live-data";

type Filters = {
  location?: string;
  employee?: string;
  status?: string;
  area?: string;
  date?: string;
};

function mapTask(row: any) {
  const task = Array.isArray(row.tasks) ? row.tasks[0] : row.tasks;
  const completedBy = Array.isArray(row.completed_by) ? row.completed_by[0] : row.completed_by;
  return {
    id: row.id,
    task_id: row.task_id || task?.id || row.id,
    title: task?.title || "Unbenannte Aufgabe",
    description: task?.description || "",
    area: task?.area || "",
    location_id: task?.location_id || "",
    assigned_employee_id: row.assigned_employee_id || task?.assigned_employee_id || "",
    original_employee_id: row.original_employee_id || task?.assigned_employee_id || "",
    status: row.status,
    due_time: task?.due_time || "",
    due_at: row.due_at,
    occurrence_date: row.occurrence_date,
    interval_type: task?.interval_type || "daily",
    proof_type: task?.proof_type || "none",
    value_unit: task?.value_unit || null,
    completed_at: row.completed_at,
    completed_by_name: completedBy?.display_name || null,
    comment: row.comment,
    value_number: row.value_number,
    photo_url: row.photo_url
  };
}

export async function getAdminTaskRows(filters: Filters = {}) {
  const db = supabaseAdmin();
  if (!db) return tasks;
  await ensureTodayWork();
  let query = db.from("task_occurrences").select("*, tasks(*), completed_by:employees!task_occurrences_completed_by_employee_id_fkey(display_name)").order("due_at", { ascending: true }).limit(500);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.employee) query = query.eq("assigned_employee_id", filters.employee);
  if (filters.date) query = query.eq("occurrence_date", filters.date);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapTask).filter((task) => {
    if (filters.location && task.location_id !== filters.location) return false;
    if (filters.area && !task.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
    return true;
  });
}

export async function getAdminChecklistRows() {
  const db = supabaseAdmin();
  if (!db) return [];
  await ensureTodayWork();
  const { data, error } = await db.from("checklist_occurrences").select("*, checklists(*)").order("due_at", { ascending: true }).limit(300);
  if (error || !data) return [];
  const ids = data.map((row) => row.id);
  const checklistIds = data.map((row: any) => (Array.isArray(row.checklists) ? row.checklists[0] : row.checklists)?.id).filter(Boolean);
  const [{ data: items }, { data: completions }] = await Promise.all([
    db.from("checklist_items").select("id, checklist_id").in("checklist_id", checklistIds).eq("active", true),
    db.from("checklist_item_completions").select("checklist_occurrence_id, checklist_item_id").in("checklist_occurrence_id", ids)
  ]);
  return data.map((row: any) => {
    const check = Array.isArray(row.checklists) ? row.checklists[0] : row.checklists;
    const checkItems = (items || []).filter((item) => item.checklist_id === check?.id);
    const done = (completions || []).filter((item) => item.checklist_occurrence_id === row.id);
    return { id: row.id, checklist_id: check?.id || row.checklist_id, name: check?.name || "Checkliste", location_id: row.location_id, status: row.status, due_at: row.due_at, due_time: check?.due_time || "", interval_type: check?.interval_type || "daily", completed_count: done.length, total_count: checkItems.length };
  });
}

export function locationDayStats(locationId: string, taskRows: any[]) {
  const rows = taskRows.filter((task) => task.location_id === locationId);
  return {
    open: rows.filter((task) => task.status !== "completed" && task.status !== "overdue").length,
    overdue: rows.filter((task) => task.status === "overdue").length,
    done: rows.filter((task) => task.status === "completed").length,
    missingProof: rows.filter((task) => task.status === "completed" && ["photo", "text", "number"].includes(task.proof_type) && !task.photo_url && !task.comment && task.value_number == null).length
  };
}

export async function getAdminBasics() {
  const [employees, locations] = await Promise.all([getEmployees(), getLocations()]);
  return { employees, locations };
}
