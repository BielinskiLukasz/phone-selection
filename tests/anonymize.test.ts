import { describe, expect, it } from 'vitest';
import phoneData from '../src/data/phones.json';
import { toAnonCard } from '../src/lib/anonymize';
import { rank } from '../src/lib/scoring';
import type { Phone, PhoneData } from '../src/types/phone';
import { makePhone, SYNTHETIC_PHONES } from './fixtures/phones';

function stringsInside(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(stringsInside);
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => [key, ...stringsInside(item)]);
  }
  return [];
}

const performanceCases: [number, string][] = [
  [75, 'wysoka'], [55, 'średnia'], [54, 'podstawowa'],
];

describe('anonymous card boundary', () => {
  it('never projects IDs, names, brands, chip tokens, links, or raw basis text', () => {
    const result = rank({ phones: SYNTHETIC_PHONES });
    for (const ranked of result.ranking) {
      const phone = SYNTHETIC_PHONES.find((item) => item.id === ranked.phoneId)!;
      const card = toAnonCard(phone, ranked);
      const text = stringsInside(card).join(' ').toLowerCase();
      expect(card.features.map((feature) => feature.key)).toEqual([
        'battery', 'camera', 'storage', 'updates', 'durability', 'display',
      ]);
      expect(card.details).toHaveLength(14);
      for (const candidate of SYNTHETIC_PHONES) {
        const prohibited = [
          candidate.id,
          candidate.reveal.name,
          candidate.reveal.brand,
          candidate.specs.chip!,
          ...candidate.specs.chip!.split(/\W+/).filter((token) => token.length >= 3),
        ];
        for (const token of prohibited) expect(text).not.toContain(token.toLowerCase());
      }
      expect(text).not.toContain('https://');
    }
  });

  it('marks neutral estimates without presenting them as measured scores', () => {
    const original = SYNTHETIC_PHONES[0]!;
    const phone: Phone = {
      ...original,
      scoresEstimatedNeutral: ['photoIndoor', 'smoothness'],
      scoreConfidence: { ...original.scoreConfidence, photoIndoor: 'high' },
    };
    const ranked = rank({ phones: [phone] }).cards[0]!;
    const card = toAnonCard(phone, ranked);
    expect(card.details.find((detail) => detail.criterion === 'photoIndoor')).toMatchObject({
      estimated: true, confidence: 'low',
    });
    expect(card.features.find((feature) => feature.key === 'display')?.text).toContain('brak danych');
  });

  it('shows missing facts and rejects a mismatched ranking record', () => {
    const original = makePhone({ id: 'empty-facts', brand: 'HiddenBrand', price: 1500, storageGb: 256, battery: 60, charging: 60, camera: 60 });
    const phone = { ...original, specs: {} };
    const ranked = rank({ phones: [phone] }).cards[0]!;
    const card = toAnonCard(phone, ranked);
    expect(card.features.find((feature) => feature.key === 'battery')).toMatchObject({ missing: true, text: 'brak danych' });
    expect(card.features.find((feature) => feature.key === 'camera')?.missing).toBe(true);
    expect(card.features.find((feature) => feature.key === 'durability')?.missing).toBe(true);
    expect(() => toAnonCard({ ...phone, id: 'other-phone' }, ranked)).toThrow();
  });

  it('formats supported features from numbers and whitelists display and IP labels', () => {
    const original = SYNTHETIC_PHONES[0]!;
    const phone: Phone = {
      ...original,
      specs: {
        ...original.specs,
        wirelessCharging: true,
        microSd: true,
        ipRating: 'Branded IP68/IP69 special edition',
        display: { sizeInches: 6.75, panel: 'Branded OLED panel', refreshHz: 90 },
        cameras: { mainMp: 50, mainOis: false, telephotoMp: 12 },
      },
    };
    const card = toAnonCard(phone, rank({ phones: [phone] }).cards[0]!);
    expect(card.features[0]?.text).toContain('ładowanie bezprzewodowe');
    expect(card.features[1]?.text).toContain('aparat do przybliżania 12 MP');
    expect(card.features[2]?.text).toContain('karta microSD');
    expect(card.features[4]?.text).toBe('odporność IP68/IP69');
    expect(card.features[5]?.text).toContain('OLED');
    expect(stringsInside(card).join(' ')).not.toContain('Branded');
  });

  it.each(performanceCases)('derives performance class from smoothness %i', (score, label) => {
    const original = SYNTHETIC_PHONES[0]!;
    const phone = { ...original, scores: { ...original.scores, smoothness: score } };
    const ranked = rank({ phones: [phone] }).cards[0]!;
    expect(toAnonCard(phone, ranked).features.find((feature) => feature.key === 'display')?.text).toContain(label);
  });
});

const verifiedPhones = (phoneData as PhoneData).phones;

if (verifiedPhones.length === 0) {
  it.skip('real-phone anonymity checks require verified phone data', () => {});
} else {
  it('keeps every verified phone anonymous before a choice', () => {
    const ranking = rank({ phones: verifiedPhones });
    for (const ranked of ranking.ranking) {
      const phone = verifiedPhones.find((item) => item.id === ranked.phoneId)!;
      const projected = stringsInside(toAnonCard(phone, ranked)).join(' ').toLowerCase();
      for (const candidate of verifiedPhones) {
        for (const token of [candidate.reveal.name, candidate.reveal.brand, candidate.specs.chip ?? '']) {
          if (token) expect(projected).not.toContain(token.toLowerCase());
        }
      }
    }
  });
}