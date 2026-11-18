import { describe, expect, it, vi } from 'vitest';
import {
  answersToCriterionWeights,
  criterionShares,
  deriveFromAnswers,
} from '../src/lib/weights';
import { CRITERIA, GROUPS, criterion } from '../src/data/criteria';
import type { Answers, CriterionId } from '../src/types';

/**
 * Plany 1–5 zmian quizu (planning/zmiany-quizu): waga 0, ładowanie max 5, agregacja max, opis odporności,
 * niższa waga ceny. Pytania i identyfikatory opcji się nie zmieniają — zmieniają się tylko wartości.
 */

describe('plan 1 · najniższe odpowiedzi dają wagę 0', () => {
  const zeroOptions: [string, CriterionId][] = [
    ['B4-a', 'selfie'],
    ['B5-a', 'video'],
    ['B6-a', 'zoom'],
    ['D2-a', 'durability'],
    ['E1-a', 'display'],
    ['E2-a', 'display'],
  ];

  it.each(zeroOptions)('%s → waga kryterium %s = 0', (optionId, criterionId) => {
    const questionId = optionId.split('-')[0]!;
    const weights = answersToCriterionWeights({ [questionId]: optionId });
    expect(weights[criterionId]).toBe(0);
  });

  it('kryterium z wagą 0 ma udział 0 w grupie, reszta dzieli całość', () => {
    const shares = criterionShares(
      { ...answersToCriterionWeights({}), battery: 0, charging: 4 },
      ['battery', 'charging'],
    );
    expect(shares.battery).toBe(0);
    expect(shares.charging).toBe(1);
  });

  it('częściowe zera nie zerują grupy, komplet zer — tak (ważność 0)', () => {
    /* selfie/video/zoom = 0, ale pozostałe kryteria aparatu bez odpowiedzi → grupa zostaje na dole skali (0,5). */
    const partial = deriveFromAnswers({ B4: 'B4-a', B5: 'B5-a', B6: 'B6-a' } as Answers, null);
    expect(partial.groupImportance.camera).toBeCloseTo(0.5, 5);

    /* D4-a ustawia jedyne kryterium grupy „size” na 0 → grupa ignorowana. */
    const complete = deriveFromAnswers({ D4: 'D4-a' } as Answers, null);
    expect(complete.groupImportance.size).toBe(0);
  });
});

describe('plan 2 · szybkie ładowanie sięga sufitu skali', () => {
  it('A3-c → charging 5, A3-a → 0,25', () => {
    expect(answersToCriterionWeights({ A3: 'A3-c' }).charging).toBe(5);
    expect(answersToCriterionWeights({ A3: 'A3-a' }).charging).toBe(0.25);
  });
});

describe('plan 3 · wiele odpowiedzi o to samo kryterium → maksimum', () => {
  it('rozbieżne pary dają max, pominięcie nie obniża wagi', () => {
    expect(answersToCriterionWeights({ A1: 'A1-d', A2: 'A2-a' }).battery).toBe(5); // 5 i 1
    expect(answersToCriterionWeights({ A1: 'A1-a', A2: 'A2-c' }).battery).toBe(5); // 1 i 5
    expect(answersToCriterionWeights({ A1: 'A1-b', A2: 'A2-skip' }).battery).toBe(3);
    expect(answersToCriterionWeights({ E1: 'E1-a', E2: 'E2-c' }).display).toBe(5); // 0 i 5
  });

  it("przełącznik MULTI_ANSWER_AGGREGATION = 'mean' przywraca średnią", async () => {
    vi.resetModules();
    vi.doMock('../src/lib/scoringConfig', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../src/lib/scoringConfig')>()),
      MULTI_ANSWER_AGGREGATION: 'mean',
    }));
    try {
      const { answersToCriterionWeights: mean } = await import('../src/lib/weights');
      expect(mean({ A1: 'A1-d', A2: 'A2-a' }).battery).toBe(3); // (5 + 1) / 2
      expect(mean({ E1: 'E1-a', E2: 'E2-c' }).display).toBe(2.5); // (0 + 5) / 2
    } finally {
      vi.doUnmock('../src/lib/scoringConfig');
      vi.resetModules();
    }
  });
});

describe('plan 4 · opis odporności zgodny z tym, co liczymy', () => {
  it('opisy durability (kryterium i grupa) mówią o wodzie i pyle, nie o szkle ani upadkach', () => {
    const group = GROUPS.find((item) => item.criteria.includes('durability'))!;
    const texts = [criterion('durability').description, group.description];
    expect(CRITERIA.some((item) => item.id === 'durability')).toBe(true);
    for (const text of texts) expect(text, text).not.toMatch(/szkł|upadk/i);
    expect(criterion('durability').description).toMatch(/wod/i);
    expect(criterion('durability').description).toMatch(/pył/i);
  });
});

describe('plan 5 · „Do 2000 zł, jeśli warto” waży cenę mniej', () => {
  it('F1-c → value 1, a ważność grupy cena poza trójką < 1,3 (0,9)', () => {
    expect(answersToCriterionWeights({ F1: 'F1-c' }).value).toBe(1);
    const { groupImportance } = deriveFromAnswers({ F1: 'F1-c' } as Answers, null);
    expect(groupImportance.price).toBeCloseTo(0.9, 5);
    expect(groupImportance.price).toBeLessThan(1.3);
  });

  it('kolejność wag ceny w F1: a (5) › d (4) › b (3) › c (1)', () => {
    const value = (optionId: string) => answersToCriterionWeights({ F1: optionId }).value;
    expect(value('F1-a')).toBeGreaterThan(value('F1-d'));
    expect(value('F1-d')).toBeGreaterThan(value('F1-b'));
    expect(value('F1-b')).toBeGreaterThan(value('F1-c'));
  });
});
