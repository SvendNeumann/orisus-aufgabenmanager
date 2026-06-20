import Link from "next/link";
import { Camera, Check, ClipboardCheck, History, Home, ListChecks, Menu } from "lucide-react";
import { Badge, Card, Page, Stat } from "@/components/ui";
import { checklistItems, checklistsFor, dateLabel, delegations, employees, requireUser, tasksFor } from "@/lib/orisus";

export default async function EmployeeWorkspace({ params }: { params: { slug?: string[] } }) {
  const user = await requireUser("employee");
  const slug = params.slug || [];
  const section = slug[0] || "dashboard";
  const tasks = tasksFor(user);
  const checks = checklistsFor(user);
  const open = tasks.filter((t) => t.status !== "completed").length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const overdue = tasks.filter((t) => t.status === "overdue").length;
  return <Page title={sectionTitle(section, user.first_name)} subtitle={`Standort: ${user.location_name}`}><div className="pb-24"><EmployeeNav />{section === "dashboard" && <><div className="grid gap-3 sm:grid-cols-3"><Stat label="Offen" value={open} tone="orange" /><Stat label="Erledigt" value={done} tone="green" /><Stat label="Überfällig" value={overdue} tone="red" /></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><TaskList tasks={tasks.slice(0, 6)} /><ChecklistList checks={checks} /></div></>}{section === "tasks" && slug[1] ? <TaskDetail id={slug[1]} tasks={tasks} userId={user.id} /> : null}{section === "tasks" && !slug[1] ? <TaskList tasks={tasks} full /> : null}{section === "checklists" && slug[1] ? <ChecklistDetail id={slug[1]} /> : null}{section === "checklists" && !slug[1] ? <ChecklistList checks={checks} full /> : null}{section === "history" ? <HistoryView tasks={tasks} /> : null}{section === "delegations" ? <DelegationsView userId={user.id} /> : null}{section === "faq" ? <FaqView /> : null}{section === "more" ? <MoreView user={user.display_name} /> : null}</div><BottomNav /></Page>;
}

function sectionTitle(section: string, name: string) {
  return ({ dashboard: `Hallo ${name}`, tasks: "Persönliche Aufgaben", checklists: "Standort-Checklisten", history: "Meine Historie", delegations: "Vertretungen", faq: "Hilfe & FAQ", more: "Mehr" } as Record<string, string>)[section] || "ORISUS";
}

