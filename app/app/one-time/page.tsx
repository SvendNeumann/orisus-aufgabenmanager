import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, Page } from "@/components/ui";
import { getEmployees, requireUser } from "@/lib/orisus";

function isLocationLead(user: { function_title?: string | null }) {
  return String(user.function_title || "").toLowerCase().includes("standortleitung");
}

export default async function LocationLeadOneTimeTaskPage() {
  const user = await requireUser("employee");
  if (!isLocationLead(user)) redirect("/app");

  const employees = (await getEmployees()).filter((employee) => employee.location_id === user.location_id && employee.id !== user.id);

  return <Page title="Einmalige Aufgabe vergeben" subtitle={`Standort: ${user.location_name}. Nur einmalige Aufgaben für dein Team.`}>
    <Card>
      <form action="/api/tasks/one-time/create" method="post" className="space-y-3">
        <input type="hidden" name="return_to" value="/app/one-time" />
        <input name="title" placeholder="Was soll erledigt werden?" required className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring" />
        <input name="area" placeholder="Bereich oder Position, z. B. Anmeldung, Steri, ZFA" className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring" />
        <select name="assigned_employee_id" required className="h-12 w-full rounded-xl border border-slate-200 px-3 focus-ring">
          <option value="">Teammitglied auswählen</option>
          {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.display_name} · {employee.function_title}</option>)}
        </select>
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="due_date" type="date" className="h-12 rounded-xl border border-slate-200 px-3 focus-ring" />
          <input name="due_time" placeholder="Uhrzeit" className="h-12 rounded-xl border border-slate-200 px-3 focus-ring" />
          <select name="proof_type" defaultValue="none" className="h-12 rounded-xl border border-slate-200 px-3 focus-ring">
            <option value="none">Kein Nachweis</option>
            <option value="text">Kommentar</option>
            <option value="photo">Foto</option>
            <option value="number">Zahl</option>
          </select>
        </div>
        <button className="min-h-12 rounded-xl bg-navy px-5 text-sm font-semibold text-white">Aufgabe vergeben</button>
      </form>
      <p className="mt-3 text-xs text-slate-500">Diese Aufgabe erscheint genau einmal bei der ausgewählten Person in der To-do-Liste und wird nicht für Folgetage erzeugt.</p>
    </Card>
    <div className="mt-4"><Link href="/app/more" className="text-sm font-semibold text-navy">Zurück</Link></div>
  </Page>;
}
