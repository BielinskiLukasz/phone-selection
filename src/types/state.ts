import type {
  Answers,
  ExclusionReason,
  Filters,
  GroupId,
  GroupImportance,
  TopThreeAnswer,
  Weights,
} from './ranking';

/**
 * Stan aplikacji i model sesji (E3-01, E11-01) — PROJECT 9, QUIZ-SPEC 7, UI-SPEC 10.
 * Wszystko, co trwałe, żyje w `localStorage` pod kluczem `wybor-telefonu:v1`.
 */

export type Mode = 'quiz' | 'sliders' | 'hybrid';
export type SessionStatus = 'in_progress' | 'completed';
export type ExclusionsStep = 'pending' | 'done';
export type Theme = 'light' | 'dark';

/** Kolejność w tablicy = numer wyboru („Wybór 1/2”, „Wybór 2/2”). */
export interface Pick {
  phoneId: string;
  at: string;
}

export interface RankingSnapshotEntry {
  phoneId: string;
  place: number;
  score: number;
  matchPercent: number;
  inBudget: boolean;
  overBudgetBy: number | null;
  practicalTieWith: string | null;
  /** GroupScore dla sześciu grup — mini-paski w pełnym rankingu (UI-SPEC 3.6). */
  groupScores?: Record<GroupId, number>;
  /** Powód wykluczenia w chwili zapisu snapshotu (etap 11). */
  excluded?: ExclusionReason;
}

/**
 * Wynik rankingu z momentu liczenia (PROJECT 9: przeglądany po tygodniu nie zmieni się,
 * gdy zaktualizujemy dane telefonów).
 */
export interface RankingSnapshot {
  computedAt: string;
  /** `_meta.generatedOn` z `phones.json` użytego do liczenia. */
  dataVersion: string | null;
  poolSize: number;
  inBudgetCount: number;
  /** Ile telefonów z puli pominięto na kartach z powodu wykluczeń (etap 11). */
  excludedCount?: number;
  bestScore: number | null;
  weights: Weights;
  groupImportance: GroupImportance;
  filters: Filters;
  entries: RankingSnapshotEntry[];
  /** phoneId trzech kart (wśród niewykluczonych), w kolejności wyświetlania. */
  cards: string[];
}

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: Mode;
  status: SessionStatus;
  /** Opcjonalny krok wykluczeń na starcie: `pending` przed Pomiń/Dalej, potem `done` (E11-01/06). */
  exclusionsStep: ExclusionsStep;
  answers: Answers;
  topThree: TopThreeAnswer | null;
  weights: Weights;
  groupImportance: GroupImportance;
  filters: Filters;
  ranking: RankingSnapshot | null;
  picks: Pick[];
  /** Ręczna korekta suwakami w hybrydzie nadpisuje wartości z quizu (QUIZ-SPEC 7). */
  manualOverride: boolean;
}

/** Komunikaty stanów krańcowych (UI-SPEC 9 i 10). */
export type NoticeCode =
  | 'storage-unavailable'
  | 'corrupted-data'
  | 'quota-exceeded'
  | 'sessions-trimmed';

export interface ImportSummary {
  added: number;
  updated: number;
  duplicates: number;
  at: string;
}

export interface AppState {
  schemaVersion: number;
  sessions: Session[];
  activeSessionId: string | null;
  theme: Theme;
  /** Wynik ostatniego importu historii (E7-07); nie jest zapisywany do magazynu. */
  lastImport?: ImportSummary | null;
  /** Komunikaty do pokazania; nie są zapisywane do magazynu. */
  notices: NoticeCode[];
}

export interface LoadResult {
  state: AppState;
  /** false = tryb awaryjny w pamięci (brak albo błąd `localStorage`). */
  persistent: boolean;
  notices: NoticeCode[];
  /** Klucz, pod którym leży kopia uszkodzonych danych. */
  backupKey: string | null;
}

export const MODE_LABEL: Record<Mode, string> = {
  quiz: 'Quiz',
  sliders: 'Suwaki',
  hybrid: 'Quiz + suwaki',
};

/** Ekran sesji pasujący do trybu — tam prowadzi „Wznów”. */
export const MODE_ENTRY_VIEW: Record<Mode, 'quiz' | 'sliders' | 'tune'> = {
  quiz: 'quiz',
  sliders: 'sliders',
  hybrid: 'quiz',
};

export const GROUP_ORDER: readonly GroupId[] = [
  'battery',
  'camera',
  'storage',
  'longevity',
  'smooth',
  'size',
  'price',
];
