import { describe, expect, it } from 'vitest';
import { POOL, phoneById } from './data';
import { WIFE } from './personas';
import { rankFromAnswers } from '../src/lib/scoring';
import {
  NO_DATA,
  PRICE_NOTE,
  assertNoLeak,
  batteryFact,
  cameraFact,
  collectForbiddenTokens,
  displayPerformanceFact,
  durabilityFact,
  findLeaks,
  megapixels,
  panelLabel,
  performanceClass,
  plural,
  redact,
  refreshLabel,
  toAnonCard,
  toAnonCards,
  updatesFact,
  updatesInfo,
  yearsLabel,
  zoomFactor,
} from '../src/lib/anonymize';
import { matchDisplay, matchLabel } from '../src/lib/matchDisplay';
import type { AnonCard, Phone } from '../src/types';

const result = rankFromAnswers(POOL, WIFE.answers, WIFE.topThree);
const cards: AnonCard[] = toAnonCards(POOL, result, 2000);

function cardFor(phone: Phone): AnonCard {
  const ranked = result.ranked.find((entry) => entry.phoneId === phone.id);
  if (!ranked) throw new Error(`Telefon ${phone.id} nie trafił do rankingu.`);
  return toAnonCard(phone, ranked, { budgetMax: 2000, bestScore: result.bestScore, pool: POOL });
}

function factOf(card: AnonCard, key: string): string {
  const found = card.facts.find((fact) => fact.key === key);
  if (!found) throw new Error(`Brak wiersza ${key} na karcie.`);
  return found.value;
}

describe('E2-12 · test wycieku nazw', () => {
  it('karta żadnego telefonu nie zawiera nazwy, marki, modelu ani tokena chipa', () => {
    for (const phone of POOL) {
      const card = cardFor(phone);
      const leaks = findLeaks(card, collectForbiddenTokens(phone, POOL));
      expect(leaks, `Wyciek w karcie ${phone.id}: ${leaks.join(', ')}`).toEqual([]);
      expect(() => assertNoLeak(card, phone, POOL)).not.toThrow();
    }
  });

  it('karty z rankingu nie mają pól reveal ani linków do sklepów', () => {
    const serialized = JSON.stringify(cards);
    for (const key of ['reveal', 'brand', 'shopLinks', 'sources']) {
      expect(serialized).not.toContain(`"${key}"`);
    }
    for (const phone of POOL) {
      expect(serialized).not.toContain(phone.reveal.name);
      expect(serialized).not.toContain(phone.reveal.brand);
      for (const link of phone.reveal.shopLinks) {
        const url = typeof link === 'string' ? link : link.url;
        expect(serialized).not.toContain(url);
      }
    }
  });

  it('uzasadnienia ocen są czyszczone z nazw modeli, także odmienionych', () => {
    const card = cardFor(phoneById('pixel-10a-8-128'));
    const basisText = card.criteria.map((criterion) => criterion.basis).join(' ');
    expect(basisText).not.toMatch(/pixel/i);
    expect(basisText).not.toMatch(/tensor/i);
    expect(basisText).not.toContain('9a');
  });

  it('uzasadnienie cytujące inny model też jest czyszczone', () => {
    const card = cardFor(phoneById('galaxy-a57-8-256'));
    const smoothness = card.criteria.find((criterion) => criterion.id === 'smoothness')!;
    expect(smoothness.basis.toLowerCase()).not.toContain('exynos');
    expect(smoothness.basis).not.toContain('A56');
  });

  it('przy cenie nie ma nazwy sklepu — wraca ona dopiero po ujawnieniu', () => {
    for (const card of cards) {
      expect(card.priceNote).toBe(PRICE_NOTE);
      for (const phone of POOL) {
        for (const link of phone.reveal.shopLinks) {
          const label = typeof link === 'string' ? link : (link.label ?? '');
          if (label.length > 2) expect(card.priceNote.toLowerCase()).not.toContain(label);
        }
      }
    }
  });

  it('tokeny pochodzą z reveal, specs.chip i nazw sklepów całej puli', () => {
    const tokens = collectForbiddenTokens(phoneById('xiaomi-15t-12-512'), POOL);
    for (const expected of ['xiaomi', '15t', 'dimensity', 'mediatek', 'samsung', 'motorola']) {
      expect(tokens, expected).toContain(expected);
    }
  });

  it('redakcja zastępuje tokeny, także w odmianie', () => {
    expect(redact('Exynos 1680 i Exynosa 1580', ['exynos'])).toBe('— 1680 i — 1580');
    expect(redact('brak nazw', ['pixel'])).toBe('brak nazw');
  });
});

