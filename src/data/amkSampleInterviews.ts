/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Code, CodedSegment, InterviewDocument, Memo, QdaProject } from '../types/qda';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Digitale Touchpoints & Social Commerce',
    description: 'Nutzung digitaler Kanäle zur Inspiration, Informationssuche und mobilen Interaktion.',
    color: '#10b981', // Vivid Emerald
    subCodeIds: ['code-1-1', 'code-1-2', 'code-1-3', 'code-1-4'],
  },
  {
    id: 'cat-2',
    name: 'Stationäres Einkaufserlebnis & Haptik',
    description: 'Physischer Kontakt mit Ware und Personal im Ladengeschäft.',
    color: '#3b82f6', // Vivid Blue
    subCodeIds: ['code-2-1', 'code-2-2', 'code-2-3', 'code-2-4'],
  },
  {
    id: 'cat-3',
    name: 'Medienbrüche & Kanal-Friktion',
    description: 'Hürden und Enttäuschungen beim Wechsel zwischen Online- und Offline-Kanälen.',
    color: '#f59e0b', // Vivid Amber
    subCodeIds: ['code-3-1', 'code-3-2', 'code-3-3', 'code-3-4'],
  },
  {
    id: 'cat-4',
    name: 'Vertrauen, Datenschutz & Markentreue',
    description: 'Bindungsfaktoren, Transparenz bei Kundendaten und Loyalitätsmotive.',
    color: '#a855f7', // Vivid Purple
    subCodeIds: ['code-4-1', 'code-4-2', 'code-4-3', 'code-4-4'],
  },
];

export const INITIAL_CODES: Code[] = [
  // Cat 1: Digitale Touchpoints
  {
    id: 'code-1-1',
    name: 'Social-Media-Inspiration',
    description: 'Entdeckung von Produkten über Instagram, TikTok oder Feeds.',
    categoryId: 'cat-1',
    color: '#059669',
    frequency: 9,
  },
  {
    id: 'code-1-2',
    name: 'App-Usability & Schnelligkeit',
    description: 'Reibungslose Bedienung, intuitive Filter und schneller Checkout.',
    categoryId: 'cat-1',
    color: '#10b981',
    frequency: 7,
  },
  {
    id: 'code-1-3',
    name: 'Personalisierte Produktvorschläge',
    description: 'Wahrnehmung von algorithmischen Empfehlungen und Newslettern.',
    categoryId: 'cat-1',
    color: '#34d399',
    frequency: 6,
  },
  {
    id: 'code-1-4',
    name: 'Online-Bewertungen & Social Proof',
    description: 'Verlässlichkeit von Kundenrezensionen und Sterne-Ratings vor dem Kauf.',
    categoryId: 'cat-1',
    color: '#047857',
    frequency: 11,
  },

  // Cat 2: Stationäres Einkaufserlebnis
  {
    id: 'code-2-1',
    name: 'Haptisches Produkterlebnis',
    description: 'Anfassen, Anprobieren, Fühlen von Materialqualität vor Ort.',
    categoryId: 'cat-2',
    color: '#2563eb',
    frequency: 12,
  },
  {
    id: 'code-2-2',
    name: 'Fachliche Beratungsqualität',
    description: 'Fachkompetenz, Höflichkeit und Empathie des Verkaufspersonals.',
    categoryId: 'cat-2',
    color: '#3b82f6',
    frequency: 8,
  },
  {
    id: 'code-2-3',
    name: 'Atmosphäre & Verweildauer',
    description: 'Ladenbau, Musik, Beleuchtung und Wohlfühlfaktor vor Ort.',
    categoryId: 'cat-2',
    color: '#60a5fa',
    frequency: 5,
  },
  {
    id: 'code-2-4',
    name: 'Sofortige Mitnahme / Verfügbarkeit',
    description: 'Sofortiger Besitz ohne Paketlaufzeit.',
    categoryId: 'cat-2',
    color: '#1d4ed8',
    frequency: 7,
  },

  // Cat 3: Medienbrüche & Kanal-Friktion
  {
    id: 'code-3-1',
    name: 'Click & Collect Wartezeiten',
    description: 'Verzögerungen und personelle Engpässe an der Abholstation.',
    categoryId: 'cat-3',
    color: '#d97706',
    frequency: 8,
  },
  {
    id: 'code-3-2',
    name: 'Preisdiskrepanz (Online vs. Filiale)',
    description: 'Verärgerung über unterschiedliche Preise oder nicht einlösbare App-Gutscheine.',
    categoryId: 'cat-3',
    color: '#f59e0b',
    frequency: 9,
  },
  {
    id: 'code-3-3',
    name: 'Retouren-Aufwand & Verpackung',
    description: 'Mühevolles Paketkleben, Post-Wartezeiten und Verpackungsmüll.',
    categoryId: 'cat-3',
    color: '#b45309',
    frequency: 10,
  },
  {
    id: 'code-3-4',
    name: 'Lagerbestand-Inkonsistenz',
    description: 'Online als vorrätig deklariert, aber in der Filiale nicht auffindbar.',
    categoryId: 'cat-3',
    color: '#f97316',
    frequency: 6,
  },

  // Cat 4: Vertrauen & Markentreue
  {
    id: 'code-4-1',
    name: 'Datenschutz & Transparenz',
    description: 'Skepsis bei Datenerfassung, Cookie-Bannern und Sicherheitsbedenken.',
    categoryId: 'cat-4',
    color: '#9333ea',
    frequency: 7,
  },
  {
    id: 'code-4-2',
    name: 'Preissensibilität & Vergleichsportale',
    description: 'Nutzung von Gutscheincodes, Idealo und Schnäppchenjagd.',
    categoryId: 'cat-4',
    color: '#a855f7',
    frequency: 11,
  },
  {
    id: 'code-4-3',
    name: 'Markentreue durch Kulanz',
    description: 'Bindung durch unbürokratische Erstattung und schnellen Kundenservice.',
    categoryId: 'cat-4',
    color: '#c084fc',
    frequency: 8,
  },
  {
    id: 'code-4-4',
    name: 'Nachhaltigkeits-Authentizität',
    description: 'Forderung nach echten Belegen gegen Greenwashing bei Marken.',
    categoryId: 'cat-4',
    color: '#7e22ce',
    frequency: 5,
  },
];

