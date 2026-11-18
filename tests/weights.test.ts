import { describe, expect, it } from 'vitest';
import {
  answeredCriteria,
  answersToCriterionWeights,
  answersToFilters,
  budgetFromAnswers,
  criterionShares,
  deriveFromAnswers,
  filtersFromAnswers,
  groupImportance,
  normalizeTopThree,
} from '../src/lib/weights';
import { noAnswers, skipAll, BATTERY, WIFE } from './personas';
import type { CriterionId, GroupId, Weights } from '../src/types';
import { CRITERION_IDS, GROUP_IDS, GROUPS } from '../src/data/criteria';
import {
  DEFAULT_WEIGHT,
  GROUP_BASE,
  GROUP_FACTOR,
  TOP_THREE_IMPORTANCE,
} from '../src/lib/scoringConfig';

describe('E2-05 · wagi kryteriów z odpowiedzi', () => {
  it('1. wszystkie odpowiedzi „pomiń” → wagi 2 i ważności grup 1,3', () => {
    const weights = answersToCriterionWeights(skipAll());
    for (const id of CRITERION_IDS) expect(weights[id]).toBe(DEFAULT_WEIGHT);

    const { groupImportance: importance } = deriveFromAnswers(skipAll());
    for (const id of GROUP_IDS) expect(importance[id]).toBeCloseTo(1.3, 5);
  });

  it('brak odpowiedzi (przerwany quiz) też daje start neutralny', () => {
    for (const id of CRITERION_IDS) expect(answersToCriterionWeights(noAnswers())[id]).toBe(2);
  });

  it('kilka pytań o jedno kryterium daje maksimum (E1=0, E2=5 → display 5)', () => {
    expect(answersToCriterionWeights({ E1: 'E1-a', E2: 'E2-c' }).display).toBe(5);
    expect(answersToCriterionWeights({ E1: 'E1-a', E2: 'E2-a' }).display).toBe(0);
  });

  it('kilka pytań o baterię: A1 i A2 łączą się do wagi kryterium (max)', () => {
    expect(answersToCriterionWeights(BATTERY.answers).battery).toBe(5);
    expect(answersToCriterionWeights(WIFE.answers).battery).toBe(3);
    /* FP3-03 (17.11.2026): „zawsze na noc” → charging 0,25 (było 1). */
    expect(answersToCriterionWeights(WIFE.answers).charging).toBe(0.25);
  });

  it('odpowiedź „pomiń” nie nadpisuje wagi z innego pytania', () => {
    const weights = answersToCriterionWeights({ A1: 'A1-d', A2: 'A2-skip' });
    expect(weights.battery).toBe(5);
  });
});