describe('E2-08 · parsowanie danych ze źródeł', () => {
  it('wyciąga Mpix z opisów aparatów', () => {
    expect(megapixels('50 MP f/1.8 z OIS')).toBe(50);
    expect(megapixels('200 MP (1/1,56″) z OIS')).toBe(200);
    expect(megapixels('3x zoom optyczny (potrójny aparat)')).toBeNull();
    expect(megapixels(null)).toBeNull();
    expect(megapixels(undefined)).toBeNull();
  });

  it('wyciąga krotność przybliżenia', () => {
    expect(zoomFactor('3x zoom optyczny')).toBe('3x');
    expect(zoomFactor('50 MP peryskopowy, zoom optyczny 3,5x')).toBe('3,5x');
    expect(zoomFactor('50 MP')).toBeNull();
  });

  it('sprowadza nazwy własne paneli do klasy technologii', () => {
    expect(panelLabel('Super AMOLED')).toBe('AMOLED');
    expect(panelLabel('AMOLED (CrystalRes)')).toBe('AMOLED');
    expect(panelLabel('pOLED')).toBe('OLED');
    expect(panelLabel('IPS LCD')).toBe('LCD');
    expect(panelLabel('Autorska nazwa producenta')).toBeNull();
  });

  it('odświeżanie jako liczba albo zakres ze źródeł', () => {
    expect(refreshLabel(144)).toBe('144 Hz');
    expect(refreshLabel('60-120')).toBe('60-120 Hz');
    expect(refreshLabel(null)).toBeNull();
  });

  it('lata wsparcia z pól liczbowych albo z opisu ze źródła', () => {
    expect(updatesInfo(phoneById('motorola-edge-70-fusion-12-256').specs)).toEqual({
      osUpdates: 3,
      securityYears: 5,
      years: null,
    });
    expect(updatesInfo(phoneById('motorola-edge-60-12-256').specs)).toEqual({
      osUpdates: 3,
      securityYears: 4,
      years: 4,
    });
    expect(updatesInfo(phoneById('nothing-phone-3a-12-256').specs).osUpdates).toBe(4);
    expect(updatesInfo(phoneById('xiaomi-15t-12-512').specs)).toEqual({
      osUpdates: null,
      securityYears: null,
      years: null,
    });
  });
});