export const INITIAL_DOCUMENTS: InterviewDocument[] = [
  {
    id: 'doc-1',
    title: 'Interview Transkript S1',
    filename: 'interview_s1.txt',
    createdAt: '2026-11-02T10:15:00Z',
    respondentInfo: {
      code: 'S1',
      fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
      interviewDate: '02.11.2026',
      duration: '42 Min.',
      keyCharacteristic: 'Fokus: Social Commerce & Mobile Fashion',
    },
    rawText: `I: Vielen Dank für die Teilnahme an unserer qualitativen AMK-Erhebung. Beschreiben Sie bitte Ihren typischen Ablauf, wenn Sie nach einem neuen Kleidungsstück suchen.
B: Also bei mir startet fast alles auf dem Smartphone, meistens abends auf dem Sofa. Ich scrolle durch Instagram oder Pinterest, und wenn mir ein Style gefällt, schaue ich direkt in die Verlinkung.
I: Wie wichtig sind Ihnen dabei Bewertungen von anderen Kundinnen und Kunden?
B: Extrem wichtig! Bevor ich überhaupt etwas in den Warenkorb lege, lese ich mindestens fünf bis zehn Rezensionen. Ich filtere immer gezielt nach den 3-Sterne-Bewertungen, weil die meistens die ungeschminkte Wahrheit über Schnitt und Stoffqualität enthalten.
I: Gehen Sie denn auch noch in die Filiale vor Ort?
B: Ehrlich gesagt nur noch selten. Wenn ich in die Stadt gehe, dann um den Stoff anzufassen. Wolle oder Leinen muss ich spüren, das sieht auf Fotos oft viel zu glattgebügelt aus. Aber wehe, das Teil ist dann im Laden 20 Euro teurer als online!
I: Haben Sie das schon erlebt?
B: Ständig! Neulich bei einer bekannten Modekette: Online gab es 15 Prozent mit App-Gutschein, aber an der Kasse im Store hieß es nur schnippisch, der gelte offline nicht. Da habe ich das Kleid einfach liegen lassen und bin gegangen. Das ist für mich ein absoluter Bruch im Kundenerlebnis.
I: Wie stehen Sie zu Click & Collect?
B: Die Idee ist super, die Realität leider oft frustrierend. Man wartet an der Paketstation im Store manchmal zwanzig Minuten, weil nur eine Person da ist, die gleichzeitig Retouren und Kasse macht. Da lasse ich es mir lieber direkt nach Hause liefern.
I: Was hält Sie letztlich bei einer bestimmten Modemarke loyal?
B: Kulanz. Wenn eine Retoure unkompliziert ist und mein Geld nach zwei Tagen wieder auf dem Konto ist, bleibe ich treu. Und wenn sie mir nicht ständig nervige Push-Nachrichten für Dinge schicken, die ich sowieso nie kaufen würde.`,
    paragraphs: [
      { index: 1, speaker: 'Interviewer', text: 'Vielen Dank für die Teilnahme an unserer qualitativen AMK-Erhebung. Beschreiben Sie bitte Ihren typischen Ablauf, wenn Sie nach einem neuen Kleidungsstück suchen.' },
      { index: 2, speaker: 'Befragter', text: 'Also bei mir startet fast alles auf dem Smartphone, meistens abends auf dem Sofa. Ich scrolle durch Instagram oder Pinterest, und wenn mir ein Style gefällt, schaue ich direkt in die Verlinkung.' },
      { index: 3, speaker: 'Interviewer', text: 'Wie wichtig sind Ihnen dabei Bewertungen von anderen Kundinnen und Kunden?' },
      { index: 4, speaker: 'Befragter', text: 'Extrem wichtig! Bevor ich überhaupt etwas in den Warenkorb lege, lese ich mindestens fünf bis zehn Rezensionen. Ich filtere immer gezielt nach den 3-Sterne-Bewertungen, weil die meistens die ungeschminkte Wahrheit über Schnitt und Stoffqualität enthalten.' },
      { index: 5, speaker: 'Interviewer', text: 'Gehen Sie denn auch noch in die Filiale vor Ort?' },
      { index: 6, speaker: 'Befragter', text: 'Ehrlich gesagt nur noch selten. Wenn ich in die Stadt gehe, dann um den Stoff anzufassen. Wolle oder Leinen muss ich spüren, das sieht auf Fotos oft viel zu glattgebügelt aus. Aber wehe, das Teil ist dann im Laden 20 Euro teurer als online!' },
      { index: 7, speaker: 'Interviewer', text: 'Haben Sie das schon erlebt?' },
      { index: 8, speaker: 'Befragter', text: 'Ständig! Neulich bei einer bekannten Modekette: Online gab es 15 Prozent mit App-Gutschein, aber an der Kasse im Store hieß es nur schnippisch, der gelte offline nicht. Da habe ich das Kleid einfach liegen lassen und bin gegangen. Das ist für mich ein absoluter Bruch im Kundenerlebnis.' },
      { index: 9, speaker: 'Interviewer', text: 'Wie stehen Sie zu Click & Collect?' },
      { index: 10, speaker: 'Befragter', text: 'Die Idee ist super, die Realität leider oft frustrierend. Man wartet an der Paketstation im Store manchmal zwanzig Minuten, weil nur eine Person da ist, die gleichzeitig Retouren und Kasse macht. Da lasse ich es mir lieber direkt nach Hause liefern.' },
      { index: 11, speaker: 'Interviewer', text: 'Was hält Sie letztlich bei einer bestimmten Modemarke loyal?' },
      { index: 12, speaker: 'Befragter', text: 'Kulanz. Wenn eine Retoure unkompliziert ist und mein Geld nach zwei Tagen wieder auf dem Konto ist, bleibe ich treu. Und wenn sie mir nicht ständig nervige Push-Nachrichten für Dinge schicken, die ich sowieso nie kaufen würde.' },
    ],
    sentimentTrajectory: [
      { paragraphIndex: 2, score: 0.6, label: 'Zufriedenheit / Begeisterung', topic: 'Inspirierende Social Media Feeds' },
      { paragraphIndex: 4, score: 0.2, label: 'Neutral / Sachlich', topic: 'Analytische Rezensionsprüfung' },
      { paragraphIndex: 6, score: 0.4, label: 'Zufriedenheit / Begeisterung', topic: 'Haptische Stoffprüfung im Laden' },
      { paragraphIndex: 8, score: -0.9, label: 'Frustration / Barriere', topic: 'Kaufabbruch wegen App-Gutschein-Verweigerung an Kasse' },
      { paragraphIndex: 10, score: -0.7, label: 'Frustration / Barriere', topic: '20 Min. Wartezeit bei Click & Collect' },
      { paragraphIndex: 12, score: 0.8, label: 'Zufriedenheit / Begeisterung', topic: 'Treue durch prompte Kulanz und Rückerstattung' },
    ],
  },
  {
    id: 'doc-2',
    title: 'Interview Transkript S2',
    filename: 'interview_s2.txt',
    createdAt: '2026-11-03T14:30:00Z',
    respondentInfo: {
      code: 'S2',
      fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
      interviewDate: '03.11.2026',
      duration: '48 Min.',
      keyCharacteristic: 'Fokus: Recherche-Orientierung & Fachhandel',
    },
    rawText: `I: Wie gehen Sie vor, wenn Sie eine größere Anschaffung wie einen neuen Akku-Bohrschrauber oder ein technisches Gerät planen?
B: Ich bin da sehr analytisch. Zuerst vergleiche ich technische Datenblätter im Web und schaue Testberichte auf Fachportalen. YouTube-Unboxings helfen mir auch, um die Geräuschkulisse und Verarbeitung einzuschätzen.
I: Bestellen Sie dann auch online?
B: Nicht zwingend. Bei teuren Werkzeugen fahre ich in den Fachhandel. Ich muss wissen, wie das Werkzeug in meiner Hand liegt – die Ergonomie und das Gewicht kann mir kein Datenblatt vermitteln. Das haptische Erlebnis ist entscheidend.
I: Welche Rolle spielt dabei die Beratung vor Ort?
B: Wenn der Verkäufer wirklich Ahnung hat und nicht nur das abliest, was auf dem Karton steht, bin ich auch bereit, fünf Prozent mehr zu zahlen. Doch leider trifft man oft auf ungelernte Aushilfen, die weniger wissen als ich nach einer halben Stunde Online-Recherche.
I: Nutzen Sie digitale Services der stationären Händler?
B: Ja, ich prüfe fast immer vorab online die Filialverfügbarkeit. Letzten Monat stand da: "Noch 4 Stück in Markt verfügbar". Ich fahre zwanzig Kilometer hin, suche den Gang ab – Regal komplett leer. Ein Mitarbeiter meinte nur trocken, das System sei wohl nicht synchronisiert. Solche Medienbrüche kosten mich Zeit und Nerven.
I: Was bedeutet Datenschutz für Sie beim Online-Shopping?
B: Ich bin da vorsichtig. Wenn ein Shop verlangt, dass ich meine Telefonnummer angeben muss oder ungefragt Newsletter abonniert werden, breche ich ab. Transparenz ist mir heilig.`,
    paragraphs: [
      { index: 1, speaker: 'Interviewer', text: 'Wie gehen Sie vor, wenn Sie eine größere Anschaffung wie einen neuen Akku-Bohrschrauber oder ein technisches Gerät planen?' },
      { index: 2, speaker: 'Befragter', text: 'Ich bin da sehr analytisch. Zuerst vergleiche ich technische Datenblätter im Web und schaue Testberichte auf Fachportalen. YouTube-Unboxings helfen mir auch, um die Geräuschkulisse und Verarbeitung einzuschätzen.' },
      { index: 3, speaker: 'Interviewer', text: 'Bestellen Sie dann auch online?' },
      { index: 4, speaker: 'Befragter', text: 'Nicht zwingend. Bei teuren Werkzeugen fahre ich in den Fachhandel. Ich muss wissen, wie das Werkzeug in meiner Hand liegt – die Ergonomie und das Gewicht kann mir kein Datenblatt vermitteln. Das haptische Erlebnis ist entscheidend.' },
      { index: 5, speaker: 'Interviewer', text: 'Welche Rolle spielt dabei die Beratung vor Ort?' },
      { index: 6, speaker: 'Befragter', text: 'Wenn der Verkäufer wirklich Ahnung hat und nicht nur das abliest, was auf dem Karton steht, bin ich auch bereit, fünf Prozent mehr zu zahlen. Doch leider trifft man oft auf ungelernte Aushilfen, die weniger wissen als ich nach einer halben Stunde Online-Recherche.' },
      { index: 7, speaker: 'Interviewer', text: 'Nutzen Sie digitale Services der stationären Händler?' },
      { index: 8, speaker: 'Befragter', text: 'Ja, ich prüfe fast immer vorab online die Filialverfügbarkeit. Letzten Monat stand da: "Noch 4 Stück in Markt verfügbar". Ich fahre zwanzig Kilometer hin, suche den Gang ab – Regal komplett leer. Ein Mitarbeiter meinte nur trocken, das System sei wohl nicht synchronisiert. Solche Medienbrüche kosten mich Zeit und Nerven.' },
      { index: 9, speaker: 'Interviewer', text: 'Was bedeutet Datenschutz für Sie beim Online-Shopping?' },
      { index: 10, speaker: 'Befragter', text: 'Ich bin da vorsichtig. Wenn ein Shop verlangt, dass ich meine Telefonnummer angeben muss oder ungefragt Newsletter abonniert werden, breche ich ab. Transparenz ist mir heilig.' },
    ],
    sentimentTrajectory: [
      { paragraphIndex: 2, score: 0.3, label: 'Neutral / Sachlich', topic: 'Strukturierte Datenblatt-Recherche' },
      { paragraphIndex: 4, score: 0.6, label: 'Zufriedenheit / Begeisterung', topic: 'Ergonomie und Wertigkeit im Fachhandel' },
      { paragraphIndex: 6, score: 0.1, label: 'Neutral / Sachlich', topic: 'Bedingte Mehrpreisbereitschaft bei Top-Beratung' },
      { paragraphIndex: 8, score: -0.95, label: 'Frustration / Barriere', topic: '20 km umsonst gefahren wegen falschem Online-Bestand' },
      { paragraphIndex: 10, score: -0.5, label: 'Frustration / Barriere', topic: 'Datenschutzbedenken bei Pflicht-Telefonnummern' },
    ],
  },
  {
    id: 'doc-3',
    title: 'Interview Transkript S3',
    filename: 'interview_s3.txt',
    createdAt: '2026-11-04T09:00:00Z',
    respondentInfo: {
      code: 'S3',
      fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
      interviewDate: '04.11.2026',
      duration: '38 Min.',
      keyCharacteristic: 'Fokus: Convenience, Frische & Authentizität',
    },
    rawText: `I: Wie sieht Ihre Einkaufsroutine bei Alltags- und Konsumprodukten aus?
B: Es muss vor allem zeiteffizient sein. Ein Teil bestellen wir online, aber frisches Obst, Gemüse und Brot kaufe ich ausschließlich auf dem Markt oder im Fachgeschäft.
I: Warum dieser Unterschied?
B: Weil man bei Frischeware riechen und sehen muss, was man bekommt. Ein Foto im Webshop zeigt mir nicht, ob die Ware von bester Qualität ist.
I: Wie beurteilen Sie Nachhaltigkeitsversprechen von Marken?
B: Da bin ich extrem skeptisch geworden. Überall steht "grün", "klimaneutral" oder "nachhaltig verpackt". Wenn dann aber drei kleine Kosmetikartikel in einem riesigen Karton mit Plastikluftpolstern ankommen, fühle ich mich betrogen. Ich erwarte da echte Authentizität und recycelte Materialien.
I: Welche digitalen Tools nutzen Sie regelmäßig?
B: Apps mit Einkaufslisten. Und wenn eine App intuitiv und schnell lädt, nutze ich sie gerne. Hakt der Bezahlvorgang mit Apple Pay oder muss ich fünfmal mein Passwort neu eingeben, breche ich sofort ab.
I: Was schätzen Sie an Ihrem Lieblingsladen?
B: Die persönliche Begrüßung. Die Inhaberin kennt meinen Geschmack und legt mir manchmal etwas zur Seite. Diese menschliche Wärme kann kein KI-Algorithmus ersetzen.`,
    paragraphs: [
      { index: 1, speaker: 'Interviewer', text: 'Wie sieht Ihre Einkaufsroutine bei Alltags- und Konsumprodukten aus?' },
      { index: 2, speaker: 'Befragter', text: 'Es muss vor allem zeiteffizient sein. Ein Teil bestellen wir online, aber frisches Obst, Gemüse und Brot kaufe ich ausschließlich auf dem Markt oder im Fachgeschäft.' },
      { index: 3, speaker: 'Interviewer', text: 'Warum dieser Unterschied?' },
      { index: 4, speaker: 'Befragter', text: 'Weil man bei Frischeware riechen und sehen muss, was man bekommt. Ein Foto im Webshop zeigt mir nicht, ob die Ware von bester Qualität ist.' },
      { index: 5, speaker: 'Interviewer', text: 'Wie beurteilen Sie Nachhaltigkeitsversprechen von Marken?' },
      { index: 6, speaker: 'Befragter', text: 'Da bin ich extrem skeptisch geworden. Überall steht "grün", "klimaneutral" oder "nachhaltig verpackt". Wenn dann aber drei kleine Kosmetikartikel in einem riesigen Karton mit Plastikluftpolstern ankommen, fühle ich mich betrogen. Ich erwarte da echte Authentizität und recycelte Materialien.' },
      { index: 7, speaker: 'Interviewer', text: 'Welche digitalen Tools nutzen Sie regelmäßig?' },
      { index: 8, speaker: 'Befragter', text: 'Apps mit Einkaufslisten. Und wenn eine App intuitiv und schnell lädt, nutze ich sie gerne. Hakt der Bezahlvorgang mit Apple Pay oder muss ich fünfmal mein Passwort neu eingeben, breche ich sofort ab.' },
      { index: 9, speaker: 'Interviewer', text: 'Was schätzen Sie an Ihrem Lieblingsladen?' },
      { index: 10, speaker: 'Befragter', text: 'Die persönliche Begrüßung. Die Inhaberin kennt meinen Geschmack und legt mir manchmal etwas zur Seite. Diese menschliche Wärme kann kein KI-Algorithmus ersetzen.' },
    ],
    sentimentTrajectory: [
      { paragraphIndex: 2, score: 0.2, label: 'Neutral / Sachlich', topic: 'Pragmatische Kanalteilung' },
      { paragraphIndex: 4, score: 0.5, label: 'Zufriedenheit / Begeisterung', topic: 'Sensorische Qualitätsprüfung vor Ort' },
      { paragraphIndex: 6, score: -0.85, label: 'Frustration / Barriere', topic: 'Greenwashing & Verpackungsmüll bei Online-Bestellung' },
      { paragraphIndex: 8, score: -0.6, label: 'Frustration / Barriere', topic: 'Kaufabbruch bei hakendem Bezahlvorgang' },
      { paragraphIndex: 10, score: 0.9, label: 'Zufriedenheit / Begeisterung', topic: 'Emotionale Bindung durch persönliche Kundenansprache' },
    ],
  },
  {
    id: 'doc-4',
    title: 'Interview Transkript S4',
    filename: 'interview_s4.txt',
    createdAt: '2026-11-04T16:00:00Z',
    respondentInfo: {
      code: 'S4',
      fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
      interviewDate: '04.11.2026',
      duration: '45 Min.',
      keyCharacteristic: 'Fokus: Mobile-First, Preisvergleich & Social Commerce',
    },
    rawText: `I: Wie kaufst du am liebsten ein?
B: Fast zu 100 Prozent mobil über mein Smartphone. Wenn ich auf TikTok ein cooles Gadget oder Sneaker sehe, will ich mit zwei Klicks bezahlen – meistens über Klarna oder PayPal. Ein langes Formular ausfüllen? No way, das macht in meiner Generation niemand mehr.
I: Achtest du auf den Preis oder die Marke?
B: Ich vergleiche alles gnadenlos. Mit Browser-Erweiterungen und Vergleichsportalen wie Idealo suche ich immer den besten Gutscheincode. Wenn ein Händler 10 Euro günstiger ist, kaufe ich dort, Markentreue habe ich da eher wenig.
I: Gehst du überhaupt noch in Einkaufszentren oder Innenstädte?
B: Eigentlich nur als Social Event mit Freunden. Wir trinken einen Bubble Tea oder schauen uns limitierte Sneaker an, die man sonst nirgends sieht. Das ist mehr Entertainment als reines Einkaufen.
I: Hast du schon mal Click & Collect genutzt?
B: Einmal versucht für ein Paar Schuhe. Vor Ort musste ich 15 Minuten in einer Schlange stehen, während draußen die Sonne schien. Danach habe ich mir geschworen: Entweder direkt liefern lassen oder ganz spontan im Laden mitnehmen.
I: Welche Rolle spielen Bewertungen für dich?
B: Unfassbar wichtig. Wenn ein Produkt unter 4,2 Sterne hat, schaue ich es mir gar nicht erst an. Am liebsten sind mir Video-Reviews von echten Usern, nicht diese bezahlten Influencer-Werbungen.`,
    paragraphs: [
      { index: 1, speaker: 'Interviewer', text: 'Wie kaufst du am liebsten ein?' },
      { index: 2, speaker: 'Befragter', text: 'Fast zu 100 Prozent mobil über mein Smartphone. Wenn ich auf TikTok ein cooles Gadget oder Sneaker sehe, will ich mit zwei Klicks bezahlen – meistens über Klarna oder PayPal. Ein langes Formular ausfüllen? No way, das macht in meiner Generation niemand mehr.' },
      { index: 3, speaker: 'Interviewer', text: 'Achtest du auf den Preis oder die Marke?' },
      { index: 4, speaker: 'Befragter', text: 'Ich vergleiche alles gnadenlos. Mit Browser-Erweiterungen und Vergleichsportalen wie Idealo suche ich immer den besten Gutscheincode. Wenn ein Händler 10 Euro günstiger ist, kaufe ich dort, Markentreue habe ich da eher wenig.' },
      { index: 5, speaker: 'Interviewer', text: 'Gehst du überhaupt noch in Einkaufszentren oder Innenstädte?' },
      { index: 6, speaker: 'Befragter', text: 'Eigentlich nur als Social Event mit Freunden. Wir trinken einen Bubble Tea oder schauen uns limitierte Sneaker an, die man sonst nirgends sieht. Das ist mehr Entertainment als reines Einkaufen.' },
      { index: 7, speaker: 'Interviewer', text: 'Hast du schon mal Click & Collect genutzt?' },
      { index: 8, speaker: 'Befragter', text: 'Einmal versucht für ein Paar Schuhe. Vor Ort musste ich 15 Minuten in einer Schlange stehen, während draußen die Sonne schien. Danach habe ich mir geschworen: Entweder direkt liefern lassen oder ganz spontan im Laden mitnehmen.' },
      { index: 9, speaker: 'Interviewer', text: 'Welche Rolle spielen Bewertungen für dich?' },
      { index: 10, speaker: 'Befragter', text: 'Unfassbar wichtig. Wenn ein Produkt unter 4,2 Sterne hat, schaue ich es mir gar nicht erst an. Am liebsten sind mir Video-Reviews von echten Usern, nicht diese bezahlten Influencer-Werbungen.' },
    ],
    sentimentTrajectory: [
      { paragraphIndex: 2, score: 0.7, label: 'Zufriedenheit / Begeisterung', topic: 'Begeisterung für 2-Klick-Checkout mobil' },
      { paragraphIndex: 4, score: 0.1, label: 'Neutral / Sachlich', topic: 'Rücksichtslose Rabattjagd' },
      { paragraphIndex: 6, score: 0.5, label: 'Zufriedenheit / Begeisterung', topic: 'Innenstadt als soziales Event' },
      { paragraphIndex: 8, score: -0.8, label: 'Frustration / Barriere', topic: 'Frust über 15 Min. Schlange bei Click & Collect' },
      { paragraphIndex: 10, score: 0.3, label: 'Neutral / Sachlich', topic: 'Strenge Selektion nach User-Reviews' },
    ],
  },
  {
    id: 'doc-5',
    title: 'Interview Transkript S5',
    filename: 'interview_s5.txt',
    createdAt: '2026-11-05T11:15:00Z',
    respondentInfo: {
      code: 'S5',
      fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
      interviewDate: '05.11.2026',
      duration: '40 Min.',
      keyCharacteristic: 'Fokus: Stationäre Verankerung & Datensicherheit',
    },
    rawText: `I: Wie erledigen Sie Ihre Einkäufe, sowohl für den täglichen Bedarf als auch für Textilien oder Geschenke?
B: Ich gehe sehr gerne in unsere örtliche Fußgängerzone. Für mich ist das ein Stück Lebensqualität. Ich mag es, durch die Buchhandlung zu schlendern, in Büchern zu blättern und den Geruch von frisch gedruckten Seiten zu genießen.
I: Nutzen Sie das Internet zur Unterstützung?
B: Manchmal für Öffnungszeiten oder um eine Telefonnummer herauszusuchen. Aber bestellen tue ich im Internet ungern. Ich habe keine Lust, Pakete zur Post zu schleppen, wenn etwas nicht passt. Das ist eine furchtbare Verpackungsverschwendung und zeitraubend.
I: Haben Sie Bedenken bezüglich der Bezahlung im Internet?
B: Ja, absolut. Diese ständigen Nachrichten über gehackte Kundendaten und Datenmissbrauch verunsichern mich sehr. Ich bezahle am liebsten mit EC-Karte oder bar. Bei einem Händler vor Ort weiß ich, an wen ich mich wenden kann, wenn etwas defekt ist.
I: Was schätzen Sie an den Mitarbeitern im Laden?
B: Geduld und ehrliche Empfehlungen! Wenn mir eine Verkäuferin sagt: "Dieses Kleid steht Ihnen von der Farbe her nicht, probieren Sie lieber jenes", dann kaufe ich das sofort. Im Internet gibt es nur Algorithmen, die mir noch mehr andrehen wollen.`,
    paragraphs: [
      { index: 1, speaker: 'Interviewer', text: 'Wie erledigen Sie Ihre Einkäufe, sowohl für den täglichen Bedarf als auch für Textilien oder Geschenke?' },
      { index: 2, speaker: 'Befragter', text: 'Ich gehe sehr gerne in unsere örtliche Fußgängerzone. Für mich ist das ein Stück Lebensqualität. Ich mag es, durch die Buchhandlung zu schlendern, in Büchern zu blättern und den Geruch von frisch gedruckten Seiten zu genießen.' },
      { index: 3, speaker: 'Interviewer', text: 'Nutzen Sie das Internet zur Unterstützung?' },
      { index: 4, speaker: 'Befragter', text: 'Manchmal für Öffnungszeiten oder um eine Telefonnummer herauszusuchen. Aber bestellen tue ich im Internet ungern. Ich habe keine Lust, Pakete zur Post zu schleppen, wenn etwas nicht passt. Das ist eine furchtbare Verpackungsverschwendung und zeitraubend.' },
      { index: 5, speaker: 'Interviewer', text: 'Haben Sie Bedenken bezüglich der Bezahlung im Internet?' },
      { index: 6, speaker: 'Befragter', text: 'Ja, absolut. Diese ständigen Nachrichten über gehackte Kundendaten und Datenmissbrauch verunsichern mich sehr. Ich bezahle am liebsten mit EC-Karte oder bar. Bei einem Händler vor Ort weiß ich, an wen ich mich wenden kann, wenn etwas defekt ist.' },
      { index: 7, speaker: 'Interviewer', text: 'Was schätzen Sie an den Mitarbeitern im Laden?' },
      { index: 8, speaker: 'Befragter', text: 'Geduld und ehrliche Empfehlungen! Wenn mir eine Verkäuferin sagt: "Dieses Kleid steht Ihnen von der Farbe her nicht, probieren Sie lieber jenes", dann kaufe ich das sofort. Im Internet gibt es nur Algorithmen, die mir noch mehr andrehen wollen.' },
    ],
    sentimentTrajectory: [
      { paragraphIndex: 2, score: 0.85, label: 'Zufriedenheit / Begeisterung', topic: 'Genuss beim Schlendern in der Fußgängerzone' },
      { paragraphIndex: 4, score: -0.7, label: 'Frustration / Barriere', topic: 'Retourenfrust und Verpackungswahnsinn' },
      { paragraphIndex: 6, score: -0.75, label: 'Frustration / Barriere', topic: 'Furcht vor Hacking und Datenmissbrauch online' },
      { paragraphIndex: 8, score: 0.9, label: 'Zufriedenheit / Begeisterung', topic: 'Echte menschliche Ehrlichkeit im Verkauf' },
    ],
  },
  {
    id: 'doc-6',
    title: 'Interview Transkript S6',
    filename: 'interview_s6.txt',
    createdAt: '2026-11-05T15:45:00Z',
    respondentInfo: {
      code: 'S6',
      fieldOfStudy: 'Wirtschaftswissenschaften / Marketing',
      interviewDate: '05.11.2026',
      duration: '44 Min.',
      keyCharacteristic: 'Fokus: Nahtlose Omnichannel-Ökosysteme & Effizienz',
    },
    rawText: `I: Wie verbinden Sie Ihren vollen Alltag mit effizientem Einkaufen?
B: Für mich zählt jede Minute. Wenn ein Händler mir Zeit spart, hat er mein Geschäft. Ich nutze sehr intensiv Click & Collect, allerdings nur dort, wo es wie bei einer Fast-Food-Drive-Through-Spur funktioniert: Barcode vorhalten, Tüte nehmen, fertig.
I: Wo hakt es in der Praxis Ihrer Meinung nach am meisten?
B: Bei der Synchronisation von Online-System und Ladenkasse. Ich kaufe oft online ein Hemd, will es aber in der Filiale umtauschen. Wenn mir dann gesagt wird: "Das geht nicht, das ist ein anderer Warenbestand, Sie müssen das per Post einschicken", platzt mir der Kragen. Das Unternehmen tritt als eine Marke auf, aber intern sind das zwei feindliche Silos.
I: Wie wichtig sind Ihnen personalisierte Angebote?
B: Wenn sie wirklich passen, finde ich sie super. Wenn mein Ausstatter merkt, was ich brauche, und mir passende Ergänzungen vorschlägt, kaufe ich die mit einem Klick. Schlecht ist es, wenn mir noch wochenlang Werbung für einen Artikel angezeigt wird, den ich längst gekauft habe.
I: Was erwarten Sie von Händlern in der Zukunft?
B: Völlige Barrierefreiheit zwischen Kanälen: Im Laden per App scannen und bezahlen, online reservieren und im Store anprobieren, oder im Laden bestellen und nach Hause schicken lassen, falls die Größe nicht da ist. Wer das nicht schafft, wird überrollt.`,
    paragraphs: [
      { index: 1, speaker: 'Interviewer', text: 'Wie verbinden Sie Ihren vollen Alltag mit effizientem Einkaufen?' },
      { index: 2, speaker: 'Befragter', text: 'Für mich zählt jede Minute. Wenn ein Händler mir Zeit spart, hat er mein Geschäft. Ich nutze sehr intensiv Click & Collect, allerdings nur dort, wo es wie bei einer Fast-Food-Drive-Through-Spur funktioniert: Barcode vorhalten, Tüte nehmen, fertig.' },
      { index: 3, speaker: 'Interviewer', text: 'Wo hakt es in der Praxis Ihrer Meinung nach am meisten?' },
      { index: 4, speaker: 'Befragter', text: 'Bei der Synchronisation von Online-System und Ladenkasse. Ich kaufe oft online ein Hemd, will es aber in der Filiale umtauschen. Wenn mir dann gesagt wird: "Das geht nicht, das ist ein anderer Warenbestand, Sie müssen das per Post einschicken", platzt mir der Kragen. Das Unternehmen tritt als eine Marke auf, aber intern sind das zwei feindliche Silos.' },
      { index: 5, speaker: 'Interviewer', text: 'Wie wichtig sind Ihnen personalisierte Angebote?' },
      { index: 6, speaker: 'Befragter', text: 'Wenn sie wirklich passen, finde ich sie super. Wenn mein Ausstatter merkt, was ich brauche, und mir passende Ergänzungen vorschlägt, kaufe ich die mit einem Klick. Schlecht ist es, wenn mir noch wochenlang Werbung für einen Artikel angezeigt wird, den ich längst gekauft habe.' },
      { index: 7, speaker: 'Interviewer', text: 'Was erwarten Sie von Händlern in der Zukunft?' },
      { index: 8, speaker: 'Befragter', text: 'Völlige Barrierefreiheit zwischen Kanälen: Im Laden per App scannen und bezahlen, online reservieren und im Store anprobieren, oder im Laden bestellen und nach Hause schicken lassen, falls die Größe nicht da ist. Wer das nicht schafft, wird überrollt.' },
    ],
    sentimentTrajectory: [
      { paragraphIndex: 2, score: 0.7, label: 'Zufriedenheit / Begeisterung', topic: 'Maximale Effizienz durch Drive-Through Click & Collect' },
      { paragraphIndex: 4, score: -0.95, label: 'Frustration / Barriere', topic: 'Wut über interne Silos & Verweigerung des Filialumtauschs' },
      { paragraphIndex: 6, score: 0.4, label: 'Zufriedenheit / Begeisterung', topic: 'Relevante, kontextsensitive Personalisierung' },
      { paragraphIndex: 8, score: 0.6, label: 'Zufriedenheit / Begeisterung', topic: 'Vision für nahtlose Kanalintegration' },
    ],
  },
];

