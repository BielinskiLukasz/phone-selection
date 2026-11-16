import { describe, expect, it } from 'vitest';
import {
  FIXTURE_PHONES,
  FIXTURE_POOL_WITHIN_LIMIT,
  buildPhone,
  fixtureById,
  overLimit,
  tiedPair,
  withMicroSd,
} from './fixtures/phones.fixture';
import { countPool, buildPool, matchesFilters } from '../src/lib/pool';
import { rank, rankFromAnswers } from '../src/lib/scoring';
import { answersToCriterionWeights, groupImportance } from '../src/lib/weights';
import {
  batteryFact,
  cameraFact,
  collectForbiddenTokens,
  displayPerformanceFact,
  durabilityFact,
  findLeaks,
  toAnonCards,
  updatesFact,
  updatesInfo,
} from '../src/lib/anonymize';
import { activeQuestions } from '../src/data/questions';
import { CRITERION_IDS } from '../src/data/criteria';
import type { Phone } from '../src/types';

/**
 * Testy na kontrolowanej puli: oba zapisy specyfikacji (płaski i ustrukturyzowany),
 * przypadki brzegowe filtrów oraz remisy — rzeczy, których nie da się pewnie
 * sprawdzić na danych produkcyjnych z `src/data/phones.json`.
 */

const flat = fixtureById('test-tani-256');
const structured = fixtureById('test-srodkowy-256');
const expensive = fixtureById('test-drogi-512-microsd');

const neutralRank = (phones: readonly Phone[], priceImportance = 0) => {
  const weights = answersToCriterionWeights({});
  return rank({
    phones,
    weights,
    groupImportance: { ...groupImportance(weights, null), price: priceImportance },
    filters: { budgetMax: 2000 },
  });
};

describe('fixture · budowa rekordu', () => {
  it('buildPhone wypełnia 14 kryteriów, value zostawia do wyliczenia', () => {
    const phone = buildPhone({
      id: 'test-minimalny',
      name: 'TestBrand Minimalny',
      price: 1500,
      storageGb: 256,
    });

    for (const id of CRITERION_IDS) {
      if (id === 'value') {
        expect(phone.scores.value).toBeNull();
        continue;
      }
      expect(phone.scores[id], id).toBe(50);
      expect((phone.basis[id] ?? '').length, id).toBeGreaterThan(10);
    }
    expect(phone.status).toBe('ok');
    expect(phone.reveal.shopLinks.length).toBe(1);
    expect(Object.keys(phone.scoreConfidence ?? {}).length).toBe(15);
  });

  it('pool ma pięć rekordów, w tym jeden ponad limitem i jeden ze slotem microSD', () => {
    expect(FIXTURE_PHONES.length).toBe(5);
    expect(FIXTURE_POOL_WITHIN_LIMIT.length).toBe(4);
    expect(FIXTURE_PHONES.filter((phone) => phone.specs.microSd === true).length).toBe(1);
  });
});

describe('fixture · płaski zapis specyfikacji (jak w phones.json)', () => {
  it('bateria, aparat i odporność z opisów tekstowych', () => {
    expect(batteryFact(flat.specs).value).toBe(
      '6000 mAh · ładowanie 45 W · bez ładowania bezprzewodowego',
    );
    expect(cameraFact(flat).value).toBe('Główny 50 MP ze stabilizacją · selfie 32 MP · szeroki kąt 8 MP');
    expect(durabilityFact(flat.specs).value).toBe('Wodoszczelny i pyłoszczelny (IP68)');
  });

  it('zakres odświeżania ze źródeł trafia na kartę jako zakres', () => {
    expect(displayPerformanceFact(expensive, 'high').value).toBe(
      '6,8″ AMOLED 60-144 Hz · wydajność wysoka',
    );
  });
});

describe('fixture · zapis ustrukturyzowany (display/updates/aparaty liczbowo)', () => {
  it('ekran z obiektu display: przekątna, klasa panelu, odświeżanie', () => {
    expect(displayPerformanceFact(structured, 'high').value).toBe(
      '6,6″ OLED 120 Hz · wydajność wysoka',
    );
  });

  it('wsparcie z obiektu updates: liczba wersji systemu i lata poprawek', () => {
    expect(updatesInfo(structured.specs)).toEqual({
      osUpdates: 3,
      securityYears: 4,
      years: null,
    });
    expect(updatesFact(structured.specs).value).toBe('3 aktualizacje systemu, 4 lata poprawek');
  });

  it('aparaty z liczb Mpix, a telephotoMp = 0 oznacza brak aparatu do przybliżania', () => {
    expect(cameraFact(structured).value).toBe(
      'Główny 50 MP ze stabilizacją · selfie 32 MP · bez aparatu do przybliżania · szeroki kąt 13 MP',
    );
  });

  it('teleobiektyw z krotnością zoomu w opisie', () => {
    expect(cameraFact(expensive).value).toBe(
      'Główny 200 MP ze stabilizacją · przybliżanie 50 MP (3,5x)',
    );
  });
});

