import { canWorkAtLocation, checklistItems, checklists, delegations, Employee, getEmployees, supabaseAdmin, tasks, TaskOccurrence } from "@/lib/orisus";
import { INSTANCE_LOCATIONS } from "@/lib/instance";

export type LiveChecklist = {
  id: string;
  checklist_id: string;
  name: string;
  location_id: string;
  status: string;
  due_time: string;
  interval_type: string;
  completed_count: number;
  total_count: number;
  required_count: number;
};

export type LiveChecklistItem = {
  id: string;
  checklist_id: string;
  title: string;
  proof_type: "none" | "photo" | "text" | "number";
  required: boolean;
  completed: boolean;
  completed_at?: string | null;
  completed_by_name?: string | null;
  comment?: string | null;
  photo_url?: string | null;
};

export type LiveDelegation = {
  id: string;
  task_occurrence_id: string;
  title: string;
  status: string;
  comment?: string | null;
  requested_at?: string | null;
  responded_at?: string | null;
  direction: "sent" | "received";
  other_person: string;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function dueAt(date: string, time?: string | null) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(`${date}T00:00:00`);
  value.setHours(hours || 0, minutes || 0, 0, 0);
  return value.toISOString();
}

function isDueToday(row: any, date = new Date()) {
  if (row.interval_type === "daily") return true;
  if (row.interval_type === "weekly") return row.due_weekday == null || Number(row.due_weekday) === date.getDay();
  if (row.interval_type === "monthly") return row.due_day_of_month == null || Number(row.due_day_of_month) === date.getDate();
  return false;
}

const EVENING_CHECK_TITLES = ["Zimmer 1: Gespült (Spüllösung)", "Zimmer 1: Schränkchen/Schubladen aufgefüllt", "Zimmer 1: Siebe gesäubert", "Zimmer 2: Gespült (Spüllösung)", "Zimmer 2: Schränkchen/Schubladen aufgefüllt", "Zimmer 2: Siebe gesäubert", "Zimmer 3: Gespült (Spüllösung)", "Zimmer 3: Schränkchen/Schubladen aufgefüllt", "Zimmer 3: Siebe gesäubert", "Zimmer 4: Gespült (Spüllösung)", "Zimmer 4: Schränkchen/Schubladen aufgefüllt", "Zimmer 4: Siebe gesäubert"];

async function ensureEveningChecklists() {
  const db = supabaseAdmin();
  if (!db) return;
  const { data: locationRows } = await db.from("locations").select("id, name").eq("active", true).in("name", INSTANCE_LOCATIONS);
  if (!locationRows || locationRows.length === 0) return;

  const expectedNames = locationRows.map((location) => `Abendcheck ${location.name}`);
  const { data: existingChecks } = await db.from("checklists").select("id, name, location_id").eq("active", true).in("name", expectedNames);
  const existingKeys = new Set((existingChecks || []).map((check) => `${check.location_id}:${check.name}`));
  const missingChecks = locationRows
    .map((location) => ({ name: `Abendcheck ${location.name}`, location_id: location.id, interval_type: "daily", due_time: "18:30", active: true }))
    .filter((check) => !existingKeys.has(`${check.location_id}:${check.name}`));

  if (missingChecks.length > 0) await db.from("checklists").insert(missingChecks);

  const { data: eveningChecks } = await db.from("checklists").select("id, name, location_id").eq("active", true).in("name", expectedNames);
  const checklistIds = (eveningChecks || []).map((check) => check.id);
  if (checklistIds.length === 0) return;

  const { data: existingItems } = await db.from("checklist_items").select("checklist_id, title").eq("active", true).in("checklist_id", checklistIds);
  const itemKeys = new Set((existingItems || []).map((item) => `${item.checklist_id}:${item.title}`));
  const missingItems = (eveningChecks || []).flatMap((check) =>
    EVENING_CHECK_TITLES.map((title, index) => ({ checklist_id: check.id, title, sort_order: index + 1, proof_type: "photo", photo_required: true, active: true }))
      .filter((item) => !itemKeys.has(`${item.checklist_id}:${item.title}`))
  );

  if (missingItems.length > 0) await db.from("checklist_items").insert(missingItems);
}

