import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { INSTANCE_LOCATIONS, INSTANCE_NAME } from "../lib/instance";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.");

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ids = {
  ulmet: "00000000-0000-0000-0000-000000000002",
  landstuhl: "00000000-0000-0000-0000-000000000003",
  lauterecken: "00000000-0000-0000-0000-000000000004",
  svend: "10000000-0000-0000-0000-000000000001",
  jennifer: "10000000-0000-0000-0000-000000000002",
  anika: "10000000-0000-0000-0000-000000000003",
  jenny: "10000000-0000-0000-0000-000000000004",
  hangx: "10000000-0000-0000-0000-000000000005",
  max: "10000000-0000-0000-0000-000000000006"
};

async function main() {
  const { data: existingLocations } = await db.from("locations").select("id, name");
  const inactiveLocationIds = (existingLocations || [])
    .filter((location) => !INSTANCE_LOCATIONS.includes(location.name))
    .map((location) => location.id);

  if (inactiveLocationIds.length > 0) {
    await db.from("locations").update({ active: false }).in("id", inactiveLocationIds);
  }

  await db.from("locations").upsert([
    { id: ids.ulmet, name: "Ulmet", active: true },
    { id: ids.landstuhl, name: "Landstuhl", active: true },
    { id: ids.lauterecken, name: "Lauterecken", active: true }
  ]);

  await db.from("employees").upsert([
    await employee(ids.svend, "Svend", "Neumann", "Svend Neumann", ids.ulmet, "Admin", "admin", "111111", true),
    await employee(ids.jennifer, "Jennifer", "Meirich", "Jennifer Meirich", ids.ulmet, "Standortleitung", "location_lead", "222222", true),
    await employee(ids.anika, "Anika", "Lützelberger", "Anika Lützelberger", ids.ulmet, "ZMP", "employee", "333333"),
    await employee(ids.jenny, "Jenny", "Beispiel", "Jenny Beispiel", ids.ulmet, "ZFA", "employee", "444444"),
    await employee(ids.hangx, "Dr.", "Hangx", "Dr. Hangx", ids.ulmet, "Zahnarzt", "employee", "555555"),
    await employee(ids.max, "Max", "Mustermann", "Max Mustermann", ids.landstuhl, "ZFA", "employee", "666666")
  ]);

  const taskRows = [
    task("20000000-0000-0000-0000-000000000001", "Tagesplanung prüfen", "Organisation", ids.ulmet, ids.jennifer, "07:00", "none"),
    task("20000000-0000-0000-0000-000000000002", "Kasse kontrollieren", "Anmeldung", ids.ulmet, ids.jennifer, "17:30", "number", "€"),
    task("20000000-0000-0000-0000-000000000003", "Offene Aufgaben prüfen", "Leitung", ids.ulmet, ids.jennifer, "18:00", "none"),
    task("20000000-0000-0000-0000-000000000004", "Wochenplanung Team prüfen", "Leitung", ids.ulmet, ids.jennifer, "15:00", "text", null, "weekly", 5),
    task("20000000-0000-0000-0000-000000000005", "Steri starten", "Steri", ids.ulmet, ids.anika, "07:30", "none"),
    task("20000000-0000-0000-0000-000000000006", "Kühlschranktemperatur dokumentieren", "Hygiene", ids.ulmet, ids.anika, "08:00", "number", "°C"),
    task("20000000-0000-0000-0000-000000000007", "Steri reinigen", "Steri", ids.ulmet, ids.anika, "18:00", "photo"),
    task("20000000-0000-0000-0000-000000000008", "Anrufbeantworter abhören", "Anmeldung", ids.ulmet, ids.jenny, "07:45", "none"),
    task("20000000-0000-0000-0000-000000000009", "Recall-Liste prüfen", "Anmeldung", ids.ulmet, ids.jenny, "12:00", "none"),
    task("20000000-0000-0000-0000-000000000010", "Laborversand vorbereiten", "Labor", ids.ulmet, ids.jenny, "13:00", "photo"),
    task("20000000-0000-0000-0000-000000000011", "Tagesplan prüfen", "Behandlung", ids.ulmet, ids.hangx, "07:30", "none"),
    task("20000000-0000-0000-0000-000000000012", "Offene Heil- und Kostenpläne prüfen", "Abrechnung", ids.ulmet, ids.hangx, "14:00", "text", null, "weekly", 3),
    task("20000000-0000-0000-0000-000000000013", "Tagesabschluss Landstuhl prüfen", "Organisation", ids.landstuhl, ids.max, "18:00", "none")
  ];
  await db.from("tasks").upsert(taskRows);
  await db.from("task_occurrences").upsert(taskRows.map((row, index) => ({ id: `30000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`, task_id: row.id, occurrence_date: new Date().toISOString().slice(0, 10), assigned_employee_id: row.assigned_employee_id, original_employee_id: row.assigned_employee_id, status: index === 4 ? "overdue" : "open", due_at: dueAt(row.due_time) })));

  const checklistRows = [
    checklist("40000000-0000-0000-0000-000000000001", "Morgencheck Ulmet", ids.ulmet, "daily", "08:00"),
    checklist("40000000-0000-0000-0000-000000000002", "Abendcheck Ulmet", ids.ulmet, "daily", "18:30"),
    checklist("40000000-0000-0000-0000-000000000003", "Wochencheck Ulmet", ids.ulmet, "weekly", "16:00", 5),
    checklist("40000000-0000-0000-0000-000000000004", "Monatscheck Ulmet", ids.ulmet, "monthly", "12:00", null, 1),
    checklist("40000000-0000-0000-0000-000000000005", "Morgencheck Lauterecken", ids.lauterecken, "daily", "08:00"),
    checklist("40000000-0000-0000-0000-000000000006", "Morgencheck Landstuhl", ids.landstuhl, "daily", "08:00"),
    checklist("40000000-0000-0000-0000-000000000007", "Abendcheck Lauterecken", ids.lauterecken, "daily", "18:30"),
    checklist("40000000-0000-0000-0000-000000000008", "Abendcheck Landstuhl", ids.landstuhl, "daily", "18:30")
  ];
  await db.from("checklists").upsert(checklistRows);
  await db.from("checklist_items").upsert([...items(checklistRows[0].id, ["Steri gestartet", "Behandlungszimmer kontrolliert", "EC-Terminal geprüft", "Terminbuch geprüft", "Wartezimmer ordentlich"], 1), ...eveningItems(checklistRows[1].id, 20), ...items(checklistRows[2].id, ["Notfallkoffer geprüft", "Medikamentenbestand geprüft", "Lagerbestand kontrolliert", "Verbrauchsmaterial nachbestellt"], 40), ...items(checklistRows[3].id, ["Kühlschrank Grundreinigung dokumentiert", "Lagerinventur durchgeführt", "QM-Unterlagen kontrolliert", "Feuerlöscher Sichtprüfung dokumentiert"], 60), ...items(checklistRows[4].id, ["Behandlungszimmer kontrolliert", "Terminbuch geprüft", "Wartezimmer ordentlich"], 80), ...items(checklistRows[5].id, ["Behandlungszimmer kontrolliert", "Terminbuch geprüft", "Wartezimmer ordentlich"], 90), ...eveningItems(checklistRows[6].id, 100), ...eveningItems(checklistRows[7].id, 120)]);
  await db.from("checklist_occurrences").upsert(checklistRows.map((row, index) => ({ id: `50000000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`, checklist_id: row.id, occurrence_date: new Date().toISOString().slice(0, 10), location_id: row.location_id, status: "open", due_at: dueAt(row.due_time) })));
}

