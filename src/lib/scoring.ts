import { GROUPS } from '@/data/criteria';
import type {
  Answers,
  CriterionId,
  Filters,
  GroupId,
  Phone,
  RankInput,
  RankResult,
  RankedPhone,
  TopThreeAnswer,
  Weights,
} from '@/types';
import { exclusionReason, selectCardsFromFullRanking } from './exclusions';
import { buildPool, inBudget } from './pool';
import { clamp, criterionShares, deriveFromAnswers, round } from './weights';
import {
  BLEND,
  BUDGET_LIMIT,
  CARD_COUNT,
  DEFAULT_BUDGET,
  NEUTRAL_SCORE,
  TIE_THRESHOLD,
  VALUE_FLOOR,
} from './scoringConfig';

/**
 * Silnik rankingu (E2-07) — czysta funkcja, bez Reacta i bez DOM.
 * QUIZ-SPEC 2.3-2.5, PROJECT 7.3.
 */

export interface ScoreRange {
  min: number;
  max: number;
}

export type ScoreRanges = Record<CriterionId, ScoreRange>;

/** `value` liczone z ceny i budżetu sesji, obcięte do 0-100 (PROJECT 7.3). */
export function valueScore(pricePln: number, budgetMax: number): number {
  const denominator = budgetMax - VALUE_FLOOR;
  if (!Number.isFinite(pricePln) || !Number.isFinite(denominator) || denominator <= 0) {
    return NEUTRAL_SCORE;
  }
  return clamp(Math.round(100 * (1 - (pricePln - VALUE_FLOOR) / denominator)), 0, 100);
}

/** Ocena kryterium: `value` z ceny, braki danych jako wartość neutralna 50. */
export function rawScore(phone: Phone, id: CriterionId, budgetMax: number): number {
  if (id === 'value') return valueScore(phone.price.pln, budgetMax);
  const score = phone.scores[id];
  return typeof score === 'number' && Number.isFinite(score) ? clamp(score, 0, 100) : NEUTRAL_SCORE;
}

/** Zakresy min-max na puli kandydatów (QUIZ-SPEC 2.3). */
export function scoreRanges(pool: readonly Phone[], budgetMax: number): ScoreRanges {
  const ranges = {} as ScoreRanges;

  for (const group of GROUPS) {
    for (const id of group.criteria) {
      const values = pool.map((phone) => rawScore(phone, id, budgetMax));
      ranges[id] = {
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 100,
      };
    }
  }

  return ranges;
}

/** Normalizacja min-max; przy max = min zwracamy 50 (QUIZ-SPEC 2.3). */
export function normalize(score: number, range: ScoreRange): number {
  const span = range.max - range.min;
  if (span <= 0) return NEUTRAL_SCORE;
  return clamp((100 * (score - range.min)) / span, 0, 100);
}

/** Zmieszanie oceny znormalizowanej z surową: `BLEND × n + (1 − BLEND) × s`. */
export function blend(score: number, range: ScoreRange, factor: number = BLEND): number {
  const normalized = normalize(score, range);
  return clamp(factor * normalized + (1 - factor) * score, 0, 100);
}

/** GroupScore_g = Σ_c (share_c × s'_c) dla kryteriów grupy g. */
export function groupScores(
  phone: Phone,
  ranges: ScoreRanges,
  weights: Weights,
  budgetMax: number,
  blendFactor: number = BLEND,
): { scores: Record<GroupId, number>; normalized: Partial<Record<CriterionId, number>> } {
  const scores = {} as Record<GroupId, number>;
  const normalized: Partial<Record<CriterionId, number>> = {};

  for (const group of GROUPS) {
    const shares = criterionShares(weights, group.criteria);
    let total = 0;

    for (const id of group.criteria) {
      const raw = rawScore(phone, id, budgetMax);
      const blended = blend(raw, ranges[id] ?? { min: 0, max: 100 }, blendFactor);
      normalized[id] = round(blended, 2);
      total += (shares[id] ?? 0) * blended;
    }

    scores[group.id] = round(total, 2);
  }

  return { scores, normalized };
}

/** S = Σ_g (G_g × GroupScore_g) / Σ_g G_g, wynik 0-100. */
export function totalScore(
  scores: Record<GroupId, number>,
  importance: Record<GroupId, number>,
): number {
  let weighted = 0;
  let sum = 0;

  for (const group of GROUPS) {
    const weight = Math.max(0, importance[group.id] ?? 0);
    weighted += weight * (scores[group.id] ?? 0);
    sum += weight;
  }

  if (sum <= 0) {
    const values = GROUPS.map((group) => scores[group.id] ?? 0);
    return round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length), 2);
  }

  return round(weighted / sum, 2);
}

function sortKey(phone: Phone): number {
  return phone.price.pln;
}

