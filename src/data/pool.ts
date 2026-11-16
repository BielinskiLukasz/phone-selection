import phonesData from './phones.json';
import { PHONES } from './phones';
import { SHORT_QUIZ_IDS, activeQuestions } from './questions';

/** Twardy limit budżetu (PROJECT 3) i data ostatniego sprawdzenia cen. */
export const BUDGET_LIMIT_PLN = 2000;
export const PRICES_CHECKED_AT = '2026-11-14';
export const EXPECTED_POOL_SIZE = 10;
export const CRITERIA_COUNT = 14;

export const CI_PIPELINE = [
  { id: 'checkout', label: 'checkout', detail: 'actions/checkout@v4' },
  { id: 'node', label: 'setup-node', detail: 'Node 22 · cache npm' },
  { id: 'install', label: 'npm ci', detail: 'wersje przypięte' },
  { id: 'lint', label: 'lint', detail: 'ESLint 9' },
  { id: 'typecheck', label: 'typecheck', detail: 'tsc --noEmit strict' },
  { id: 'test', label: 'test', detail: 'Vitest + Testing Library' },
  { id: 'validate', label: 'validate-data', detail: 'schemat phones.json' },
  { id: 'build', label: 'build', detail: 'Vite 7 · dist/' },
  { id: 'deploy', label: 'deploy-pages', detail: 'GitHub Pages' },
] as const;

export const ACCEPTANCE_TESTS = [
  {
    id: 'E1-A1',
    text: 'npm run build kończy się bez błędów i ostrzeżeń typów.',
  },
  {
    id: 'E1-A2',
    text: 'Otwarcie #/history i odświeżenie strony pokazuje ekran historii, nie 404.',
  },
  {
    id: 'E1-A3',
    text: 'Wypchnięcie zmiany do main przechodzi workflow i publikuje stronę na Pages.',
  },
  {
    id: 'E1-A4',
    text: 'Cena 2100 zł w phones.json kończy validate-data błędem.',
  },
  {
    id: 'E1-A5',
    text: 'Wersje React, TypeScript, Vite i Tailwind są przypięte dokładnie (bez ^ i ~).',
  },
] as const;

/** Etapy z ROADMAP.md — użyte w stopce jako pasek postępu projektu. */
export const ROADMAP_STAGES: { id: number; name: string; done: boolean; active: boolean }[] = [
  { id: 0, name: 'Dane telefonów i specyfikacja rankingu', done: true, active: false },
  { id: 1, name: 'Szkielet projektu i deploy', done: true, active: false },
  { id: 2, name: 'Silnik rankingu', done: true, active: false },
  { id: 3, name: 'Sesje i zapis w przeglądarce', done: true, active: false },
  { id: 4, name: 'Tryb quiz', done: true, active: false },
  { id: 5, name: 'Tryb suwaków i hybryda', done: true, active: false },
  { id: 6, name: 'Ranking, anonimowe karty, wybór', done: true, active: false },
  { id: 7, name: 'Historia sesji i wznawianie', done: true, active: false },
  { id: 8, name: 'Motywy, mobile, dostępność', done: false, active: false },
  { id: 9, name: 'Pełny ranking, szlify i wydanie', done: false, active: false },
];

/** Stałe silnika rankingu (etap 2) — QUIZ-SPEC 2.6, trzymane w `lib/scoringConfig.ts`. */
export const ENGINE_FACTS = [
  { label: 'BLEND', value: '0,5', note: 'normalizacja min-max × ocena surowa' },
  { label: 'Ważności G1', value: '5 / 4 / 3', note: 'trzy najważniejsze grupy' },
  { label: 'Waga domyślna', value: '2', note: 'start neutralny w skali 0-5' },
  { label: 'Próg remisu', value: '2 pkt', note: '„praktyczny remis” na karcie' },
] as const;

export const ENGINE_STATUS = [
  'Czysta logika w src/lib: weights, pool, scoring, anonymize, matchDisplay — bez Reacta.',
  'Persony z QUIZ-SPEC 9: żona #1 69 pkt, aparat i bateria rozróżnialne (78 : 75 na zdjęciach w dzień).',
  'Budżet 1500 zł daje dwie karty w budżecie i jedną „Powyżej budżetu o 460 zł”.',
  'Reguły ocen w src/data/scoringRules.ts; spójność danych z regułami pilnuje test.',
  'Test wycieku: karta nie zawiera nazwy, marki, modelu, chipa ani nazwy sklepu.',
] as const;

