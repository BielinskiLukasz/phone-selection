import { GROUPS, GROUP_IDS, CRITERION_IDS } from '../data/criteria';
import { QUIZ_QUESTIONS } from '../data/questions';
import type { CriterionId, GroupId } from '../types/criteria';
import type { Answers, CriterionWeights, Filters, GroupWeights } from '../types/ranking';
import { DEFAULT_BUDGET, DEFAULT_CRITERION_WEIGHT, OTHER_GROUP_BASE, OTHER_GROUP_FACTOR, TOP_THREE_IMPORTANCE } from './scoringConfig';

function answeredValues(answers: Answers): Partial<Record<CriterionId, number[]>> {
  const values: Partial<Record<CriterionId, number[]>> = {};
  for (const question of QUIZ_QUESTIONS) {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option || option.skip || !option.sets) continue;
    for (const criterion of CRITERION_IDS) {
      const weight = option.sets[criterion];
      if (weight !== undefined && Number.isFinite(weight) && weight >= 0 && weight <= 5) {
        (values[criterion] ??= []).push(weight);
      }
    }
  }
  return values;
}

export function answersToCriterionWeights(answers: Answers): CriterionWeights {
  const values = answeredValues(answers);
  return Object.fromEntries(CRITERION_IDS.map((criterion) => {
    const choices = values[criterion];
    return [criterion, choices?.length
      ? choices.reduce((sum, value) => sum + value, 0) / choices.length
      : DEFAULT_CRITERION_WEIGHT];
  })) as CriterionWeights;
}

export function groupImportance(
  weights: CriterionWeights,
  topThree: readonly GroupId[] = [],
  answers: Answers = {},
): GroupWeights {
  const answered = answeredValues(answers);
  return Object.fromEntries(GROUP_IDS.map((group) => {
    const selectedIndex = topThree.indexOf(group);
    if (selectedIndex >= 0 && selectedIndex < TOP_THREE_IMPORTANCE.length) {
      return [group, TOP_THREE_IMPORTANCE[selectedIndex]];
    }

    const answeredInGroup = GROUPS[group].criteria.filter((criterion) => answered[criterion]?.length);
    const mean = answeredInGroup.length
      ? answeredInGroup.reduce((sum, criterion) => sum + weights[criterion], 0) / answeredInGroup.length
      : DEFAULT_CRITERION_WEIGHT;
    return [group, OTHER_GROUP_BASE + OTHER_GROUP_FACTOR * mean];
  })) as GroupWeights;
}

export function criterionShares(weights: CriterionWeights): Record<CriterionId, number> {
  const shares = {} as Record<CriterionId, number>;
  for (const group of GROUP_IDS) {
    const criteria = GROUPS[group].criteria;
    const sum = criteria.reduce((total, criterion) => total + Math.max(0, weights[criterion]), 0);
    for (const criterion of criteria) {
      shares[criterion] = sum === 0
        ? 1 / criteria.length
        : Math.max(0, weights[criterion]) / sum;
    }
  }
  return shares;
}

export function answersToFilters(answers: Answers): Filters {
  const filters: Filters = { budgetMax: DEFAULT_BUDGET };
  for (const question of QUIZ_QUESTIONS) {
    const option = question.options.find((item) => item.id === answers[question.id]);
    if (!option || option.skip) continue;
    if (option.budgetMax) filters.budgetMax = option.budgetMax;
    if (option.minStorageGb) filters.minStorageGb = option.minStorageGb;
  }
  return filters;
}