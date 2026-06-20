import Link from "next/link";
import { Badge, Card, Page, Stat } from "@/components/ui";
import { checklists, dateLabel, delegations, employees, getAdminTasks, locations, requireUser, tasks } from "@/lib/orisus";

export default async function AdminWorkspace({ params }: { params: { slug?: string[] } }) {
  await requireUser("admin");
  const section = params.slug?.[0] || "dashboard";
  const id = params.slug?.[1];
  const adminTasks = await getAdminTasks();
  const open = adminTasks.filter((task) => task.status !== "completed").length;
  const done = adminTasks.filter((task) => task.status === "completed").length;
  const overdue = adminTasks.filter((task) => task.status === "overdue").length;
  return <Page title={title(section)} subtitle="Standortübergreifende Kontrolle für ORISUS."><AdminNav />{section === "dashboard" ? <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><Stat label="Standorte" value={locations.length} /><Stat label="Mitarbeiter" value={employees.length} /><Stat label="Offen" value={open} tone="orange" /><Stat label="Erledigt" value={done} tone="green" /><Stat label="Überfällig" value={overdue} tone="red" /><Stat label="Checklisten" value={checklists.length} /></div><LocationCards taskRows={adminTasks} /></> : null}{section === "locations" && id ? <LocationDetail id={id} taskRows={adminTasks} /> : null}{section === "locations" && !id ? <LocationCards taskRows={adminTasks} /> : null}{section === "employees" ? <Employees /> : null}{section === "tasks" ? <Tasks taskRows={adminTasks} /> : null}{section === "checklists" ? <Checklists /> : null}{section === "delegations" ? <Delegations /> : null}{section === "history" ? <History taskRows={adminTasks} /> : null}{section === "settings" ? <Settings /> : null}</Page>;
}

function title(section: string) {
  return ({ dashboard: "Admin-Dashboard", locations: "Standorte", employees: "Mitarbeiterverwaltung", tasks: "Aufgabenverwaltung", checklists: "Checklistenverwaltung", delegations: "Vertretungen", history: "Historie & Nachweise", settings: "Einstellungen" } as Record<string, string>)[section] || "Admin";
}

function AdminNav() {
  const links = [["/admin", "Übersicht"], ["/admin/locations", "Standorte"], ["/admin/employees", "Mitarbeiter"], ["/admin/tasks", "Aufgaben"], ["/admin/checklists", "Checklisten"], ["/admin/delegations", "Vertretungen"], ["/admin/history", "Historie"], ["/admin/settings", "Einstellungen"]];
  return <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-card">{links.map(([href, label]) => <Link key={href} href={href} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-canvas">{label}</Link>)}</div>;
}

function LocationCards({ taskRows }: { taskRows: typeof tasks }) {
  return <div className="mt-6 grid gap-3 lg:grid-cols-2">{locations.map((location) => { const locationTasks = taskRows.filter((task) => task.location_id === location.id); const hasOverdue = locationTasks.some((task) => task.status === "overdue"); const allDone = locationTasks.length > 0 && locationTasks.every((task) => task.status === "completed"); return <Link key={location.id} href={`/admin/locations/${location.id}`}><Card className="flex items-center justify-between"><div><p className="font-bold text-navy">{location.name}</p><p className="text-sm text-slate-500">{locationTasks.length} Aufgaben im Blick</p></div><Badge status={hasOverdue ? "overdue" : allDone ? "completed" : "open"} /></Card></Link>; })}</div>;
}

function LocationDetail({ id, taskRows }: { id: string; taskRows: typeof tasks }) {
  const location = locations.find((item) => item.id === id) || locations[0];
  const people = employees.filter((item) => item.location_id === location.id);
  const locationTasks = taskRows.filter((item) => item.location_id === location.id);
  const locationChecks = checklists.filter((item) => item.location_id === location.id);
  return <div className="grid gap-5 lg:grid-cols-2"><Card><h2 className="text-lg font-bold text-navy">{location.name}</h2><div className="mt-3 space-y-3">{people.map((person) => <div key={person.id} className="rounded-xl border border-slate-100 p-3"><p className="font-semibold">{person.display_name}</p><p className="text-sm text-slate-500">{person.function_title}</p></div>)}</div></Card><Card><h2 className="text-lg font-bold text-navy">Aufgaben & Checklisten</h2><div className="mt-3 space-y-3">{[...locationTasks, ...locationChecks].map((item: any) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><p className="font-semibold">{item.title || item.name}</p><Badge status={item.status} /></div>)}</div></Card></div>;
}

