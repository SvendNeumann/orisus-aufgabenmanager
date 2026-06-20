import { ButtonLink, Card, Page } from "@/components/ui";

const faq = [
  ["Wofür ist die App gedacht?", "Die App unterstützt das Team der Zahnmedizin Westpfalz MVZ dabei, tägliche, wöchentliche und monatliche Aufgaben an den Standorten Ulmet, Lauterecken und Landstuhl zuverlässig zu erledigen und nachweisbar zu dokumentieren."],
  ["Wie starte ich die App?", "Tippe auf der Startseite auf App starten, wähle deinen Namen aus und gib deine persönliche 6-stellige PIN ein."],
  ["Brauche ich eine E-Mail-Adresse oder ein Passwort?", "Nein. Für dieses MVP gibt es keine E-Mail-Registrierung und kein klassisches Passwort. Der Login läuft über Mitarbeiter-Auswahl und PIN."],
  ["Was sehe ich nach dem Login?", "Mitarbeiter sehen eigene Aufgaben, Checklisten des eigenen Standorts, Historie, Vertretungen und weitere Hilfeseiten. Admins sehen standortübergreifend alle Aufgaben, Checklisten, Mitarbeiter und Nachweise."],
  ["Wie erledige ich eine Aufgabe?", "Öffne die Aufgabe, erfasse den geforderten Nachweis und tippe auf Als erledigt markieren. Datum, Uhrzeit, Mitarbeiter und Standort werden automatisch gespeichert."],
  ["Wie funktionieren Fotos?", "Bei Foto-Pflicht erscheint nur Foto aufnehmen. Die App ist so gestaltet, dass kein Galerie-Upload im UI angeboten wird. Bitte keine Patienten, keine Bildschirme mit Patientendaten und keine sensiblen Inhalte fotografieren."],
  ["Wie funktionieren Checklisten?", "Öffne eine Standort-Checkliste und hake die Punkte einzeln ab. Eine Checkliste soll erst abgeschlossen werden, wenn alle notwendigen Punkte erledigt sind."],
  ["Was mache ich, wenn ich eine Aufgabe nicht erledigen kann?", "Du kannst eine Vertretung anfragen. Die Aufgabe wird erst übertragen, wenn die angefragte Person aktiv annimmt."],
  ["Welche Standorte sind in dieser App enthalten?", "Diese App ist zunächst nur für Zahnmedizin Westpfalz MVZ mit den Standorten Ulmet, Lauterecken und Landstuhl vorgesehen."],
  ["Ist das schon ein Produktivsystem?", "Nein. Es ist ein MVP/Testsystem mit Dummy-Daten. Vor Produktivbetrieb müssen echte Daten, Rollen, Datenschutzregeln und Supabase-Einstellungen final geprüft werden."]
];

export default function PublicFaqPage() {
  return <Page title="FAQ & Nutzung" subtitle="Kurze Anleitung für Mitarbeitende vor dem Login."><div className="mb-5 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/login">App starten</ButtonLink><ButtonLink href="/" secondary>Zur Startseite</ButtonLink></div><div className="grid gap-3 lg:grid-cols-2">{faq.map(([question, answer]) => <Card key={question}><p className="font-bold text-navy">{question}</p><p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p></Card>)}</div></Page>;
}
