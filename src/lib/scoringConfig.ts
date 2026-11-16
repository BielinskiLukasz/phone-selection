/**
 * Stałe silnika rankingu (E2-04) — wszystko, co „do kalibracji”, w jednym miejscu.
 * QUIZ-SPEC 2.6 i PROJECT 7.3.
 */

/** 0 = surowe oceny, 1 = pełna normalizacja min-max. */
export const BLEND = 0.5;

/** Ważności grup wybranych w kroku G1, wg miejsca. */
export const TOP_THREE_IMPORTANCE: readonly [number, number, number] = [5, 4, 3];

/**
 * Jak krok G1 łączy się z odpowiedziami (QUIZ-SPEC 2.2):
 *
 * - `band` (domyślny): miejsce w trójce daje pasmo 5 / 4 / 3, a odpowiedzi **korygują** je
 *   o `TOP_THREE_EVIDENCE_FACTOR × (wyliczone − 1,3)`, maksymalnie ±`TOP_THREE_EVIDENCE_MAX`.
 *   Pasma się nie nakładają (4,4-5,6 / 3,4-4,6 / 2,4-3,6), więc kolejność wyboru jest
 *   zachowana zawsze — a widać w niej też siłę odpowiedzi.
 * - `additive`: ważneść wyliczona z odpowiedzi + bonus `TOP_THREE_BONUS` (1,5 / 1,0 / 0,5).
 *   Prostszy do wyjaśnienia, ale pozwala odpowiedziom odwrócić świadomy wybór: grupa z większą
 *   liczbą pytań (Aparat: 6) zbiera więcej „dowodów” niż grupa z dwoma (Bateria).
 */
export type TopThreeMode = 'band' | 'additive';
export const TOP_THREE_MODE: TopThreeMode = 'band';
export const TOP_THREE_BONUS: readonly [number, number, number] = [1.5, 1.0, 0.5];
export const TOP_THREE_EVIDENCE_FACTOR = 0.3;
export const TOP_THREE_EVIDENCE_MAX = 0.6;
/** Ważność grupy bez odpowiedzi (0,5 + 0,4 × 2) — punkt zerowy korekty. */
export const TOP_THREE_EVIDENCE_BASELINE = 1.3;
export const IMPORTANCE_MAX = 5;

/** Grupa poza trójką: GROUP_BASE + GROUP_FACTOR × średnia wag odpowiedzianych kryteriów. */
export const GROUP_BASE = 0.5;
export const GROUP_FACTOR = 0.4;

/** Waga kryterium bez odpowiedzi (start neutralny). */
export const DEFAULT_WEIGHT = 2;

/** Różnica mniejsza niż próg to „praktyczny remis”. */
export const TIE_THRESHOLD = 2;

/** `value` = 100 × (1 − (cena − VALUE_FLOOR) / (budżet − VALUE_FLOOR)). */
export const VALUE_FLOOR = 1200;

/** Twardy limit strony i domyślny budżet sesji. */
export const BUDGET_LIMIT = 2000;
export const DEFAULT_BUDGET = 2000;

/** Wartość neutralna wpisywana z braku danych (PROJECT 7.5). */
export const NEUTRAL_SCORE = 50;

/** Liczba kart na ekranie wyboru. */
export const CARD_COUNT = 3;

/** Progi opisu dopasowania (QUIZ-SPEC 10.1 — decyzja etapu 2). */
export const MATCH_LABEL_THRESHOLDS = {
  veryGood: 66,
  good: 57,
} as const;

export const MATCH_LABELS = {
  veryGood: 'bardzo dobre',
  good: 'dobre',
  average: 'przeciętne',
} as const;
