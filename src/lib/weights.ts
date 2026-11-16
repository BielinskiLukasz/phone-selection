import { GROUPS, criterion } from '@/data/criteria';
import { QUESTIONS, findOption } from '@/data/questions';
import type {
  Answers,
  CriterionId,
  CriterionShares,
  Filters,
  GroupId,
  GroupImportance,
  QuizQuestion,
  TopThreeAnswer,
  Weights,
} from '@/types';
const ALL_CRITERIA: readonly CriterionId[] = GROUPS.flatMap((group) => group.criteria);

/** Trójka najważniejszych albo surowa lista grup — obie formy są poprawne. */
export function normalizeTopThree(
  value: TopThreeAnswer | readonly GroupId[] | null | undefined,
): TopThreeAnswer | null {
  if (!value) return null;
  const picks: readonly GroupId[] = 'picks' in value ? value.picks : value;
  if (!Array.isArray(picks) || picks.length === 0) return null;
  const unique = picks.filter(
    (id, index) => picks.indexOf(id) === index,
  ) as [GroupId, GroupId, GroupId];
  return { picks: unique };
}

import {
  BUDGET_LIMIT,
  DEFAULT_BUDGET,
  DEFAULT_WEIGHT,
  GROUP_BASE,
  GROUP_FACTOR,
  IMPORTANCE_MAX,
  TOP_THREE_EVIDENCE_BASELINE,
  TOP_THREE_EVIDENCE_FACTOR,
  TOP_THREE_EVIDENCE_MAX,
  TOP_THREE_BONUS,
  TOP_THREE_IMPORTANCE,
  TOP_THREE_MODE,
  type TopThreeMode,
} from './scoringConfig';

/**
 * Wagi z odpowiedzi (E2-05) — QUIZ-SPEC 2.2.
 * Dwa poziomy: waga kryterium w grupie (`w_c`) i ważność grupy (`G_g`).
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 6): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return DEFAULT_WEIGHT;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Surowe wartości ustawione przez odpowiedzi, z podziałem na kryteria. */
export function answeredCriterionValues(
  answers: Answers,
  questions: readonly QuizQuestion[] = QUESTIONS,
): Map<CriterionId, number[]> {
  const collected = new Map<CriterionId, number[]>();

  for (const question of questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((item) => item.id === optionId) ?? findOption(question.id, optionId);
    if (!option || option.skip === true || !option.sets) continue;

    for (const [key, value] of Object.entries(option.sets)) {
      if (typeof value !== 'number') continue;
      const id = key as CriterionId;
      const list = collected.get(id) ?? [];
      list.push(clamp(value, 0, 5));
      collected.set(id, list);
    }
  }

  return collected;
}

/** Kryteria, których waga pochodzi z odpowiedzi (reszta zostaje neutralna). */
export function answeredCriteria(
  answers: Answers,
  questions: readonly QuizQuestion[] = QUESTIONS,
): Set<CriterionId> {
  return new Set(answeredCriterionValues(answers, questions).keys());
}

/** Waga kryterium wewnątrz grupy: średnia z odpowiedzi, bez odpowiedzi — 2. */
export function answersToCriterionWeights(
  answers: Answers,
  questions: readonly QuizQuestion[] = QUESTIONS,
): Weights {
  const collected = answeredCriterionValues(answers, questions);
  const weights = {} as Weights;

  for (const { id } of criterionIds()) {
    const values = collected.get(id);
    weights[id] = round(values && values.length > 0 ? average(values) : DEFAULT_WEIGHT);
  }

  return weights;
}

function criterionIds(): { id: CriterionId }[] {
  return GROUPS.flatMap((group) => group.criteria.map((id) => ({ id })));
}

/**
 * Udziały kryteriów w grupie: `share_c = w_c / Σ w_c`.
 * Przy samych zerach udziały są równe (QUIZ-SPEC 2.2).
 */
/** Udziały kryteriów w grupie; bez listy kryteriów liczone dla wszystkich 14. */
export function criterionShares(
  weights: Weights,
  criteria: readonly CriterionId[] = ALL_CRITERIA,
): CriterionShares {
  if (criteria.length === 0) return {};

  const total = criteria.reduce((sum, id) => sum + clamp(weights[id] ?? 0, 0, 5), 0);
  const shares: CriterionShares = {};

  for (const id of criteria) {
    shares[id] = total > 0 ? round((weights[id] ?? 0) / total) : round(1 / criteria.length);
  }

  return shares;
}

/**
 * Ważność grupy: miejsca w trójce dostają 5/4/3, pozostałe
 * `0,5 + 0,4 × średnia wag odpowiedzianych kryteriów` (bez odpowiedzi: 1,3).
 */
