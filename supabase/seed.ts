import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.");

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ids = {
  verwaltung: "00000000-0000-0000-0000-000000000001",
  ulmet: "00000000-0000-0000-0000-000000000002",
  landstuhl: "00000000-0000-0000-0000-000000000003",
  lauterecken: "00000000-0000-0000-0000-000000000004",
  kehl: "00000000-0000-0000-0000-000000000005",
  kirchberg: "00000000-0000-0000-0000-000000000006",
  kassel: "00000000-0000-0000-0000-000000000007",
  svend: "10000000-0000-0000-0000-000000000001",
  jennifer: "10000000-0000-0000-0000-000000000002",
  anika: "10000000-0000-0000-0000-000000000003",
  jenny: "10000000-0000-0000-0000-000000000004",
  hangx: "10000000-0000-0000-0000-000000000005",
  max: "10000000-0000-0000-0000-000000000006"
};

async function main() {
  await db.from("locations").upsert([
    { id: ids.verwaltung, name: "Verwaltung" }, { id: ids.ulmet, name: "Ulmet" }, { id: ids.landstuhl, name: "Landstuhl" },
    { id: ids.lauterecken, name: "Lauterecken" }, { id: ids.kehl, name: "Kehl" }, { id: ids.kirchberg, name: "Kirchberg" }, { id: ids.kassel, name: "Kassel" }
  ]);
  await db.from("employees").upsert([
    await employee(ids.svend, "Svend", "Neumann", "Svend Neumann", ids.verwaltung, "Admin", "admin", "111111"),
    await employee(ids.jennifer, "Jennifer", "Meirich", "Jennifer Meirich", ids.ulmet, "Standortleitung", "employee", "222222"),
    await employee(ids.anika, "Anika", "Lützelberger", "Anika Lützelberger", ids.ulmet, "ZMP", "employee", "333333"),
    await employee(ids.jenny, "Jenny", "Beispiel", "Jenny Beispiel", ids.ulmet, "ZFA", "employee", "444444"),
    await employee(ids.hangx, "Dr.", "Hangx", "Dr. Hangx", ids.ulmet, "Zahnarzt", "employee", "555555"),
    await employee(ids.max, "Max", "Mustermann", "Max Mustermann", ids.landstuhl, "ZFA", "employee", "666666")
  ]);
  const taskRows = [
    task("20000000-0000-0000-0000-000000000001", "Tagesplanung prüfen", "Organisation", ids.jennifer, "07:00", "none"),
    task("20000000-0000-0000-0000-000000000002", "Kasse kontrollieren", "Anmeldung", ids.jennifer, "17:30", "number", "€"),
    task("20000000-0000-0000-0000-000000000003", "Offene Aufgaben prüfen", "Leitung", ids.jennifer, "18:00", "none"),
    task("20000000-0000-0000-0000-000000000004", "Wochenplanung Team prüfen", "Leitung", ids.jennifer, "15:00", "text", null, "weekly", 5),
    task("20000000-0000-0000-0000-000000000005", "Steri starten", "Steri", ids.anika, "07:30", "none"),
    task("20000000-0000-0000-0000-000000000006", "Kühlschranktemperatur dokumentieren", "Hygiene", ids.anika, "08:00", "number", "°C"),
    task("20000000-0000-0000-0000-000000000007", "Steri reinigen", "Steri", ids.anika, "18:00", "photo"),
    task("20000000-0000-0000-0000-000000000008", "Anrufbeantworter abhören", "Anmeldung", ids.jenny, "07:45", "none"),
    task("20000000-0000-0000-0000-000000000009", "Recall-Liste prüfen", "Anmeldung", ids.jenny, "12:00", "none"),
    task("20000000-0000-0000-0000-000000000010", "Laborversand vorbereiten", "Labor", ids.jenny, "13:00", "photo"),
    task("20000000-0000-0000-0000-000000000011", "Tagesplan prüfen", "Behandlung", ids.hangx, "07:30", "none"),
    task("20000000-0000-0000-0000-000000000012", "Offene Heil- und Kostenpläne prüfen", "Abrechnung", ids.hangx, "14:00", "text", null, "weekly", 3),
    task("20000000-0000-0000-0000-000000000013", "Rückfragen aus KFO-Fällen prüfen", "KFO", ids.hangx, "14:00", "text", null, "weekly", 4)
  ];
  await db.from("tasks").upsert(taskRows);
  await db.from("task_occurrences").upsert(taskRows.map((row, index) => ({ id: `30000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`, task_id: row.id, occurrence_date: new Date().toISOString().slice(0, 10), assigned_employee_id: row.assigned_employee_id, original_employee_id: row.assigned_employee_id, status: index === 4 ? "overdue" : "open", due_at: dueAt(row.due_time) })));
  const checklistRows = [checklist("40000000-0000-0000-0000-000000000001", "Morgencheck", "daily", "08:00"), checklist("40000000-0000-0000-0000-000000000002", "Abendcheck", "daily", "18:30"), checklist("40000000-0000-0000-0000-000000000003", "Wochencheck", "weekly", "16:00", 5), checklist("40000000-0000-0000-0000-000000000004", "Monatscheck", "monthly", "12:00", null, 1)];
  await db.from("checklists").upsert(checklistRows);
  await db.from("checklist_items").upsert([...items(checklistRows[0].id, ["Steri gestartet", "Behandlungszimmer kontrolliert", "EC-Terminal geprüft", "Terminbuch geprüft", "Wartezimmer ordentlich"], 1), ...items(checklistRows[1].id, ["Rohre spülen", "Zimmer 1 aufräumen", "Zimmer 2 aufräumen", "Zimmer 3 aufräumen", "Schränke auffüllen", "Steri ausschalten", "Müll entsorgen", "Alarmanlage aktivieren"], 20), ...items(checklistRows[2].id, ["Notfallkoffer geprüft", "Medikamentenbestand geprüft", "Lagerbestand kontrolliert", "Verbrauchsmaterial nachbestellt"], 40), ...items(checklistRows[3].id, ["Kühlschrank Grundreinigung dokumentiert", "Lagerinventur durchgeführt", "QM-Unterlagen kontrolliert", "Feuerlöscher Sichtprüfung dokumentiert"], 60)]);
  await db.from("checklist_occurrences").upsert(checklistRows.map((row, index) => ({ id: `50000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`, checklist_id: row.id, occurrence_date: new Date().toISOString().slice(0, 10), location_id: ids.ulmet, status: "open", due_at: dueAt(row.due_time) })));
}