async function ensureTaskOccurrences() {
  const db = supabaseAdmin();
  if (!db) return;
  const date = todayISO();
  const { data: taskRows } = await db.from("tasks").select("*").eq("active", true);
  const dueTasks = (taskRows || []).filter((row) => isDueToday(row));
  if (dueTasks.length === 0) return;
  const ids = dueTasks.map((row) => row.id);
  const { data: existing } = await db.from("task_occurrences").select("task_id").eq("occurrence_date", date).in("task_id", ids);
  const existingIds = new Set((existing || []).map((row) => row.task_id));
  const rows = dueTasks.filter((row) => !existingIds.has(row.id)).map((row) => ({
    task_id: row.id,
    occurrence_date: date,
    assigned_employee_id: row.assigned_employee_id,
    original_employee_id: row.assigned_employee_id,
    status: "open",
    due_at: dueAt(date, row.due_time)
  }));
  if (rows.length > 0) await db.from("task_occurrences").insert(rows);
}

async function ensureChecklistOccurrences() {
  const db = supabaseAdmin();
  if (!db) return;
  await ensureEveningChecklists();
  const date = todayISO();
  const { data: checklistRows } = await db.from("checklists").select("*").eq("active", true);
  const dueChecks = (checklistRows || []).filter((row) => isDueToday(row));
  if (dueChecks.length === 0) return;
  const ids = dueChecks.map((row) => row.id);
  const { data: existing } = await db.from("checklist_occurrences").select("checklist_id").eq("occurrence_date", date).in("checklist_id", ids);
  const existingIds = new Set((existing || []).map((row) => row.checklist_id));
  const rows = dueChecks.filter((row) => !existingIds.has(row.id)).map((row) => ({
    checklist_id: row.id,
    occurrence_date: date,
    location_id: row.location_id,
    status: "open",
    due_at: dueAt(date, row.due_time)
  }));
  if (rows.length > 0) await db.from("checklist_occurrences").insert(rows);
}

export async function ensureTodayWork() {
  const db = supabaseAdmin();
  if (!db) return;
  await ensureTaskOccurrences();
  await ensureChecklistOccurrences();
  const now = new Date().toISOString();
  await db.from("task_occurrences").update({ status: "overdue" }).lt("due_at", now).in("status", ["open", "delegation_requested", "delegated"]);
  await db.from("checklist_occurrences").update({ status: "overdue" }).lt("due_at", now).in("status", ["open", "in_progress"]);
}

function mapTask(row: any): TaskOccurrence {
  const task = Array.isArray(row.tasks) ? row.tasks[0] : row.tasks;
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
    interval_type: task?.interval_type || "daily",
    proof_type: task?.proof_type || "none",
    value_unit: task?.value_unit || null,
    completed_at: row.completed_at,
    comment: row.comment,
    photo_url: row.photo_url
  };
}

export async function getEmployeeTasks(user: Employee) {
  const db = supabaseAdmin();
  if (!db) return tasks.filter((task) => task.assigned_employee_id === user.id);
  await ensureTodayWork();
  const { data, error } = await db.from("task_occurrences").select("*, tasks(*)").eq("assigned_employee_id", user.id).order("due_at", { ascending: true }).limit(200);
  if (error || !data) return [];
  return data.map(mapTask);
}

export async function getEmployeeChecklists(user: Employee): Promise<LiveChecklist[]> {
  const db = supabaseAdmin();
  if (!db) return checklists.filter((check) => canWorkAtLocation(user, check.location_id)).map((check) => ({ ...check, checklist_id: check.id, completed_count: 0, total_count: checklistItems.filter((item) => item.checklist_id === check.id).length, required_count: checklistItems.filter((item) => item.checklist_id === check.id && item.required).length }));
  await ensureTodayWork();
  let query = db.from("checklist_occurrences").select("*, checklists(*)").order("due_at", { ascending: true }).limit(100);
  if (!user.works_across_locations) query = query.eq("location_id", user.location_id);
  const { data, error } = await query;
  if (error || !data || data.length === 0) return [];
  const occurrenceIds = data.map((row) => row.id);
  const checklistIds = data.map((row: any) => (Array.isArray(row.checklists) ? row.checklists[0] : row.checklists)?.id).filter(Boolean);
  const [{ data: itemRows }, { data: completionRows }] = await Promise.all([
    db.from("checklist_items").select("id, checklist_id").in("checklist_id", checklistIds).eq("active", true),
    db.from("checklist_item_completions").select("checklist_occurrence_id, checklist_item_id").in("checklist_occurrence_id", occurrenceIds)
  ]);
  return data.map((row: any) => {
    const checklist = Array.isArray(row.checklists) ? row.checklists[0] : row.checklists;
    const items = (itemRows || []).filter((item) => item.checklist_id === checklist?.id);
    const completions = (completionRows || []).filter((item) => item.checklist_occurrence_id === row.id);
    return { id: row.id, checklist_id: checklist?.id || row.checklist_id, name: checklist?.name || "Checkliste", location_id: row.location_id, status: row.status, due_time: checklist?.due_time || "", interval_type: checklist?.interval_type || "daily", completed_count: completions.length, total_count: items.length, required_count: items.length };
  });
}

