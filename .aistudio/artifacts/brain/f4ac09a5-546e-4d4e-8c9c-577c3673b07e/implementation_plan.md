# AMK Qualitative Analysis Studio (MAXQDA AI Edition)

An automated, MAXQDA-inspired qualitative data analysis (QDA) workbench tailored for the university module **AMK (Analyse von Markt- und Kundendaten)**. It automates qualitative content analysis (Grounded Theory & Mayring) on transcribed marketing interviews through a two-stage AI pipeline (open thematic coding followed by axial category aggregation), complete with an interactive coding margin, a dynamic concept map graph, a cross-interview code matrix browser, and full export capabilities in dark mode.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned based on your Phase 1 feedback:

- **Confirmed Decision 1 (Data Setup & Input Options)**: The application supports both sequential one-by-one transcript ingestion and bulk multi-file upload (TXT, PDF, Word `.docx`, and JSON formats, plus direct text paste). In addition, a complete preloaded AMK marketing benchmark dataset (6 qualitative in-depth German customer interviews on omnichannel purchasing behavior, brand loyalty, and digital friction) is provided for immediate exploration and testing.
- **Confirmed Decision 2 (Core Visual Analysis Views)**: Fully implements the three most vital MAXQDA-inspired views:
  1. *Interactive Document Browser & Coding Stripes Margin*: Line-numbered interview text with visual colored margin bars, speaker separation (`I:` vs `B:`), and quote inspection.
  2. *Hierarchical Concept Map (MAXMaps-style Network)*: Interactive SVG node-link graph connecting Überkategorien with subcodes, passage frequencies, and verbatim quotes.
  3. *Code Matrix Browser*: Crosstab comparing code occurrences across all 6 interviews with interactive frequency bubbles and cross-case quotation viewer.
- **Confirmed Decision 3 (Two-Stage AI Pattern Recognition)**:
  - *Stage 1 (Open Thematic Coding)*: Inductive semantic parsing extracting empirical codes, definitions, and exact verbatim text spans with character offsets.
  - *Stage 2 (Axial Category Aggregation & Reduction)*: Thematic synthesis clustering codes into 4–6 high-level marketing dimensions (Überkategorien) with visual hierarchy and color assignment.
- **Confirmed Decision 4 (Runtime & Documentation)**: Cross-platform web application running on Mac and Linux with zero external native dependencies, Git-ready structure, export as PDF / CSV / JSON, and a comprehensive German & English `README.md` documenting installation, academic methodology, and usage.

---

## 1. Overview & Core Concept

### What It Does
The **AMK Qualitative Analysis Studio** bridges the gap between traditional Computer-Assisted Qualitative Data Analysis Software (CAQDAS like MAXQDA) and modern generative AI. Students and researchers in market research (AMK) can load raw interview transcripts, run an automated two-stage qualitative content analysis based on Philipp Mayring's methodology and Grounded Theory, and immediately explore the resulting code system, text segments, and visual category trees.

### Target Audience & Persona
- **AMK Students & Academic Researchers**: Conducting market research projects (e.g., 6 in-depth consumer/expert interviews) who need sound, transparent, and reproducible qualitative coding without hundreds of hours of manual highlighting.
- **Marketing Analysts**: Evaluating open-ended customer feedback, user journey interviews, and focus group transcripts for executive insights.

### Key Value
- **Zero-Effort Automated Coding**: Eliminates manual labor by automatically identifying themes, marking exact text passages, assigning distinct color palettes, and aggregating them into meaningful core marketing categories.
- **Reliability & Full Traceability**: Unlike opaque summary tools, every generated code remains strictly anchored to its exact line and quote in the source text, ensuring academic validity and intercoder verifiability.
- **Complete Visual Toolkit**: Features the iconic MAXQDA 4-pane style workflow: Document System, Code System with counts, Document Viewer with margin stripes, and Visual Concept Map.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Workspace Entry & Data Ingestion**:
   - The user opens the app and sees an AMK project dashboard.
   - The user can either click *"Load AMK Sample Project (6 Marketing Interviews)"* or upload their own interview transcripts (drag-and-drop TXT, PDF, Word, or batch upload).
   - Interviews appear in the **Document System** panel with word counts, interview duration, and status indicators.