describe('E2-08 · treść anonimowej karty (UI-SPEC 4)', () => {
  it('ma sześć wierszy cech w stałej kolejności i ze stałymi etykietami', () => {
    for (const card of cards) {
      expect(card.facts.map((fact) => fact.key)).toEqual([
        'battery',
        'camera',
        'storage',
        'updates',
        'durability',
        'displayPerformance',
      ]);
      expect(card.facts.map((fact) => fact.label)).toEqual([
        'Bateria',
        'Aparat',
        'Pamięć',
        'Aktualizacje',
        'Odporność',
        'Ekran i wydajność',
      ]);
    }
  });

  it('format wierszy dla telefonu z kompletem danych', () => {
    const fusion = phoneById('motorola-edge-70-fusion-12-256');
    expect(batteryFact(fusion.specs).value).toBe(
      '7000 mAh · ładowanie 68 W · bez ładowania bezprzewodowego',
    );
    expect(cameraFact(fusion).value).toBe(
      'Główny 50 MP ze stabilizacją · selfie 32 MP · bez aparatu do przybliżania · szeroki kąt 13 MP',
    );
    expect(updatesFact(fusion.specs).value).toBe('3 aktualizacje systemu, 5 lat poprawek');
    expect(durabilityFact(fusion.specs).value).toBe('Wodoszczelny i pyłoszczelny (IP68/IP69)');
    expect(displayPerformanceFact(fusion, 'medium').value).toBe(
      '6,78″ AMOLED 144 Hz · wydajność średnia',
    );
  });

  it('teleobiektyw: Mpix z krotnością, sama krotność, albo „bez aparatu do przybliżania”', () => {
    expect(cameraFact(phoneById('realme-16-pro-plus-5g-8-256')).value).toContain(
      'przybliżanie 50 MP (3,5x)',
    );
    expect(cameraFact(phoneById('motorola-edge-60-12-256')).value).toContain('przybliżanie 3x');
    expect(cameraFact(phoneById('pixel-10a-8-128')).value).toContain('bez aparatu do przybliżania');
  });

  it('zakres odświeżania i brak nazwy własnej panelu trafiają na kartę', () => {
    const pixel = cardFor(phoneById('pixel-10a-8-128'));
    expect(factOf(pixel, 'displayPerformance')).toBe('6,3″ OLED 60-120 Hz · wydajność średnia');
    expect(factOf(pixel, 'battery')).toBe(
      '5100 mAh · ładowanie 30 W · ładowanie bezprzewodowe',
    );
    expect(factOf(pixel, 'updates')).toBe('7 lat aktualizacji');
    expect(factOf(pixel, 'storage')).toBe('128 GB · bez karty microSD');
  });

  it('brak danych → „brak danych”, nigdy zero ani pusty wiersz', () => {
    const xiaomi = cardFor(phoneById('xiaomi-15t-12-512'));
    expect(factOf(xiaomi, 'camera')).toBe(NO_DATA);
    expect(factOf(xiaomi, 'updates')).toBe(NO_DATA);
    expect(factOf(xiaomi, 'durability')).toBe(NO_DATA);
    expect(factOf(xiaomi, 'battery')).toBe('5500 mAh');
    expect(factOf(xiaomi, 'displayPerformance')).toBe('ekran: brak danych · wydajność wysoka');
    expect(factOf(xiaomi, 'storage')).toBe('512 GB · karta microSD: brak danych');

    const edge60 = cardFor(phoneById('motorola-edge-60-12-256'));
    expect(factOf(edge60, 'durability')).toBe(NO_DATA);
    expect(factOf(edge60, 'displayPerformance')).toBe('6,67″ 120 Hz · wydajność średnia');

    for (const phone of POOL) {
      for (const fact of cardFor(phone).facts) {
        expect(fact.value.length, `${phone.id}/${fact.key}`).toBeGreaterThan(0);
        expect(fact.value, `${phone.id}/${fact.key}`).not.toBe('0');
        expect(fact.missing, `${phone.id}/${fact.key}`).toBe(fact.value === NO_DATA);
      }
    }
  });

  it('microSd: null oznacza brak danych, false oznacza brak slotu', () => {
    expect(factOf(cardFor(phoneById('redmi-note-15-pro-5g-8-256')), 'storage')).toBe(
      '256 GB · karta microSD: brak danych',
    );
    expect(factOf(cardFor(phoneById('nothing-phone-3a-12-256')), 'storage')).toBe(
      '256 GB · bez karty microSD',
    );
    expect(cardFor(phoneById('redmi-note-15-pro-5g-8-256')).hasMicroSd).toBeNull();
  });

  it('klasa IP: kombinacje i pojedyncze klasy mają opisy słowne', () => {
    expect(durabilityFact(phoneById('redmi-note-15-pro-5g-8-256').specs).value).toBe(
      'Odporny na silne strugi wody i wodoszczelny (IP66/IP68)',
    );
    expect(durabilityFact(phoneById('galaxy-a56-5g-8-256').specs).value).toBe(
      'Odporny na kurz i krótkie zanurzenie (IP67)',
    );
    expect(durabilityFact(phoneById('nothing-phone-3a-12-256').specs).value).toBe(
      'Odporny na zachlapania (IP64/IP65)',
    );
    expect(durabilityFact({}).missing).toBe(true);
  });

  it('klasa wydajności z smoothness: ≥75 wysoka, 55-74 średnia, <55 podstawowa', () => {
    expect(performanceClass(75)).toBe('high');
    expect(performanceClass(74)).toBe('medium');
    expect(performanceClass(55)).toBe('medium');
    expect(performanceClass(54)).toBe('basic');
    expect(performanceClass(null)).toBe('basic');
    expect(cardFor(phoneById('xiaomi-15t-12-512')).performanceClass).toBe('high');
    expect(cardFor(phoneById('motorola-edge-70-fusion-12-256')).performanceClass).toBe('medium');
  });

  it('cena z datą, miejsce, dopasowanie i flaga powyżej budżetu', () => {
    for (const card of cards) {
      expect(card.pricePln).toBeGreaterThan(0);
      expect(card.priceCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(card.place).toBeGreaterThanOrEqual(1);
      expect(card.place).toBeLessThanOrEqual(3);
      expect(card.matchPercent).toBeGreaterThanOrEqual(0);
      expect(card.matchPercent).toBeLessThanOrEqual(100);
      expect(card.overBudgetBy).toBeNull();
    }

    const tight = rankFromAnswers(POOL, { ...WIFE.answers, F1: 'F1-a' }, WIFE.topThree);
    const flagged = toAnonCards(POOL, tight, 1500).filter((card) => card.overBudgetBy !== null);
    expect(flagged.length).toBe(1);
    expect(flagged[0]!.overBudgetBy).toBe(158);
  });

  it('szczegóły kryteriów: ocena, pewność, uzasadnienie i znacznik szacunku', () => {
    const redmi = cardFor(phoneById('redmi-note-15-pro-5g-8-256'));
    expect(redmi.criteria.length).toBe(14);

    const updates = redmi.criteria.find((criterion) => criterion.id === 'updates')!;
    expect(updates.estimated).toBe(true);
    expect(updates.confidence).toBe('low');
    expect(updates.score).toBe(50);

    const value = redmi.criteria.find((criterion) => criterion.id === 'value')!;
    expect(value.estimated).toBe(false);
    expect(value.groupId).toBe('price');
    expect(value.score).toBeGreaterThan(0);

    const battery = redmi.criteria.find((criterion) => criterion.id === 'battery')!;
    expect(battery.score).toBe(68);
    expect(battery.label).toBe('Czas pracy na baterii');
    expect(battery.basis.length).toBeGreaterThan(20);
  });
});

describe('E2-09 · wyświetlanie dopasowania', () => {
  it('procent to round(S), a opis słowny różnicuje wąski przedział wyników', () => {
    expect(matchDisplay(71.4, 72).percent).toBe(71);
    expect(matchLabel(72)).toBe('bardzo dobre');
    expect(matchLabel(60)).toBe('dobre');
    expect(matchLabel(52)).toBe('przeciętne');
  });

  it('przeskalowanie względem najlepszego w puli trafia do szczegółów', () => {
    expect(matchDisplay(60, 72).rescaledPercent).toBe(83);
    expect(matchDisplay(60, null).rescaledPercent).toBeNull();
    expect(cards.find((card) => card.place === 1)?.matchRescaledPercent).toBe(100);
  });
});

describe('polskie formatowanie', () => {
  it('odmiana lat i aktualizacji', () => {
    expect(yearsLabel(1)).toBe('1 rok');
    expect(yearsLabel(3)).toBe('3 lata');
    expect(yearsLabel(5)).toBe('5 lat');
    expect(yearsLabel(22)).toBe('22 lata');
    expect(plural(1, 'aktualizacja', 'aktualizacje', 'aktualizacji')).toBe('aktualizacja');
    expect(plural(4, 'aktualizacja', 'aktualizacje', 'aktualizacji')).toBe('aktualizacje');
    expect(plural(5, 'aktualizacja', 'aktualizacje', 'aktualizacji')).toBe('aktualizacji');
  });
});
