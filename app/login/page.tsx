import Link from "next/link";
import { UserRound } from "lucide-react";
import { Card, Page } from "@/components/ui";
import { getEmployees, locationLabelForEmployee } from "@/lib/orisus";

export default async function LoginPage() {
  const employees = await getEmployees();
  return <Page title="Mitarbeiter auswählen" subtitle="Wähle deinen Namen aus und melde dich mit deiner persönlichen 6-stelligen PIN an."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{employees.map((employee) => <Link key={employee.id} href={`/login/${employee.id}`}><Card className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-navy"><UserRound className="h-6 w-6" /></div><div><p className="font-bold">{employee.display_name}</p><p className="text-sm text-slate-500">{locationLabelForEmployee(employee)} · {employee.function_title}</p></div></Card></Link>)}</div></Page>;
}
