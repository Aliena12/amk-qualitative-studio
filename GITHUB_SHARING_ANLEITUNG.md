# Anleitung: GitHub-Veröffentlichung mit beschränktem Zugriff & Weitergabe an Kommilitonen

> **Ziel:** Die App in ein eigenes GitHub-Repository hochladen, **ohne** einer KI oder einem Tool Zugriff auf deinen gesamten GitHub-Account zu gewähren, und das Projekt einfach für dein AMK-Team bereitzustellen.

---

## 1. Wichtig: Wie schützt du deinen GitHub-Account?

Du hast völlig recht, vorsichtig zu sein: Man sollte externen Tools niemals pauschalen Zugriff auf alle privaten Repositories geben. Du hast hierfür **drei sehr einfache und sichere Wege**:

---

### Weg A (Empfohlen & am sichersten): Manueller Git-Push via Terminal
*Hierbei gibst du der KI oder AI Studio **überhaupt keinen Zugriff** auf deinen GitHub-Account!*

1. **Neues leeres Repository auf GitHub anlegen**:
   - Gehe auf [github.com/new](https://github.com/new).
   - Gib dem Repo einen Namen (z. B. `amk-qualitative-studio`).
   - Wähle **Public** (öffentlich) oder **Private** (nur für dich und dein Team).
   - **Wichtig:** Setze **keinen** Haken bei „Add a README file“ (da wir bereits eine vollständige README haben).
   - Klicke auf **Create repository**.

2. **Code auf deinen Rechner holen**:
   - Entweder lädst du das Projekt über den AI Studio Download-Button als ZIP auf deinen Rechner und entpackst es.

3. **In deinem Terminal (Mac / Linux / Windows Terminal)**:
   ```bash
   # In den Projektordner wechseln
   cd pfad/zu/deinem/amk-qualitative-studio

   # Git initialisieren
   git init

   # Alle Dateien hinzufügen (.gitignore schützt sensible Daten automatisch)
   git add .

   # Ersten Commit erstellen
   git commit -m "Initial commit: AMK Qualitative Analysis Studio (MAXQDA AI Edition)"

   # Haupt-Branch auf 'main' setzen
   git branch -M main

   # Dein GitHub-Repository als Ziel verknüpfen (ersetze DEIN-BENUTZERNAME):
   git remote add origin https://github.com/DEIN-BENUTZERNAME/amk-qualitative-studio.git

   # Hochladen
   git push -u origin main
   ```
*Ergebnis:* Dein Code liegt auf GitHub, und kein AI-Dienst hat Zugangsdaten zu deinem Account.

---

### Weg B: GitHub-Freigabe auf genau EIN Repository beschränken
Wenn du ein GitHub-Tool oder AI Studio direkt autorisierst:

1. Klicke im Autorisierungsfenster von GitHub **nicht** einfach auf „Authorize“.
2. Scrolle zu **Repository access**.
3. Wähle:
   ```
   ○ All repositories
   ● Only select repositories  <-- DIESE OPTION WÄHLEN!
   ```
4. Wähle im Dropdown-Menü **ausschließlich** dein Repo `amk-qualitative-studio` aus.
5. Klicke erst dann auf „Install & Authorize“.
*Ergebnis:* Selbst wenn das Tool Zugriff hat, sieht und erreicht es ausschließlich dieses eine ausgewählte Repository. Alle deine anderen Repositories und privaten Daten bleiben unsichtbar.

---

### Weg C: Fine-Grained Personal Access Token (Feingranularer Token)
Falls du Git-Befehle über einen Token autorisieren willst:
1. Klicke auf GitHub oben rechts auf dein Profilbild ➔ **Settings**.
2. Scrolle ganz unten links auf **Developer Settings** ➔ **Personal access tokens** ➔ **Fine-grained tokens**.
3. Klicke auf **Generate new token**.
4. Wähle unter **Repository access**: `Only select repositories` ➔ wähle `amk-qualitative-studio`.
5. Unter **Permissions** ➔ **Repository permissions** ➔ wähle bei `Contents` nur `Access: Read and write`.
6. Token generieren und kopieren. Dieser Token funktioniert ausschließlich für dieses einzige Repo.

---

## 2. Wie du das Repo für deine Kommilitonen freigibst

### Option 1: Wenn das Repo `Private` (privat) ist
Damit nur deine Kommilitonen Zugriff haben und niemand sonst aus dem Internet:
1. Öffne dein Repository auf GitHub.
2. Gehe auf den Reiter **Settings** (oben im Menü des Repos).
3. Klicke links auf **Collaborators** (Mitarbeiter).
4. Klicke auf den grünen Button **Add people**.
5. Gib die GitHub-Benutzernamen oder E-Mail-Adressen deiner Kommilitonen ein und klicke auf Einladen.
6. Sobald sie die E-Mail-Einladung bestätigen, können sie das Projekt klonen und mitarbeiten.

### Option 2: Wenn das Repo `Public` (öffentlich) ist
- Schicke ihnen einfach den Link zu deinem GitHub-Repo (z. B. `https://github.com/DEIN-BENUTZERNAME/amk-qualitative-studio`). Jeder mit dem Link kann es sofort klonen.

---

## 3. Kurzanleitung für deine Kommilitonen: Wie sie die App starten

Du kannst deinen Kommilitonen einfach diesen kurzen Text kopieren:

```markdown
Hallo zusammen,

hier ist unsere qualitative QDA-App (MAXQDA AI Edition) für das Modul AMK:
Repository: https://github.com/DEIN-BENUTZERNAME/amk-qualitative-studio

### Schnellstart in 3 Schritten (macOS, Linux oder Windows):

1. Repository klonen:
   git clone https://github.com/DEIN-BENUTZERNAME/amk-qualitative-studio.git
   cd amk-qualitative-studio

2. Abhängigkeiten installieren:
   npm install

3. App lokal starten:
   npm run dev

➔ Öffne danach im Browser: http://localhost:3000

Hinweise zum Datenschutz:
- Die App läuft zu 100% lokal auf eurem Rechner.
- Die Transkripte (S1 bis S6) werden an KEINE Cloud gesendet (DSGVO-konform).
- Ihr benötigt keinen API-Key und keinen Login.
- Ergebnisse können direkt als Word (.docx), PDF oder CSV exportiert werden.
```

---

## 4. Alternative für Kommilitonen ohne Terminal-Erfahrung

Falls jemand in deiner Gruppe Node.js oder das Terminal nicht installieren möchte:
1. **Gemeinsamer Datenexport**:
   - Du führst die Auswertung bei dir lokal aus.
   - Klicke oben rechts auf **Export** ➔ **Microsoft Word Dokument (.docx)** oder **PDF**.
   - Du teilst einfach die fertige Word-Datei mit den Tabellen, Zitaten und Kernaussagen.
2. **Projekt-Austausch via JSON**:
   - Unter **Export** ➔ **AMK Projektarchiv (JSON)** kannst du den aktuellen Codierungsstand exportieren und deinen Kommilitonen schicken.
