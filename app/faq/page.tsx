import { ButtonLink, Card, Page } from "@/components/ui";
import { INSTANCE_LOCATIONS, INSTANCE_NAME } from "@/lib/instance";

const locationLabel = INSTANCE_LOCATIONS.join(", ");

const sections = [
  {
    title: "Kurz erklärt",
    items: [
      ["Wofür ist die App gedacht?", `Der ORISUS Aufgabenmanager hilft dem Team der ${INSTANCE_NAME}, wiederkehrende Praxisaufgaben an den Standorten ${locationLabel} zuverlässig zu erledigen. Dazu gehören tägliche Aufgaben, Wochenaufgaben, Monatsaufgaben und Standort-Checklisten.`],
      ["Was ist das Ziel?", "Wichtige Abläufe sollen klar sichtbar sein, pünktlich erledigt werden und später nachvollziehbar bleiben. Die App ersetzt lose Zettel, mündliche Zurufe und unklare Zuständigkeiten durch eine einfache digitale Übersicht."],
      ["Ist das schon ein Produktivsystem?", "Nein. Diese Version ist zunächst ein MVP/Testsystem. Sie dient dazu, Abläufe, Bedienung, Aufgabenstruktur und Zuständigkeiten zu testen, bevor echte Produktivdaten genutzt werden."]
    ]
  },
  {
    title: "Anmelden",
    items: [
      ["Wie melde ich mich an?", "Tippe auf der Startseite auf App starten. Wähle anschließend deinen Namen aus der Mitarbeiterliste aus und gib deine persönliche 6-stellige PIN ein."],
      ["Brauche ich eine E-Mail-Adresse?", "Nein. Für diese App ist keine E-Mail-Adresse notwendig. Es gibt auch keine Registrierung und keine Passwort-Vergessen-Mail."],
      ["Was ist meine PIN?", "Für das Testsystem gibt es Dummy-PINs. Im späteren Betrieb erhält jede Person eine eigene PIN. Die PIN wird nicht im Klartext gespeichert, sondern nur als Hash."],
      ["Was passiert bei falscher PIN?", "Wenn eine PIN falsch eingegeben wird, erscheint eine Fehlermeldung. Nach mehreren falschen Versuchen kann der Zugang temporär gesperrt werden, damit niemand durch Ausprobieren Zugriff erhält."],
      ["Was mache ich, wenn ich meine PIN vergessen habe?", "Bitte wende dich an eine zuständige Admin-Person. Admins können eine PIN zurücksetzen, sehen die bisherige PIN aber nicht im Klartext."]
    ]
  },
  {
    title: "Aufgaben erledigen",
    items: [
      ["Was sehe ich nach dem Login?", "Du siehst dein persönliches Dashboard mit offenen, erledigten und überfälligen Aufgaben. Außerdem findest du die Checklisten deines Standorts, deine Historie und Vertretungsanfragen."],
      ["Welche Aufgaben sehe ich?", "Mitarbeiter sehen nur die eigenen persönlichen Aufgaben sowie die Standort-Checklisten des eigenen Standorts. Admins können standortübergreifend alle Aufgaben und Checklisten sehen."],
      ["Wie erledige ich eine Aufgabe?", "Öffne die Aufgabe, lies Beschreibung und Fälligkeit, erfasse den geforderten Nachweis und tippe auf Als erledigt markieren. Die App speichert automatisch Datum, Uhrzeit, Mitarbeiter und Standort."],
      ["Welche Nachweise gibt es?", "Es gibt Aufgaben ohne Nachweis, Aufgaben mit Kommentar, Aufgaben mit Zahlenwert und Aufgaben mit Foto-Nachweis. Die App zeigt dir jeweils nur das an, was für diese Aufgabe benötigt wird."],
      ["Kann ich eine erledigte Aufgabe einfach verschwinden lassen?", "Erledigte Aufgaben sollen in der Historie nachvollziehbar bleiben. Dadurch kann später geprüft werden, wann und von wem eine Aufgabe erledigt wurde."],
      ["Was bedeutet überfällig?", "Eine Aufgabe ist überfällig, wenn sie nach der geplanten Fälligkeit noch offen ist. Überfällige Aufgaben bleiben sichtbar, bis sie erledigt oder administrativ angepasst werden."]
    ]
  },
  {
    title: "Checklisten",
    items: [
      ["Was ist der Unterschied zwischen Aufgaben und Checklisten?", "Persönliche Aufgaben sind einer bestimmten Person zugeordnet. Standort-Checklisten gehören zum Standort und können von aktiven Mitarbeitenden dieses Standorts bearbeitet werden."],
      ["Wie bearbeite ich eine Checkliste?", "Öffne die Checkliste, gehe die Punkte nacheinander durch und hake erledigte Punkte ab. Bei Pflichtpunkten muss der geforderte Nachweis erfasst werden, bevor die Checkliste vollständig abgeschlossen werden soll."],
      ["Wer sieht, wer welchen Punkt erledigt hat?", "Die App speichert pro Checklistenpunkt, wer ihn erledigt hat und wann. Admins können diese Nachweise später einsehen."],
      ["Kann eine Checkliste von mehreren Personen bearbeitet werden?", "Ja. Eine Standort-Checkliste kann im Arbeitsalltag von mehreren Personen bearbeitet werden. Der Zeitstempel zeigt später, wer welchen Punkt erledigt hat."],
      ["Was passiert, wenn nicht alle Punkte erledigt sind?", "Dann gilt die Checkliste noch nicht als vollständig abgeschlossen. Offene oder begonnene Checklisten bleiben sichtbar."]
    ]
  },
  {
    title: "Fotos & Nachweise",
    items: [
      ["Wann muss ich ein Foto machen?", "Nur wenn eine Aufgabe oder ein Checklistenpunkt ausdrücklich einen Foto-Nachweis verlangt. Dann erscheint ein Button Foto aufnehmen."],
      ["Kann ich ein Foto aus der Galerie hochladen?", "Nein. Die App soll im UI nur Foto aufnehmen anbieten. Der Nachweis soll möglichst direkt im Moment der Aufgabe entstehen und nicht aus alten Bildern importiert werden."],
      ["Was darf ich fotografieren?", "Nur den konkreten, unkritischen Nachweis zur Aufgabe, zum Beispiel einen gereinigten Bereich, einen aufgefüllten Schrank oder einen dokumentationsfreien Sachzustand."],
      ["Was darf ich nicht fotografieren?", "Keine Patienten, keine Patientennamen, keine Behandlungsunterlagen, keine Monitore mit Patientendaten, keine Karteikarten, keine sensiblen personenbezogenen Informationen und keine privaten Inhalte."],
      ["Was passiert mit Foto-Nachweisen?", "Foto-Nachweise werden im vorgesehenen Speicherbereich der App abgelegt und mit der jeweiligen Aufgabe, dem Standort, dem Mitarbeiter und einem Zeitstempel verknüpft."],
      ["Wer kann Fotos sehen?", "Mitarbeitende sehen eigene Nachweise im passenden Kontext. Admins können Nachweise standortübergreifend einsehen, damit Aufgaben und Checklisten nachvollziehbar bleiben."],
      ["Was mache ich, wenn versehentlich etwas Sensibles fotografiert wurde?", "Bitte sofort einer zuständigen Admin-Person Bescheid geben. Solche Inhalte müssen geprüft und bei Bedarf gelöscht oder aus dem System entfernt werden."]
    ]
  },
  {
    title: "Datenschutz & Speicherung",
    items: [
      ["Werden Patientendaten gespeichert?", "Nein. Die App ist nicht dafür gedacht, Patientendaten zu erfassen. Es sollen ausschließlich interne Aufgaben, Checklisten, Nachweise und Zeitstempel dokumentiert werden."],
      ["Welche Daten werden gespeichert?", "Gespeichert werden zum Beispiel Mitarbeiter, Standort, Aufgabe oder Checklistenpunkt, Status, Datum, Uhrzeit, Kommentar, Zahlenwert und gegebenenfalls eine Foto-URL."],
      ["Warum wird mein Name gespeichert?", "Damit nachvollziehbar ist, wer eine Aufgabe oder einen Checklistenpunkt erledigt hat. Das ist wichtig für Qualität, Organisation und interne Nachweise."],
      ["Wird meine PIN gespeichert?", "Die PIN wird nicht im Klartext gespeichert. Im echten Betrieb wird nur ein technischer Hash gespeichert. Admins können die PIN zurücksetzen, aber nicht auslesen."],
      ["Wie lange bleiben Daten gespeichert?", "Für das MVP ist noch keine finale Löschfrist festgelegt. Vor Produktivbetrieb sollten Aufbewahrungsfristen, Löschkonzept und Zuständigkeiten verbindlich festgelegt werden."],
      ["Ist die App für private Nachrichten gedacht?", "Nein. Die App ist kein Chat, kein Ticketsystem und kein privater Kommunikationskanal. Bitte nur aufgabenbezogene Informationen eintragen."],
      ["Darf ich sensible Informationen in Kommentare schreiben?", "Nein. Kommentare sollen kurz, sachlich und aufgabenbezogen sein. Keine Patientennamen, Diagnosen, Telefonnummern, privaten Informationen oder sonstige sensiblen Inhalte eintragen."],
      ["Wo werden die Daten gespeichert?", "Die technische Speicherung ist für Supabase vorgesehen. Foto-Nachweise werden im Supabase Storage Bucket der App abgelegt. Für den Produktivbetrieb müssen Projekt, Region, Zugriffsrechte und Datenschutzkonzept final geprüft werden."]
    ]
  },
  {
    title: "Vertretungen",
    items: [
      ["Was ist eine Vertretung?", "Wenn du eine Aufgabe nicht erledigen kannst, kannst du eine andere aktive Person als Vertretung anfragen."],
      ["Wird die Aufgabe sofort übertragen?", "Nein. Die Aufgabe bleibt bei dir, bis die angefragte Person aktiv annimmt. Erst dann wechselt die Verantwortung."],
      ["Was passiert bei Ablehnung?", "Wenn die Vertretung ablehnt, bleibt die Aufgabe bei der ursprünglichen Person. Sie muss dann selbst erledigt oder erneut angefragt werden."],
      ["Sieht der Admin Vertretungen?", "Ja. Admins können Vertretungsanfragen, angenommene Vertretungen und abgelehnte Vertretungen einsehen."],
      ["Wer wird als erledigende Person gespeichert?", "Gespeichert wird die Person, die die Aufgabe tatsächlich erledigt hat. Die ursprüngliche Verantwortung bleibt trotzdem nachvollziehbar."]
    ]
  },
  {
    title: "Rollen & Sichtbarkeit",
    items: [
      ["Was kann ein Mitarbeiter sehen?", "Mitarbeiter sehen die eigenen Aufgaben, Standort-Checklisten des eigenen Standorts, eigene Historie, Vertretungen, FAQ und Menüfunktionen."],
      ["Was kann ein Admin sehen?", "Admins können alle Standorte, Mitarbeiter, Aufgaben, Checklisten, Erledigungen, Nachweise, Fotos und Vertretungen sehen und verwalten."],
      ["Warum sieht ein Admin mehr?", "Admins brauchen die standortübergreifende Übersicht, um offene und überfällige Aufgaben, Nachweise, Mitarbeiterverwaltung und Qualitätssicherung zu steuern."],
      ["Kann ein Mitarbeiter Aufgaben für andere Standorte sehen?", "Nein. Im vorgesehenen Betrieb sehen Mitarbeitende nur Inhalte des eigenen Standorts und eigene persönliche Aufgaben."],
      ["Welche Standorte gehören zu dieser App?", `Diese App ist nur für ${INSTANCE_NAME} mit den Standorten ${locationLabel} gedacht. Andere MVZs erhalten eigene, vollständig getrennte App-Instanzen.`]
    ]
  },
  {
    title: "Gute Nutzung im Alltag",
    items: [
      ["Wann sollte ich Aufgaben erledigen?", "Am besten direkt dann, wenn die Aufgabe im Praxisablauf erledigt wurde. So bleiben Nachweise und Zeitstempel korrekt und nachvollziehbar."],
      ["Was schreibe ich in Kommentare?", "Nur kurze sachliche Hinweise, zum Beispiel Material nachbestellt, Temperatur kontrolliert oder Rücksprache mit Leitung erfolgt. Keine Patientendaten eintragen."],
      ["Was mache ich bei technischen Problemen?", "Bitte der zuständigen Admin-Person melden, was passiert ist, bei welchem Schritt es auftrat und welches Gerät genutzt wurde."],
      ["Was mache ich, wenn eine Aufgabe falsch ist?", "Nicht selbst improvisieren. Bitte an Standortleitung oder Admin melden, damit Aufgabe, Fälligkeit oder Zuständigkeit sauber angepasst werden."],
      ["Muss ich mich abmelden?", "Ja, besonders auf gemeinsam genutzten Geräten. Nutze im Menü die Abmelden-Funktion, damit niemand unter deinem Namen arbeitet."],
      ["Kann ich die App auf dem Handy nutzen?", "Ja. Die App ist mobile-first gestaltet und soll auf dem Smartphone einfach bedienbar sein. Admin-Seiten sind zusätzlich für größere Bildschirme optimiert."]
    ]
  }
];

export default function PublicFaqPage() {
  return <Page title="FAQ & Nutzung" subtitle={`Ausführliche Anleitung für Mitarbeitende der ${INSTANCE_NAME}.`}><div className="mb-5 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/login">App starten</ButtonLink><ButtonLink href="/" secondary>Zur Startseite</ButtonLink></div><div className="space-y-6">{sections.map((section) => <section key={section.title}><h2 className="mb-3 text-xl font-bold text-navy">{section.title}</h2><div className="grid gap-3 lg:grid-cols-2">{section.items.map(([question, answer]) => <Card key={question}><p className="font-bold text-navy">{question}</p><p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p></Card>)}</div></section>)}</div></Page>;
}
