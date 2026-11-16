/**
 * Wszystkie teksty interfejsu w jednym module (UI-SPEC 1.4 — tylko polski).
 * Komponenty nie zawierają literałów językowych.
 */

export const strings = {
  appName: 'Wybór telefonu',
  appTagline: 'Po cechach, nie po nazwie',
  home: 'Start',
  historyNav: 'Historia',
  history: 'Historia wyborów',
  quiz: 'Quiz',
  sliders: 'Suwaki',
  tune: 'Dostrojenie',
  cards: 'Trzy propozycje',
  ranking: 'Pełny ranking',

  /* Start (UI-SPEC 3.1, kluczowe teksty 9) */
  heroEyebrow: 'Etap 1 — szkielet i wdrożenie',
  heroTitle: 'Jaki telefon do Ciebie pasuje?',
  heroLead:
    'Odpowiedz na kilka pytań, a pokażemy trzy telefony, które pasują do Twoich potrzeb. Nazwy odkryjemy dopiero po Twoim wyborze.',
  heroNote: 'Wybór po cechach · ranking z jasnych reguł · brak backendu',
  howItWorks: 'Jak to działa',
  howItWorksSteps: [
    { n: '1', text: 'Opisujesz, jak korzystasz z telefonu — quiz, suwaki albo jedno i drugie.' },
    { n: '2', text: 'Strona liczy ranking: wagi z Twoich odpowiedzi, oceny telefonów z danych.' },
    { n: '3', text: 'Widzisz trzy anonimowe karty: miejsce, dopasowanie, cenę i cechy.' },
    { n: '4', text: 'Wybierasz kartę — dopiero wtedy pokazujemy nazwę i link do sklepu.' },
  ],

  chooseMode: 'Wybierz sposób',
  quizDescription: 'Pytania o to, jak korzystasz z telefonu.',
  slidersDescription: 'Samodzielnie ustaw, co jest ważne.',
  hybridDescription: 'Krótki quiz i własne poprawki.',
  quizAndSliders: 'Quiz + suwaki',
  quizTime: 'około 5 min',
  slidersTime: 'około 2 min',
  hybridTime: 'około 3 min',
  historyLink: 'Historia wyborów',

  noSessions: 'Brak rozpoczętych wyborów',
  noSessionsNote:
    'Zapis sesji w przeglądarce pojawia się w etapie 3. Wtedy tutaj pokaże się baner „Wróć do rozpoczętego wyboru”.',

  /* Podgląd anonimowych kart na starcie */
  anonDeckTitle: 'Tak wyglądają propozycje',
  anonDeckNote: 'Nazwa, marka i zdjęcia są ukryte do momentu wyboru.',
  proposal: 'Propozycja',
  matchLabel: 'Dopasowanie',
  priceLabel: 'Cena',
  priceNote: 'cena z 14.11.2026',
  hiddenName: 'nazwa ukryta',
  redacted: '—',
  anonFeatureRows: [
    'Bateria · ładowanie',
    'Aparat · zdjęcia i filmy',
    'Pamięć · microSD',
    'Aktualizacje · odporność',
  ],

  /* Panel szkieletu (Etap 1) */
  skeletonTitle: 'Stan projektu',
  skeletonNote:
    'Ta sekcja opisuje stan wdrożenia (etapy 1-5) i zniknie, gdy gotowe będą karty, historia sesji i pełny ranking.',
  routesTitle: 'Mapa ekranów (routing hashowy)',
  routesNote: 'Każdy adres działa po odświeżeniu — GitHub Pages nie potrzebuje fallbacku SPA.',
  routeWorks: 'ekran-zaślepka',
  routeBroken: 'sprawdź obsługę błędu',
  pipelineTitle: 'Wdrożenie na GitHub Pages',
  pipelineNote: 'Workflow uruchamia się po wypchnięciu do gałęzi main.',
  dataTitle: 'Dane i walidacja',
  acceptanceTitle: 'Testy akceptacyjne etapu 1',
  commandsTitle: 'Komendy',

  /* Ekrany-zaślepki */
  preview: 'To podgląd ekranu. Właściwe funkcje pojawią się w kolejnych etapach.',
  historyPreview:
    'Tutaj pojawią się zapisane sesje, kiedy będzie gotowy zapis wyborów (etap 3 i 7).',
  historyEmpty: 'Nie masz jeszcze żadnych wyborów',
  historyEmptyNote:
    'Zapisane sesje pokażą się tutaj w etapie 7: data, tryb, status, ostatni wybór i postęp quizu.',
  historyListPreview: 'Tak będzie wyglądać lista sesji',
  startNew: 'Rozpocznij wybór',
  skeletonPreview: 'Podgląd szkieletu',
  routerConsoleTitle: 'Konsola routera',
  routerConsoleNote:
    'Wpisz adres, a zobaczysz, jak rozpoznał go router hashowy. Te same reguły działają po odświeżeniu strony.',
  routerInputLabel: 'Adres hashowy do sprawdzenia',
  routerHint: 'Wynik rozpoznania',
  routerOpen: 'Otwórz',
  routerState: 'obiekt trasy',
  routerScreen: 'ekran',
  routerStatus: 'stan',
  routerSession: 'sesja',
  routerStatusReady: 'gotowy',
  routerStatusStub: 'zaślepka',
  routerStatusError: 'błąd',
  routerPresets: 'Przykłady',
  requestedAddress: 'Żądany adres',
  requestedSession: 'Identyfikator sesji',
  requestedView: 'Ekran',
  plannedIn: 'Planowane w etapie',
  stageDone: 'zrobione w etapie',
  willContain: 'Co się tu znajdzie',
  screenPager: 'Nawigacja po ekranach',
  backHome: 'Wróć na start',
  back: 'Wstecz',
  next: 'Dalej',
  openRoute: 'Otwórz adres',
  currentRoute: 'Bieżący adres',

  /* Stany błędów (UI-SPEC 3, 10) */
  unknownRoute: 'Nie ma takiej strony',
  unknownRouteDescription: 'Sprawdź adres albo wróć na stronę startową.',
  missingSession: 'Nie znaleziono sesji',
  missingSessionDescription:
    'Ta sesja nie istnieje. Rozpocznij nowy wybór na stronie startowej.',
  demoSessionNote:
    'Adres „demo” to podgląd szkieletu, nie zapisana sesja. Zapis sesji pojawi się w etapie 3.',
  storageWarning:
    'Ta przeglądarka nie pozwala zapisać postępu (np. tryb prywatny). Możesz kontynuować, ale po zamknięciu strony odpowiedzi znikną.',
  dataWarning:
    'Ceny i oceny pochodzą z 14.11.2026. Przed zakupem sprawdź aktualną cenę w sklepie.',
  errorTitle: 'Coś poszło nie tak',
  errorNote: 'Odśwież stronę albo wróć na start.',
  reload: 'Odśwież stronę',

  /* Etap 4 — tryb quiz (UI-SPEC 3.2) */
  quizScreenTitle: 'Quiz',
  quizWhy: 'Dlaczego pytamy?',
  quizSaveExit: 'Zapisz i wyjdź',
  quizSavedNote: 'Zapisywane automatycznie po każdej odpowiedzi',
  quizShowResults: 'Pokaż wyniki',
  quizSkipStep: 'Pomiń ten krok',
  quizTopThreeHint:
    'Dotknij trzech rzeczy po kolei — kolejność ma znaczenie. Wybór nadaje priorytet (1. miejsce 5, 2. miejsce 4, 3. miejsce 3), a Twoje odpowiedzi korygują go wewnątrz pasma, maksymalnie o ±0,6.',
  quizSummaryTitle: 'Podsumowanie odpowiedzi',
  quizSummaryNote:
    'Wagi i filtry wyliczone z Twoich odpowiedzi. Ranking liczy się od razu, a odpowiedzi możesz zmienić nawet po zakończeniu.',
  quizChangeAnswers: 'Zmień odpowiedzi',
  quizLowPersonalization: 'Większość odpowiedzi to „nie wiem”, więc wynik jest ogólny.',
  quizBackToQuestion: 'Wróć do pytań',
  quizStepOfBlock: 'Blok',
  quizResumeNote: 'Wznawiamy od pierwszego pytania bez odpowiedzi.',
  quizGoToCards: 'Przejdź do propozycji',
  quizKeyboardHint: 'Strzałki i spacja wybierają odpowiedź',

  /* Etap 5 — suwaki i hybryda (UI-SPEC 3.3) */
  slidersLead:
    'Ustaw, jak ważna jest każda rzecz. Suwak grupy ustawia jej ważność w wyniku, a „Szczegóły” rozkładają ją na kryteria w środku grupy.',
  slidersGroupHint: 'Jak ważna jest ta rzecz?',
  slidersDetails: 'Szczegóły',
  slidersHideDetails: 'Ukryj szczegóły',
  slidersShares: 'udział w grupie',
  computedBadge: 'Wyliczone z Twoich odpowiedzi',
  restoreComputed: 'Przywróć wyliczone',
  manualOverrideNote:
    'Wartości zmienione ręcznie — ranking liczy się z nich, a nie z odpowiedzi na pytania.',
  computedNote: 'Wartości wyliczone z odpowiedzi. Możesz je dostroić ręcznie.',
  filtersTitle: 'Filtry twarde',
  filtersNote: 'Te warunki odrzucają telefony zanim policzymy wynik.',
  budgetLabel: 'Budżet',
  storageLabel: 'Pamięć',
  storageAny: 'dowolna',
  storage256: 'minimum 256 GB',
  microSdLabel: 'Karta microSD',
  microSdRequired: 'musi mieć',
  microSdAny: 'obojętnie',
  previewTitle: 'Podgląd na żywo',
  previewNote: 'Trzy najlepsze propozycje dla tych ustawień. Nazwy odkryjesz dopiero po wyborze.',
  noPhonesMatch: 'Żaden telefon nie spełnia tych warunków',
  changeFilters: 'Zmień filtry',
  backToQuestions: 'Wróć do pytań',
  tuneLead:
    'Krótki quiz wyliczył te wartości. Dostroj je ręcznie, jeśli coś chcesz zmienić — ranking przelicza się na bieżąco.',

  /* Etap 6 — karty, wybór i ujawnienie (UI-SPEC 3.4, 3.5, 4) */
  cardsIntro: 'Trzy propozycje dla Ciebie. Nazwy odkryjemy po wyborze.',
  cardsFewInBudget: 'Mało telefonów mieści się w budżecie — jedna propozycja jest droższa.',
  cardsMatch: 'Dopasowanie',
  cardsChoose: 'Wybieram tę propozycję',
  cardsMoreDetails: 'Więcej szczegółów',
  cardsHideDetails: 'Ukryj szczegóły',
  cardsDetailsScores: 'Oceny kryteriów',
  cardsDetailsSpecs: 'Pełne dane',
  cardsBasis: 'uzasadnienie',
  cardsConfidence: 'pewność oceny',
  cardsConfidenceHigh: 'wysoka',
  cardsConfidenceMedium: 'średnia',
  cardsConfidenceLow: 'niska',
  cardsEstimated: 'brak danych — ocena neutralna',
  cardsConfirmTitle: 'Odkryć nazwę tej propozycji?',
  cardsConfirmBody: 'Odkryjemy jej nazwę i link do sklepu. Pozostałe propozycje zostają anonimowe.',
  cardsConfirmReveal: 'Odkryj',
  cardsConfirmBack: 'Wróć',
  cardsRevealedNote: 'Cena orientacyjna, sprawdź w sklepie.',
  cardsShopLink: 'Zobacz w sklepie',
  cardsStartOver: 'Zacznij od nowa',
  cardsChangeAnswers: 'Zmień odpowiedzi',
  cardsFullRanking: 'Pokaż pełny ranking',
  cardsPricesStale: 'Ceny mogą być nieaktualne',
  cardsNoRanking: 'Ta sesja nie ma jeszcze rankingu — przeliczamy go z Twoich ustawień.',
  cardsRecompute: 'Przelicz ranking',
  cardsToastRevealed: 'Nazwa odkryta. Karta zostaje odsłonięta, pozostałe są anonimowe.',
  cardsSpecDisplay: 'Ekran',
  cardsSpecPerformance: 'Wydajność',
  cardsSpecBattery: 'Bateria',
  cardsSpecCharging: 'Ładowanie',
  cardsSpecWeight: 'Waga i wymiary',
  cardsSpecCameras: 'Aparaty',
  cardsSpecStorage: 'Pamięć',
  cardsSpecUpdates: 'Aktualizacje',
  cardsSpecDurability: 'Odporność',
  cardsSpecConnectivity: 'Łączność',
  cardsSpecCharger: 'Ładowarka w zestawie',

  /* Motyw (UI-SPEC 6) */
  themeToDark: 'Przełącz na ciemny motyw',
  themeToLight: 'Przełącz na jasny motyw',
  themeLabel: 'Motyw',
  themeLight: 'jasny',
  themeDark: 'ciemny',

  /* Etap 3 — sesje i zapis w przeglądarce */
  sessionPanelTitle: 'Stan sesji',
  sessionPanelNote:
    'Każda zmiana trafia do localStorage pod kluczem „wybor-telefonu:v1” (z opóźnieniem 300 ms, natychmiast przy zamknięciu karty). Odświeżenie strony nie gubi postępu.',
  sessionPreviewNote:
    'To podgląd szkieletu — sesja „demo” nie jest zapisywana. Wybierz tryb na starcie, żeby utworzyć prawdziwą sesję.',
  sessionFieldId: 'identyfikator',
  sessionFieldMode: 'tryb',
  sessionFieldStatus: 'status',
  sessionFieldCreated: 'utworzono',
  sessionFieldUpdated: 'zapisano',
  sessionFieldAnswers: 'odpowiedzi',
  sessionFieldWeights: 'ważności grup',
  sessionFieldFilters: 'filtry',
  sessionFieldRanking: 'snapshot rankingu',
  sessionFieldPicks: 'wybory',
  sessionFieldOverride: 'ręczna korekta',
  statusInProgress: 'W trakcie',
  statusCompleted: 'Ukończona',
  snapshotNone: 'brak — pojawi się po pierwszej zmianie',
  harnessTitle: 'Krok testowy zapisu',
  harnessNote:
    'Te przyciski wywołują akcje reducera z etapu 3, żeby sprawdzić trwałość zapisu w przeglądarce. Znikną, gdy gotowe będą ekrany quizu i kart.',
  harnessAnswer: 'Zapisz przykładową odpowiedź',
  harnessTopThree: 'Ustaw trzy najważniejsze',
  harnessBudget: 'Budżet 1500 zł',
  harnessStorage: 'Minimum 256 GB',
  harnessRecompute: 'Przelicz ranking',
  harnessPickFirst: 'Dodaj wybór propozycji #1',
  harnessPickSecond: 'Dodaj wybór propozycji #2',
  harnessComplete: 'Oznacz jako ukończoną',
  harnessReset: 'Wyczyść odpowiedzi',
  harnessDelete: 'Usuń sesję',
  resumeTitle: 'Wróć do rozpoczętego wyboru',
  resumeAction: 'Wznów',
  noSessionsYet: 'Brak rozpoczętych wyborów',
  storageTitle: 'Zapis w przeglądarce',
  sessionsStored: 'Zapisane sesje',
  storageKey: 'wybor-telefonu:v1',
  storageMemoryMode: 'tryb w pamięci',
  storagePersistent: 'zapis trwały',
  noticeCorrupted:
    'Zapis w przeglądarce był uszkodzony. Uruchomiliśmy pustą kopię stanu, a surowe dane zostawiliśmy pod kluczem zapasowym „wybor-telefonu:backup”.',
  noticeQuota:
    'Przeglądarka odmówiła zapisu (limit pamięci). Stan działa dalej, ale snapshoty rankingu nie zostały zachowane.',
  noticeTrimmed: 'Zachowujemy 50 najnowszych sesji — najstarsze zostały przycięte.',
  noticeDismiss: 'Zamknij',
  noticeStartOver: 'Zacznij od nowa',
  revealedBadge: 'Wybór',
  anonymousBadge: 'anonimowa',
  roadmapNext: 'następny etap',
  roadmapDone: 'ukończone',
  docsSpecs: 'specyfikacje',
  docsStages: 'opisy etapów',

  footerNote:
    'Statyczna strona na GitHub Pages. Bez backendu, bez trackerów, stan w Twojej przeglądarce.',
  planningDocs: 'Dokumenty planistyczne',
} as const;

