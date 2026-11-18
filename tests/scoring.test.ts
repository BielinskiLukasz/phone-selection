import { describe, expect, it } from 'vitest';
import { POOL, clonePhone, overLimit, phoneById, tiedPair, withMicroSd, poolWithTwoInBudget, SMALL_STORAGE_IDS } from './data';
import { CAMERA, WIFE, noAnswers } from './personas';
import {
  anyMicroSd,
  buildPool,
  countPool,
  inBudget,
  inBudgetSubset,
  matchesFilters,
} from '../src/lib/pool';
import {
  blend,
  groupScores,
  normalize,
  rank,
  rankFromAnswers,
  rawScore,
  scoreRanges,
  totalScore,
  valueScore,
} from '../src/lib/scoring';
import { answersToCriterionWeights, groupImportance } from '../src/lib/weights';
import {
  BLEND,
  BUDGET_LIMIT,
  NEUTRAL_SCORE,
  TIE_THRESHOLD,
  VALUE_FLOOR,
} from '../src/lib/scoringConfig';
import { GROUPS } from '../src/data/criteria';
import { activeQuestions } from '../src/data/questions';
import type { Phone } from '../src/types';

const neutralRun = (phones: readonly Phone[]) => {
  const weights = answersToCriterionWeights(noAnswers());
  return rank({
    phones,
    weights,
    groupImportance: groupImportance(weights, null),
    filters: { budgetMax: BUDGET_LIMIT },
  });
};

describe('E2-07 · value, braki danych i normalizacja', () => {
  it('value = 100 × (1 − (cena − 1200) / (budżet − 1200)), obcięte do 0-100', () => {
    expect(valueScore(VALUE_FLOOR, 2000)).toBe(100);
    expect(valueScore(2000, 2000)).toBe(0);
    expect(valueScore(1600, 2000)).toBe(50);
    expect(valueScore(3000, 2000)).toBe(0);
    expect(valueScore(1500, 1200)).toBe(NEUTRAL_SCORE);
  });

  it('8. `null` w scores.value nie zawiesza silnika — value liczy się z ceny', () => {
    for (const phone of POOL) expect(phone.scores.value).toBeNull();

    const result = neutralRun(POOL);
    expect(result.ranked.length).toBe(POOL.length);
    for (const entry of result.ranked) {
      expect(Number.isFinite(entry.score)).toBe(true);
      expect(entry.score).toBeGreaterThanOrEqual(0);
      expect(entry.score).toBeLessThanOrEqual(100);
    }

    // najtańszy telefon w puli ma najwyższe value
    const cheapest = [...POOL].sort((a, b) => a.price.pln - b.price.pln)[0]!;
    expect(rawScore(cheapest, 'value', 2000)).toBe(
      Math.max(...POOL.map((phone) => rawScore(phone, 'value', 2000))),
    );
  });

  it('brak danych → 50 (mechanizm), a po uzupełnieniu wzory z PROJECT 7.5', () => {
    const redmi = phoneById('redmi-note-15-pro-5g-8-256');
    const gapped = clonePhone(redmi, {
      scores: { ...redmi.scores, updates: null },
      scoresEstimatedNeutral: ['updates'],
    });
    expect(rawScore(gapped, 'updates', 2000)).toBe(NEUTRAL_SCORE);

    for (const phone of POOL) expect(phone.scoresEstimatedNeutral ?? [], phone.id).toEqual([]);

    expect(rawScore(phoneById('xiaomi-15t-12-512'), 'charging', 2000)).toBe(69);
    expect(rawScore(phoneById('xiaomi-15t-12-512'), 'updates', 2000)).toBe(71);
    expect(rawScore(phoneById('xiaomi-15t-12-512'), 'durability', 2000)).toBe(90);
    expect(rawScore(phoneById('motorola-edge-60-12-256'), 'storage', 2000)).toBe(80);
    expect(rawScore(phoneById('motorola-edge-60-12-256'), 'durability', 2000)).toBe(100);
    expect(rawScore(phoneById('realme-16-pro-plus-5g-8-256'), 'charging', 2000)).toBe(87);
    /* 18.11.2026: 6 lat poprawek serii 3a potwierdzone (9to5google, Notebookcheck) → jak 3a Pro; wcześniej 43. */
    expect(rawScore(phoneById('nothing-phone-3a-12-256'), 'updates', 2000)).toBe(64);
  });

  it('normalizacja min-max z mieszaniem; przy max = min zwraca 50', () => {
    expect(normalize(75, { min: 50, max: 100 })).toBe(50);
    expect(normalize(60, { min: 60, max: 60 })).toBe(NEUTRAL_SCORE);
    expect(blend(60, { min: 50, max: 100 }, 0)).toBe(60);
    expect(blend(60, { min: 50, max: 100 }, 1)).toBe(20);
    expect(blend(60, { min: 50, max: 100 }, BLEND)).toBe(40);
  });

  it('zakresy normalizacji liczone są na puli po filtrach', () => {
    const full = scoreRanges(POOL, 2000);
    const filtered = scoreRanges(
      buildPool(POOL, { budgetMax: 2000, minStorageGb: 256 }),
      2000,
    );
    expect(full.storage.min).toBe(40); // Pixel 10a i 9a: 128 GB
    expect(filtered.storage.min).toBe(75); // po filtrze zostają 256 GB i 512 GB
  });

  it('S jest średnią ważoną GroupScore (przy równych ważnościach — zwykłą średnią)', () => {
    const weights = answersToCriterionWeights(noAnswers());
    const ranges = scoreRanges(POOL, 2000);
    const phone = POOL[0]!;
    const { scores } = groupScores(phone, ranges, weights, 2000);
    const flat = groupImportance(weights, null);
    const expected =
      GROUPS.reduce((sum, group) => sum + (scores[group.id] ?? 0), 0) / GROUPS.length;

    expect(totalScore(scores, flat)).toBeCloseTo(expected, 1);
  });
});