/** Stan roadmapy dla stopki: ile etapów 1-9 zrobione i który jest następny. */
export function roadmapStatus(stages: readonly { id: number; done: boolean }[] = ROADMAP_STAGES): {
  done: number;
  total: number;
  next: number;
  /** Etap 0 (dane) jest poza numeracją etapów 1-9 — raportujemy go osobno. */
  dataStageDone: boolean;
} {
  const delivery = stages.filter((stage) => stage.id >= 1);
  const done = delivery.filter((stage) => stage.done).length;
  const nextStage = delivery.find((stage) => !stage.done);
  return {
    done,
    total: delivery.length,
    next: nextStage ? nextStage.id : delivery.length,
    dataStageDone: stages.some((stage) => stage.id === 0 && stage.done),
  };
}

export const STORAGE_STATUS = [
  'Zapis z opóźnieniem 300 ms, natychmiastowy przy chowaniu karty i przy pagehide.',
  'Migracje schematu i kopia uszkodzonych danych pod kluczem zapasowym.',
  'Synchronizacja kart zdarzeniem storage — ostatni zapis wygrywa.',
  'Snapshot rankingu z wersją danych: wynik w historii nie zmienia się po aktualizacji cen.',
] as const;

export const QUIZ_FACTS = [
  {
    label: 'pytania',
    value: String(activeQuestions(PHONES).length),
    note: 'bloki A-F + krok G1',
  },
  { label: 'bloki', value: '6', note: 'bateria, aparat, pamięć, codzienność, ekran, budżet' },
  { label: 'krótki quiz', value: String(SHORT_QUIZ_IDS.length), note: 'podstawa hybrydy (etap 5)' },
  { label: 'auto-przejście', value: '250 ms', note: 'zapis natychmiast, debounce 300 ms' },
] as const;

export const QUIZ_STATUS = [
  'Odpowiedź od razu przelicza wagi, filtry i snapshot rankingu w sesji.',
  'Wznowienie wraca na pierwsze pytanie bez odpowiedzi — także po odświeżeniu strony.',
  'Krok G1 z numeracją 1-3; pominięcie zostawia ważności grup ze wzoru 0,5 + 0,4 × średnia.',
  'Podsumowanie pokazuje ważności, filtry i liczbę pasujących telefonów przed przejściem do kart.',
] as const;

export const SLIDERS_FACTS = [
  { label: 'suwaki grup', value: '6', note: 'skala 0-5, krok 0,1' },
  { label: 'kryteria', value: '14', note: 'udziały wewnątrz grupy' },
  { label: 'filtry twarde', value: '3', note: 'budżet · pamięć · microSD' },
  { label: 'tryby wyboru', value: '3 z 3', note: 'quiz, suwaki, hybryda' },
] as const;

export const SLIDERS_STATUS = [
  'Suwak grupy ustawia ważność G_g, nie średnią kryteriów — znacznik na torze pokazuje wartość wyliczoną z odpowiedzi.',
  'Licznik „Pasuje X z 10 telefonów” w aria-live reaguje na każdą zmianę filtrów.',
  'Hybryda: krótki quiz (7 pytań) → dostrojenie z plakietką i przyciskiem „Przywróć wyliczone”.',
  'Wszystkie trzy tryby kończą się tym samym kształtem sesji: weights, groupImportance, filters, ranking.',
] as const;

export const CARDS_FACTS = [
  { label: 'propozycje', value: '3', note: '1 kolumna, 3 od 1024 px' },
  { label: 'cechy na karcie', value: '6', note: 'stała kolejność, ikony' },
  { label: 'kryteria w szczegółach', value: '14', note: 'paski 0-100 + pewność' },
  { label: 'wybory w sesji', value: 'n / m', note: 'plakietki „Wybór 1/2”' },
] as const;

export const CARDS_STATUS = [
  'Przed wyborem w DOM, atrybutach i adresie nie ma nazwy, marki ani sklepu — pilnuje test wycieku.',
  'Potwierdzenie w oknie u dołu: pułapka fokusu, zamknięcie klawiszem Esc, fokus wraca na kartę.',
  'Każdy wybór zostaje w sesji: po odświeżeniu karty są odsłonięte z tymi samymi numerami.',
  'W ciemnym motywie szczegóły (oceny i pełne dane) są widoczne od razu, bez rozwijania.',
] as const;

