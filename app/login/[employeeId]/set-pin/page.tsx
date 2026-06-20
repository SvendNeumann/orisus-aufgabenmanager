import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Card, Page } from "@/components/ui";
import { getEmployees, isDemoEmployeeId, locationLabelForEmployee } from "@/lib/orisus";

export default async function SetPinPage({ params, searchParams }: { params: { employeeId: string }; searchParams: { error?: string } }) {
  const employee = (await getEmployees()).find((item) => item.id === params.employeeId);
  if (!employee) redirect("/login");
  if (isDemoEmployeeId(employee.id) || employee.pin_hash) redirect(`/login/${employee.id}`);

  return <Page title="PIN festlegen" subtitle={`${employee.display_name} · ${locationLabelForEmployee(employee)}`}><Card className="mx-auto max-w-md">{searchParams.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">Bitte gib zweimal dieselbe 6-stellige PIN ein.</p> : null}<KeyRound className="mb-4 h-8 w-8 text-navy" /><p className="mb-4 text-sm leading-6 text-slate-600">Für deinen ersten Login legst du jetzt selbst deine persönliche PIN fest. Der Admin kann diese PIN nicht sehen.</p><form action="/api/auth/set-pin" method="post" className="space-y-4"><input type="hidden" name="employee_id" value={employee.id} /><label className="block"><span className="text-sm font-semibold">Neue 6-stellige PIN</span><input name="pin" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} required className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-4 text-center text-2xl tracking-[0.4em] focus-ring" /></label><label className="block"><span className="text-sm font-semibold">PIN wiederholen</span><input name="pin_confirm" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} required className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-4 text-center text-2xl tracking-[0.4em] focus-ring" /></label><button className="min-h-12 w-full rounded-xl bg-navy px-5 text-sm font-semibold text-white">PIN speichern und einloggen</button></form></Card></Page>;
}
