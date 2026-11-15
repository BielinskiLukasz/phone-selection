import type { Phone } from '../../src/types';
import { FIXTURE_PHONES, buildPhone, fixtureById, makePhone } from './phones';

/**
 * Fixture'y puli testowej (E2-11/E2-12) — kontrolowane przypadki brzegowe.
 * Typy danych pochodzą z barrela `src/types` (jedna definicja `Phone` w projekcie).
 */

export { buildPhone, fixtureById, makePhone };
export { FIXTURE_PHONES, FIXTURE_POOL, FIXTURE_POOL_WITHIN_LIMIT, PHONES } from './phones';
export type { PhoneSeed } from './phones';

export const fixturePool: Phone[] = FIXTURE_PHONES;

/** Dwa telefony o identycznych ocenach i identycznej cenie — czysty remis punktowy. */
export function tiedPair(): Phone[] {
  const base = fixtureById('test-tani-256');
  const cheaper: Phone = {
    ...structuredClone(base),
    id: 'remis-tanszy',
    reveal: { name: 'Remis Tanszy', brand: 'TestBrand', shopLinks: [] },
    price: { ...base.price, pln: base.price.pln - 200 },
  };
  const pricier: Phone = {
    ...structuredClone(base),
    id: 'remis-drozszy',
    reveal: { name: 'Remis Drozszy', brand: 'TestBrand', shopLinks: [] },
  };
  return [pricier, cheaper];
}

/** Klon ze slotem microSD — sprawdza filtr „musi mieć” i pytanie warunkowe C3. */
export function withMicroSd(phone: Phone = fixtureById('test-tani-256')): Phone {
  return {
    ...structuredClone(phone),
    id: `${phone.id}-microsd`,
    specs: { ...phone.specs, microSd: true },
  };
}

/** Klon powyżej twardego limitu strony (2000 zł). */
export function overLimit(phone: Phone = fixtureById('test-drogi-512-microsd')): Phone {
  return {
    ...structuredClone(phone),
    id: `${phone.id}-2100`,
    status: 'over_budget',
    price: { ...phone.price, pln: 2100 },
  };
}

/** Klon z pamięcią 128 GB — do testów filtra minimalnej pamięci. */
export function smallStorage(phone: Phone = fixtureById('test-srodkowy-256')): Phone {
  return {
    ...structuredClone(phone),
    id: `${phone.id}-128`,
    variant: { ...phone.variant, storageGb: 128 },
    scores: { ...phone.scores, storage: 40 },
  };
}
