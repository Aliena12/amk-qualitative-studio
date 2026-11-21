# AMK Interviewauswertung – Zusammenhalt an der Fakultät

Lokales Tool zur Auswertung qualitativer Interviews (React + Express). Läuft nur auf deinem Rechner, es werden keine Daten an externe Dienste gesendet (auch die optionale KI läuft lokal über Ollama).

## Start
```
npm install
npm run dev      # dann http://localhost:3000
```

## Arbeitsweise (passend zur AMK-Kette Interview → Kategorien → Hypothesen → Items)
1. **Import**: Transkript (.txt/.md, z. B. tiroScribe) importieren. Sprecher und Zeitstempel werden erkannt, Rollen lassen sich zuordnen.
2. **Codieren**: Text markieren → Code wählen oder direkt „+ Neuer Code“. Codesystem links: Überkategorien anlegen, Codes definieren, verschieben, zusammenführen.
3. **Hypothesen**: Tab „Hypothesen“, mit Codes verknüpfen (Belege erscheinen automatisch).
4. **Memos & KI-Doku**: methodische Entscheidungen, Fallprofile und die Pflicht-KI-Dokumentation.
5. **Ergebnisbericht**: Vorschau = Inhalt des PDFs. „PDF herunterladen“.

## Kausalmodell: Wirkung und Stärke
- Überkategorien sind entweder **Begebenheit/Einflussfaktor** oder **Zielgröße** (Zugehörigkeit). Einstellbar über den Stift an der Überkategorie.
- Jede codierte Stelle zu einer Begebenheit bekommt eine **Wirkung** (stärkt / schwächt / ambivalent / kein Effekt) und eine **Stärke 1–3** (= Schwere).
- Vorschläge (von KI oder vorbelegt) sind gestrichelt und mit „?“ markiert. Über „zu prüfen“ im Transkript durchgehen und mit „Prüfen & bestätigen“ übernehmen.
- Code-Matrix: Größe nach **Häufigkeit** oder **Schwere**, Farbe nach **Code** oder **Wirkung**.
- Bericht/PDF: Abschnitt 3 „Einflussfaktoren auf die Zugehörigkeit“ (sortiert nach Schwere).

## KI-Codevorschläge (optional, lokal mit Ollama)
1. Ollama installieren (https://ollama.com) und die App starten.
2. Einmalig: `ollama pull llama3`
3. Im Tab „Codieren“ → „KI-Vorschläge“. Das Modell nutzt euer Codesystem samt Definitionen.
4. Vorschläge sind als „KI“ und „zu prüfen“ markiert; jeder Lauf wird automatisch in der KI-Dokumentation festgehalten.

Die Transkripte gehen dabei nur an Ollama auf diesem Rechner. Anderer Ollama-Rechner: Umgebungsvariable `OLLAMA_HOST`.

## Daten
- Maßgeblich: `data/projekt.json`. Backups in `data/backups/` (bei jedem Serverstart und alle ~10 Minuten bei Änderungen).
- `data/` enthält vertrauliche Transkripte und ist in `.gitignore`. Nicht committen oder weitergeben.
- Umzug auf einen anderen Rechner: Ordner `data/` mitkopieren.