export const INITIAL_CODED_SEGMENTS: CodedSegment[] = [
  // Doc 1 (S1)
  {
    id: 'seg-1-1',
    documentId: 'doc-1',
    codeId: 'code-1-1', // Social-Media-Inspiration
    paragraphIndex: 2,
    exactQuote: 'Ich scrolle durch Instagram oder Pinterest, und wenn mir ein Style gefällt, schaue ich direkt in die Verlinkung.',
    startIndex: 73,
    endIndex: 184,
    comment: 'Typische mobile Entdeckungsphase über Bildmedien.',
  },
  {
    id: 'seg-1-2',
    codeId: 'code-1-4', // Online-Bewertungen
    documentId: 'doc-1',
    paragraphIndex: 4,
    exactQuote: 'Bevor ich überhaupt etwas in den Warenkorb lege, lese ich mindestens fünf bis zehn Rezensionen. Ich filtere immer gezielt nach den 3-Sterne-Bewertungen',
    startIndex: 16,
    endIndex: 172,
    comment: 'Social Proof als Kaufentscheidungsfilter.',
  },
  {
    id: 'seg-1-3',
    codeId: 'code-2-1', // Haptisches Produkterlebnis
    documentId: 'doc-1',
    paragraphIndex: 6,
    exactQuote: 'Wolle oder Leinen muss ich spüren, das sieht auf Fotos oft viel zu glattgebügelt aus.',
    startIndex: 64,
    endIndex: 150,
    comment: 'Haptische Überprüfung von Textilfasern im Store.',
  },
  {
    id: 'seg-1-4',
    codeId: 'code-3-2', // Preisdiskrepanz
    documentId: 'doc-1',
    paragraphIndex: 8,
    exactQuote: 'Online gab es 15 Prozent mit App-Gutschein, aber an der Kasse im Store hieß es nur schnippisch, der gelte offline nicht. Da habe ich das Kleid einfach liegen lassen und bin gegangen.',
    startIndex: 37,
    endIndex: 221,
    comment: 'Kaufabbruch durch Preisdiskrepanz zwischen App und POS.',
  },
  {
    id: 'seg-1-5',
    codeId: 'code-3-1', // Click & Collect Wartezeiten
    documentId: 'doc-1',
    paragraphIndex: 10,
    exactQuote: 'Man wartet an der Paketstation im Store manchmal zwanzig Minuten, weil nur eine Person da ist, die gleichzeitig Retouren und Kasse macht.',
    startIndex: 36,
    endIndex: 177,
    comment: 'Personalengpass an Abholstation als Friktionsfaktor.',
  },
  {
    id: 'seg-1-6',
    codeId: 'code-4-3', // Markenloyalität durch Kulanz
    documentId: 'doc-1',
    paragraphIndex: 12,
    exactQuote: 'Wenn eine Retoure unkompliziert ist und mein Geld nach zwei Tagen wieder auf dem Konto ist, bleibe ich treu.',
    startIndex: 8,
    endIndex: 118,
    comment: 'Vertrauen entsteht durch reibungslose Rückabwicklung.',
  },

  // Doc 2 (S2)
  {
    id: 'seg-2-1',
    documentId: 'doc-2',
    codeId: 'code-2-1', // Haptik
    paragraphIndex: 4,
    exactQuote: 'Ich muss wissen, wie das Werkzeug in meiner Hand liegt – die Ergonomie und das Gewicht kann mir kein Datenblatt vermitteln.',
    startIndex: 42,
    endIndex: 165,
    comment: 'Ergonomie und Haptik als stationäre Alleinstellungsmerkmale.',
  },
  {
    id: 'seg-2-2',
    documentId: 'doc-2',
    codeId: 'code-2-2', // Beratungsqualität
    paragraphIndex: 6,
    exactQuote: 'Wenn der Verkäufer wirklich Ahnung hat und nicht nur das abliest, was auf dem Karton steht, bin ich auch bereit, fünf Prozent mehr zu zahlen.',
    startIndex: 0,
    endIndex: 142,
    comment: 'Zahlungsbereitschaft für echte Fachkompetenz.',
  },
  {
    id: 'seg-2-3',
    documentId: 'doc-2',
    codeId: 'code-3-4', // Lagerbestand-Inkonsistenz
    paragraphIndex: 8,
    exactQuote: 'Ich fahre zwanzig Kilometer hin, suche den Gang ab – Regal komplett leer. Ein Mitarbeiter meinte nur trocken, das System sei wohl nicht synchronisiert.',
    startIndex: 85,
    endIndex: 240,
    comment: 'Kanal-Friktion durch fehlerhafte Omnichannel-Daten.',
  },
  {
    id: 'seg-2-4',
    documentId: 'doc-2',
    codeId: 'code-4-1', // Datenschutz
    paragraphIndex: 10,
    exactQuote: 'Wenn ein Shop verlangt, dass ich meine Telefonnummer angeben muss oder ungefragt Newsletter abonniert werden, breche ich ab.',
    startIndex: 24,
    endIndex: 152,
    comment: 'Datensparsamkeit als Hürde im Checkout.',
  },

  // Doc 3 (S3)
  {
    id: 'seg-3-1',
    documentId: 'doc-3',
    codeId: 'code-2-1', // Haptik / Frische
    paragraphIndex: 4,
    exactQuote: 'Weil man bei Frischeware riechen und sehen muss, was man bekommt. Ein Foto im Webshop zeigt mir nicht, ob die Ware von bester Qualität ist.',
    startIndex: 0,
    endIndex: 141,
    comment: 'Sensorische Qualitätsprüfung unersetzbar.',
  },
  {
    id: 'seg-3-2',
    documentId: 'doc-3',
    codeId: 'code-4-4', // Nachhaltigkeits-Authentizität
    paragraphIndex: 6,
    exactQuote: 'Wenn dann aber drei kleine Kosmetikartikel in einem riesigen Karton mit Plastikluftpolstern ankommen, fühle ich mich betrogen. Ich erwarte da echte Authentizität',
    startIndex: 89,
    endIndex: 251,
    comment: 'Diskrepanz zwischen grüner Markenbotschaft und Verpackungsrealität.',
  },
  {
    id: 'seg-3-3',
    documentId: 'doc-3',
    codeId: 'code-1-2', // App Usability
    paragraphIndex: 8,
    exactQuote: 'Hakt der Bezahlvorgang mit Apple Pay oder muss ich fünfmal mein Passwort neu eingeben, breche ich sofort ab.',
    startIndex: 83,
    endIndex: 191,
    comment: 'Null-Toleranz bei mobilem Checkout-Bruch.',
  },
  {
    id: 'seg-3-4',
    documentId: 'doc-3',
    codeId: 'code-2-3', // Atmosphäre
    paragraphIndex: 10,
    exactQuote: 'Die persönliche Begrüßung. Die Inhaberin kennt meinen Geschmack und legt mir manchmal etwas zur Seite. Diese menschliche Wärme kann kein KI-Algorithmus ersetzen.',
    startIndex: 0,
    endIndex: 164,
    comment: 'Emotionale Bindung durch persönliche Händlerbeziehung.',
  },

  // Doc 4 (S4)
  {
    id: 'seg-4-1',
    documentId: 'doc-4',
    codeId: 'code-1-1', // Social Inspiration
    paragraphIndex: 2,
    exactQuote: 'Wenn ich auf TikTok ein cooles Gadget oder Sneaker sehe, will ich mit zwei Klicks bezahlen – meistens über Klarna oder PayPal.',
    startIndex: 43,
    endIndex: 172,
    comment: 'Social-Commerce und One-Click-Buy.',
  },
  {
    id: 'seg-4-2',
    documentId: 'doc-4',
    codeId: 'code-4-2', // Rabattjagd
    paragraphIndex: 4,
    exactQuote: 'Ich vergleiche alles gnadenlos. Mit Browser-Erweiterungen und Vergleichsportalen wie Idealo suche ich immer den besten Gutscheincode.',
    startIndex: 0,
    endIndex: 136,
    comment: 'Geringe Markentreue durch Preissensibilität.',
  },
  {
    id: 'seg-4-3',
    documentId: 'doc-4',
    codeId: 'code-3-1', // Click & Collect
    paragraphIndex: 8,
    exactQuote: 'Vor Ort musste ich 15 Minuten in einer Schlange stehen, während draußen die Sonne schien. Danach habe ich mir geschworen: Entweder direkt liefern lassen oder ganz spontan im Laden mitnehmen.',
    startIndex: 37,
    endIndex: 232,
    comment: 'Click & Collect wird als unattraktiver Zwischenzustand empfunden.',
  },
  {
    id: 'seg-4-4',
    documentId: 'doc-4',
    codeId: 'code-1-4', // Reviews
    paragraphIndex: 10,
    exactQuote: 'Wenn ein Produkt unter 4,2 Sterne hat, schaue ich es mir gar nicht erst an. Am liebsten sind mir Video-Reviews von echten Usern',
    startIndex: 24,
    endIndex: 153,
    comment: 'User Generated Content schlägt professionelle Werbung.',
  },

  // Doc 5 (S5)
  {
    id: 'seg-5-1',
    documentId: 'doc-5',
    codeId: 'code-2-3', // Atmosphäre
    paragraphIndex: 2,
    exactQuote: 'Ich mag es, durch die Buchhandlung zu schlendern, in Büchern zu blättern und den Geruch von frisch gedruckten Seiten zu genießen.',
    startIndex: 64,
    endIndex: 195,
    comment: 'Stationäres Flanieren als sinnliches Erlebnis.',
  },
  {
    id: 'seg-5-2',
    documentId: 'doc-5',
    codeId: 'code-3-3', // Retouren-Aufwand
    paragraphIndex: 4,
    exactQuote: 'Ich habe keine Lust, Pakete zur Post zu schleppen, wenn etwas nicht passt. Das ist eine furchtbare Verpackungsverschwendung und zeitraubend.',
    startIndex: 70,
    endIndex: 211,
    comment: 'Retourenabwicklung als Hauptbarriere gegen E-Commerce.',
  },
  {
    id: 'seg-5-3',
    documentId: 'doc-5',
    codeId: 'code-4-1', // Datenschutz
    paragraphIndex: 6,
    exactQuote: 'Diese ständigen Nachrichten über gehackte Kundendaten und Datenmissbrauch verunsichern mich sehr. Ich bezahle am liebsten mit EC-Karte oder bar.',
    startIndex: 14,
    endIndex: 160,
    comment: 'Sicherheitsbedürfnis und Abneigung gegen Online-Zahlungsmethoden.',
  },
  {
    id: 'seg-5-4',
    documentId: 'doc-5',
    codeId: 'code-2-2', // Beratung
    paragraphIndex: 8,
    exactQuote: 'Wenn mir eine Verkäuferin sagt: "Dieses Kleid steht Ihnen von der Farbe her nicht, probieren Sie lieber jenes", dann kaufe ich das sofort.',
    startIndex: 32,
    endIndex: 171,
    comment: 'Ehrliche, ungefilterte Verkaufsberatung schafft Loyalität.',
  },

  // Doc 6 (S6)
  {
    id: 'seg-6-1',
    documentId: 'doc-6',
    codeId: 'code-3-1', // Click & Collect
    paragraphIndex: 2,
    exactQuote: 'Ich nutze sehr intensiv Click & Collect, allerdings nur dort, wo es wie bei einer Fast-Food-Drive-Through-Spur funktioniert: Barcode vorhalten, Tüte nehmen, fertig.',
    startIndex: 79,
    endIndex: 247,
    comment: 'Click & Collect muss auf absolute Schnelligkeit getrimmt sein.',
  },
  {
    id: 'seg-6-2',
    documentId: 'doc-6',
    codeId: 'code-3-2', // Kanalbrüche
    paragraphIndex: 4,
    exactQuote: 'Wenn mir dann gesagt wird: "Das geht nicht, das ist ein anderer Warenbestand, Sie müssen das per Post einschicken", platzt mir der Kragen. Das Unternehmen tritt als eine Marke auf, aber intern sind das zwei feindliche Silos.',
    startIndex: 114,
    endIndex: 338,
    comment: 'Organisatorische Silos zerstören Omnichannel-Versprechen.',
  },
  {
    id: 'seg-6-3',
    documentId: 'doc-6',
    codeId: 'code-1-3', // Personalisierung
    paragraphIndex: 6,
    exactQuote: 'Wenn mein Ausstatter merkt, was ich brauche, und mir passende Ergänzungen vorschlägt, kaufe ich die mit einem Klick.',
    startIndex: 37,
    endIndex: 153,
    comment: 'Kontextsensitive Personalisierung generiert Spontankäufe.',
  },
  {
    id: 'seg-6-4',
    documentId: 'doc-6',
    codeId: 'code-2-4', // Sofortige Verfügbarkeit
    paragraphIndex: 8,
    exactQuote: 'Völlige Barrierefreiheit zwischen Kanälen: Im Laden per App scannen und bezahlen, online reservieren und im Store anprobieren',
    startIndex: 0,
    endIndex: 126,
    comment: 'Die Erwartung an moderne Omnichannel-Ökosysteme.',
  },
];

