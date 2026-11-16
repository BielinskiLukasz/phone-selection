import { describe, expect, it } from 'vitest';
import { POOL, phoneById } from './data';
import {
  batteryScore,
  chargingScore,
  durabilityScore,
  storageScore,
  updatesScore,
  displayScoreFromHardware,
  enduranceFromGsmarenaHours,
  enduranceFromPcmarkHours,
  batteryCapacityScore,
  scoreFromProVariant,
} from '../src/data/scoringRules';
import type { Phone } from '../src/types';

/**
 * Spójność danych z regułami (PROJECT 7.5 + C1): oceny obiektywne w `phones.json`
 * muszą wynikać ze wzorów. Test łapie rozjazd przy każdej aktualizacji danych.
 */

const OBJECTIVE = ['battery', 'charging', 'updates', 'storage', 'durability'] as const;

function expectedScore(phone: Phone, criterion: (typeof OBJECTIVE)[number]): number | null {
  const { specs, variant } = phone;
  switch (criterion) {
    case 'battery':
      return batteryScore(specs.batteryMah, specs.batteryEndurance);
    case 'charging':
      return chargingScore(specs.chargingW, specs.wirelessCharging);
    case 'updates':
      return updatesScore(specs.updatesOsGenerations, specs.updatesSecurityYears, specs.updatesYears);
    case 'storage':
      return storageScore(variant.storageGb, specs.microSd);
    case 'durability':
      return durabilityScore(specs.ip, specs.militaryStandard);
    default:
      return null;
  }
}

describe('reguły ocen obiektywnych', () => {
  it('pojemność baterii (D4, etap 10): 4000 mAh = 0, 8000 mAh = 100, powyżej obcięte do 100', () => {
    expect(batteryCapacityScore(4000)).toBe(0);
    expect(batteryCapacityScore(6000)).toBe(50);
    expect(batteryCapacityScore(7000)).toBe(75);
    expect(batteryCapacityScore(8000)).toBe(100);
    expect(batteryCapacityScore(8340)).toBe(100);
    expect(batteryCapacityScore(null)).toBeNull();
  });

  it('wytrzymałość z testów: GSMArena (godziny) i PCMark', () => {
    expect(Math.round(enduranceFromGsmarenaHours(57 + 44 / 60))).toBe(59);
    expect(Math.round(enduranceFromPcmarkHours(17 + 34 / 60))).toBe(80);
    expect(Math.round(enduranceFromPcmarkHours(19))).toBe(92);
    expect(enduranceFromGsmarenaHours(40)).toBe(0);
    expect(enduranceFromPcmarkHours(20)).toBe(100);
  });

  it('ładowanie: (W − 15) / 75 × 100, +8 za bezprzewodowe', () => {
    expect(chargingScore(67, false)).toBe(69);
    expect(chargingScore(80, false)).toBe(87);
    expect(chargingScore(30, true)).toBe(28);
    expect(chargingScore(23, true)).toBe(19);
    expect(chargingScore(null, true)).toBeNull();
  });

  it('aktualizacje: lata / 7 × 100 ze średniej wersji i lat poprawek', () => {
    expect(updatesScore(4, 6)).toBe(71);
    expect(updatesScore(3, 5)).toBe(57);
    expect(updatesScore(3, 4)).toBe(50);
    expect(updatesScore(7, 7)).toBe(100);
    expect(updatesScore(3, null)).toBe(43); // znana tylko jedna składowa
    expect(updatesScore(null, null, 6)).toBe(86);
    expect(updatesScore(null, null, null)).toBeNull();
  });

  it('pamięć: 128 = 40, 256 = 75, 512 = 100, +5 za microSD', () => {
    expect(storageScore(128, false)).toBe(40);
    expect(storageScore(256, false)).toBe(75);
    expect(storageScore(256, true)).toBe(80);
    expect(storageScore(512, null)).toBe(100);
  });

  it('odporność: tabela klas IP z wierszem IP68/IP69 bez MIL-STD', () => {
    expect(durabilityScore('IP68/IP69', 'MIL-STD-810H')).toBe(100);
    expect(durabilityScore('IP69/IP68', 'MIL-STD-810H')).toBe(100);
    expect(durabilityScore('IP68/IP69', null)).toBe(95);
    expect(durabilityScore('IP68')).toBe(90);
    expect(durabilityScore('IP66/IP68')).toBe(88);
    expect(durabilityScore('IP67')).toBe(80);
    expect(durabilityScore('IP64')).toBe(55);
    expect(durabilityScore(null)).toBeNull();
  });

  it('ekran bez pomiarów: progi jasności + bonus za wysokie odświeżanie', () => {
    expect(displayScoreFromHardware(3200, 120)).toBe(80);
    expect(displayScoreFromHardware(5200, 144)).toBe(85);
    expect(displayScoreFromHardware(1900, 120)).toBe(70);
    expect(displayScoreFromHardware(1200, 120)).toBe(60);
    expect(displayScoreFromHardware(null, 120)).toBeNull();
  });

  it('aparat z testu wariantu Pro: −10 pkt', () => {
    expect(scoreFromProVariant(88)).toBe(78);
  });
});

