import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export type Role = "employee" | "admin";
export type Status = "open" | "completed" | "overdue" | "in_progress" | "delegation_requested" | "delegated" | "rejected" | "pending" | "accepted";

export type Employee = {
  id: string;
  display_name: string;
  first_name: string;
  location_id: string;
  location_name: string;
  function_title: string;
  role: Role;
  active: boolean;
  pin_hash?: string;
  failed_login_attempts?: number;
  locked_until?: string | null;
};

export type TaskOccurrence = {
  id: string;
  title: string;
  description: string;
  area: string;
  location_id: string;
  assigned_employee_id: string;
  original_employee_id: string;
  status: Status;
  due_time: string;
  interval_type: "daily" | "weekly" | "monthly" | "custom";
  proof_type: "none" | "photo" | "text" | "number";
  value_unit?: string | null;
  completed_at?: string | null;
  comment?: string | null;
  photo_url?: string | null;
};

export type ChecklistOccurrence = {
  id: string;
  name: string;
  location_id: string;
  status: Status;
  due_time: string;
  interval_type: "daily" | "weekly" | "monthly" | "custom";
};

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  title: string;
  proof_type: "none" | "photo" | "text" | "number";
  required: boolean;
};

export const locations = ["Verwaltung", "Ulmet", "Landstuhl", "Lauterecken", "Kehl", "Kirchberg", "Kassel"].map((name, index) => ({
  id: `loc-${index + 1}`,
  name,
  active: true
}));

export const demoPins: Record<string, string> = {
  "emp-svend": "111111",
  "emp-jennifer": "222222",
  "emp-anika": "333333",
  "emp-jenny": "444444",
  "emp-hangx": "555555",
  "emp-max": "666666"
};

export const employees: Employee[] = [
  employee("emp-svend", "Svend Neumann", "Svend", "Verwaltung", "Admin", "admin"),
  employee("emp-jennifer", "Jennifer Meirich", "Jennifer", "Ulmet", "Standortleitung", "employee"),
  employee("emp-anika", "Anika Lützelberger", "Anika", "Ulmet", "ZMP", "employee"),
  employee("emp-jenny", "Jenny Beispiel", "Jenny", "Ulmet", "ZFA", "employee"),
  employee("emp-hangx", "Dr. Hangx", "Dr.", "Ulmet", "Zahnarzt", "employee"),
  employee("emp-max", "Max Mustermann", "Max", "Landstuhl", "ZFA", "employee")
];

export const tasks: TaskOccurrence[] = [
  task("t1", "Tagesplanung prüfen", "Organisation", "emp-jennifer", "07:00", "none"),
  task("t2", "Kasse kontrollieren", "Anmeldung", "emp-jennifer", "17:30", "number", "€"),
  task("t3", "Offene Aufgaben prüfen", "Leitung", "emp-jennifer", "18:00", "none", null, "completed"),
  task("t4", "Wochenplanung Team prüfen", "Leitung", "emp-jennifer", "15:00", "text", null, "open", "weekly"),
  task("t5", "Steri starten", "Steri", "emp-anika", "07:30", "none", null, "overdue"),
  task("t6", "Kühlschranktemperatur dokumentieren", "Hygiene", "emp-anika", "08:00", "number", "°C"),
  task("t7", "Steri reinigen", "Steri", "emp-anika", "18:00", "photo"),
  task("t8", "Anrufbeantworter abhören", "Anmeldung", "emp-jenny", "07:45", "none"),
  task("t9", "Recall-Liste prüfen", "Anmeldung", "emp-jenny", "12:00", "none"),
  task("t10", "Laborversand vorbereiten", "Labor", "emp-jenny", "13:00", "photo"),
  task("t11", "Tagesplan prüfen", "Behandlung", "emp-hangx", "07:30", "none"),
  task("t12", "Offene Heil- und Kostenpläne prüfen", "Abrechnung", "emp-hangx", "14:00", "text", null, "open", "weekly"),
  task("t13", "Rückfragen aus KFO-Fällen prüfen", "KFO", "emp-hangx", "14:00", "text", null, "open", "weekly")
];

export const checklists: ChecklistOccurrence[] = [
  checklist("c1", "Morgencheck", "08:00", "in_progress"),
  checklist("c2", "Abendcheck", "18:30", "open"),
  checklist("c3", "Wochencheck", "16:00", "completed", "weekly"),
  checklist("c4", "Monatscheck", "12:00", "open", "monthly")
];

export const checklistItems: ChecklistItem[] = [
  ...items("c1", ["Steri gestartet", "Behandlungszimmer kontrolliert", "EC-Terminal geprüft", "Terminbuch geprüft", "Wartezimmer ordentlich"]),
  ...items("c2", ["Rohre spülen", "Zimmer 1 aufräumen", "Zimmer 2 aufräumen", "Zimmer 3 aufräumen", "Schränke auffüllen", "Steri ausschalten", "Müll entsorgen", "Alarmanlage aktivieren"]),
  ...items("c3", ["Notfallkoffer geprüft", "Medikamentenbestand geprüft", "Lagerbestand kontrolliert", "Verbrauchsmaterial nachbestellt"]),
  ...items("c4", ["Kühlschrank Grundreinigung dokumentiert", "Lagerinventur durchgeführt", "QM-Unterlagen kontrolliert", "Feuerlöscher Sichtprüfung dokumentiert"])
];

