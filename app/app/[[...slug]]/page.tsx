import Link from "next/link";
import { Camera, Check, ClipboardCheck, History, Home, ListChecks, Menu } from "lucide-react";
import { Badge, Card, Page, Stat } from "@/components/ui";
import { dateLabel, requireUser } from "@/lib/orisus";
import { getChecklistDetail, getDelegationTargets, getEmployeeChecklists, getEmployeeDelegations, getEmployeeTasks } from "@/lib/live-data";

export default async function EmployeeWorkspace({ params, searchParams }: { params: { slug?: string[] }; searchParams?: { tab?: string } }) {
  const user = await requireUser("employee");
  const slug = params.slug || [];
  const section = slug[0] || "dashboard";
  const [tasks, checks, delegationRows] = await Promise.all([getEmployeeTasks(user), getEmployeeChecklists(user), getEmployeeDelegations(user)]);
  const open = tasks.filter((task) => task.status !== "completed").length;
  const done = tasks.filter((task) => task.status === "completed").length;
  const overdue = tasks.filter((task) => task.status === "overdue").length;
  const tab = searchParams?.tab || "today";
  return <Page title={sectionTitle(section, user.first_name)} subtitle={`Standort: ${user.location_name}`}><div className="pb-24"><EmployeeNav />{section === "dashboard" && <><div className="grid gap-3 sm:grid-cols-3"><Stat label="Offen" value={open} tone="orange" /><Stat label="Erledigt" value={done} tone="green" /><Stat label="Überfällig" value={overdue} tone="red" /></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><TaskList tasks={tasks.filter((task) => task.status !== "completed").slice(0, 6)} title="Heute offen" empty="Keine offenen Aufgaben" /><ChecklistList checks={checks.filter((check) => check.status !== "completed")} title="Standort-Checklisten heute" empty="Keine Checklisten heute" /></div></>}{section === "tasks" && slug[1] ? <TaskDetail id={slug[1]} tasks={tasks} userId={user.id} userLocationId={user.location_id} /> : null}{section === "tasks" && !slug[1] ? <TaskTabs tasks={tasks} delegations={delegationRows} active={tab} /> : null}{section === "checklists" && slug[1] ? <ChecklistDetail id={slug[1]} user={user} /> : null}{section === "checklists" && !slug[1] ? <ChecklistList checks={checks} title="Standort-Checklisten" empty="Keine Checklisten heute" full /> : null}{section === "history" ? <HistoryView tasks={tasks} /> : null}{section === "delegations" ? <DelegationsView delegations={delegationRows} /> : null}{section === "faq" ? <FaqView /> : null}{section === "more" ? <MoreView user={user.display_name} /> : null}</div><BottomNav /></Page>;
}

function sectionTitle(section: string, name: string) {
  return ({ dashboard: `Hallo ${name}`, tasks: "Meine Aufgaben", checklists: "Standort-Checklisten", history: "Meine Historie", delegations: "Vertretungen", faq: "Hilfe & FAQ", more: "Mehr" } as Record<string, string>)[section] || "ORISUS";
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">{text}</p>;
}

function TaskTabs({ tasks, delegations, active }: { tasks: any[]; delegations: any[]; active: string }) {
  const todayTasks = tasks.filter((task) => !["completed", "overdue"].includes(task.status));
  const overdueTasks = tasks.filter((task) => task.status === "overdue");
  const doneTasks = tasks.filter((task) => task.status === "completed");
  const tabs = [["today", "Heute", todayTasks.length], ["overdue", "Überfällig", overdueTasks.length], ["done", "Erledigt", doneTasks.length], ["delegations", "Vertretung", delegations.length]] as const;
  const currentTasks = active === "overdue" ? overdueTasks : active === "done" ? doneTasks : todayTasks;
  return <div className="space-y-4"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{tabs.map(([id, label, count]) => <Link key={id} href={`/app/tasks?tab=${id}`} className={`rounded-xl border px-3 py-3 text-center text-sm font-semibold ${active === id ? "border-navy bg-navy text-white" : "border-slate-200 bg-white text-navy"}`}>{label}<span className="ml-2 rounded-full bg-white/20 px-2">{count}</span></Link>)}</div>{active === "delegations" ? <DelegationsView delegations={delegations} /> : <TaskList tasks={currentTasks} title={active === "done" ? "Erledigte Aufgaben" : active === "overdue" ? "Überfällige Aufgaben" : "Heute"} empty={active === "done" ? "Keine erledigten Aufgaben" : active === "overdue" ? "Keine überfälligen Aufgaben" : "Keine offenen Aufgaben"} full />}</div>;
}

