import { describe, expect, it } from 'vitest';
import { POOL, RAW_RECORDS } from './data';
import { BUDGET_LIMIT } from '../src/lib/scoringConfig';

/**
 * Strażnik wydania (B9): twarde warunki, przy których nie publikujemy strony.
 * Miękkie luki (pewność `low`, pola `null` bez źródła) raportuje `npm run data-gaps`.
 */

const daysSince = (iso: string): number =>
  Math.floor((Date.now() - new Date(`${iso}T00:00:00.000Z`).getTime()) / 86_400_000);

describe('strażnik wydania', () => {
  it('żaden rekord nie czeka na potwierdzenie', () => {
    const unconfirmed = RAW_RECORDS.filter(
      (phone) => phone.status === 'needs_confirmation' || phone.status === 'unverified',
    );
    expect(unconfirmed.map((phone) => phone.id)).toEqual([]);
  });

  it('wszystkie ceny mieszczą się w twardym limicie i mają datę sprawdzenia', () => {
    for (const phone of POOL) {
      expect(phone.price.pln, phone.id).toBeGreaterThan(0);
      expect(phone.price.pln, phone.id).toBeLessThanOrEqual(BUDGET_LIMIT);
      expect(phone.price.checkedAt, phone.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('ceny nie są starsze niż 30 dni (próg walidatora; etap 9 zaostrza do 7 dni)', () => {
    for (const phone of POOL) {
      expect(daysSince(phone.price.checkedAt), phone.id).toBeLessThanOrEqual(30);
    }
  });

  it('każda ocena ma uzasadnienie ze źródłem i poziom pewności', () => {
    for (const phone of POOL) {
      expect((phone.sources ?? []).length, phone.id).toBeGreaterThan(0);
      for (const [criterion, score] of Object.entries(phone.scores)) {
        if (criterion === 'value') continue;
        expect(typeof score, `${phone.id}.${criterion}`).toBe('number');
        expect((phone.basis[criterion as keyof typeof phone.basis] ?? '').length, phone.id).toBeGreaterThan(20);
        expect(
          ['high', 'medium', 'low'],
          `${phone.id}.${criterion}: pewność`,
        ).toContain(phone.scoreConfidence?.[criterion as keyof typeof phone.scoreConfidence]);
      }
    }
  });

  it('żadna ocena nie jest „z braku danych” — wszystko ma źródło', () => {
    for (const phone of POOL) {
      expect(phone.scoresEstimatedNeutral ?? [], phone.id).toEqual([]);
    }
  });

  it('linki nie mają parametrów śledzących, a dane ujawniane są pełne', () => {
    for (const phone of POOL) {
      expect(phone.reveal.name.length, phone.id).toBeGreaterThan(5);
      expect(phone.reveal.brand.length, phone.id).toBeGreaterThan(1);
      for (const link of phone.reveal.shopLinks) {
        const url = typeof link === 'string' ? link : link.url;
        expect(url.startsWith('https://'), url).toBe(true);
        expect(/utm_|ceneo_cid/.test(url), url).toBe(false);
      }
    }
  });
});