function Employees() {
  return <div className="space-y-3">{employees.map((employee) => <Card key={employee.id}><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-navy">{employee.display_name}</p><p className="text-sm text-slate-500">{employee.location_name} · {employee.function_title} · {employee.role}</p></div><form action={`/api/admin/employees/${employee.id}/pin`} method="post" className="flex gap-2"><input name="pin" placeholder="Neue PIN" pattern="[0-9]{6}" maxLength={6} className="h-11 w-32 rounded-xl border border-slate-200 px-3 focus-ring" /><button className="rounded-xl bg-navy px-4 text-sm font-semibold text-white">PIN setzen</button></form></div></Card>)}</div>;
}

function Tasks({ taskRows }: { taskRows: typeof tasks }) {
  return <><div className="mb-4 grid gap-2 sm:grid-cols-4">{["Standort", "Mitarbeiter", "Bereich", "Status"].map((filter) => <input key={filter} placeholder={filter} className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" />)}</div><div className="space-y-4">{taskRows.map((task) => <Card key={task.id}><div className="mb-4 flex items-center justify-between gap-3"><div><p className="font-bold text-navy">{task.title}</p><p className="text-sm text-slate-500">{task.area} · fällig {task.due_time}</p></div><Badge status={task.status} /></div><form action={`/api/admin/tasks/${task.id}/update`} method="post" className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.6fr_0.7fr_auto]"><input type="hidden" name="task_id" value={task.task_id || task.id} /><input name="title" defaultValue={task.title} className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" aria-label="Aufgabentitel" /><input name="area" defaultValue={task.area} className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" aria-label="Bereich" /><input name="due_time" defaultValue={task.due_time} className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" aria-label="Fälligkeit" /><select name="status" defaultValue={task.status} className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" aria-label="Status"><option value="open">Offen</option><option value="completed">Erledigt</option><option value="overdue">Überfällig</option><option value="delegation_requested">Vertretung angefragt</option><option value="delegated">Vertreten</option><option value="rejected">Abgelehnt</option></select><button className="min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white">Speichern</button></form><form action={`/api/admin/tasks/${task.id}/delete`} method="post" className="mt-3"><input type="hidden" name="task_id" value={task.task_id || task.id} /><button className="min-h-10 rounded-xl bg-red-50 px-4 text-sm font-semibold text-danger">Aufgabe löschen</button></form><p className="mt-3 text-xs text-slate-500">Im Demo-Modus ohne Supabase werden Änderungen nicht dauerhaft gespeichert. Mit Supabase werden Aufgabe und Status in der Datenbank aktualisiert.</p></Card>)}</div></>;
}

function Checklists() {
  return <div className="grid gap-3 lg:grid-cols-2">{checklists.map((check) => <Card key={check.id} className="flex items-center justify-between"><div><p className="font-bold text-navy">{check.name}</p><p className="text-sm text-slate-500">{check.interval_type} · {check.due_time}</p></div><Badge status={check.status} /></Card>)}</div>;
}

function Delegations() {
  return <div className="space-y-3">{delegations.map((item) => <Card key={item.id} className="flex items-center justify-between"><div><p className="font-bold text-navy">Aufgabe {item.task_id}</p><p className="text-sm text-slate-500">{item.comment}</p></div><Badge status={item.status} /></Card>)}</div>;
}

function History({ taskRows }: { taskRows: typeof tasks }) {
  return <><div className="mb-4 grid gap-2 sm:grid-cols-5">{["Standort", "Mitarbeiter", "Datum", "Bereich", "Nachweis"].map((filter) => <input key={filter} placeholder={filter} className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" />)}</div><div className="space-y-3">{taskRows.filter((task) => task.status === "completed").map((task) => <Card key={task.id}><p className="font-bold text-navy">{task.title}</p><p className="text-sm text-slate-500">{dateLabel(task.completed_at)} · {task.proof_type}</p></Card>)}</div></>;
}

function Settings() {
  return <Card><p className="font-bold text-navy">Supabase Storage</p><p className="mt-2 text-sm leading-6 text-slate-600">Lege einen Bucket namens <strong>task-proofs</strong> an. Foto-Nachweise werden ausschließlich über den Kamera-Button in der App erfasst.</p></Card>;
}