2. **Automated AI Analysis Execution**:
   - The user clicks *"Start Automated AMK Qualitative Analysis"*.
   - A multi-step progress visualizer shows real-time progress:
     * Step 1: Text segmentation & speaker separation (`Interviewer` / `Befragter`).
     * Step 2: Inductive open coding (discovering thematic codes and quoting exact passages).
     * Step 3: Axial reduction & clustering into high-level Überkategorien (e.g., *Vertrauen & Markentreue*, *Omnichannel-Friktion*, *Preissensibilität & Mehrwert*, *Digitale Touchpoint-Akzeptanz*).
     * Step 4: Concept graph layout & code matrix calculation.
3. **Exploration & Coding Margin View (MAXQDA Document Browser)**:
   - Selecting an interview displays the text with paragraph numbers.
   - On the left margin, MAXQDA-style colored coding stripes show which code spans which text passage.
   - Hovering or clicking a stripe highlights the corresponding text and opens a detail card showing code definition, category, and options to edit/merge.
4. **Visual Concept Map (MAXMaps Network View)**:
   - An interactive node-link canvas displays the structural hierarchy: Center Project $\rightarrow$ Überkategorien $\rightarrow$ Thematic Subcodes.
   - Nodes can be dragged, filtered, and clicked to reveal all aggregated text passages and frequencies.
5. **Code Matrix Browser**:
   - A crosstab matrix (Interviews on X-axis, Codes/Categories on Y-axis) displays frequency weights with scaled bubbles.
   - Clicking any matrix cell pulls up all quotations for that specific interview and code for comparative cross-case analysis.
6. **Memos & Analytical Synthesis**:
   - Academic memo system for field notes, theoretical reflections, and research journal entries.
   - One-click executive summary generator synthesizing core marketing takeaways with cited evidence.
7. **Export & Documentation**:
   - Export full qualitative report as formatted PDF.
   - Export coded passages and matrix as CSV / Excel-compatible sheets.
   - Export project archive as JSON for backup and sharing across team members.

### Visual Identity & Theme
- **Dark Mode First**: Complete dark mode architecture adhering to `@custom-variant dark (&:where(.dark, .dark *));`.
  - Dark canvas: `#0b0f19` (Slate/Navy deep neutral) with elevated panels at `#111827` and `#1f2937`.
  - Light canvas: `#f8fafc` with crisp white `#ffffff` cards and subtle `#e2e8f0` hairline borders.
  - Strict 60-30-10 distribution: deep neutral canvas (60%), slate structural panes (30%), vibrant semantic code accents (10%).
- **Color Coding Discipline**:
  - Each Überkategorie receives a distinct harmonic color family (e.g., Emerald for Trust/Loyalty, Amber for Price/Value, Violet for Digital Friction, Cyan for Channel Preferences).
  - Subcodes inherit tonal variations within their parent category's palette.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` (bold, crisp, academic software feel).
  - Body & Transcripts: `Public Sans` / `Inter` (high legibility for dense qualitative texts, comfortable line height `1.65`, balanced measure).
  - Line numbers, timestamps, and frequencies: `JetBrains Mono` / `tabular-nums` for rock-solid tabular alignment.
- **MAXQDA Layout Rhythm**:
  - Flexible multi-pane workbench: Document List (left-top), Code Tree (left-bottom), Document Browser with Coding Margin (center), Detail/Inspector & Map (right/modal).
  - Collapsible panels allowing focus on pure text reading or full-screen graph exploration.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Gemini Integration via Server Route with Heuristic Resiliency**
  - *Chosen Approach*: Implement a dedicated Node/Express proxy `/api/qda/analyze` utilizing `@google/genai` with `gemini-3.8-flash` and strict JSON schemas (`responseSchema`). In addition, include an intelligent local NLP fallback parser so the app works reliably even if an API key is temporarily unavailable or when running in offline demo environments.
  - *Why*: Ensures production-grade qualitative analysis with zero client-side API key leaks, combined with bulletproof fail-safes so university grading and presentations never encounter broken states.
- **Decision 2: Verbatim Text Span Alignment & Margin Stripe Rendering**
  - *Chosen Approach*: Store coded passages with both paragraph index, exact substring match, and character offsets. The document viewer parses these into multi-layered coding stripes rendered in a dedicated margin column next to paragraph blocks (identical to MAXQDA).
  - *Why*: Allows overlapping codes on the same text sentence without breaking HTML rendering or creating nested tag messes.