describe('fixture · filtry i pula', () => {
  it('telefon ponad limitem 2000 zł nie wchodzi do puli', () => {
    expect(matchesFilters(fixtureById('test-ponad-limit-2100'), { budgetMax: 2000 })).toBe(false);
    expect(countPool(FIXTURE_PHONES, { budgetMax: 2000 })).toBe(4);
    expect(countPool([...FIXTURE_PHONES, overLimit()], { budgetMax: 2000 })).toBe(4);
  });

  it('filtr pamięci 256 GB odrzuca wariant 128 GB', () => {
    const pool = buildPool(FIXTURE_PHONES, { budgetMax: 2000, minStorageGb: 256 });
    expect(pool.map((phone) => phone.id)).not.toContain('test-mala-pamiec-128');
    expect(pool.length).toBe(3);
  });

  it('filtr microSD zostawia jeden telefon i włącza pytanie warunkowe C3', () => {
    const pool = buildPool(FIXTURE_PHONES, { budgetMax: 2000, requireMicroSd: true });
    expect(pool.map((phone) => phone.id)).toEqual(['test-drogi-512-microsd']);
    expect(activeQuestions(FIXTURE_PHONES).map((question) => question.id)).toContain('C3');
    expect(activeQuestions(FIXTURE_PHONES).length).toBe(19);
    expect(activeQuestions([withMicroSd(flat)]).map((question) => question.id)).toContain('C3');
  });

  it('budżet sesji 1500 zł oznacza droższą kartę jako „powyżej budżetu”', () => {
    const result = rankFromAnswers(
      FIXTURE_PHONES,
      { F1: 'F1-a' },
      null,
    );
    expect(result.inBudgetCount).toBe(1);
    const over = result.cards.filter((entry) => !entry.inBudget);
    expect(over.length).toBeGreaterThan(0);
    expect(over[0]!.overBudgetBy).toBeGreaterThan(0);
  });
});

describe('fixture · remisy', () => {
  it('identyczne oceny i wyłączona cena → wygrywa tańszy, obie karty ze znacznikiem remisu', () => {
    const result = neutralRank(tiedPair());
    expect(result.ranked[0]!.score).toBe(result.ranked[1]!.score);
    expect(result.ranked[0]!.phoneId).toBe('remis-tanszy');
    expect(result.ranked[0]!.practicalTieWith).toBe('remis-drozszy');
    expect(result.ranked[1]!.practicalTieWith).toBe('remis-tanszy');
  });

  it('włączona cena rozstrzyga remis na korzyść tańszego telefonu', () => {
    const result = neutralRank(tiedPair(), 1.3);
    expect(result.ranked[0]!.phoneId).toBe('remis-tanszy');
    expect(result.ranked[0]!.score).toBeGreaterThan(result.ranked[1]!.score);
  });
});

describe('fixture · anonimizacja danych syntetycznych', () => {
  it('karty puli testowej nie zawierają nazw, marek ani nazw sklepów', () => {
    const result = rankFromAnswers(FIXTURE_PHONES, {}, null);
    const cards = toAnonCards(FIXTURE_PHONES, result, 2000);
    expect(cards.length).toBe(3);

    for (const card of cards) {
      const phone = fixtureById(card.phoneId);
      expect(findLeaks(card, collectForbiddenTokens(phone, FIXTURE_PHONES))).toEqual([]);
    }

    const serialized = JSON.stringify(cards);
    expect(serialized).not.toContain('TestBrand');
    expect(serialized).not.toContain('sklep-testowy');
    expect(serialized).not.toContain('example.test');
    expect(serialized).not.toContain('TestChip');
  });

  it('karty mają po sześć wierszy cech i cenę z datą', () => {
    const result = rankFromAnswers(FIXTURE_PHONES, {}, null);
    for (const card of toAnonCards(FIXTURE_PHONES, result, 2000)) {
      expect(card.facts.length).toBe(7);
      expect(card.priceCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(card.matchLabel.length).toBeGreaterThan(0);
    }
  });
});
