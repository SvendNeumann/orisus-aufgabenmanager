import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Card, Page } from "@/components/ui";
import { getEmployees, isDemoEmployeeId } from "@/lib/orisus";

export default async function PinPage({ params, searchParams }: { params: { employeeId: string }; searchParams: { error?: string } }) {
  const employee = (await getEmployees()).find((item) => item.id === params.employeeId);
  if (!employee) redirect("/login");
  if (!isDemoEmployeeId(employee.id) && !employee.pin_hash) redirect(`/login/${employee.id}/set-pin`);
  return <Page title="PIN eingeben" subtitle={`${employee.display_name} · ${employee.location_name}`}><Card className="mx-auto max-w-md">{searchParams.error ? <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-danger">PIN nicht korrekt oder Zugang temporär gesperrt.</p> : null}<KeyRound className="mb-4 h-8 w-8 text-navy" /><form action="/api/auth/login" method="post" className="space-y-4"><input type="hidden" name="employee_id" value={employee.id} /><label className="block"><span className="text-sm font-semibold">6-stellige PIN</span><input name="pin" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} minLength={6} required className="mt-2 h-14 w-full rounded-xl border border-slate-200 px-4 text-center text-2xl tracking-[0.4em] focus-ring" /></label><button className="min-h-12 w-full rounded-xl bg-navy px-5 text-sm font-semibold text-white">Einloggen</button></form></Card></Page>;
}