/** Treści zaślepek: co dany ekran będzie zawierał i w którym etapie (ROADMAP). */
export const screenPlans = {
  quiz: {
    stage: 4,
    stageName: 'Tryb quiz',
    done: true,
    previewNote:
      'To makieta podglądowa. Prawdziwy quiz uruchamia wybór trybu na stronie startowej — tworzy sesję i zapisuje odpowiedzi.',
    items: [
      'Ok. 14–16 pytań w blokach: bateria, aparat, pamięć, codzienność, budżet.',
      'Pasek postępu, licznik „Aparat · 5 z 17”, przycisk Wstecz.',
      'Odpowiedzi jako duże przyciski jednokrotnego wyboru (radiogroup), zapis po każdej odpowiedzi.',
      'Krok G1 „Trzy najważniejsze rzeczy” z mnożnikami wag 1,5 / 1,3 / 1,15.',
      '„Dlaczego pytamy?” jako rozwijany akapit przy każdym pytaniu.',
    ],
  },
  sliders: {
    stage: 5,
    done: true,
    previewNote:
      'To makieta podglądowa. Prawdziwe suwaki uruchamia wybór trybu „Suwaki” na stronie startowej.',
    stageName: 'Tryb suwaków i hybryda',
    items: [
      'Sześć suwaków grup 0–5 z etykietami i wartością tekstową („3 z 5”).',
      'Przycisk „Szczegóły” rozwijający suwaki kryteriów w grupie.',
      'Panel filtrów: budżet (1500 / 1800 / 2000 zł) i minimalna pamięć.',
      'Licznik na żywo „Pasuje 8 z 10 telefonów” w aria-live.',
    ],
  },
  tune: {
    stage: 5,
    done: true,
    previewNote:
      'To makieta podglądowa. Ekran dostrojenia otwiera się po krótkim quizu w trybie „Quiz + suwaki”.',
    stageName: 'Tryb suwaków i hybryda',
    items: [
      'Ten sam ekran co suwaki, z wartościami wyliczonymi z krótkiego quizu.',
      'Plakietka „Wyliczone z Twoich odpowiedzi”.',
      'Przycisk „Przywróć wyliczone”.',
    ],
  },
  cards: {
    stage: 6,
    done: true,
    previewNote:
      'To makieta podglądowa. Prawdziwe karty otwierają się po quizie albo suwakach — przycisk „Pokaż wyniki”.',
    stageName: 'Ranking, anonimowe karty, wybór',
    items: [
      'Trzy anonimowe karty: miejsce, % dopasowania, cena z datą, sześć wierszy cech.',
      '„Więcej szczegółów”: paski ocen 0–100, pewność oceny, uzasadnienia, pełne dane.',
      'Wybór karty potwierdzany oknem u dołu, potem ujawnienie nazwy i linków do sklepu.',
      'Plakietki „Wybór 1/2”, „Wybór 2/2” przy kolejnych wyborach.',
    ],
  },
  ranking: {
    stage: 9,
    done: false,
    stageName: 'Pełny ranking i wydanie',
    items: [
      'Wszystkie telefony w puli: miejsce, nazwa, cena, dopasowanie, mini-paski grup.',
      'Odznaki własnych wyborów („Twój wybór 1/2”).',
      'Rozwijany wiersz ze szczegółami i linkami do sklepów.',
      'Komunikat o dacie danych i konieczności sprawdzenia ceny.',
    ],
  },
  history: {
    stage: 7,
    done: false,
    stageName: 'Historia sesji i wznawianie',
    items: [
      'Lista sesji od najnowszej: data, tryb, status, ostatni wybór, postęp quizu.',
      'Przyciski Wznów (dla sesji w trakcie), Podgląd (dla ukończonych), Usuń z potwierdzeniem.',
      'Pusty stan: „Nie masz jeszcze żadnych wyborów” i przycisk Start.',
    ],
  },
} as const;