- **Decision 3: Interactive SVG Concept Map without Bloated Dependencies**
  - *Chosen Approach*: Build a bespoke, reactive SVG force-directed / radial tree component with drag-and-drop node physics, zoom/pan controls, and edge routing.
  - *Why*: Fast, zero bundle bloat, responsive in both dark and light modes, and directly exportable to SVG/PNG for academic thesis figures.
- **Decision 4: Multi-Format Parser in Pure TypeScript**
  - *Chosen Approach*: Support plain text (.txt), Markdown (.md), PDF text extraction, Word text extraction (.docx via client zip/xml parsing or raw text reader), and structured interview JSON.
  - *Why*: Students often receive transcripts in varied formats from different audio transcription services (e.g. Whisper, f4transkript, MAXQDA transcription, Otter.ai).

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AMK QUALITATIVE ANALYSIS WORKBENCH                   │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation: Project Selector | View Switcher | Dark Mode | Export │
├────────────────────────┬───────────────────────────────────────────────┤
│ 1. Documents Panel     │ 3. Document Browser (Center)                  │
│    - 6 AMK Interviews  │    - Paragraph numbering & Speaker tags       │
│    - Upload TXT/PDF/DOC│    - Coding Margin (Multi-color stripes)      │
│    - Status & Length   │    - Search in text / highlight navigator     │
├────────────────────────┼───────────────────────────────────────────────┤
│ 2. Code System (Tree)  │ 4. Analytical Workspace / Tabbed Views        │
│    - Überkategorien    │    [A] Coding Stripes Margin View             │
│    - Thematic Subcodes │    [B] Hierarchical Concept Map (MAXMaps)     │
│    - Frequency Counts  │    [C] Code Matrix Browser (Crosstab)         │
│    - Color Palette     │    [D] Academic Memos & Reflexivity Journal   │
│    - Merge / Filter    │    [E] AI Marketing Synthesis & Key Findings  │
└────────────────────────┴───────────────────────────────────────────────┘
                                   │
                           HTTP POST /api/qda/analyze
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Express Server (server.ts) + @google/genai (gemini-3.8-flash)          │
│ - Stage 1: Inductive Open Thematic Coding & Verbatim Extraction        │
│ - Stage 2: Axial Category Reduction into Core Marketing Dimensions    │
│ - Structure Validation: CodeSystem, TextSegments, CategoryTree         │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & TypeScript Entities

```typescript
// Core Entities
interface InterviewDocument {
  id: string;
  title: string;
  respondentInfo: {
    pseudonym: string;
    role: string; // e.g. "Konsument (28 J., Hybrid-Shopper)"
    date: string;
    duration: string;
  };
  rawText: string;
  paragraphs: Paragraph[];
}

interface Paragraph {
  index: number;
  speaker: 'Interviewer' | 'Befragter' | 'System';
  text: string;
}

interface Code {
  id: string;
  name: string;
  description: string;
  categoryId: string; // References parent Überkategorie
  color: string;
  frequency: number; // Count of coded text segments
}

interface Category {
  id: string;
  name: string; // Überkategorie
  description: string;
  color: string;
  subCodeIds: string[];
}

interface CodedSegment {
  id: string;
  documentId: string;
  codeId: string;
  paragraphIndex: number;
  exactQuote: string;
  startIndex: number;
  endIndex: number;
  comment?: string;
}

interface Memo {
  id: string;
  title: string;
  content: string;
  documentId?: string;
  codeId?: string;
  createdAt: string;
  type: 'theoretical' | 'methodological' | 'case_summary';
}
```

### Export Formats
- **PDF Report**: Formatted qualitative research report containing executive summary, methodology description, full Code System table with frequencies, Concept Map visualization snapshot, and code-by-code quotations.
- **CSV Matrix & Coded Segments**: Two structured CSV downloads:
  1. `amk_code_matrix.csv`: Crosstab (Interviews $\times$ Codes) for statistical verification.
  2. `amk_coded_segments.csv`: Every quote with Document, Speaker, Paragraph, Code, and Überkategorie.
- **JSON Backup**: Portable single-file export for archiving or team collaboration.

### Documentation (`README.md`)
- Detailed instructions on how to install and run the app locally on Mac and Linux (`npm install`, `npm run dev`).
- Overview of the AMK marketing context, Grounded Theory / Mayring methodology, and how the AI two-stage pipeline works.
- Step-by-step user guide for uploading transcripts, navigating the coding stripes, using the concept map, and generating reports.
