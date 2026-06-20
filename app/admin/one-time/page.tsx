import Link from "next/link";
import { Card, Page } from "@/components/ui";
import { getEmployees, locationLabelForEmployee, requireUser } from "@/lib/orisus";

export default async function AdminOneTimeTaskPage() {
  await requireUser("admin");
  const employees = await getEmployees();

  return <Page title="Einmalige Aufgabe" subtitle="Eine Aufgabe einmalig an ein Teammitglied vergeben. Sie erscheint nur einmal in der To-do-Liste.">
    <Card>
      <form action="/api/tasks/one-time/create" method="post" className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_1fr_0.7fr_0.7fr_0.8fr_auto]">
        <input type="hidden" name="return_to" value="/admin/one-time" />
        <input name="title" placeholder="Aufgabe" required className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" />
        <input name="area" placeholder="Bereich/Position" className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" />
        <select name="assigned_employee_id" required className="h-11 rounded-xl border border-slate-200 px-3 focus-ring">
          <option value="">Mitarbeiter auswählen</option>
          {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.display_name} · {locationLabelForEmployee(employee)} · {employee.function_title}</option>)}
        </select>
        <input name="due_date" type="date" className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" />
        <input name="due_time" placeholder="Uhrzeit" className="h-11 rounded-xl border border-slate-200 px-3 focus-ring" />
        <select name="proof_type" defaultValue="none" className="h-11 rounded-xl border border-slate-200 px-3 focus-ring">
          <option value="none">Kein Nachweis</option>
          <option value="text">Kommentar</option>
          <option value="photo">Foto</option>
          <option value="number">Zahl</option>
        </select>
        <button className="min-h-11 rounded-xl bg-navy px-4 text-sm font-semibold text-white">Vergeben</button>
      </form>
      <p className="mt-3 text-xs text-slate-500">Einmalige Aufgaben werden nicht wiederholt. Nach Erledigung bleiben sie nur in der Historie sichtbar.</p>
    </Card>
    <div className="mt-4"><Link href="/admin/tasks" className="text-sm font-semibold text-navy">Zur Aufgabenverwaltung</Link></div>
  </Page>;
}
