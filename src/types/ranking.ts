import type { CriterionId, GroupId } from './criteria';
import type { Phone } from './phone';

/**
 * Kompatybilność wsteczna: część modułów i testów importuje typy danych z tego pliku.
 * Re-eksport jest jawny, więc barrel `./index` nie dostaje zdublowanych nazw (TS2308).
 */
export type { CriterionId, GroupId, ScoreConfidence } from './criteria';
export type {
  CameraSpecs,
  DisplaySpec,
  Phone,
  PhoneScores,
  PhoneStatus,
  PhonesData,
  Price,
  PriceObservation,
  Reveal,
  ShopLink,
  Specs,
  UpdatesSpec,
  Variant,
} from './phone';

/**
 * Typy silnika rankingu i anonimowej karty (E2-01) — QUIZ-SPEC 3.
 * `Phone`, `CriterionId` i `GroupId` pochodzą z `./phone` i `./criteria`
 * (jedna definicja w projekcie, bez duplikatów w barrelu).
 */

export type BudgetOption = 1500 | 1800 | 2000;
export type QuizBlock = 'battery' | 'camera' | 'storage' | 'everyday' | 'display' | 'budget';

export interface QuizOption {
  id: string;
  label: string;
  /** Wartość 0-5 ustawiana dla kryterium. */
  sets?: Partial<Record<CriterionId, number>>;
  /** Tylko F1. */
  budgetMax?: BudgetOption;
  /** Tylko C2. */
  minStorageGb?: 256;
  /** „Nie wiem / pomiń” — nie wnosi nic do wag. */
  skip?: true;
}

export interface QuizQuestion {
  id: string;
  block: QuizBlock;
  text: string;
  /** „Dlaczego pytamy?” — jedno zdanie (UI-SPEC 3.2). */
  why: string;
  options: QuizOption[];
  /** Pytanie warunkowe: pomijane bez śladu w liczniku. */
  appliesWhen?: (phones: readonly Phone[]) => boolean;
  /** Udział w krótkim quizie trybu hybrydowego (QUIZ-SPEC 5). */
  inShortQuiz?: boolean;
}

/** Kolejność wyboru ma znaczenie: 1., 2. i 3. miejsce (QUIZ-SPEC 4, krok G1). */
export interface TopThreeAnswer {
  picks: [GroupId, GroupId, GroupId];
}

/** questionId -> optionId. */
export type Answers = Record<string, string>;

export interface Filters {
  budgetMax: number;
  minStorageGb?: number | null;
  requireMicroSd?: boolean;
}

/** Waga kryterium wewnątrz grupy, skala 0-5. */
export type Weights = Record<CriterionId, number>;

/** Ważność grupy G_g. */
export type GroupImportance = Record<GroupId, number>;

/** Udziały kryteriów w grupie: Σ = 1. */
export type CriterionShares = Partial<Record<CriterionId, number>>;

export interface RankedPhone {
  phoneId: string;
  /** Miejsce w rankingu całej puli (od 1). */
  place: number;
  /** S: 0-100. */
  score: number;
  matchPercent: number;
  groupScores: Record<GroupId, number>;
  normalized: Partial<Record<CriterionId, number>>;
  inBudget: boolean;
  /** Różnica wobec budżetu sesji, gdy telefon jest za drogi. */
  overBudgetBy: number | null;
  /** Id telefonu, z którym ten wynik to „praktyczny remis”. */
  practicalTieWith: string | null;
}

export interface RankResult {
  poolSize: number;
  inBudgetCount: number;
  /** Cała pula, posortowana. */
  ranked: RankedPhone[];
  /** Trzy karty (mniej, gdy pula jest mniejsza), z uzupełnieniem powyżej budżetu. */
  cards: RankedPhone[];
  /** Najlepszy wynik w puli — do skalowania w szczegółach. */
  bestScore: number | null;
  /** Pula pusta po filtrach. */
  empty: boolean;
}

export interface RankInput {
  phones: readonly Phone[];
  weights: Weights;
  groupImportance: GroupImportance;
  filters: Filters;
}

export type FactKey =
  | 'battery'
  | 'camera'
  | 'storage'
  | 'updates'
  | 'durability'
  | 'displayPerformance';

export interface AnonFact {
  key: FactKey;
  label: string;
  value: string;
  /** Brak danych pokazujemy jako „brak danych”, nigdy jako zero (UI-SPEC 4). */
  missing: boolean;
}

export interface AnonCriterion {
  id: CriterionId;
  groupId: GroupId;
  label: string;
  score: number;
  confidence: import('./criteria').ScoreConfidence;
  basis: string;
  /** Ocena neutralna 50 wpisana z braku danych. */
  estimated: boolean;
}

export interface AnonCard {
  phoneId: string;
  place: number;
  matchPercent: number;
  matchLabel: string;
  /** Przeskalowanie względem najlepszego w puli — pokazywane w szczegółach. */
  matchRescaledPercent: number | null;
  practicalTieWithPlace: number | null;
  pricePln: number;
  priceCheckedAt: string;
  priceNote: string;
  overBudgetBy: number | null;
  storageGb: number;
  hasMicroSd: boolean | null;
  performanceClass: 'basic' | 'medium' | 'high';
  facts: AnonFact[];
  groupScores: Record<GroupId, number>;
  criteria: AnonCriterion[];
}
