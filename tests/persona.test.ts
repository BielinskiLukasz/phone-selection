import { describe, expect, it } from 'vitest';
import phoneData from '../src/data/phones.json';
import { rank } from '../src/lib/scoring';
import type { Phone, PhoneData } from '../src/types/phone';
import { validatePhoneData } from '../scripts/validate-data';
import { SYNTHETIC_PHONES } from './fixtures/phones';
import { personas } from './personas';

function average(phones: readonly Phone[], ids: readonly string[], criterion: 'battery' | 'photoDay') {
  const selected = phones.filter((phone) => ids.includes(phone.id));
  return selected.reduce((total, phone) => total + phone.scores[criterion], 0) / selected.length;
}

describe('persona invariants', () => {
  it('keeps the wife profile focused on storage and battery using synthetic phones', () => {
    const persona = personas.wife;
    const result = rank({ phones: SYNTHETIC_PHONES, ...persona });
    const ids = result.cards.map((card) => card.phoneId);
    expect(ids).toHaveLength(3);
    expect(SYNTHETIC_PHONES.filter((phone) => ids.includes(phone.id)).every((phone) => phone.variant.storageGb >= 256)).toBe(true);
    expect(average(SYNTHETIC_PHONES, ids, 'battery')).toBeGreaterThanOrEqual(
      average(SYNTHETIC_PHONES, SYNTHETIC_PHONES.map((phone) => phone.id), 'battery'),
    );
    const filtered = rank({ phones: SYNTHETIC_PHONES, ...persona, filters: { minStorageGb: 256 } });
    expect(filtered.cards[0]?.phoneId).toBe(result.cards[0]?.phoneId);
    const budget = rank({ phones: SYNTHETIC_PHONES, ...persona, filters: { budgetMax: 1500 } });
    expect(budget.cards).toHaveLength(3);
    expect(budget.cards.filter((card) => card.overBudgetBy === undefined)).toHaveLength(2);
  });

  it('differentiates the battery and camera profiles', () => {
    const camera = rank({ phones: SYNTHETIC_PHONES, ...personas.camera });
    const battery = rank({ phones: SYNTHETIC_PHONES, ...personas.battery });
    const cameraIds = camera.cards.map((card) => card.phoneId);
    const batteryIds = battery.cards.map((card) => card.phoneId);
    expect(average(SYNTHETIC_PHONES, batteryIds, 'battery')).toBeGreaterThan(
      average(SYNTHETIC_PHONES, cameraIds, 'battery'),
    );
    expect(average(SYNTHETIC_PHONES, cameraIds, 'photoDay')).toBeGreaterThan(
      average(SYNTHETIC_PHONES, batteryIds, 'photoDay'),
    );
  });

  it('validates the synthetic schema and the local phones.json shape', () => {
    expect(validatePhoneData({ _meta: { generatedOn: '2026-11-15' }, phones: SYNTHETIC_PHONES }, new Date('2026-11-16')).errors).toEqual([]);
    expect(validatePhoneData(phoneData).errors).toEqual([]);
  });
});

const realPhones = (phoneData as PhoneData).phones;

if (realPhones.length === 0) {
  it.skip('real phone persona calibration requires the verified Etap 0 dataset', () => {});
} else {
  it('checks the specified wife-persona invariants on verified phones', () => {
    const persona = personas.wife;
    const result = rank({ phones: realPhones, ...persona });
    const ids = result.cards.map((card) => card.phoneId);
    expect(result.cards).toHaveLength(3);
    expect(realPhones.filter((phone) => ids.includes(phone.id)).every((phone) => phone.variant.storageGb >= 256)).toBe(true);
    expect(average(realPhones, ids, 'battery')).toBeGreaterThanOrEqual(
      average(realPhones, realPhones.map((phone) => phone.id), 'battery'),
    );
    expect(rank({ phones: realPhones, ...persona, filters: { minStorageGb: 256 } }).cards[0]?.phoneId).toBe(result.cards[0]?.phoneId);
    const lowerBudget = rank({ phones: realPhones, ...persona, filters: { budgetMax: 1500 } });
    expect(lowerBudget.cards).toHaveLength(3);
    expect(lowerBudget.cards.filter((card) => card.overBudgetBy === undefined)).toHaveLength(2);
  });

  it('differentiates verified camera and battery personas', () => {
    const battery = rank({ phones: realPhones, ...personas.battery });
    const camera = rank({ phones: realPhones, ...personas.camera });
    const batteryIds = battery.cards.map((card) => card.phoneId);
    const cameraIds = camera.cards.map((card) => card.phoneId);
    expect(average(realPhones, batteryIds, 'battery')).toBeGreaterThan(average(realPhones, cameraIds, 'battery'));
    expect(average(realPhones, cameraIds, 'photoDay')).toBeGreaterThan(average(realPhones, batteryIds, 'photoDay'));
  });
}