async function employee(id: string, first_name: string, last_name: string, display_name: string, location_id: string, function_title: string, role: "employee" | "admin", pin: string) {
  return { id, first_name, last_name, display_name, location_id, function_title, role, pin_hash: await bcrypt.hash(pin, 12), active: true };
}
function task(id: string, title: string, area: string, assigned_employee_id: string, due_time: string, proof_type: string, value_unit: string | null = null, interval_type = "daily", due_weekday: number | null = null) {
  return { id, title, description: `${title} sauber dokumentieren und bei Auffälligkeiten kommentieren.`, area, location_id: assigned_employee_id === ids.max ? ids.landstuhl : ids.ulmet, assigned_employee_id, interval_type, due_time, due_weekday, proof_type, photo_required: proof_type === "photo", comment_required: proof_type === "text", value_required: proof_type === "number", value_unit, active: true };
}
function checklist(id: string, name: string, interval_type: string, due_time: string, due_weekday: number | null = null, due_day_of_month: number | null = null) { return { id, name, location_id: ids.ulmet, interval_type, due_time, due_weekday, due_day_of_month, active: true }; }
function items(checklist_id: string, titles: string[], offset: number) { return titles.map((title, index) => ({ id: `60000000-0000-0000-0000-${String(offset + index).padStart(12, "0")}`, checklist_id, title, sort_order: index + 1, proof_type: "none", active: true })); }
function dueAt(time: string | null) { if (!time) return null; const date = new Date(); const [hours, minutes] = time.split(":").map(Number); date.setHours(hours, minutes, 0, 0); return date.toISOString(); }

main().then(() => console.log("ORISUS Seed-Daten wurden eingespielt.")).catch((error) => { console.error(error); process.exit(1); });
