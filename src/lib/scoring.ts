import { CRITERION_IDS, GROUP_IDS, GROUPS } from '../data/criteria';
import type { CriterionId } from '../types/criteria';
import type { Phone } from '../types/phone';
import type { GroupScores, RankInput, RankedPhone, RankingResult } from '../types/ranking';
import { toMatchPercent } from './matchDisplay';
import { getCandidatePool } from './pool';
import { BLEND, DEFAULT_BUDGET, PRACTICAL_TIE_THRESHOLD, VALUE_PRICE_FLOOR } from './scoringConfig';
import { answersToCriterionWeights, answersToFilters, criterionShares, groupImportance } from './weights';

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function valueScore(pricePln: number, budgetMax = DEFAULT_BUDGET): number {
  const denominator = Math.max(1, budgetMax - VALUE_PRICE_FLOOR);
  return clamp(100 * (1 - (pricePln - VALUE_PRICE_FLOOR) / denominator));
}

function rawScoresFor(phone: Phone, budgetMax: number): Record<CriterionId, number> {
  return Object.fromEntries(CRITERION_IDS.map((criterion) => [
    criterion,
    criterion === 'value'
      ? valueScore(phone.price.pln, budgetMax)
      : clamp(phone.scores[criterion] ?? 50),
  ])) as Record<CriterionId, number>;
}

interface ScoredCandidate {
  phone: Phone;
  score: number;
  rawScores: Record<CriterionId, number>;
  normalizedScores: Record<CriterionId, number>;
  groupScores: GroupScores;
}

function orderWithPracticalTies(candidates: ScoredCandidate[]): ScoredCandidate[] {
  const byScore = [...candidates].sort((a, b) => b.score - a.score || a.phone.id.localeCompare(b.phone.id));
  const ordered: ScoredCandidate[] = [];

  // Group by the best score in each band so the near-tie rule stays transitive.
  for (let start = 0; start < byScore.length;) {
    const anchor = byScore[start]!;
    let end = start + 1;
    while (end < byScore.length && anchor.score - byScore[end]!.score < PRACTICAL_TIE_THRESHOLD) {
      end += 1;
    }
    ordered.push(...byScore.slice(start, end).sort((a, b) =>
      a.phone.price.pln - b.phone.price.pln ||
      b.rawScores.battery - a.rawScores.battery ||
      b.score - a.score ||
      a.phone.id.localeCompare(b.phone.id),
    ));
    start = end;
  }

  return ordered;
}

function withPositions(candidates: ScoredCandidate[], budgetMax: number): RankedPhone[] {
  return candidates.map((item, index) => {
    const previousTie = candidates.slice(0, index).reverse().find((previous) =>
      Math.abs(previous.score - item.score) < PRACTICAL_TIE_THRESHOLD,
    );
    const previousIndex = previousTie ? candidates.indexOf(previousTie) : -1;
    const overBudgetBy = Math.max(0, item.phone.price.pln - budgetMax);
    return {
      phoneId: item.phone.id,
      position: index + 1,
      score: item.score,
      matchPercent: toMatchPercent(item.score),
      rawScores: item.rawScores,
      normalizedScores: item.normalizedScores,
      groupScores: item.groupScores,
      ...(previousIndex >= 0 ? { tieWith: previousIndex + 1 } : {}),
      ...(overBudgetBy > 0 ? { overBudgetBy } : {}),
    };
  });
}

export function rank(input: RankInput): RankingResult {
  const answers = input.answers ?? {};
  const derivedFilters = answersToFilters(answers);
  const filters = {
    ...derivedFilters,
    ...input.filters,
    budgetMax: input.filters?.budgetMax ?? derivedFilters.budgetMax,
  };
  if (!Number.isFinite(filters.budgetMax) || filters.budgetMax <= 0) {
    filters.budgetMax = DEFAULT_BUDGET;
  }
  const criterionWeights = input.criterionWeights ?? answersToCriterionWeights(answers);
  const groupWeights = input.groupWeights ?? groupImportance(criterionWeights, input.topThree, answers);
  const pool = getCandidatePool(input.phones, filters);

  if (pool.length === 0) {
    return { filters, criterionWeights, groupWeights, ranking: [], cards: [] };
  }

  const raw = pool.map((phone) => ({ phone, scores: rawScoresFor(phone, filters.budgetMax) }));
  const bounds = Object.fromEntries(CRITERION_IDS.map((criterion) => [criterion, {
    min: Math.min(...raw.map((item) => item.scores[criterion])),
    max: Math.max(...raw.map((item) => item.scores[criterion])),
  }])) as Record<CriterionId, { min: number; max: number }>;
  const shares = criterionShares(criterionWeights);
  const importanceTotal = GROUP_IDS.reduce((sum, group) => sum + Math.max(0, groupWeights[group]), 0);

  const scored: ScoredCandidate[] = raw.map(({ phone, scores }) => {
    const normalizedScores = Object.fromEntries(CRITERION_IDS.map((criterion) => {
      const { min, max } = bounds[criterion];
      const normalized = max === min ? 50 : 100 * (scores[criterion] - min) / (max - min);
      return [criterion, BLEND * normalized + (1 - BLEND) * scores[criterion]];
    })) as Record<CriterionId, number>;

    const groupScores = Object.fromEntries(GROUP_IDS.map((group) => [group,
      GROUPS[group].criteria.reduce((sum, criterion) =>
        sum + shares[criterion] * normalizedScores[criterion], 0),
    ])) as GroupScores;

    const score = importanceTotal === 0
      ? GROUP_IDS.reduce((sum, group) => sum + groupScores[group], 0) / GROUP_IDS.length
      : GROUP_IDS.reduce((sum, group) => sum + Math.max(0, groupWeights[group]) * groupScores[group], 0) / importanceTotal;

    return { phone, score, rawScores: scores, normalizedScores, groupScores };
  });

  const ordered = orderWithPracticalTies(scored);
  const ranking = withPositions(ordered, filters.budgetMax);
  const inBudget = ordered.filter((item) => item.phone.price.pln <= filters.budgetMax);
  const aboveBudget = ordered.filter((item) => item.phone.price.pln > filters.budgetMax);
  const chosen = [...inBudget.slice(0, 3), ...aboveBudget.slice(0, Math.max(0, 3 - inBudget.length))];
  const cards = withPositions(chosen, filters.budgetMax);

  return { filters, criterionWeights, groupWeights, ranking, cards };
}