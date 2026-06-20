import { Camera, CheckCircle2, Clock, HelpCircle, MapPinned, ShieldCheck } from "lucide-react";
import { ButtonLink, Card, Page } from "@/components/ui";
import { INSTANCE_LOCATIONS, INSTANCE_NAME } from "@/lib/instance";

export default function HomePage() {
  const locationLabel = INSTANCE_LOCATIONS.join(", ");
  const benefits = [
    [CheckCircle2, "Wichtige Aufgaben werden zuverlässig erledigt"],
    [Clock, "Jede Erledigung wird mit Zeitstempel dokumentiert"],
    [Camera, "Fotos nur direkt aus der App"],
    [MapPinned, `${locationLabel} im Blick`],
    [ShieldCheck, "Einfache Bedienung für alle Mitarbeiter"]
  ] as const;

  return <Page><section className="flex min-h-screen items-center py-8"><div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><div><p className="text-sm font-bold uppercase tracking-wide text-navy/70">ORISUS Aufgabenmanager</p><h1 className="mt-3 text-4xl font-bold leading-tight text-navy sm:text-6xl">{INSTANCE_NAME}</h1><p className="mt-4 text-xl font-semibold">Einfach. Verlässlich. Nachweisbar.</p><p className="mt-4 max-w-xl leading-7 text-slate-600">Tägliche, wöchentliche und monatliche Aufgaben für die Standorte {locationLabel} strukturiert erledigen, dokumentieren und jederzeit nachvollziehen.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/login">App starten</ButtonLink><ButtonLink href="/faq" secondary>FAQ & Nutzung</ButtonLink><ButtonLink href="#mehr" secondary>Mehr erfahren</ButtonLink></div></div><Card><div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-slate-500">Heute</p><p className="text-2xl font-bold text-navy">Standort Ulmet</p><p className="mt-1 text-sm text-slate-500">{INSTANCE_NAME}</p></div><HelpCircle className="h-6 w-6 text-navy" /></div><div className="mt-4 space-y-3">{["Morgencheck", "Kasse kontrollieren", "Kühlschranktemperatur", "Abendcheck"].map((item, index) => <div key={item} className="flex justify-between rounded-xl border border-slate-100 p-3"><span className="font-medium">{item}</span><span className={index === 0 ? "text-success" : index === 3 ? "text-danger" : "text-warning"}>{index === 0 ? "erledigt" : index === 3 ? "überfällig" : "offen"}</span></div>)}</div></Card></div></section><section id="mehr" className="grid gap-3 pb-10 sm:grid-cols-2 lg:grid-cols-5">{benefits.map(([Icon, text]) => <Card key={text}><Icon className="mb-3 h-5 w-5 text-navy" /><p className="text-sm font-semibold leading-5">{text}</p></Card>)}</section></Page>;
}