export const HISTORY_FACTS = [
  { label: 'limit historii', value: '50', note: 'najnowsze sesje' },
  { label: 'kopia zapasowa', value: 'JSON', note: 'eksport i import' },
  { label: 'link do wznowienia', value: '#/r/…', note: 'base64url, bez wyborów' },
  { label: 'podgląd sesji', value: 'snapshot', note: 'dane z dnia zapisu' },
] as const;

export const HISTORY_STATUS = [
  'Lista od najnowszej z osią czasu: tryb, status, postęp quizu i wybrane telefony z miejscem w rankingu.',
  'Wznów otwiera pierwsze pytanie bez odpowiedzi, Podgląd — karty ze snapshotu, nie nowy ranking.',
  'Usuwanie z potwierdzeniem; eksport i import scalają bez duplikatów (ten sam id wygrywa nowszą wersją).',
  'Link do wznowienia przenosi odpowiedzi i trójkę G1 na drugie urządzenie — bez wyborów, żeby nie odkrywać nazw.',
] as const;

export const CONSOLE_COMMANDS = [
  { cmd: 'npm run dev', what: 'lokalny serwer Vite' },
  { cmd: 'npm run lint', what: 'ESLint' },
  { cmd: 'npm run typecheck', what: 'TypeScript strict' },
  { cmd: 'npm test', what: 'Vitest + Testing Library' },
  { cmd: 'npm run validate-data', what: 'walidacja phones.json' },
  { cmd: 'npm run build', what: 'build produkcyjny do dist/' },
] as const;

interface PoolMeta {
  schemaVersion?: number;
  currency?: string;
  budgetMaxPln?: number;
  generatedOn: string | null;
  rules?: string[];
  scoresNote?: string;
  note?: string;
}

interface PoolRecord {
  id: string;
  status?: string;
  price?: { pln?: number; checkedAt?: string };
  variant?: { storageGb?: number };
}

const meta = (phonesData as { _meta?: PoolMeta })._meta;
const records = ((phonesData as { phones?: PoolRecord[] }).phones ?? []) as PoolRecord[];
const prices = records
  .map((record) => record.price?.pln)
  .filter((value): value is number => typeof value === 'number');
const unconfirmed = records.filter((record) => record.status !== 'ok').length;

export const pool = {
  /** Ile rekordów jest w pliku danych. */
  count: records.length,
  expected: EXPECTED_POOL_SIZE,
  budgetLimit: BUDGET_LIMIT_PLN,
  checkedAt: meta?.generatedOn ?? PRICES_CHECKED_AT,
  schemaVersion: meta?.schemaVersion ?? null,
  currency: meta?.currency ?? 'PLN',
  /** Rekordy ze statusem innym niż `ok` (np. `needs_confirmation`). */
  unconfirmed,
  statusNote:
    records.length === 0
      ? 'brak danych — etap 0'
      : unconfirmed > 0
        ? `${unconfirmed} rekord do potwierdzenia`
        : 'dane zweryfikowane',
  priceRange:
    prices.length > 0
      ? `${Math.min(...prices)}-${Math.max(...prices)} zł`
      : 'brak danych',
  metaNote: meta?.note ?? null,
  generatedOn: meta?.generatedOn ?? null,
};

/** Liczba dni od daty sprawdzenia cen — próg ostrzeżenia to 30 dni (E1-11). */
export function daysSincePriceCheck(now = new Date()): number {
  const checked = new Date(`${PRICES_CHECKED_AT}T00:00:00.000Z`);
  if (Number.isNaN(checked.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - checked.getTime()) / 86_400_000));
}

/** Najstarsza data sprawdzenia ceny w puli i czy przekracza próg 30 dni (E6-09). */
export function priceFreshness(
  checkedDates: readonly string[],
  now: Date = new Date(),
  thresholdDays = 30,
): { oldest: string | null; days: number; stale: boolean } {
  const valid = checkedDates
    .map((iso) => ({ iso, time: new Date(`${iso}T00:00:00.000Z`).getTime() }))
    .filter((entry) => Number.isFinite(entry.time))
    .sort((a, b) => a.time - b.time);

  const oldest = valid[0];
  if (!oldest) return { oldest: null, days: 0, stale: false };

  const days = Math.max(0, Math.floor((now.getTime() - oldest.time) / 86_400_000));
  return { oldest: oldest.iso, days, stale: days > thresholdDays };
}

export function formatPln(value: number): string {
  return `${value.toLocaleString('pl-PL')} zł`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}