/**
 * Ważność grupy z odpowiedzi: `0,5 + 0,4 × średnia wag odpowiedzianych kryteriów`
 * (bez odpowiedzi: średnia = 2, czyli 1,3). Zakres 0,5-2,5.
 */
export function computedGroupImportance(
  weights: Weights,
  groupCriteria: readonly CriterionId[],
  answered: ReadonlySet<CriterionId>,
): number {
  const answeredInGroup = groupCriteria.filter((id) => answered.has(id));
  const source = answeredInGroup.length > 0 ? answeredInGroup : groupCriteria;
  const mean = average(source.map((id) => clamp(weights[id] ?? DEFAULT_WEIGHT, 0, 5)));
  /* Jawne „bez znaczenia” (0) dla całej grupy = ignoruj (PROJECT 7.2). */
  if (answeredInGroup.length > 0 && mean <= 0) return 0;
  return round(clamp(GROUP_BASE + GROUP_FACTOR * mean, GROUP_BASE, 2.5));
}

/**
 * Ważności grup (QUIZ-SPEC 2.2): miejsce w trójce G1 plus sygnał z odpowiedzi.
 * `mode` domyślnie z `TOP_THREE_MODE`; testy przechodzą oba warianty.
 */
export function groupImportance(
  weights: Weights,
  topThree?: TopThreeAnswer | readonly GroupId[] | null,
  answered: ReadonlySet<CriterionId> = new Set(criterionIds().map((item) => item.id)),
  mode: TopThreeMode = TOP_THREE_MODE,
): GroupImportance {
  const importance = {} as GroupImportance;
  const picks = normalizeTopThree(topThree)?.picks ?? null;

  for (const group of GROUPS) {
    const computed = computedGroupImportance(weights, group.criteria, answered);
    const position = picks ? picks.indexOf(group.id) : -1;

    if (position < 0) {
      importance[group.id] = computed;
      continue;
    }

    if (mode === 'additive') {
      const bonus = TOP_THREE_BONUS[position] ?? 0;
      importance[group.id] = round(clamp(computed + bonus, GROUP_BASE, IMPORTANCE_MAX), 2);
      continue;
    }

    /* Pasmo z miejsca w trójce, skorygowane siłą odpowiedzi (bez odwracania kolejności). */
    const pick = TOP_THREE_IMPORTANCE[position] ?? GROUP_BASE;
    const evidence = clamp(
      TOP_THREE_EVIDENCE_FACTOR * (computed - TOP_THREE_EVIDENCE_BASELINE),
      -TOP_THREE_EVIDENCE_MAX,
      TOP_THREE_EVIDENCE_MAX,
    );
    importance[group.id] = round(clamp(pick + evidence, GROUP_BASE, IMPORTANCE_MAX), 2);
  }

  return importance;
}

/** Budżet sesji z odpowiedzi F1 (domyślnie 2000 zł, nigdy powyżej limitu strony). */
export function budgetFromAnswers(
  answers: Answers,
  questions: readonly QuizQuestion[] = QUESTIONS,
): number {
  for (const question of questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((item) => item.id === optionId);
    if (option?.budgetMax) return clamp(option.budgetMax, 0, BUDGET_LIMIT);
  }
  return DEFAULT_BUDGET;
}

/** Filtry twarde z odpowiedzi: budżet (F1) i minimalna pamięć (C2). */
export function filtersFromAnswers(
  answers: Answers,
  questions: readonly QuizQuestion[] = QUESTIONS,
): Filters {
  let minStorageGb: number | null = null;

  for (const question of questions) {
    const optionId = answers[question.id];
    if (!optionId) continue;
    const option = question.options.find((item) => item.id === optionId);
    if (option?.minStorageGb) minStorageGb = option.minStorageGb;
  }

  return { budgetMax: budgetFromAnswers(answers, questions), minStorageGb, requireMicroSd: false };
}

/** Alias nazewniczy używany w testach i w ekranach suwaków. */
export function answersToFilters(
  answers: Answers,
  questions: readonly QuizQuestion[] = QUESTIONS,
): Filters {
  return filtersFromAnswers(answers, questions);
}

/** Komplet wag i filtrów z odpowiedzi — wspólny punkt wyjścia quizu, suwaków i hybrydy. */
export function deriveFromAnswers(
  answers: Answers,
  topThree?: TopThreeAnswer | readonly GroupId[] | null,
  questions: readonly QuizQuestion[] = QUESTIONS,
): { weights: Weights; groupImportance: GroupImportance; filters: Filters } {
  const weights = answersToCriterionWeights(answers, questions);
  return {
    weights,
    groupImportance: groupImportance(weights, topThree, answeredCriteria(answers, questions)),
    filters: filtersFromAnswers(answers, questions),
  };
}

export { clamp, round };
export type { GroupId };
export const criterionLabel = (id: CriterionId): string => criterion(id).label;