export async function getChecklistDetail(occurrenceId: string, user: Employee) {
  const db = supabaseAdmin();
  if (!db) {
    const check = checklists.find((item) => item.id === occurrenceId) || checklists[0];
    const items = checklistItems.filter((item) => item.checklist_id === check.id).map((item) => ({ ...item, completed: false }));
    return { occurrence: { ...check, checklist_id: check.id, completed_count: 0, total_count: items.length }, items };
  }
  await ensureTodayWork();
  const { data: occurrence } = await db.from("checklist_occurrences").select("*, checklists(*)").eq("id", occurrenceId).single();
  if (!occurrence) return null;
  if (!canWorkAtLocation(user, occurrence.location_id)) return null;
  const checklist = Array.isArray((occurrence as any).checklists) ? (occurrence as any).checklists[0] : (occurrence as any).checklists;
  const [{ data: items }, { data: completions }] = await Promise.all([
    db.from("checklist_items").select("*").eq("checklist_id", checklist.id).eq("active", true).order("sort_order"),
    db.from("checklist_item_completions").select("*, completed_by:employees!checklist_item_completions_completed_by_employee_id_fkey(display_name)").eq("checklist_occurrence_id", occurrenceId)
  ]);
  const done = new Map((completions || []).map((row) => [row.checklist_item_id, row]));
  const detailItems = (items || []).map((item) => {
    const completion: any = done.get(item.id);
    const completedBy = Array.isArray(completion?.completed_by) ? completion.completed_by[0] : completion?.completed_by;
    return { ...item, required: true, completed: done.has(item.id), completed_at: completion?.completed_at, completed_by_name: completedBy?.display_name || null, comment: completion?.comment, photo_url: completion?.photo_url };
  }) as LiveChecklistItem[];
  return { occurrence: { id: occurrence.id, checklist_id: checklist.id, name: checklist.name, status: occurrence.status, due_time: checklist.due_time, interval_type: checklist.interval_type, completed_count: detailItems.filter((item) => item.completed).length, total_count: detailItems.length }, items: detailItems };
}

export async function getEmployeeDelegations(user: Employee): Promise<LiveDelegation[]> {
  const db = supabaseAdmin();
  if (!db) return delegations.filter((item) => item.to === user.id || item.from === user.id).map((item) => ({ id: item.id, task_occurrence_id: item.task_id, title: `Aufgabe ${item.task_id}`, status: item.status, comment: item.comment, requested_at: item.requested_at, direction: item.to === user.id ? "received" : "sent", other_person: item.to === user.id ? item.from : item.to }));
  const { data } = await db.from("delegation_requests").select("*, task_occurrences(*, tasks(title)), requested_by:employees!delegation_requests_requested_by_employee_id_fkey(display_name), requested_to:employees!delegation_requests_requested_to_employee_id_fkey(display_name)").or(`requested_by_employee_id.eq.${user.id},requested_to_employee_id.eq.${user.id}`).order("requested_at", { ascending: false });
  return (data || []).map((row: any) => {
    const task = Array.isArray(row.task_occurrences?.tasks) ? row.task_occurrences.tasks[0] : row.task_occurrences?.tasks;
    const received = row.requested_to_employee_id === user.id;
    return { id: row.id, task_occurrence_id: row.task_occurrence_id, title: task?.title || "Aufgabe", status: row.status, comment: row.comment, requested_at: row.requested_at, responded_at: row.responded_at, direction: received ? "received" : "sent", other_person: received ? row.requested_by?.display_name || "Anfragende Person" : row.requested_to?.display_name || "Vertretung" };
  });
}

export async function getDelegationTargets(user: Employee) {
  const all = await getEmployees();
  return all.filter((employee) => employee.id !== user.id && employee.active && (user.works_across_locations || employee.works_across_locations || employee.location_id === user.location_id));
}