async function employee(id: string, first_name: string, last_name: string, display_name: string, location_id: string, function_title: string, role: "employee" | "location_lead" | "admin", pin: string, works_across_locations = false) {
  return { id, first_name, last_name, display_name, location_id, function_title, role, works_across_locations, pin_hash: await bcrypt.hash(pin, 12), active: true };
}
function task(id: string, title: string, area: string, location_id: string, assigned_employee_id: string, due_time: string, proof_type: string, value_unit: string | null = null, interval_type = "daily", due_weekday: number | null = null) {
  return { id, title, description: `${title} sauber dokumentieren und bei Auffälligkeiten kommentieren.`, area, location_id, assigned_employee_id, interval_type, due_time, due_weekday, proof_type, photo_required: proof_type === "photo", comment_required: proof_type === "text", value_required: proof_type === "number", value_unit, active: true };
}
function checklist(id: string, name: string, location_id: string, interval_type: string, due_time: string, due_weekday: number | null = null, due_day_of_month: number | null = null) { return { id, name, location_id, interval_type, due_time, due_weekday, due_day_of_month, active: true }; }
function items(checklist_id: string, titles: string[], offset: number, proof_type = "none") { return titles.map((title, index) => ({ id: `60000000-0000-0000-0000-${String(offset + index).padStart(12, "0")}`, checklist_id, title, sort_order: index + 1, proof_type, required: true, photo_required: proof_type === "photo", active: true })); }
function eveningItems(checklist_id: string, offset: number) {
  return items(checklist_id, ["Zimmer 1: Gespült (Spüllösung)", "Zimmer 1: Schränkchen/Schubladen aufgefüllt", "Zimmer 1: Siebe gesäubert", "Zimmer 2: Gespült (Spüllösung)", "Zimmer 2: Schränkchen/Schubladen aufgefüllt", "Zimmer 2: Siebe gesäubert", "Zimmer 3: Gespült (Spüllösung)", "Zimmer 3: Schränkchen/Schubladen aufgefüllt", "Zimmer 3: Siebe gesäubert", "Zimmer 4: Gespült (Spüllösung)", "Zimmer 4: Schränkchen/Schubladen aufgefüllt", "Zimmer 4: Siebe gesäubert"], offset, "photo");
}
function dueAt(time: string | null) { if (!time) return null; const date = new Date(); const [hours, minutes] = time.split(":").map(Number); date.setHours(hours || 0, minutes || 0, 0, 0); return date.toISOString(); }

main().then(() => console.log(`ORISUS Seed-Daten für ${INSTANCE_NAME} wurden eingespielt.`)).catch((error) => { console.error(error); process.exit(1); });
