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
  skeletonTitle: 'Panel szkieletu',
  skeletonNote:
    'Ta sekcja opisuje stan etapu 1 i zniknie, gdy gotowe będą quiz, ranking i zapis sesji.',
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

  /* Motyw (UI-SPEC 6) */
  themeToDark: 'Przełącz na ciemny motyw',
  themeToLight: 'Przełącz na jasny motyw',
  themeLabel: 'Motyw',
  themeLight: 'jasny',
  themeDark: 'ciemny',

  footerNote:
    'Statyczna strona na GitHub Pages. Bez backendu, bez trackerów, stan w Twojej przeglądarce.',
  planningDocs: 'Dokumenty planistyczne',
} as const;

/** Treści zaślepek: co dany ekran będzie zawierał i w którym etapie (ROADMAP). */
export const screenPlans = {
  quiz: {
    stage: 4,
    stageName: 'Tryb quiz',
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
    stageName: 'Tryb suwaków i hybryda',
    items: [
      'Ten sam ekran co suwaki, z wartościami wyliczonymi z krótkiego quizu.',
      'Plakietka „Wyliczone z Twoich odpowiedzi”.',
      'Przycisk „Przywróć wyliczone”.',
    ],
  },
  cards: {
    stage: 6,
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
    stageName: 'Historia sesji i wznawianie',
    items: [
      'Lista sesji od najnowszej: data, tryb, status, ostatni wybór, postęp quizu.',
      'Przyciski Wznów (dla sesji w trakcie), Podgląd (dla ukończonych), Usuń z potwierdzeniem.',
      'Pusty stan: „Nie masz jeszcze żadnych wyborów” i przycisk Start.',
    ],
  },
} as const;

export type PlanScreenKey = keyof typeof screenPlans;
