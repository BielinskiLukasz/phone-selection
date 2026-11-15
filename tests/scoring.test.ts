import { describe, expect, it } from 'vitest';
import { formatMatchPercent, toMatchPercent } from '../src/lib/matchDisplay';
import { countPool, getCandidatePool } from '../src/lib/pool';
import { rank, valueScore } from '../src/lib/scoring';
import type { GroupWeights } from '../src/types/ranking';
import { makePhone, SYNTHETIC_PHONES } from './fixtures/phones';

const noPriceWeight: GroupWeights = {
  battery: 1, camera: 1, storage: 1, longevity: 1, smooth: 1, price: 0,
};

describe('candidate pool and scoring', () => {
  it('applies the site limit and hard memory/microSD filters before normalization', () => {
    const tooExpensive = { ...SYNTHETIC_PHONES[0]!, id: 'too-expensive', price: { ...SYNTHETIC_PHONES[0]!.price, pln: 2100 } };
    expect(countPool([...SYNTHETIC_PHONES, tooExpensive])).toBe(6);
    expect(getCandidatePool(SYNTHETIC_PHONES, { minStorageGb: 256 })).toHaveLength(5);
    expect(getCandidatePool(SYNTHETIC_PHONES, { requireMicroSd: true })).toEqual([]);
    const withSlot = { ...SYNTHETIC_PHONES[0]!, specs: { ...SYNTHETIC_PHONES[0]!.specs, microSd: true } };
    expect(countPool([withSlot], { requireMicroSd: true })).toBe(1);
  });

  it('computes value from the budget even when the stored value score is null', () => {
    expect(valueScore(1200, 2000)).toBe(100);
    expect(valueScore(1600, 2000)).toBe(50);
    expect(valueScore(2000, 2000)).toBe(0);
    expect(valueScore(2000, 1500)).toBe(0);
    const phone = makePhone({ id: 'value-case', brand: 'ValueBrand', price: 1600, storageGb: 256, battery: 60, charging: 60, camera: 60 });
    expect(rank({ phones: [phone] }).ranking[0]?.rawScores.value).toBe(50);
  });

  it('blends raw and min-max values, using 50 when a criterion is constant', () => {
    const phones = [
      makePhone({ id: 'same-a', brand: 'FirstBrand', price: 1500, storageGb: 256, battery: 60, charging: 60, camera: 60 }),
      makePhone({ id: 'same-b', brand: 'SecondBrand', price: 1700, storageGb: 256, battery: 60, charging: 60, camera: 60 }),
    ];
    const result = rank({ phones });
    expect(result.ranking[0]?.normalizedScores.battery).toBe(55);
    expect(result.ranking[0]?.rawScores.value).toBe(62.5);
  });

  it('breaks an identical-score tie by lower price then higher battery', () => {
    const cheaper = makePhone({ id: 'cheap', brand: 'CheaperBrand', price: 1400, storageGb: 256, battery: 60, charging: 60, camera: 60 });
    const expensive = makePhone({ id: 'expensive', brand: 'ExpensiveBrand', price: 1800, storageGb: 256, battery: 60, charging: 60, camera: 60 });
    const tied = rank({ phones: [expensive, cheaper], groupWeights: noPriceWeight });
    expect(tied.ranking[0]?.phoneId).toBe('cheap');
    expect(tied.ranking[1]?.tieWith).toBe(1);

    const higherBattery = { ...cheaper, id: 'higher-battery', scores: { ...cheaper.scores, battery: 90 } };
    const withoutBattery: GroupWeights = { ...noPriceWeight, battery: 0 };
    expect(rank({ phones: [cheaper, higherBattery], groupWeights: withoutBattery }).ranking[0]?.phoneId).toBe('higher-battery');
  });

  it('fills three cards from above the session budget when necessary', () => {
    const result = rank({ phones: SYNTHETIC_PHONES, answers: { F1: 'F1-a' } });
    expect(result.cards).toHaveLength(3);
    expect(result.cards.slice(0, 2).every((card) => card.overBudgetBy === undefined)).toBe(true);
    expect(result.cards[2]?.overBudgetBy).toBeGreaterThan(0);
    expect(result.ranking).toHaveLength(6);
  });

  it('keeps 128 GB phones out of the pool and ranking when 256 GB is required', () => {
    const result = rank({ phones: SYNTHETIC_PHONES, answers: { C2: 'C2-b' } });
    expect(result.ranking.map((item) => item.phoneId)).not.toContain('sample-four');
    expect(result.cards.map((item) => item.phoneId)).not.toContain('sample-four');
  });

  it('handles an empty pool, zero group weights and display rounding', () => {
    expect(rank({ phones: [] }).cards).toEqual([]);
    const result = rank({ phones: SYNTHETIC_PHONES, groupWeights: {
      battery: 0, camera: 0, storage: 0, longevity: 0, smooth: 0, price: 0,
    } });
    expect(Number.isFinite(result.ranking[0]!.score)).toBe(true);
    expect(toMatchPercent(72.6)).toBe(73);
    expect(formatMatchPercent(72.6)).toBe('73%');
    expect(toMatchPercent(Number.NaN)).toBe(0);
  });
});