export const delegations = [
  { id: "d1", task_id: "t7", from: "emp-anika", to: "emp-jenny", status: "pending" as Status, comment: "Kannst du heute den Abend-Steri übernehmen?", requested_at: new Date().toISOString() }
];

function employee(id: string, display_name: string, first_name: string, locationName: string, function_title: string, role: Role): Employee {
  const location = locations.find((item) => item.name === locationName)!;
  return { id, display_name, first_name, location_id: location.id, location_name: location.name, function_title, role, active: true };
}

function task(id: string, title: string, area: string, employeeId: string, due_time: string, proof_type: TaskOccurrence["proof_type"], value_unit: string | null = null, status: Status = "open", interval_type: TaskOccurrence["interval_type"] = "daily"): TaskOccurrence {
  const employee = employees.find((item) => item.id === employeeId)!;
  return { id, title, description: `${title} sauber dokumentieren und bei Auffälligkeiten kommentieren.`, area, location_id: employee.location_id, assigned_employee_id: employeeId, original_employee_id: employeeId, status, due_time, proof_type, value_unit, interval_type, completed_at: status === "completed" ? new Date().toISOString() : null };
}

function checklist(id: string, name: string, due_time: string, status: Status, interval_type: ChecklistOccurrence["interval_type"] = "daily"): ChecklistOccurrence {
  return { id, name, location_id: locations.find((item) => item.name === "Ulmet")!.id, status, due_time, interval_type };
}

function items(checklist_id: string, names: string[]) {
  return names.map((title, index) => ({ id: `${checklist_id}-${index + 1}`, checklist_id, title, proof_type: "none" as const, required: true }));
}

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function hashPin(pin: string) {
  return bcrypt.hash(pin, 12);
}

export async function verifyPin(pin: string, hash: string) {
  return bcrypt.compare(pin, hash);
}

export function sessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function tokenHash(token: string) {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET || "dev-secret").update(token).digest("hex");
}

export async function getEmployees() {
  const db = supabaseAdmin();
  if (!db) return employees;
  const { data, error } = await db.from("employees").select("*, locations(name)").eq("active", true).order("display_name");
  if (error || !data) return employees;
  return data.map((row: any) => ({ ...row, location_name: row.locations?.name || "" })) as Employee[];
}

export async function verifyLogin(employeeId: string, pin: string) {
  const db = supabaseAdmin();
  if (!/^\d{6}$/.test(pin)) return null;
  if (!db) {
    const employee = employees.find((item) => item.id === employeeId && demoPins[item.id] === pin);
    return employee || null;
  }
  const { data } = await db.from("employees").select("*").eq("id", employeeId).eq("active", true).single();
  if (!data) return null;
  if (data.locked_until && new Date(data.locked_until) > new Date()) return null;
  const ok = await verifyPin(pin, data.pin_hash);
  if (!ok) {
    const failed = Number(data.failed_login_attempts || 0) + 1;
    await db.from("employees").update({ failed_login_attempts: failed, locked_until: failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null }).eq("id", employeeId);
    return null;
  }
  await db.from("employees").update({ failed_login_attempts: 0, locked_until: null }).eq("id", employeeId);
  return data as Employee;
}

export async function currentUser(): Promise<Employee | null> {
  const cookie = cookies().get("orisus_session")?.value;
  if (!cookie) return null;
  const db = supabaseAdmin();
  if (!db) {
    try {
      const parsed = JSON.parse(Buffer.from(cookie, "base64url").toString("utf8"));
      return employees.find((item) => item.id === parsed.employee_id) || null;
    } catch { return null; }
  }
  const { data } = await db.from("sessions").select("employee_id, expires_at, employees(*, locations(name))").eq("token_hash", tokenHash(cookie)).gt("expires_at", new Date().toISOString()).single();
  const employee: any = data?.employees;
  return employee ? { ...employee, location_name: employee.locations?.name || "" } : null;
}

export async function requireUser(role?: Role) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(user.role === "admin" ? "/admin" : "/app");
  return user;
}

export function tasksFor(user: Employee) {
  return user.role === "admin" ? tasks : tasks.filter((item) => item.assigned_employee_id === user.id);
}

export function checklistsFor(user: Employee) {
  return user.role === "admin" ? checklists : checklists.filter((item) => item.location_id === user.location_id);
}

export function labelFor(status: string) {
  return ({ open: "Offen", completed: "Erledigt", overdue: "Überfällig", in_progress: "Begonnen", delegation_requested: "Vertretung angefragt", delegated: "Vertreten", rejected: "Abgelehnt", pending: "Wartet", accepted: "Angenommen" } as Record<string, string>)[status] || status;
}

export function dateLabel(value?: string | null) {
  return value ? new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "Noch offen";
}
