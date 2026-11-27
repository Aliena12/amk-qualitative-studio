# AMK Interviewauswertung – Zusammenhalt an der Fakultät

Lokales Tool zur qualitativen Auswertung der Interviews aus dem AMK-Gruppenprojekt („Zusammenhalt / Zugehörigkeit an der Fakultät IWI“). React + Vite im Browser, kleiner Express-Server zum Speichern. Alles läuft auf dem eigenen Rechner; es werden keine Daten an externe Dienste gesendet (auch die optionale KI läuft lokal über Ollama).

Repository: https://github.com/Aliena12/amk-qualitative-studio

## Einrichten
Voraussetzung: Node.js 22 (mindestens 20.19).

```
git clone https://github.com/Aliena12/amk-qualitative-studio.git
cd amk-qualitative-studio
npm install
npm run dev      # dann http://localhost:3000
```

**Wichtig:** Das Projekt nicht in einem Cloud-Ordner (OneDrive, iCloud, Dropbox) ablegen. Dateien, die erst aus der Cloud nachgeladen werden, führen zu Timeouts beim Start (`ETIMEDOUT`, Vite hängt).

## Daten (nicht im Repository)
- Der Projektstand liegt in `data/projekt.json`: Transkripte, Codesystem, Codierungen, Hypothesen, Memos.
- Backups legt der Server automatisch in `data/backups/` an (bei jedem Start und spätestens alle ~10 Minuten bei Änderungen).
- `data/` enthält vertrauliche Transkripte und ist in `.gitignore` ausgeschlossen. **Nicht committen, nicht hochladen.**
- Weitergabe im Team: `data/projekt.json` direkt austauschen oder im Tool unter „Export & Archiv“ → „Projektarchiv sichern (JSON)“ bzw. „einspielen“.
- Ohne `data/`-Ordner startet das Tool mit einem leeren Projekt.

## Arbeitsweise
Kausalmodell: **Begebenheiten an Hochschule/Fakultät → wirken auf die Zugehörigkeit bzw. Identifikation mit Fakultät und Studiengang.**

1. **Import:** Transkript (.txt/.md, z. B. aus tiroScribe/Whisper) importieren. Sprecher und Zeitstempel werden erkannt, Rollen lassen sich zuordnen.
2. **Codieren:** Text markieren → Code wählen (oder „+ Neuer Code“), optional einen **Kontext-Kommentar** ergänzen. Klick auf eine Markierung: Code ändern, Zitat zuschneiden, Kontext bearbeiten, löschen.
3. **Codesystem** (links): Überkategorien und Codes anlegen, mit Definition versehen, verschieben, zusammenführen. Eine Überkategorie ist entweder *Begebenheit/Einflussfaktor* oder *Zielgröße* (hier: „Zugehörigkeitsverständnis“).
4. **Code-Matrix:** Codes × Interviews; Kreisgröße = **Schwere** (Anzahl der Nennungen). Klick auf eine Zelle zeigt die Zitate.
5. **Hypothesen:** Hypothese, Herleitung, **„Wirkt auf“** und die zugrunde liegenden Codes. Die Anzahl der Belege wird automatisch ermittelt.
6. **Memos & KI-Doku:** methodische Entscheidungen, Fallprofile und die Pflicht-Dokumentation der KI-Nutzung.
7. **Ergebnisbericht:** Die Vorschau ist der Inhalt des PDFs („PDF herunterladen“):
   1. Datengrundlage, 2. Kategorienschema, 3. Einflussfaktoren nach Schwere, 4. Belegstellen (wörtliche Zitate mit Absatz, Zeitstempel und Kontext), 5. Hypothesen, 6. ff. Memos.

**Schwere** = Anzahl der codierten Textstellen (Nennungen) je Code. Es gibt keine Abstufung und keinen Durchschnitt.

## KI-Codevorschläge (optional, lokal mit Ollama)
1. Ollama installieren (https://ollama.com) und die App starten.
2. Einmalig im Terminal: `ollama pull llama3` (bei wenig Arbeitsspeicher: `llama3.2`).
3. Im Tab „Codieren“ ein Interview wählen → **„KI-Vorschläge“**. Das Modell prüft jede Antwort der befragten Person einzeln (mit der Frage davor) gegen das Codesystem samt Definitionen.
4. Vorschläge erscheinen gestrichelt mit „KI ?“ und zählen erst nach **„Prüfen & bestätigen“** als eigene Codierung (Button „zu prüfen“ oben im Transkript).
5. Jeder Lauf wird automatisch als Eintrag in „Memos & KI-Doku“ festgehalten; dort die eigene Prüfung ergänzen.

Die Transkripte gehen dabei nur an Ollama auf diesem Rechner. Ollama auf einem anderen Rechner: Umgebungsvariable `OLLAMA_HOST` setzen.

## Exporte
Unter „Export & Archiv“: Ergebnisbericht (PDF), codierte Textstellen (CSV), Code-Matrix (CSV), Projektarchiv (JSON, enthält die Transkripte – vertraulich).

## Entwicklung
- `npm run dev` – Server mit Vite (Hot Reload) auf http://localhost:3000
- `npm run lint` – TypeScript-Prüfung
- Wichtige Dateien: `server.ts` (Speichern, Backups, Ollama-Anbindung), `src/App.tsx`, `src/components/`, `src/utils/report.ts` + `reportPdf.ts` (Bericht/PDF), `src/utils/ki.ts` (KI-Vorschläge), `src/utils/normalize.ts` (Laden und Migration älterer Projektdateien)