export const INITIAL_MEMOS: Memo[] = [
  {
    id: 'memo-1',
    title: 'Theoretisches Memo: Das Phänomen der "Omnichannel-Dissonanz"',
    type: 'theoretical',
    author: 'AMK Forschungsgruppe',
    createdAt: '2026-11-06T09:30:00Z',
    content: `Aus den Interviews S1 und S6 kristallisiert sich ein zentrales theoretisches Konstrukt heraus: Kunden nehmen eine Marke als homogene Entität wahr ("Single Brand Identity"). 
    Wenn das Unternehmen jedoch online und offline organisatorisch trennt (z.B. unterschiedliche Gutscheinbedingungen, keine Filialretouren für Onlinekäufe), entsteht eine starke kognitive Dissonanz und akuter Frust. 
    Im Marketing-Mix muss zwingend die Schnittstelle 'Channel Integration' priorisiert werden.`,
  },
  {
    id: 'memo-2',
    title: 'Methodisches Memo: Reliabilität der Selbstauskünfte zur Preissensibilität',
    type: 'methodological',
    author: 'AMK Forschungsgruppe',
    createdAt: '2026-11-06T11:45:00Z',
    content: `Während Proband S4 offensiv mit Schnäppchenjagd argumentiert, betont Probandin S5 Werte wie Qualität und Entschleunigung. Bei Proband S2 zeigt sich jedoch die Realität: Für echten Mehrwert (haptische Sicherheit, Top-Beratung) existiert eine messbare Mehrpreisbereitschaft von ~5-10%. 
    Empfehlung für das Auswertungskonzept: Differenzierung zwischen 'absoluter Preissensibilität' (reine Commodity-Güter) und 'relativer Preissensibilität' (beratungsintensive Güter).`,
  },
  {
    id: 'memo-3',
    title: 'Fallprofil: Kontrastierung Mobile-Native vs. Stationäre Konsumorientierung',
    type: 'case_summary',
    documentId: 'doc-1',
    author: 'AMK Forschungsgruppe',
    createdAt: '2026-11-07T14:00:00Z',
    content: `Der maximale Kontrast zwischen S1 (doc-1) und S5 (doc-5) zeigt die Bandbreite moderner Zielgruppensegmente:
    - S1 optimiert nach Bequemlichkeit, Social Proof und Reibungslosigkeit im Checkout.
    - S5 sucht im Laden Entschleunigung, persönliche Ansprache und Datensicherheit.
    Gemeinsamer Nenner beider Extremfälle: Beide brechen den Kaufprozess sofort ab, wenn das Vertrauen verletzt wird (S5 bei Datenerfassung, S1 bei intransparenter Preisgestaltung).`,
  },
];

