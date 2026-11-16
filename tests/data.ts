import phonesData from '../src/data/phones.json';
import type { Phone } from '../src/types';

/**
 * Pula testowa = prawdziwe dane z `src/data/phones.json` (15 telefonów po etapie 10).
 * Jeden rzut na granicy JSON → typy: rekordy są heterogeniczne (np. `refreshHz` bywa
 * zakresem „60-120”), a kształt pilnuje `tests/phones-schema.test.ts` i `validate-data`.
 */
export const POOL: Phone[] = (phonesData.phones ?? []) as Phone[];

export function phoneById(id: string): Phone {
  const found = POOL.find((phone) => phone.id === id);
  if (!found) throw new Error(`Brak telefonu „${id}” w puli.`);
  return found;
}

export function clonePhone(phone: Phone, patch: Partial<Phone> = {}): Phone {
  return structuredClone({ ...phone, ...patch });
}

/** Dwa telefony o identycznych ocenach, różniące się tylko ceną — do testu remisu. */
export function tiedPair(): Phone[] {
  const base = phoneById('galaxy-a57-8-256');
  const cheaper = clonePhone(base, {
    id: 'remis-tanszy',
    reveal: { name: 'Remis Tanszy', brand: 'Remis', shopLinks: [] },
    price: { ...base.price, pln: base.price.pln - 200 },
  });
  const pricier = clonePhone(base, {
    id: 'remis-drozszy',
    reveal: { name: 'Remis Drozszy', brand: 'Remis', shopLinks: [] },
  });
  return [pricier, cheaper];
}

/** Klon ze slotem microSD — sprawdza filtr i pytanie warunkowe C3. */
export function withMicroSd(phone: Phone = phoneById('galaxy-a57-8-256')): Phone {
  return clonePhone(phone, {
    id: `${phone.id}-microsd`,
    specs: { ...phone.specs, microSd: true },
  });
}

/** Klon powyżej twardego limitu strony. */
export function overLimit(phone: Phone = phoneById('xiaomi-15t-12-512')): Phone {
  return clonePhone(phone, {
    id: `${phone.id}-2100`,
    price: { ...phone.price, pln: 2100 },
    status: 'over_budget',
  });
}

/** Telefony z pamięcią 128 GB (Pixel 10a i 9a) — do testów filtra pamięci. */
export const SMALL_STORAGE_IDS = POOL.filter((phone) => phone.variant.storageGb < 256).map(
  (phone) => phone.id,
);
