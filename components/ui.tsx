import Link from "next/link";
import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { BackButton } from "@/components/back-button";
import { RefreshButton } from "@/components/refresh-button";
import { labelFor } from "@/lib/orisus";

export function Page({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return <main className="min-h-screen bg-canvas px-4 py-5 text-ink sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl">{title ? <><div className="flex flex-wrap gap-2"><BackButton /><RefreshButton /></div><header className="mb-5"><p className="text-xs font-bold uppercase tracking-wide text-navy/70">ORISUS Aufgabenmanager</p><h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">{title}</h1>{subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}</header></> : null}{children}</div></main>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white p-4 shadow-card ${className}`}>{children}</div>;
}

export function ButtonLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold ${secondary ? "border border-slate-200 bg-white text-navy" : "bg-navy text-white"}`}>{children}</Link>;
}

export function Badge({ status }: { status: string }) {
  const tone = status === "completed" || status === "accepted" ? "bg-green-50 text-success" : status === "overdue" || status === "rejected" ? "bg-red-50 text-danger" : "bg-orange-50 text-warning";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{labelFor(status)}</span>;
}

export function Stat({ label, value, tone = "navy" }: { label: string; value: string | number; tone?: "navy" | "green" | "orange" | "red" }) {
  const Icon = tone === "green" ? CheckCircle2 : tone === "red" ? ShieldAlert : Clock3;
  const color = tone === "green" ? "text-success" : tone === "orange" ? "text-warning" : tone === "red" ? "text-danger" : "text-navy";
  return <Card><Icon className={`mb-3 h-5 w-5 ${color}`} /><p className="text-2xl font-bold">{value}</p><p className="text-sm text-slate-500">{label}</p></Card>;
}
