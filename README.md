# AMK Interviewauswertung – Zusammenhalt an der Fakultät

Lokales Tool zur Auswertung qualitativer Interviews (React + Express). Läuft nur auf deinem Rechner, es werden keine Daten an externe Dienste gesendet.

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

## Daten
- Maßgeblich: `data/projekt.json`. Backups in `data/backups/` (bei jedem Serverstart und alle ~10 Minuten bei Änderungen).
- `data/` enthält vertrauliche Transkripte und ist in `.gitignore`. Nicht committen oder weitergeben.
- Umzug auf einen anderen Rechner: Ordner `data/` mitkopieren.