describe('E2-07 · kolejność i remisy', () => {
  /* Cena wchodzi do S przez kryterium `value`, więc prawdziwy remis punktowy wymaga
     wyzerowania ważności grupy „Cena” — wtedy decyduje kolejność z PROJECT 7.3. */
  const tiedRun = () => {
    const phones = tiedPair();
    const weights = answersToCriterionWeights(noAnswers());
    const importance = { ...groupImportance(weights, null), price: 0 };
    return rank({ phones, weights, groupImportance: importance, filters: { budgetMax: 2000 } });
  };

  it('3. identyczne oceny → wyżej jest tańszy telefon', () => {
    const result = tiedRun();
    expect(result.ranked[0]!.score).toBe(result.ranked[1]!.score);
    expect(result.ranked.map((entry) => entry.phoneId)).toEqual(['remis-tanszy', 'remis-drozszy']);
  });

  it('dokładny remis dostaje znacznik praktycznego remisu', () => {
    const result = tiedRun();
    expect(result.ranked[0]!.practicalTieWith).toBe('remis-drozszy');
    expect(result.ranked[1]!.practicalTieWith).toBe('remis-tanszy');
  });

  it('przy jednakowej cenie o remisie rozstrzyga wyższa ocena baterii', () => {
    const phones = tiedPair().map((phone) => ({
      ...phone,
      price: { ...phone.price, pln: 1500 },
    }));
    phones[0]!.scores = { ...phones[0]!.scores, battery: 40 };
    phones[1]!.scores = { ...phones[1]!.scores, battery: 90 };
    const weights = answersToCriterionWeights(noAnswers());
    const result = rank({
      phones,
      weights,
      groupImportance: { ...groupImportance(weights, null), price: 0 },
      filters: { budgetMax: 2000 },
    });
    expect(result.ranked[0]!.phoneId).toBe(phones[1]!.id);
  });

  it('sąsiedzi bliżej niż próg 2 pkt są oznaczeni, dalsi nie', () => {
    const result = rankFromAnswers(POOL, CAMERA.answers, CAMERA.topThree);
    for (const [index, entry] of result.ranked.entries()) {
      const next = result.ranked[index + 1];
      if (!next) continue;
      const close = entry.score - next.score < TIE_THRESHOLD;
      const linked =
        entry.practicalTieWith === next.phoneId || next.practicalTieWith === entry.phoneId;
      if (close) expect(linked, `${entry.phoneId} vs ${next.phoneId}`).toBe(true);
    }
  });

  it('różnica ponad próg nie daje znacznika remisu', () => {
    const result = rankFromAnswers(POOL, CAMERA.answers, CAMERA.topThree);
    expect(result.ranked[0]!.score - result.ranked[1]!.score).toBeGreaterThan(TIE_THRESHOLD);
    expect(result.ranked[0]!.practicalTieWith).toBeNull();
  });
});

