import { describe, expect, it } from 'vitest';
import { POOL } from './data';
import { RELEASE_MAX_AGE_DAYS, priceAges, stalePrices } from '../scripts/stale-prices';
import { priceFreshness } from '../src/data/pool';

/** E9-05 i test akceptacyjny 2: wiek cen przed wydaniem (próg 7 dni). */

const RELEASE_DAY = new Date('2026-11-18T12:00:00.000Z');

describe('E9-05 · npm run stale-prices', () => {
  it('próg wydania to 7 dni, a wiek liczy się z checkedAt', () => {
    expect(RELEASE_MAX_AGE_DAYS).toBe(7);
    const ages = priceAges(POOL, RELEASE_DAY);
    expect(ages.length).toBe(POOL.length);
    for (const entry of ages) expect(entry.days).toBe(4); // 14.11 → 18.11
  });

  it('2. w dniu wydania żadna cena nie jest przeterminowana', () => {
    expect(stalePrices(POOL, RELEASE_DAY)).toEqual([]);
    expect(priceFreshness(POOL.map((phone) => phone.price.checkedAt), RELEASE_DAY).stale).toBe(false);
  });

  it('po tygodniu skrypt wskazuje wszystkie telefony do odświeżenia', () => {
    const monthLater = new Date('2026-12-20T12:00:00.000Z');
    expect(stalePrices(POOL, monthLater).length).toBe(POOL.length);
    expect(priceFreshness(POOL.map((phone) => phone.price.checkedAt), monthLater).stale).toBe(true);
  });

  it('rekordy bez daty są pomijane, a nie liczone jako świeże', () => {
    expect(priceAges([{ id: 'x', price: { pln: 1 } }], RELEASE_DAY)).toEqual([]);
    expect(priceAges([{ id: 'y' }], RELEASE_DAY)).toEqual([]);
    expect(stalePrices([{ id: 'z', price: { pln: 1, checkedAt: '2020-01-01' } }], RELEASE_DAY).length).toBe(1);
  });
});