describe('E2-05 · udziały kryteriów w grupie', () => {
  it('2. wagi 5 i 1 dają udziały 5/6 i 1/6', () => {
    const weights = { ...answersToCriterionWeights(noAnswers()), battery: 5, charging: 1 };
    const shares = criterionShares(weights, ['battery', 'charging']);
    expect(shares.battery).toBeCloseTo(5 / 6, 5);
    expect(shares.charging).toBeCloseTo(1 / 6, 5);
    expect((shares.battery ?? 0) + (shares.charging ?? 0)).toBeCloseTo(1, 5);
  });

  it('przy samych zerach udziały są równe', () => {
    const weights = { ...answersToCriterionWeights(noAnswers()), battery: 0, charging: 0 };
    const shares = criterionShares(weights, ['battery', 'charging']);
    expect(shares.battery).toBeCloseTo(0.5, 5);
    expect(shares.charging).toBeCloseTo(0.5, 5);
  });

  it('bez listy kryteriów liczy udziały dla wszystkich 14 i suma wynosi 1', () => {
    const shares = criterionShares(answersToCriterionWeights(WIFE.answers));
    const sum = CRITERION_IDS.reduce((total, id) => total + (shares[id] ?? 0), 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('udziały w grupie „Aparat” zależą od odpowiedzi (B1-B6 = 5 daje równe udziały)', () => {
    const weights = answersToCriterionWeights({
      B1: 'B1-c',
      B2: 'B2-c',
      B3: 'B3-c',
      B4: 'B4-c',
      B5: 'B5-c',
      B6: 'B6-c',
    });
    const camera = GROUPS.find((group) => group.id === 'camera')!;
    const shares = criterionShares(weights, camera.criteria);
    for (const id of camera.criteria) expect(shares[id]).toBeCloseTo(1 / 6, 5);
  });
});

describe('E2-05 · ważności grup', () => {
  it('trójka najważniejszych: pasma 5/4/3 skorygowane siłą odpowiedzi', () => {
    const weights = answersToCriterionWeights(WIFE.answers);
    const importance = groupImportance(weights, WIFE.topThree);

    /* U „żony” bateria z odpowiedzi daje 1,15 (battery 3, charging 0,25 po FP3-03) → korekta +0,3 × (1,15 − 1,3) = −0,045 → 4,96. */
    expect(importance.battery).toBeCloseTo(TOP_THREE_IMPORTANCE[0] - 0.045, 2);
    /* Aparat: odpowiedzi dają 2,1 → +0,3 × (2,1 − 1,3) = +0,24. */
    expect(importance.camera).toBeCloseTo(4.24, 2);
    /* Pamięć: 2,5 → +0,36. */
    expect(importance.storage).toBeCloseTo(3.36, 2);

    // longevity: updates 3 i durability 3 → 0,5 + 0,4 × 3 (poza trójką, bez korekty)
    expect(importance.longevity).toBeCloseTo(GROUP_BASE + GROUP_FACTOR * 3, 5);
    // price: value 1 z odpowiedzi F1 (plan 5) → 0,5 + 0,4 × 1 = 0,9
    expect(importance.price).toBeCloseTo(0.9, 5);
  });

  it('kolejność trójki jest zachowana zawsze — pasma się nie nakładają', () => {
    /* Skrajne dowody: pierwsza grupa odpowiedziana minimalnie, trzecia maksymalnie. */
    const weights: Weights = { ...answersToCriterionWeights(noAnswers()) };
    weights.battery = 0;
    weights.charging = 0;
    weights.storage = 5;
    const importance = groupImportance(weights, { picks: ['battery', 'camera', 'storage'] }, new Set(['battery', 'charging', 'storage']));

    expect(importance.battery).toBeGreaterThan(importance.camera);
    expect(importance.camera).toBeGreaterThan(importance.storage);
    expect(importance.battery).toBeLessThanOrEqual(5);
    expect(importance.storage).toBeGreaterThanOrEqual(GROUP_BASE);
  });

  it('pierwsze miejsce nasyca się na 5, a korekta działa w dół przy słabych odpowiedziach', () => {
    const strong = { ...answersToCriterionWeights(noAnswers()), battery: 5, charging: 5 };
    const weak = { ...answersToCriterionWeights(noAnswers()), battery: 1, charging: 1 };
    const answered = new Set<CriterionId>(['battery', 'charging']);
    const picks: [GroupId, GroupId, GroupId] = ['battery', 'camera', 'storage'];

    expect(groupImportance(strong, { picks }, answered).battery).toBe(5); // 5 + 0,6 → sufit skali
    expect(groupImportance(weak, { picks }, answered).battery).toBeCloseTo(4.88, 2); // 5 − 0,12
  });

  it('wariant addytywny (+1,5/1,0/0,5) dodaje bonus do wartości z odpowiedzi', () => {
    const weights = answersToCriterionWeights(WIFE.answers);
    const answered = answeredCriteria(WIFE.answers);
    const additive = groupImportance(weights, WIFE.topThree, answered, 'additive');

    expect(additive.battery).toBeCloseTo(2.65, 2); // 1,15 + 1,5 (FP3-03)
    expect(additive.camera).toBeCloseTo(3.1, 2); // 2,1 + 1,0
    expect(additive.storage).toBeCloseTo(3.0, 2); // 2,5 + 0,5
    expect(additive.longevity).toBeCloseTo(1.7, 5);
  });

  it('wariant addytywny potrafi odwrócić świadomy wybór — dlatego domyślny jest pasmowy', () => {
    /* Żona: aparat ma 6 pytań odpowiedzianych „często”, bateria 2 pytania umiarkowane. */
    const weights = answersToCriterionWeights(WIFE.answers);
    const answered = answeredCriteria(WIFE.answers);
    const additive = groupImportance(weights, WIFE.topThree, answered, 'additive');

    expect(additive.camera).toBeGreaterThan(additive.battery); // wybór „bateria 1.” przegrany z arytmetyką
    const band = groupImportance(weights, WIFE.topThree, answered, 'band');
    expect(band.battery).toBeGreaterThan(band.camera); // priorytet z PROJECT 2 zachowany
  });

  it('pominięcie kroku G1 zostawia grupy na wzorze, a jawne 0 („bez znaczenia”) zeruje grupę', () => {
    const weights = answersToCriterionWeights(WIFE.answers);
    const importance = groupImportance(weights, null);
    for (const id of GROUP_IDS) {
      expect(importance[id]).toBeLessThanOrEqual(2.5);
      if (id === 'size') expect(importance[id]).toBe(0); // D4-a → compactness 0 → ignoruj
      else expect(importance[id]).toBeGreaterThanOrEqual(GROUP_BASE);
    }
    // bateria: battery 3 i charging 0,25 (FP3-03) → średnia 1,625 → 0,5 + 0,4 × 1,625 = 1,15
    expect(importance.battery).toBeCloseTo(GROUP_BASE + GROUP_FACTOR * 1.625, 5);
  });

  it('normalizeTopThree przyjmuje obiekt, listę grup, pustą listę i null', () => {
    expect(normalizeTopThree({ picks: ['battery', 'camera', 'storage'] })).toEqual({
      picks: ['battery', 'camera', 'storage'],
    });
    expect(normalizeTopThree(['camera', 'price', 'smooth'])).toEqual({
      picks: ['camera', 'price', 'smooth'],
    });
    expect(normalizeTopThree([])).toBeNull();
    expect(normalizeTopThree(null)).toBeNull();
    expect(normalizeTopThree(undefined)).toBeNull();
  });

  it('ważności grup można podać jako listę — wynik jest taki sam', () => {
    const weights = answersToCriterionWeights(WIFE.answers);
    const fromObject = groupImportance(weights, WIFE.topThree);
    const fromList = groupImportance(weights, WIFE.topThree!.picks);
    expect(fromList).toEqual(fromObject);
  });
});

describe('E2-05 · filtry z odpowiedzi', () => {
  it('F1 ustawia budżet, domyślnie obowiązuje 2000 zł', () => {
    expect(budgetFromAnswers({ F1: 'F1-a' })).toBe(1500);
    expect(budgetFromAnswers({ F1: 'F1-b' })).toBe(1800);
    expect(budgetFromAnswers({ F1: 'F1-c' })).toBe(2000);
    expect(budgetFromAnswers(noAnswers())).toBe(2000);
  });

  it('C2 ustawia filtr pamięci, a answersToFilters jest aliasem filtersFromAnswers', () => {
    const answers = { C2: 'C2-b', F1: 'F1-b' };
    expect(filtersFromAnswers(answers)).toEqual({
      budgetMax: 1800,
      budgetStretch: null,
      minStorageGb: 256,
      requireMicroSd: false,
      preferMicroSd: false,
    });
    expect(answersToFilters(answers)).toEqual(filtersFromAnswers(answers));
  });

  it('„pomiń” w F1 i C2 nie zmienia filtrów', () => {
    expect(answersToFilters({ F1: 'F1-skip', C2: 'C2-skip' })).toEqual({
      budgetMax: 2000,
      budgetStretch: null,
      minStorageGb: null,
      requireMicroSd: false,
      preferMicroSd: false,
    });
  });
});