export const INITIAL_SYNTHESIS_REPORT = {
  summary: `Die qualitative Inhaltsanalyse von 6 leitfadengestützten Tiefeninterviews (Probanden S1 bis S6) im Modul AMK zeigt deutlich: Moderne Konsumenten denken nicht mehr in isolierten Kanälen, sondern erwarten ein vollkommen friktionsfreies Zusammenspiel aus digitaler Bequemlichkeit und physischer Sinnlichkeit. Medienbrüche und organisatorische Silos zwischen Webshop und Filiale stellen das größte Abwanderungsrisiko dar.`,
  keyInsights: [
    {
      categoryName: 'Digitale Touchpoints & Social Commerce',
      takeaway: 'Social Media (Instagram/TikTok) fungiert als primärer Inspirationskatalysator, während Online-Rezensionen als unverzichtbarer sozialer Filter vor jedem Kaufabschluss dienen.',
      quotes: [
        'Ich scrolle durch Instagram oder Pinterest, und wenn mir ein Style gefällt, schaue ich direkt in die Verlinkung. (Proband S1)',
        'Wenn ein Produkt unter 4,2 Sterne hat, schaue ich es mir gar nicht erst an. Am liebsten sind mir Video-Reviews von echten Usern. (Proband S4)',
      ],
    },
    {
      categoryName: 'Stationäres Einkaufserlebnis & Haptik',
      takeaway: 'Das physische Geschäft hat seine Existenzberechtigung nicht verloren, sondern sich zum Sinnes- und Erlebnisraum gewandelt. Haptische Materialprüfung und qualifizierte menschliche Beratung rechtfertigen sogar Preisaufschläge.',
      quotes: [
        'Wolle oder Leinen muss ich spüren, das sieht auf Fotos oft viel zu glattgebügelt aus. (Proband S1)',
        'Wenn der Verkäufer wirklich Ahnung hat und nicht nur das abliest, was auf dem Karton steht, bin ich auch bereit, fünf Prozent mehr zu zahlen. (Proband S2)',
      ],
    },
    {
      categoryName: 'Medienbrüche & Kanal-Friktion',
      takeaway: 'Unterschiedliche Preise im Store vs. Online, asynchrone Bestandsanzeigen und langsame Click & Collect Schalter führen zu sofortigen Kaufabbrüchen und langfristigem Vertrauensverlust.',
      quotes: [
        'Online gab es 15 Prozent mit App-Gutschein, aber an der Kasse im Store hieß es nur schnippisch, der gelte offline nicht. Da habe ich das Kleid einfach liegen lassen... (Proband S1)',
        'Das Unternehmen tritt als eine Marke auf, aber intern sind das zwei feindliche Silos. (Proband S6)',
      ],
    },
    {
      categoryName: 'Vertrauen, Datenschutz & Markentreue',
      takeaway: 'Markenloyalität ist volatil und wird vor allem durch Kulanz bei Retouren, Respekt vor Privatsphäre und transparente Nachhaltigkeit ohne Greenwashing gesichert.',
      quotes: [
        'Kulanz. Wenn eine Retoure unkompliziert ist und mein Geld nach zwei Tagen wieder auf dem Konto ist, bleibe ich treu. (Proband S1)',
        'Wenn ein Shop verlangt, dass ich meine Telefonnummer angeben muss oder ungefragt Newsletter abonniert werden, breche ich ab. (Proband S2)',
      ],
    },
  ],
  methodologyNotes: `Methodische Dokumentation: Zweistufige qualitative Inhaltsanalyse nach Philipp Mayring (2015) in Kombination mit Grounded Theory Prinzipien (Glaser & Strauss). 
  Stufe 1: Induktive offene Kodierung der anonymisierten Rohdaten (S1 bis S6). 
  Stufe 2: Axiales Kodieren und Verdichtung auf 4 übergeordnete analytische Hauptdimensionen (Überkategorien). 
  Die Interkoder-Reliabilität und Transparenz wird durch direkte Zitatverankerung mit Paragraphenoffsets im Document Browser sichergestellt.`,
  generatedAt: '2026-11-10T07:45:00Z',
};

export const INITIAL_PROJECT: QdaProject = {
  id: 'amk-project-1',
  name: 'AMK Projekt: Omnichannel & Customer Journey',
  description: 'Qualitative Auswertung von 6 anonymisierten Interviews (S1–S6) zu Konsumentenverhalten, Medienbrüchen und Markenloyalität.',
  courseModule: 'AMK – Analyse von Markt- und Kundendaten',
  documents: INITIAL_DOCUMENTS,
  categories: INITIAL_CATEGORIES,
  codes: INITIAL_CODES,
  codedSegments: INITIAL_CODED_SEGMENTS,
  memos: INITIAL_MEMOS,
  synthesisReport: INITIAL_SYNTHESIS_REPORT,
};
