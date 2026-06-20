# ORISUS Aufgabenmanager

Mobile-first MVP für interne Aufgaben, Checklisten, Nachweise und Vertretungen der **Zahnmedizin Westpfalz MVZ**.

Diese App-Instanz ist ausschließlich für die drei Standorte der Zahnmedizin Westpfalz MVZ gedacht:

- Ulmet
- Landstuhl
- Lauterecken

Die App ist ein Testsystem mit Dummy-Daten. Es dürfen keine echten Patientendaten verwendet werden.

## Instanzmodell

Diese App ist keine gruppenweite Multi-Tenant-Plattform.

Für jedes MVZ wird später eine eigene, vollständig getrennte Instanz betrieben. Jede Instanz hat eine eigene Datenbank, eigene Benutzer, eigene Aufgaben, eigene Checklisten, eigene Nachweise und eine eigene Historie.

Die gemeinsame Grundlage ist nur die Softwarebasis, nicht die Daten. Es gibt in dieser Version keine zentrale Mandantenverwaltung, keine gemeinsame Datenbank für mehrere MVZ, keinen Gruppenadmin und keine technische Trennung über `tenant_id` oder `mvz_id`.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Datenbank
- Supabase Storage für Foto-Nachweise
- Eigene PIN-Authentifizierung ohne Supabase Auth
- Sichere Cookie-Session mit gehashtem Session-Token
- Lucide Icons
- Inter

## Lokales Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Supabase Projekt anlegen

1. Neues Supabase-Projekt erstellen.
2. `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` aus den API-Einstellungen kopieren.
3. `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig in `.env` und Vercel hinterlegen.
4. Einen langen zufälligen Wert für `SESSION_SECRET` setzen.

## SQL Migration ausführen

Den Inhalt von `supabase/migration.sql` im Supabase SQL Editor ausführen.

Die Migration erstellt Tabellen für Standorte, Mitarbeiter, Sessions, Aufgaben, Aufgaben-Vorkommen, Checklisten, Checklistenpunkte, Erledigungen, Vertretungen, Zeitraumvertretungen und Audit-Log.

## Storage Bucket

Die Migration legt den Bucket `task-proofs` an. Falls das im Projekt nicht erlaubt ist, lege ihn manuell an:

- Name: `task-proofs`
- Verwendung: Foto-Nachweise
- MVP-Einstellung: public URL für einfache Vorschau

Für Produktivbetrieb sollte der Bucket privat sein und über signierte URLs ausgeliefert werden.

## Environment Variablen

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Seed-Daten einspielen

```bash
npm run seed
```

Das Seed-Script legt nur die drei Standorte Ulmet, Landstuhl und Lauterecken aktiv an. Standorte außerhalb dieser Instanz werden deaktiviert.

Dummy-PINs:

- Svend Neumann: `111111`
- Jennifer Meirich: `222222`
- Anika Lützelberger: `333333`
- Jenny Beispiel: `444444`
- Dr. Hangx: `555555`
- Max Mustermann: `666666`

Die PINs werden durch das Seed-Script gehasht gespeichert.

## App starten

```bash
npm run dev
```

Ohne Supabase-Konfiguration läuft die App mit lokalen Demo-Daten. Schreibaktionen werden dann nur simuliert. Mit Supabase-Konfiguration werden Sessions, PIN-Login, Aufgaben, Checklisten, Mitarbeiterverwaltung, Vertretungen und PIN-Reset gegen die Datenbank ausgeführt.

## Deployment auf Vercel

1. Repository mit Vercel verbinden.
2. Framework Preset: Next.js.
3. Environment Variablen aus `.env.example` in Vercel eintragen.
4. Build Command: `npm run build`.
5. Supabase Migration ausführen.
6. Seed-Daten einspielen.

## Produktivsetzung

Vor Produktivbetrieb empfohlen:

- Supabase RLS-Policies detailliert ausarbeiten.
- Storage Bucket privat machen und signierte URLs nutzen.
- Audit-Log konsequent in allen Admin-Aktionen schreiben.
- Session-Laufzeiten und Sperrregeln fachlich abnehmen.
- Admin-Formulare für vollständige CRUD-Prozesse erweitern.
- Foto-Komprimierung und Löschfristen definieren.

## Datenschutz

Keine Patienten, keine Bildschirme mit Patientendaten und keine sensiblen personenbezogenen Inhalte fotografieren. Der ORISUS Aufgabenmanager dient ausschließlich der internen Aufgaben- und Checklisten-Dokumentation.