function byRank(a: RankedPhone, b: RankedPhone, phones: Map<string, Phone>): number {
  if (b.score !== a.score) return b.score - a.score;
  /* Remis: niższa cena, potem wyższa ocena `battery` (PROJECT 7.3). */
  const phoneA = phones.get(a.phoneId);
  const phoneB = phones.get(b.phoneId);
  const priceA = phoneA ? sortKey(phoneA) : Number.POSITIVE_INFINITY;
  const priceB = phoneB ? sortKey(phoneB) : Number.POSITIVE_INFINITY;
  if (priceA !== priceB) return priceA - priceB;
  const batteryA = phoneA?.scores.battery ?? 0;
  const batteryB = phoneB?.scores.battery ?? 0;
  return (batteryB ?? 0) - (batteryA ?? 0);
}

/** FP3-04: kopia telefonu z premią za slot microSD w kryterium `storage` (sesyjna, nie zapisywana w danych). */
export const MICROSD_PREFERENCE_BONUS = 15;
export function withMicroSdBonus(phone: Phone): Phone {
  if (phone.specs.microSd !== true) return phone;
  const storage = phone.scores.storage;
  if (typeof storage !== 'number') return phone;
  return { ...phone, scores: { ...phone.scores, storage: clamp(storage + MICROSD_PREFERENCE_BONUS, 0, 100) } };
}

/** Pełne liczenie rankingu: pula → normalizacja → S → kolejność → karty. */
export function rank(input: RankInput): RankResult {
  const { phones, weights, groupImportance, filters } = input;
  const budgetMax = clamp(filters.budgetMax ?? DEFAULT_BUDGET, 0, BUDGET_LIMIT);
  const pool = buildPool(phones, { ...filters, budgetMax });

  if (pool.length === 0) {
    return {
      poolSize: 0,
      inBudgetCount: 0,
      excludedCount: 0,
      fullRanking: [],
      ranked: [],
      cards: [],
      bestScore: null,
      empty: true,
    };
  }

  /* E11-04 (decyzja 3): normalizacja i S liczone na pełnej puli — wykluczenia nie zmieniają ocen. */
  /* FP3-04: preferencja microSD (C3) = +15 pkt `storage` dla telefonów ze slotem — w tej sesji, nie w danych. */
  const scoredPool = filters.preferMicroSd ? pool.map((phone) => withMicroSdBonus(phone)) : pool;
  const ranges = scoreRanges(scoredPool, budgetMax);
  const blendFactor = typeof input.blend === 'number' ? input.blend : BLEND;
  const byId = new Map(scoredPool.map((phone) => [phone.id, phone]));
  const entries: RankedPhone[] = scoredPool.map((phone) => {
    const { scores, normalized } = groupScores(phone, ranges, weights, budgetMax, blendFactor);
    const score = totalScore(scores, groupImportance);
    const within = inBudget(phone, budgetMax);
    return {
      phoneId: phone.id,
      place: 0,
      score,
      matchPercent: Math.round(score),
      groupScores: scores,
      normalized,
      inBudget: within,
      overBudgetBy: within ? null : Math.round(phone.price.pln - budgetMax),
      practicalTieWith: null,
      excluded: exclusionReason(phone, filters),
    };
  });

  entries.sort((a, b) => byRank(a, b, byId));
  entries.forEach((entry, index) => {
    entry.place = index + 1;
  });

  /* „Praktyczny remis” w pełnym rankingu: różnica mniejsza niż próg wobec sąsiada w kolejności. */
  entries.forEach((entry, index) => {
    const previous = entries[index - 1];
    const next = entries[index + 1];
    if (previous && previous.score - entry.score < TIE_THRESHOLD) {
      entry.practicalTieWith = previous.phoneId;
    } else if (next && entry.score - next.score < TIE_THRESHOLD) {
      entry.practicalTieWith = next.phoneId;
    }
  });

  /* E11-04: karty to trzy najlepsze niewykluczone, z uzupełnieniem ponad budżetem tylko z niewykluczonych. */
  const { cards, inBudgetCount, excludedCount } = selectCardsFromFullRanking(entries, CARD_COUNT, {
    budgetMax,
    budgetStretch: filters.budgetStretch ?? null,
    priceOf: (phoneId) => byId.get(phoneId)?.price.pln ?? null,
  });

  return {
    poolSize: pool.length,
    inBudgetCount,
    excludedCount,
    fullRanking: entries,
    ranked: entries,
    cards,
    bestScore: entries[0]?.score ?? null,
    empty: false,
  };
}

/** Wygoda dla testów i przyszłych ekranów: odpowiedzi → wagi → ranking. */
export function rankFromAnswers(
  phones: readonly Phone[],
  answers: Answers,
  topThree?: TopThreeAnswer | null,
  filtersOverride?: Partial<Filters>,
): RankResult {
  const derived = deriveFromAnswers(answers, topThree);
  const filters: Filters = { ...derived.filters, ...filtersOverride };
  return rank({
    phones: phones as Phone[],
    weights: derived.weights,
    groupImportance: derived.groupImportance,
    filters,
  });
}