function TaskList({ tasks, title, empty, full = false }: { tasks: any[]; title: string; empty: string; full?: boolean }) {
  return <Card><h2 className="text-lg font-bold text-navy">{title}</h2><div className="mt-4 space-y-3">{tasks.length === 0 ? <EmptyState text={empty} /> : tasks.map((task) => <Link key={task.id} href={`/app/tasks/${task.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-canvas"><div><p className="font-semibold">{task.title}</p><p className="text-sm text-slate-500">{task.area || "Ohne Bereich"} · {task.interval_type} · fällig {task.due_time || "ohne Uhrzeit"}</p>{full && task.completed_at ? <p className="text-xs text-slate-500">Erledigt: {dateLabel(task.completed_at)}</p> : null}</div><Badge status={task.status} /></Link>)}</div></Card>;
}

async function TaskDetail({ id, tasks, userId, userLocationId }: { id: string; tasks: any[]; userId: string; userLocationId: string }) {
  const task = tasks.find((item) => item.id === id);
  const targets = await getDelegationTargets({ id: userId, location_id: userLocationId } as any);
  if (!task) return <Card><EmptyState text="Aufgabe nicht gefunden" /></Card>;
  return <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"><Card><div className="mb-4 flex justify-between"><Badge status={task.status} /><span className="text-sm text-slate-500">{task.interval_type}</span></div><p className="text-slate-700">{task.description}</p><p className="mt-4 text-sm font-semibold text-navy">Nachweis: {task.proof_type}</p><form action={`/api/tasks/${task.id}/complete`} method="post" encType="multipart/form-data" className="mt-5 space-y-4">{task.proof_type === "text" ? <><p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-danger">Keine Patientennamen, Diagnosen, Telefonnummern oder sensiblen Inhalte eintragen.</p><textarea name="comment" required className="min-h-28 w-full rounded-xl border border-slate-200 p-3 focus-ring" placeholder="Kommentar" /></> : null}{task.proof_type === "number" ? <input name="value_number" required inputMode="decimal" className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring" placeholder={`Wert ${task.value_unit || ""}`} /> : null}{task.proof_type === "photo" ? <><p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-danger">Keine Patienten, keine Bildschirme mit Patientendaten und keine sensiblen Inhalte fotografieren.</p><label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white"><Camera className="h-5 w-5" />Foto aufnehmen<input name="photo" type="file" accept="image/*" capture="environment" className="sr-only" required /></label></> : null}<button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-success px-5 text-sm font-semibold text-white sm:w-auto"><Check className="h-5 w-5" />Als erledigt markieren</button></form></Card><Card><h2 className="text-lg font-bold text-navy">Vertretung anfragen</h2><p className="mt-1 text-sm text-slate-500">Die Aufgabe bleibt bei dir, bis die angefragte Person aktiv annimmt.</p><form action={`/api/tasks/${task.id}/delegate`} method="post" className="mt-4 space-y-3"><select name="requested_to_employee_id" required className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring"><option value="">Vertretung auswählen</option>{targets.map((employee) => <option key={employee.id} value={employee.id}>{employee.display_name}</option>)}</select><textarea name="comment" placeholder="Optionaler Kommentar" className="min-h-24 w-full rounded-xl border border-slate-200 p-3 focus-ring" /><button className="min-h-12 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-navy">Vertretung anfragen</button></form></Card></div>;
}

function ChecklistList({ checks, title, empty, full = false }: { checks: any[]; title: string; empty: string; full?: boolean }) {
  return <Card><h2 className="text-lg font-bold text-navy">{title}</h2><div className="mt-4 space-y-3">{checks.length === 0 ? <EmptyState text={empty} /> : checks.map((check) => <Link key={check.id} href={`/app/checklists/${check.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-canvas"><div><p className="font-semibold">{check.name}</p><p className="text-sm text-slate-500">{check.interval_type} · fällig {check.due_time || "ohne Uhrzeit"}</p><p className="text-xs font-semibold text-navy">{check.completed_count || 0}/{check.total_count || 0} Punkte erledigt</p></div><Badge status={check.status} /></Link>)}</div></Card>;
}

async function ChecklistDetail({ id, user }: { id: string; user: any }) {
  const detail = await getChecklistDetail(id, user);
  if (!detail) return <Card><EmptyState text="Checkliste nicht gefunden" /></Card>;
  const requiredOpen = detail.items.filter((item) => item.required && !item.completed).length;
  return <Card><div className="mb-5 flex justify-between gap-3"><div><h2 className="text-lg font-bold text-navy">{detail.occurrence.name}</h2><p className="text-sm text-slate-500">{detail.occurrence.completed_count}/{detail.occurrence.total_count} Punkte erledigt</p></div><Badge status={detail.occurrence.status} /></div><div className="space-y-3">{detail.items.map((item) => <form key={item.id} action={`/api/checklists/${detail.occurrence.id}/items/${item.id}/complete`} method="post" encType="multipart/form-data" className="rounded-xl border border-slate-100 p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="text-xs text-slate-500">{item.required ? "Pflichtpunkt" : "Optional"} · Nachweis: {item.proof_type}</p>{item.completed ? <p className="text-xs font-semibold text-success">Erledigt {dateLabel(item.completed_at)}</p> : null}</div>{item.completed ? <Badge status="completed" /> : <button className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white" aria-label="Punkt erledigen"><Check className="h-5 w-5" /></button>}</div>{!item.completed && item.proof_type === "text" ? <><p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-danger">Keine Patientendaten oder sensiblen Inhalte eintragen.</p><textarea name="comment" required className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 p-3 focus-ring" placeholder="Kommentar" /></> : null}{!item.completed && item.proof_type === "photo" ? <><p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-danger">Keine Patienten, keine Bildschirme mit Patientendaten und keine sensiblen Inhalte fotografieren.</p><input name="photo" type="file" accept="image/*" capture="environment" required className="mt-3 block w-full text-sm" /></> : null}</form>)}</div><form action={`/api/checklists/${detail.occurrence.id}/complete`} method="post" className="mt-5"><button disabled={requiredOpen > 0} className="min-h-12 w-full rounded-xl bg-success px-5 text-sm font-semibold text-white disabled:bg-slate-300">{requiredOpen > 0 ? `${requiredOpen} Pflichtpunkte offen` : "Checkliste abschließen"}</button></form></Card>;
}

function HistoryView({ tasks }: { tasks: any[] }) {
  const done = tasks.filter((task) => task.status === "completed");
  return <div className="space-y-3">{done.length === 0 ? <Card><EmptyState text="Keine Nachweise vorhanden" /></Card> : done.map((task) => <Card key={task.id}><p className="font-bold text-navy">{task.title}</p><p className="text-sm text-slate-500">{dateLabel(task.completed_at)} · {task.proof_type}</p>{task.comment ? <p className="mt-2 text-sm">{task.comment}</p> : null}{task.photo_url ? <a href={task.photo_url} className="mt-2 inline-block text-sm font-semibold text-navy">Foto ansehen</a> : null}</Card>)}</div>;
}

function DelegationsView({ delegations }: { delegations: any[] }) {
  return <div className="space-y-3">{delegations.length === 0 ? <Card><EmptyState text="Keine Vertretungen" /></Card> : delegations.map((item) => <Card key={item.id}><div className="flex justify-between gap-3"><div><p className="font-bold text-navy">{item.title}</p><p className="text-sm text-slate-500">{item.direction === "received" ? `Anfrage von ${item.other_person}` : `Anfrage an ${item.other_person}`}</p>{item.comment ? <p className="mt-2 text-sm">{item.comment}</p> : null}<p className="mt-2 text-xs text-slate-500">Angefragt: {dateLabel(item.requested_at)}{item.responded_at ? ` · Beantwortet: ${dateLabel(item.responded_at)}` : ""}</p></div><Badge status={item.status} /></div>{item.direction === "received" && item.status === "pending" ? <div className="mt-4 flex gap-2"><form action={`/api/delegations/${item.id}/respond`} method="post"><input type="hidden" name="status" value="accepted" /><button className="min-h-10 rounded-xl bg-success px-4 text-sm font-semibold text-white">Annehmen</button></form><form action={`/api/delegations/${item.id}/respond`} method="post"><input type="hidden" name="status" value="rejected" /><button className="min-h-10 rounded-xl bg-red-50 px-4 text-sm font-semibold text-danger">Ablehnen</button></form></div> : null}</Card>)}</div>;
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
