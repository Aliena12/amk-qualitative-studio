# AMK Qualitative Analysis Studio (MAXQDA AI Edition)

> **Automatisiertes CAQDAS-Workbench-Tool für das Hochschulmodul AMK (Analyse von Markt- und Kundendaten)**  
> **100% Lokale Ausführung (Zero-Cloud)** · DSGVO-konform · macOS & Linux · Dark Mode · Word (.docx), PDF & CSV Export

Dieses Repository enthält das **AMK Qualitative Analysis Studio**, eine moderne Web-Anwendung zur computergestützten qualitativen Datenanalyse (CAQDAS), inspiriert von Branchenstandards wie **MAXQDA**, erweitert um **vollautomatische zweistufige KI-Mustererkennung** und **strikten lokalen Datenschutz**.

Das Tool wurde speziell für die qualitative Auswertung von Tiefeninterviews im Marketing-Kontext konzipiert (z. B. 6 anonymisierte Konsumenteninterviews $S1$ bis $S6$ zu Omnichannel-Customer-Journeys, Markenloyalität und Medienbrüchen).

---

## Inhaltsverzeichnis
1. [Datenschutz & 100% Lokale Ausführung (Zero-Cloud)](#1-datenschutz--100-lokale-ausführung-zero-cloud)
2. [Wissenschaftlicher & Methodischer Hintergrund](#2-wissenschaftlicher--methodischer-hintergrund)
3. [Die Kernarbeitsbereiche (MAXQDA-Referenz)](#3-die-kernarbeitsbereiche-maxqda-referenz)
4. [Die zweistufige automatisierte KI-Analysepipeline](#4-die-zweistufige-automatisierte-ki-analysepipeline)
5. [Installation & Start (macOS & Linux)](#5-installation--start-macos--linux)
6. [Nutzung mit lokalem LLM (Ollama)](#6-nutzung-mit-lokalem-llm-ollama)
7. [Bedienungsanleitung & Workflow](#7-bedienungsanleitung--workflow)
8. [Export-Funktionen & Datenschnittstellen](#8-export-funktionen--datenschnittstellen)
9. [Vergleich mit klassischem MAXQDA](#9-vergleich-mit-klassischem-maxqda)

---

## 1. Datenschutz & 100% Lokale Ausführung (Zero-Cloud)

### Warum Zero-Cloud?
Interviewtranskripte enthalten hochsensible Aussagen von Probanden. Selbst mit Anonymisierung ($S1$–$S6$) dürfen Primärdaten im Rahmen von Hochschul- und Unternehmensprojekten oft **nicht an externe Cloud-Server oder US-amerikanische KI-APIs übertragen werden** (DSGVO- und Compliance-Vorgaben).

### 3 wählbare Engine-Modi:

1. **100% Lokale semantische Engine (Standard & Empfohlen)**:
   - Die gesamte Inhaltsanalyse, Segmentierung, Verbatim-Zitat-Extraktion und Matrixberechnung läuft **ausschließlich lokal auf deinem Rechner** (in Node.js / Browser).
   - **Kein Byte verlässt deinen Computer.**
   - Funktioniert komplett ohne Internetverbindung (im Flugmodus oder Offline-Netzwerken).
   - Kein API-Key und keine Registrierung erforderlich.

2. **Lokales Open-Source-LLM (via Ollama auf `localhost:11434`)**:
   - Für noch tiefere Freitext-Paraphrasierung kannst du lokale Open-Source-Modelle wie **Llama 3**, **Mistral** oder **DeepSeek** nutzen.
   - Die Inferenz erfolgt zu 100% auf deiner lokalen Hardware (z. B. Apple Silicon M1–M4 Unified Memory oder Linux mit NVIDIA-GPU).
   - Verbindet sich über die native lokale REST-Schnittstelle von Ollama.

3. **Cloud-KI (Google Gemini API - Optional)**:
   - Nur für synthetische Testdaten ohne Vertraulichkeitsauflagen gedacht, falls explizit in den Datenschutz-Einstellungen aktiviert.

---

## 2. Wissenschaftlicher & Methodischer Hintergrund

In der qualitativen Marktforschung (Modul AMK) scheitern empirische Auswertungen häufig am immensen manuellen Zeitaufwand der Textcodierung:
- **Klassisches Vorgehen**: Forscher lesen hunderte Seiten Transkripte und markieren händisch Textstellen mit Markern oder CAQDAS-Tools.
- **AMK Qualitative Studio Lösung**: Das Tool führt die Auswertung methodisch fundiert nach der **Qualitativen Inhaltsanalyse nach Philipp Mayring (2015)** und den Kodierparadigmen der **Grounded Theory (Glaser & Strauss)** automatisiert durch:
  1. **Induktives offenes Codieren**: Erkennung von empirischen Einzelcodes und Verbatim-Zitaten direkt am Textmaterial.
  2. **Axiale Kategorienbildung**: Reduktion und Abstraktion auf 4 übergeordnete analytische Marketing-Dimensionen (**Überkategorien**).
  3. **Verankerung & Reliabilität**: Jedes Zitat behält seine exakte Paragraphen- und Zeichenposition, wodurch die wissenschaftliche Nachvollziehbarkeit für Prüfer gewährleistet ist.
  4. **Volle manuelle Kontrollierbarkeit**: Alle automatischen Codierungen können nachträglich editiert, gelöscht, neu zugeordnet oder manuell ergänzt werden.

---

## 3. Die Kernarbeitsbereiche (MAXQDA-Referenz)

Das Interface orientiert sich an der bewährten Multi-Pane-Architektur professioneller QDA-Software im **modernen Deep-Zinc Dark-Mode** (`#09090b`):

| Bereich | Funktion & MAXQDA-Äquivalent |
| :--- | :--- |
| **Dokumentsystem** | Minimalistische Verwaltung der 6 Interview-Transkripte ($S1$–$S6$) mit Metadaten (Code, Studienrichtung, Interviewdauer, Segmentzähler). Ein- und ausklappbare Seitenleiste. Einzel- und Batch-Upload. |
| **Codesystem** | Hierarchischer Baum aus 4 Überkategorien und 16 Subcodes mit Farbindikatoren, Suchleiste, Häufigkeitszählern (`tabular-nums`) und Modals zur Erstellung, Umbenennung und Neuzuordnung. |
| **Dokumenten-Browser & Codierleiste** | Paragraphennummerierte Textanzeige (`P01`, `P02`), Sprechertrennung (`I:` vs. `B:`), **leuchtende Zitat-Hervorhebungen** und die **originalgetreue Codierleiste (Margin Stripes)** am Rand mit Legende und klickbaren Zitat-Popovers. Unterstützt freies Markieren mit Schnell-Codierung. |
| **Sentiment-Verlauf** | Interaktive Verlaufskurve der emotionalen Kundenreise (+1.0 bis -1.0) von der Inspiration über die Kaufentscheidung bis zu Frustrationen und Markentreue mit KPIs und Hover-Karten. |
| **Konzept-Map (MAXMaps)** | Interaktiver SVG-Netzwerkgraph, der die Beziehungen zwischen Projektkern, Überkategorien und Subcodes visualisiert. Knoten sind per Drag & Drop verschiebbar und skalieren mit der Zitat-Häufigkeit. Klick öffnet Zitat-Inspektor. |
| **Code-Matrix-Browser** | Kreuztabelle aller Probanden ($S1$–$S6$) gegenüber allen Codes mit dimensionierten Kreisen und sprechenden Spaltenüberschriften (kein `$\sum$`). Klick auf eine Zelle öffnet das **Segment-Retrieval**. |
| **Forschungs-Memos & Audit** | Dokumentation von theoretischen Hypothesen, methodischen Entscheidungen und Fallzusammenfassungen nach Mayring. |
| **Ergebnisbericht (Synthese)** | Wissenschaftliche Gesamtzusammenfassung mit Management-Takeaways und Belegzitaten. |

---

## 4. Die zweistufige automatisierte KI-Analysepipeline

```
[Interview-Transkripte S1–S6]
         │
         ▼
[Stufe 1: Induktives offenes Codieren (Lokal / Zero-Cloud)]
 ├── Extraktion thematischer Einzelcodes (z.B. "Click & Collect Wartezeiten")
 └── Exaktes Matching von Verbatim-Zitaten mit Paragraphen-Offsets
         │
         ▼
[Stufe 2: Axiales Codieren & Überkategorien-Reduktion]
 ├── Bündelung in 4 Hauptdimensionen:
 │     1. Digitale Touchpoints & Social Commerce (Emerald)
 │     2. Stationäres Einkaufserlebnis & Haptik (Blau)
 │     3. Medienbrüche & Kanal-Friktion (Amber)
 │     4. Vertrauen, Datenschutz & Markentreue (Violett)
 └── Automatische Zuweisung harmonischer Farbpaletten
         │
         ▼
[Berechnung Code-Matrix & Sentiment-Verlauf & Konzept-Map-Layout]
```

---

## 5. Installation & Start (macOS & Linux)

### Voraussetzungen
- **Node.js** (Version 18 oder höher, Node.js 20+ empfohlen)
- **npm** (wird automatisch mit Node.js installiert)
- **Git**

### Schritt 1: Repository klonen
```bash
git clone https://github.com/dein-account/amk-qualitative-studio.git
cd amk-qualitative-studio
```

### Schritt 2: Abhängigkeiten installieren
```bash
npm install
```

### Schritt 3: Entwicklungsserver starten
```bash
npm run dev
```

Öffne deinen Browser unter: **`http://localhost:3000`**

*Es ist kein API-Key erforderlich! Die App startet standardmäßig im 100% lokalen Zero-Cloud-Modus.*

---

## 6. Nutzung mit lokalem LLM (Ollama)

Falls du zusätzlich zur integrierten semantischen Engine ein echtes Open-Source Large Language Model lokal ausführen möchtest:

1. **Ollama installieren**:
   - macOS: `brew install ollama` oder Download von [ollama.com](https://ollama.com)
   - Linux: `curl -fsSL https://ollama.com/install.sh | sh`

2. **Modell starten (im Terminal)**:
   ```bash
   ollama run llama3
   # Alternativ: ollama run mistral oder ollama run deepseek-r1:8b
   ```

3. **In AMK Qualitative Studio aktivieren**:
   - Klicke im Header auf das grüne Schild-Icon **"100% Lokal (Zero-Cloud)"**.
   - Wähle **"Lokales Open-Source-LLM (via Ollama)"**.
   - Gib dein Modell ein (z. B. `llama3`).
   - Die App verbindet sich über `localhost:11434` direkt mit deinem lokalen Modell. Auch hier verlässt kein einziges Datum deinen Rechner!

---

## 7. Bedienungsanleitung & Workflow

### 1. Datenbasis erkunden
- Beim ersten Start ist bereits ein vollständiger AMK-Benchmark-Datensatz geladen: **6 anonymisierte Tiefeninterviews** ($S1$–$S6$) aus dem Fachbereich Wirtschaftswissenschaften / Marketing.
- Klicke links im **Dokumentsystem** auf ein Interview ($S1$ bis $S6$), um das Transkript im zentralen Browser zu lesen.

### 2. Codierleiste & Zitate nutzen
- Links neben dem Text siehst du die **farbigen Codierstreifen** und am rechten Rand die Code-Legende.
- Markierte Zitate leuchten farblich im Text hervor.
- Klicke auf eine Markierung: Ein Popover erlaubt es, den Code zu wechseln, Notizen einzusehen oder das Segment zu löschen.
- **Manuelles Codieren**: Markiere eine beliebige Textstelle mit dem Cursor. Es erscheint ein Schnellauswahl-Menü, um sofort einen bestehenden oder neuen Code zuzuweisen.

### 3. KI-Analyse ausführen
- Klicke oben rechts auf den vollständig sichtbaren Button **`KI-Analyse starten`**.
- Ein modales Fortschrittsfenster visualisiert die 4 Analyseschritte (Segmentierung, Induktion, Reduktion, Matrixberechnung).

### 4. Sentiment-Verlauf analysieren (Tab "Sentiment-Verlauf")
- Visualisiert die Customer Journey des ausgewählten Probanden als emotionale Fieberkurve (+1.0 bis -1.0).
- Zeigt exakt, an welchen Phasen Begeisterung (z. B. Social-Media-Inspiration) oder Enttäuschung (z. B. Wartezeiten bei Click & Collect) auftraten.

### 5. Konzept-Map & Cross-Case-Vergleich
- **Konzept-Map**: Zeigt den interaktiven Wissensgraphen. Knoten können per Maus frei arrangiert werden; ein Klick öffnet alle Belegzitate.
- **Code-Matrix-Browser**: Stellt $S1$–$S6$ tabellarisch gegenüber mit quantitativer Bubble-Größe und Segment-Retrieval per Mausklick.

---

## 8. Export-Funktionen & Datenschnittstellen

Über den **`Export`**-Button stehen 5 professionelle Formate zur Verfügung:
1. **Microsoft Word Dokument (.docx / .doc)**: Vollständig formatiertes Forschungsdokument inklusive Deckblatt, Dokumentübersicht, hierarchischem Kategoriensystem, Mayring-Synthese und Zitatentabelle.
2. **Wissenschaftlicher PDF-Bericht**: Druckfertiger Mayring-Report. Über `Cmd+P` (Mac) bzw. `Ctrl+P` (Linux) kann der Bericht mit optimierten `@media print`-Stylesheets als Vektor-PDF gespeichert werden.
3. **Codierte Textstellen (CSV / Excel)**: Semikolon-getrennt mit UTF-8 BOM für Excel. Enthält Segment-ID, Proband ($S1$–$S6$), Absatznummer, Überkategorie, Code, Verbatim-Zitat und Anmerkungen.
4. **Code-Matrix Kreuztabelle (CSV)**: Direkter Import für SPSS, R oder Excel-Pivot.
5. **AMK Projektarchiv (JSON)**: Vollständiges Backup aller Transkripte, Codierungen, Memos und Synthesen zum Teilen im Team.

---

## 9. Vergleich mit klassischem MAXQDA

| Feature | Klassisches MAXQDA | AMK Qualitative Studio |
| :--- | :--- | :--- |
| **Lizenzmodell** | Teure Einzelplatzlizenz / Dongle | Open Source & 100% kostenlos |
| **Plattformen** | Mac / Windows Software-Install | Überall lauffähig (macOS, Linux, Browser) |
| **Datenschutz** | Lokal auf Rechner | **100% Lokal (Zero-Cloud)** oder lokales Ollama |
| **Codierung** | Ausschließlich manuell per Hand | **Vollautomatische 2-Stufen-Mustererkennung** + manuelle Nachbearbeitung |
| **Sentiment-Analyse** | Nur teures Zusatzmodul | **Vollständig integrierte Sentiment-Kurve** |
| **Ergebnis-Synthese** | Muss händisch verfasst werden | **Automatischer Mayring-Bericht mit Zitaten** |
| **Word (.docx) Export**| Eingeschränkt | **Vollständiger strukturierter Word-Export** |

---

## Lizenz & Autor
Entwickelt für das Hochschulmodul **AMK (Analyse von Markt- und Kundendaten)**.  
Lizenziert unter der Apache-2.0 License.
