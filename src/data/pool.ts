import phonesData from './phones.json';

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
  { id: 0, name: 'Dane telefonów i specyfikacja rankingu', done: false, active: true },
  { id: 1, name: 'Szkielet projektu i deploy', done: true, active: false },
  { id: 2, name: 'Silnik rankingu', done: false, active: false },
  { id: 3, name: 'Sesje i zapis w przeglądarce', done: false, active: false },
  { id: 4, name: 'Tryb quiz', done: false, active: false },
  { id: 5, name: 'Tryb suwaków i hybryda', done: false, active: false },
  { id: 6, name: 'Ranking, anonimowe karty, wybór', done: false, active: false },
  { id: 7, name: 'Historia sesji i wznawianie', done: false, active: false },
  { id: 8, name: 'Motywy, mobile, dostępność', done: false, active: false },
  { id: 9, name: 'Pełny ranking, szlify i wydanie', done: false, active: false },
];

export const CONSOLE_COMMANDS = [
  { cmd: 'npm run dev', what: 'lokalny serwer Vite' },
  { cmd: 'npm run lint', what: 'ESLint' },
  { cmd: 'npm run typecheck', what: 'TypeScript strict' },
  { cmd: 'npm test', what: 'Vitest + Testing Library' },
  { cmd: 'npm run validate-data', what: 'walidacja phones.json' },
  { cmd: 'npm run build', what: 'build produkcyjny do dist/' },
] as const;

interface PoolMeta {
  generatedOn: string | null;
  note?: string;
}

const meta = (phonesData as { _meta?: PoolMeta })._meta;

export const pool = {
  /** Ile rekordów jest naprawdę w pliku danych (etap 0 w toku). */
  count: Array.isArray((phonesData as { phones?: unknown[] }).phones)
    ? ((phonesData as { phones: unknown[] }).phones.length as number)
    : 0,
  expected: EXPECTED_POOL_SIZE,
  budgetLimit: BUDGET_LIMIT_PLN,
  checkedAt: PRICES_CHECKED_AT,
  metaNote: meta?.note ?? null,
  generatedOn: meta?.generatedOn ?? null,
};

/** Liczba dni od daty sprawdzenia cen — próg ostrzeżenia to 30 dni (E1-11). */
export function daysSincePriceCheck(now = new Date()): number {
  const checked = new Date(`${PRICES_CHECKED_AT}T00:00:00.000Z`);
  if (Number.isNaN(checked.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - checked.getTime()) / 86_400_000));
}

export function formatPln(value: number): string {
  return `${value.toLocaleString('pl-PL')} zł`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}