/** Nazwy i podpisy bloków tematycznych quizu (QUIZ-SPEC 4). */
export const quizBlocks = {
  battery: { title: 'Bateria i ładowanie', subtitle: 'Jak długo telefon ma działać i jak szybko wracać do pełni.' },
  camera: { title: 'Aparat', subtitle: 'Zdjęcia dziecka i rodziny: w domu, w ruchu, w dzień i z daleka.' },
  storage: { title: 'Pamięć', subtitle: 'Ile zdjęć i filmów zmieści się w telefonie.' },
  everyday: { title: 'Codzienność i trwałość', subtitle: 'Płynność działania, odporność i lata wsparcia.' },
  display: { title: 'Ekran', subtitle: 'Czytelność w słońcu i wygoda oglądania.' },
  budget: { title: 'Budżet', subtitle: 'Ile chcesz wydać i jak ważna jest opłacalność.' },
} as const;

export type PlanScreenKey = keyof typeof screenPlans;

/** Teksty z wartościami liczbowymi — trzymane obok `strings`, żeby nie było literałów w JSX. */
export const sessionTexts = {
  resumeNote: (mode: string, answered: number, total: number): string =>
    answered > 0 ? `${mode} · pytanie ${answered} z ${total}` : `${mode} · brak odpowiedzi`,
  progress: (answered: number, total: number): string => `pytanie ${answered} z ${total}`,
  answersCount: (answered: number, total: number): string => `${answered} z ${total}`,
  sessionsStored: (count: number): string => {
    if (count === 0) return 'brak zapisanych sesji w tej przeglądarce';
    const label = count === 1 ? 'sesja' : count < 5 ? 'sesje' : 'sesji';
    return `${count} ${label} w tej przeglądarce`;
  },
  historyStub: (count: number): string =>
    count === 0
      ? 'Zapis sesji działa (etap 3), ale nie masz jeszcze żadnej — lista pojawi się w etapie 7.'
      : `Zapis sesji działa (etap 3): ${sessionTexts.sessionsStored(count)}. Lista z podglądem i wznawianiem pojawi się w etapie 7.`,
  snapshot: (count: number, dataVersion: string | null, computedAt: string): string =>
    `${count} telefonów · dane z ${dataVersion ?? '—'} · liczone ${new Date(computedAt).toLocaleString('pl-PL')}`,
  picksList: (count: number): string => (count === 0 ? 'brak' : `${count}`),
  weightValue: (value: number): string => value.toFixed(1).replace('.', ','),
  blockCounter: (block: string, n: number, total: number): string => `${block} · ${n} z ${total}`,
  overBudgetMessage: (inBudget: number): string => {
    if (inBudget === 0) return 'W tym budżecie nie mieści się żaden telefon — propozycje będą droższe.';
    if (inBudget === 1) return 'W tym budżecie mieści się tylko jeden telefon. Pozostałe propozycje są droższe.';
    if (inBudget === 2) return 'W tym budżecie mieszczą się tylko dwa telefony. Trzecia propozycja jest droższa.';
    return '';
  },
  poolMatches: (matches: number, total: number): string =>
    `Pasuje ${matches} z ${total} ${total === 1 ? 'telefonu' : matches === 1 ? 'telefonów' : 'telefonów'}`,
  proposalHeading: (place: number): string => `Propozycja #${place}`,
  practicalTie: (place: number): string => `Praktyczny remis z #${place}`,
  overBudgetBy: (amount: number): string => `Powyżej budżetu o ${amount} zł`,
  priceWithDate: (iso: string): string => {
    const [year, month, day] = iso.split('-');
    return `cena z ${day}.${month}.${year}`;
  },
  pickBadge: (order: number, total: number): string => `Wybór ${order}/${total}`,
  confirmTitle: (place: number): string => `Wybierasz propozycję #${place}?`,
  pricesStaleNote: (iso: string, days: number): string =>
    `Najstarsza cena w puli jest z ${sessionTexts.priceWithDate(iso).replace('cena z ', '')} (${days} dni temu). Przed zakupem sprawdź aktualną cenę w sklepie.`,
  poolSmall: (count: number): string =>
    count === 1
      ? 'Tylko jeden telefon spełnia te warunki — pokazujemy jedną propozycję.'
      : `Tylko ${count} telefony spełniają te warunki — pokazujemy ${count} propozycje.`,
  answeredSummary: (answered: number, total: number, skipped: number): string =>
    `${answered} z ${total} pytań · ${skipped} × „nie wiem”`,
} as const;
