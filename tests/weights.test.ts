import { describe, expect, it } from 'vitest';
import { CRITERION_IDS, GROUP_IDS } from '../src/data/criteria';
import { answersToCriterionWeights, answersToFilters, criterionShares, groupImportance } from '../src/lib/weights';
import { personas } from './personas';

describe('answers and weights', () => {
  it('leaves skipped and unanswered criteria neutral', () => {
    const answers = { A1: 'A1-skip', B1: 'B1-skip', F1: 'F1-skip' };
    const weights = answersToCriterionWeights(answers);
    for (const criterion of CRITERION_IDS) expect(weights[criterion]).toBe(2);
    const groups = groupImportance(weights, [], answers);
    for (const group of GROUP_IDS) expect(groups[group]).toBeCloseTo(1.3);
    expect(answersToFilters(answers)).toEqual({ budgetMax: 2000 });
  });

  it('averages multiple answers for one criterion, including display', () => {
    const weights = answersToCriterionWeights({ A1: 'A1-d', A2: 'A2-a', E1: 'E1-c', E2: 'E2-a' });
    expect(weights.battery).toBe(3);
    expect(weights.display).toBe(3);
    expect(weights.charging).toBe(2);
  });

  it('calculates shares within groups, falling back to equal shares for all zeros', () => {
    const weights = { ...answersToCriterionWeights({}), battery: 5, charging: 1 };
    expect(criterionShares(weights).battery).toBeCloseTo(5 / 6);
    expect(criterionShares(weights).charging).toBeCloseTo(1 / 6);
    expect(criterionShares({ ...weights, battery: 0, charging: 0 }).battery).toBe(0.5);
  });

  it('uses the ranked top three and only answered weights outside them', () => {
    const answers = { ...personas.wife.answers, F1: 'F1-a' };
    const weights = answersToCriterionWeights(answers);
    const groups = groupImportance(weights, personas.wife.topThree, answers);
    expect([groups.battery, groups.camera, groups.storage]).toEqual([5, 4, 3]);
    expect(groups.price).toBe(2.5);
    expect(groups.smooth).toBeCloseTo(1.7);
  });

  it('derives budget and memory filters from current answers', () => {
    expect(answersToFilters({ F1: 'F1-b', C2: 'C2-b' })).toEqual({ budgetMax: 1800, minStorageGb: 256 });
    expect(answersToFilters({ F1: 'bad-answer', C2: 'C2-a' })).toEqual({ budgetMax: 2000 });
  });
});