function TaskList({ tasks, full = false }: { tasks: any[]; full?: boolean }) {
  return <Card><h2 className="text-lg font-bold text-navy">{full ? "Aufgaben" : "Meine nächsten Aufgaben"}</h2><div className="mt-4 space-y-3">{tasks.map((task) => <Link key={task.id} href={`/app/tasks/${task.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-canvas"><div><p className="font-semibold">{task.title}</p><p className="text-sm text-slate-500">{task.area} · {task.interval_type} · fällig {task.due_time}</p></div><Badge status={task.status} /></Link>)}</div></Card>;
}

function TaskDetail({ id, tasks, userId }: { id: string; tasks: any[]; userId: string }) {
  const task = tasks.find((item) => item.id === id) || tasks[0];
  const targets = employees.filter((employee) => employee.id !== userId && employee.location_id === task.location_id);
  return <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"><Card><div className="mb-4 flex justify-between"><Badge status={task.status} /><span className="text-sm text-slate-500">{task.interval_type}</span></div><p className="text-slate-700">{task.description}</p><p className="mt-4 text-sm font-semibold text-navy">Nachweis: {task.proof_type}</p><form action={`/api/tasks/${task.id}/complete`} method="post" encType="multipart/form-data" className="mt-5 space-y-4">{task.proof_type === "text" ? <textarea name="comment" required className="min-h-28 w-full rounded-xl border border-slate-200 p-3 focus-ring" placeholder="Kommentar" /> : null}{task.proof_type === "number" ? <input name="value_number" required inputMode="decimal" className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring" placeholder={`Wert ${task.value_unit || ""}`} /> : null}{task.proof_type === "photo" ? <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white"><Camera className="h-5 w-5" />Foto aufnehmen<input name="photo" type="file" accept="image/*" capture="environment" className="sr-only" required /></label> : null}<button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-success px-5 text-sm font-semibold text-white sm:w-auto"><Check className="h-5 w-5" />Als erledigt markieren</button></form></Card><Card><h2 className="text-lg font-bold text-navy">Vertretung anfragen</h2><p className="mt-1 text-sm text-slate-500">Die Aufgabe wird erst übertragen, wenn die Vertretung aktiv annimmt.</p><form action={`/api/tasks/${task.id}/delegate`} method="post" className="mt-4 space-y-3"><select name="requested_to_employee_id" required className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring"><option value="">Vertretung auswählen</option>{targets.map((employee) => <option key={employee.id} value={employee.id}>{employee.display_name}</option>)}</select><textarea name="comment" placeholder="Optionaler Kommentar" className="min-h-24 w-full rounded-xl border border-slate-200 p-3 focus-ring" /><button className="min-h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-navy">Vertretung anfragen</button></form></Card></div>;
}

function ChecklistList({ checks, full = false }: { checks: any[]; full?: boolean }) {
  return <Card><h2 className="text-lg font-bold text-navy">{full ? "Checklisten" : "Standort-Checklisten"}</h2><div className="mt-4 space-y-3">{checks.map((check) => <Link key={check.id} href={`/app/checklists/${check.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-canvas"><div><p className="font-semibold">{check.name}</p><p className="text-sm text-slate-500">{check.interval_type} · fällig {check.due_time}</p></div><Badge status={check.status} /></Link>)}</div></Card>;
}

function ChecklistDetail({ id }: { id: string }) {
  const check = checklistsFor({ role: "admin" } as any).find((item) => item.id === id) || checklistsFor({ role: "admin" } as any)[0];
  const items = checklistItems.filter((item) => item.checklist_id === check.id);
  return <Card><div className="mb-5 flex justify-between"><Badge status={check.status} /><span className="text-sm font-semibold text-navy">0/{items.length} erledigt</span></div><div className="space-y-3">{items.map((item) => <form key={item.id} action={`/api/checklists/${check.id}/items/${item.id}/complete`} method="post" className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><p className="font-semibold">{item.title}</p><button className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white"><Check className="h-5 w-5" /></button></form>)}</div><form action={`/api/checklists/${check.id}/complete`} method="post" className="mt-5"><button className="min-h-12 w-full rounded-xl bg-success px-5 text-sm font-semibold text-white">Checkliste abschließen</button></form></Card>;
}

function HistoryView({ tasks }: { tasks: any[] }) {
  return <div className="space-y-3">{tasks.filter((task) => task.status === "completed").map((task) => <Card key={task.id}><p className="font-bold text-navy">{task.title}</p><p className="text-sm text-slate-500">{dateLabel(task.completed_at)} · {task.proof_type}</p>{task.comment ? <p className="mt-2 text-sm">{task.comment}</p> : null}</Card>)}</div>;
}

function DelegationsView({ userId }: { userId: string }) {
  return <div className="space-y-3">{delegations.filter((item) => item.to === userId || item.from === userId).map((item) => <Card key={item.id}><div className="flex justify-between"><div><p className="font-bold text-navy">Vertretungsanfrage</p><p className="text-sm text-slate-500">{item.comment}</p></div><Badge status={item.status} /></div><div className="mt-4 flex gap-2"><form action={`/api/delegations/${item.id}/respond`} method="post"><input type="hidden" name="status" value="accepted" /><button className="min-h-10 rounded-xl bg-success px-4 text-sm font-semibold text-white">Annehmen</button></form><form action={`/api/delegations/${item.id}/respond`} method="post"><input type="hidden" name="status" value="rejected" /><button className="min-h-10 rounded-xl bg-red-50 px-4 text-sm font-semibold text-danger">Ablehnen</button></form></div></Card>)}</div>;
}

function FaqView() {
  const faq = [["Warum nutzen wir den Orisus Aufgabenmanager?", "Er hilft uns, wichtige Aufgaben strukturiert und nachweisbar zu dokumentieren."], ["Wie melde ich mich an?", "Wähle deinen Namen aus und gib deine persönliche 6-stellige PIN ein."], ["Wie mache ich ein Foto?", "Tippe auf Foto aufnehmen. Die Kamera öffnet sich direkt, ohne Galerie-Upload im UI."], ["Was ist eine Vertretung?", "Eine Aufgabe wird erst übertragen, wenn die angefragte Person aktiv annimmt."]];
  return <div className="grid gap-3 lg:grid-cols-2">{faq.map(([q, a]) => <Card key={q}><p className="font-bold text-navy">{q}</p><p className="mt-2 text-sm leading-6 text-slate-600">{a}</p></Card>)}</div>;
}

function MoreView({ user }: { user: string }) {
  return <Card><p className="mb-3 font-bold text-navy">{user}</p>{[["Profil", "/app/more"], ["Vertretungen", "/app/delegations"], ["Historie", "/app/history"], ["Hilfe & FAQ", "/app/faq"]].map(([label, href]) => <Link key={label} href={href} className="block border-t border-slate-100 py-4 font-semibold text-navy">{label}</Link>)}<form action="/api/auth/logout" method="post"><button className="border-t border-slate-100 py-4 font-semibold text-danger">Abmelden</button></form></Card>;
}

function EmployeeNav() {
  return <div className="mb-5 hidden gap-2 overflow-x-auto rounded-xl bg-white p-2 shadow-card sm:flex">{[["/app", "Übersicht"], ["/app/tasks", "Aufgaben"], ["/app/checklists", "Checklisten"], ["/app/history", "Historie"], ["/app/more", "Mehr"]].map(([href, label]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-navy hover:bg-canvas">{label}</Link>)}</div>;
}

function BottomNav() {
  const links = [["/app", "Übersicht", Home], ["/app/tasks", "Aufgaben", ClipboardCheck], ["/app/checklists", "Checklisten", ListChecks], ["/app/history", "Historie", History], ["/app/more", "Mehr", Menu]] as const;
  return <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-2 py-2 sm:hidden"><div className="grid grid-cols-5 gap-1">{links.map(([href, label, Icon]) => <Link key={href} href={href} className="flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium text-slate-600"><Icon className="h-5 w-5 text-navy" />{label}</Link>)}</div></nav>;
}
