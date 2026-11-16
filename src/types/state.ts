import type {
  Answers,
  Filters,
  GroupId,
  GroupImportance,
  TopThreeAnswer,
  Weights,
} from './ranking';

/**
 * Stan aplikacji i model sesji (E3-01) — PROJECT 9, QUIZ-SPEC 7, UI-SPEC 10.
 * Wszystko, co trwałe, żyje w `localStorage` pod kluczem `wybor-telefonu:v1`.
 */

export type Mode = 'quiz' | 'sliders' | 'hybrid';
export type SessionStatus = 'in_progress' | 'completed';
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
  bestScore: number | null;
  weights: Weights;
  groupImportance: GroupImportance;
  filters: Filters;
  entries: RankingSnapshotEntry[];
  /** phoneId trzech kart, w kolejności wyświetlania. */
  cards: string[];
}

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: Mode;
  status: SessionStatus;
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

export interface AppState {
  schemaVersion: number;
  sessions: Session[];
  activeSessionId: string | null;
  theme: Theme;
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
  'price',
];