describe('E2-06 · pula i filtry twarde', () => {
  it('cała pula mieści się w twardym limicie 2000 zł', () => {
    expect(countPool(POOL, { budgetMax: BUDGET_LIMIT })).toBe(POOL.length);
    for (const phone of POOL) expect(phone.price.pln).toBeLessThanOrEqual(BUDGET_LIMIT);
  });

  it('telefon powyżej limitu nie wchodzi do puli', () => {
    expect(matchesFilters(overLimit(), { budgetMax: BUDGET_LIMIT })).toBe(false);
    expect(countPool([...POOL, overLimit()], { budgetMax: BUDGET_LIMIT })).toBe(POOL.length);
  });

  it('5. filtr „min. 256 GB” usuwa telefony 128 GB z puli i z rankingu', () => {
    const filters = { budgetMax: BUDGET_LIMIT, minStorageGb: 256 };
    const pool = buildPool(POOL, filters);
    expect(pool.length).toBe(POOL.length - SMALL_STORAGE_IDS.length);
    expect(pool.map((phone) => phone.id)).not.toContain('pixel-10a-8-128');
    expect(pool.map((phone) => phone.id)).not.toContain('pixel-9a-8-128');

    const result = rankFromAnswers(POOL, WIFE.answers, WIFE.topThree, filters);
    for (const entry of result.ranked) {
      expect(phoneById(entry.phoneId).variant.storageGb).toBeGreaterThanOrEqual(256);
    }
  });

  it('filtr „musi mieć microSD” zostawia tylko telefony ze slotem', () => {
    expect(anyMicroSd(POOL)).toBe(true);

    const pool = buildPool(POOL, { budgetMax: BUDGET_LIMIT, requireMicroSd: true });
    const withSlotIds = POOL.filter((phone) => phone.specs.microSd === true).map((phone) => phone.id);
    expect(withSlotIds).toContain('motorola-edge-60-12-256');
    expect(pool.map((phone) => phone.id).sort()).toEqual([...withSlotIds].sort());
    expect(countPool(POOL, { budgetMax: BUDGET_LIMIT, requireMicroSd: true })).toBe(withSlotIds.length);

    const withSlot = withMicroSd();
    expect(buildPool([...POOL, withSlot], { budgetMax: BUDGET_LIMIT, requireMicroSd: true }).length).toBe(withSlotIds.length + 1);
    expect(activeQuestions(POOL).map((question) => question.id)).toContain('C3');
  });

  it('inBudgetSubset liczy telefony mieszczące się w budżecie sesji', () => {
    expect(inBudgetSubset(POOL, 1500).map((phone) => phone.id).sort()).toEqual(
      POOL.filter((phone) => phone.price.pln <= 1500).map((phone) => phone.id).sort(),
    );
    expect(inBudgetSubset(POOL, BUDGET_LIMIT).length).toBe(POOL.length);
    expect(inBudget(phoneById('xiaomi-15t-12-512'), 1500)).toBe(false);
  });

  it('pusta pula po filtrach zwraca pusty wynik, nie wyjątek', () => {
    const result = rank({
      phones: POOL,
      weights: answersToCriterionWeights(noAnswers()),
      groupImportance: groupImportance(answersToCriterionWeights(noAnswers()), null),
      filters: { budgetMax: BUDGET_LIMIT, minStorageGb: 1024 },
    });
    expect(result.empty).toBe(true);
    expect(result.ranked).toEqual([]);
    expect(result.cards).toEqual([]);
    expect(result.bestScore).toBeNull();
  });

  it('pula mniejsza niż trzy telefony daje tyle kart, ile jest (QUIZ-SPEC 8)', () => {
    const small = POOL.slice(0, 2);
    const result = neutralRun(small);
    expect(result.cards.length).toBe(2);
    expect(result.poolSize).toBe(2);
  });
});

describe('E2-07 · karty i uzupełnianie powyżej budżetu', () => {
  it('4. budżet 1500 zł na pełnej puli daje komplet w budżecie, a przy 2 telefonach dokłada 1 z overBudgetBy', () => {
    const full = rankFromAnswers(POOL, { ...WIFE.answers, F1: 'F1-a' }, WIFE.topThree);
    expect(full.inBudgetCount).toBeGreaterThanOrEqual(3);
    expect(full.cards.length).toBe(3);
    expect(full.cards.every((entry) => entry.inBudget && entry.overBudgetBy === null)).toBe(true);

    const twoInBudget = poolWithTwoInBudget();
    const result = rankFromAnswers(twoInBudget, { ...WIFE.answers, F1: 'F1-a' }, WIFE.topThree);
    expect(result.inBudgetCount).toBe(2);
    expect(result.cards.length).toBe(3);
    expect(result.cards.filter((entry) => entry.overBudgetBy !== null).length).toBe(1);
    expect(result.cards.map((entry) => entry.place)).toEqual([1, 2, 3]);
  });

  it('karty są numerowane od 1, a ranking puli zachowuje własną numerację', () => {
    const twoInBudget = poolWithTwoInBudget();
    const result = rankFromAnswers(twoInBudget, { ...WIFE.answers, F1: 'F1-a' }, WIFE.topThree);
    const overBudgetCard = result.cards.find((entry) => !entry.inBudget)!;
    const sameInPool = result.ranked.find((entry) => entry.phoneId === overBudgetCard.phoneId)!;
    /* Uzupełnienie ponad budżetem trafia na koniec kart, choć w puli jest najlepsze. */
    expect(overBudgetCard.place).toBe(3);
    expect(sameInPool.place).toBe(1);
    expect(result.ranked.map((entry) => entry.place)).toEqual(
      result.ranked.map((_entry, index) => index + 1),
    );
  });

  it('budżet 2000 zł: wszystkie karty mieszczą się w budżecie', () => {
    const result = rankFromAnswers(POOL, WIFE.answers, WIFE.topThree);
    expect(result.inBudgetCount).toBe(POOL.length);
    for (const entry of result.cards) {
      expect(entry.inBudget).toBe(true);
      expect(entry.overBudgetBy).toBeNull();
    }
  });

  it('klon telefonu z inną ceną zmienia value, a więc i wynik', () => {
    const base = phoneById('galaxy-a57-8-256');
    const cheaper = clonePhone(base, {
      id: 'a57-taniej',
      price: { ...base.price, pln: 1299 },
      reveal: { ...base.reveal, name: 'Taniej', brand: 'Test' },
    });
    expect(rawScore(cheaper, 'value', 2000)).toBeGreaterThan(rawScore(base, 'value', 2000));
  });
});