describe('spójność ocen w phones.json z regułami', () => {
  it.each(POOL.map((phone) => [phone.id, phone] as const))(
    '%s: oceny obiektywne wynikają ze wzorów',
    (_id, phone) => {
      for (const criterion of OBJECTIVE) {
        const expected = expectedScore(phone, criterion);
        const stored = phone.scores[criterion];
        if (expected === null) {
          expect(stored, `${criterion} bez danych → 50`).toBe(50);
          continue;
        }
        expect(Math.abs((stored ?? 0) - expected), `${criterion}: ${stored} vs ${expected}`).toBeLessThanOrEqual(1);
      }
    },
  );

  it('każdy telefon ma udokumentowaną wytrzymałość baterii (składnik wzoru)', () => {
    for (const phone of POOL) {
      expect(typeof phone.specs.batteryEndurance, phone.id).toBe('number');
      expect((phone.basis.battery ?? '').length, phone.id).toBeGreaterThan(30);
    }
  });

  it('po uzupełnieniu danych nie ma ocen neutralnych z braku danych', () => {
    for (const phone of POOL) {
      expect(phone.scoresEstimatedNeutral ?? [], phone.id).toEqual([]);
    }
  });

  it('oceny „low” mają w basis zdanie o luce w danych', () => {
    const checked = POOL.filter((phone) =>
      Object.values(phone.scoreConfidence ?? {}).includes('low'),
    );
    expect(checked.length).toBeGreaterThan(0);
    for (const phone of checked) {
      for (const [criterion, confidence] of Object.entries(phone.scoreConfidence ?? {})) {
        if (confidence !== 'low') continue;
        const basis = phone.basis[criterion as keyof typeof phone.basis] ?? '';
        expect(
          /brak|rozbieżn|niezweryfikow|do potwierdzenia|obniżeni|bez niezależnych/i.test(basis),
          `${phone.id}.${criterion}: ${basis}`,
        ).toBe(true);
      }
    }
  });

  it('15T ma ekran i aktualizacje z oficjalnej specyfikacji, a nie wartość neutralną', () => {
    const xiaomi = phoneById('xiaomi-15t-12-512');
    expect(xiaomi.scores.display).toBe(80);
    expect(xiaomi.scores.updates).toBe(71);
    expect(xiaomi.scores.battery).toBe(48); // 0,5 × 37,5 (5500 mAh w skali 4000–8000) + 0,5 × 59
    expect(xiaomi.specs.peakNits).toBe(3200);
  });

  it('nowe modele etapu 10 mają spójne oceny z etykiet UE i reguły D4 (8000 mAh)', () => {
    expect(chargingScore(90, false)).toBe(100);
    expect(chargingScore(66, false)).toBe(68);
    expect(durabilityScore('IP65')).toBe(55);
    expect(updatesScore(5, 6)).toBe(79);
    expect(phoneById('redmi-note-17-pro-5g-8-512').scores.battery).toBe(100);
    expect(phoneById('vivo-v70-fe-5g-8-256').scores.battery).toBe(83);
    expect(phoneById('vivo-v70-fe-5g-8-256').scores.charging).toBe(100);
    expect(phoneById('honor-400-8-256').scores.updates).toBe(86);
    expect(phoneById('oneplus-nord-5-5g-8-256').scores.charging).toBe(87);
    expect(phoneById('galaxy-a37-5g-8-256').scores.durability).toBe(90);
  });
});
