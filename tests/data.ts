import phonesData from '../src/data/phones.json';
import type { Phone } from '../src/types';
import { isCompleteRecord } from '../src/data/phones';

/**
 * Pula testowa = prawdziwe dane z `src/data/phones.json` (15 telefonów po etapie 10).
 * Jeden rzut na granicy JSON → typy: rekordy są heterogeniczne (np. `refreshHz` bywa
 * zakresem „60-120”), a kształt pilnuje `tests/phones-schema.test.ts` i `validate-data`.
 */
export const RAW_RECORDS: Phone[] = (phonesData.phones ?? []) as Phone[];

/**
 * Pula rankingowa = kompletne rekordy w twardym limicie ceny i bez statusu `over_budget` — dokładnie to, co
 * rankinguje silnik (`matchesFilters`). Szkice kandydatów i rekordy ponad limit pilnuje `RAW_RECORDS`.
 */
export const POOL: Phone[] = RAW_RECORDS.filter(
  (phone) =>
    isCompleteRecord(phone) &&
    phone.status !== 'over_budget' &&
    typeof phone.price.pln === 'number' &&
    phone.price.pln <= 2000,
);

/**
 * Rekordy dodane po ustaleniu stanu referencyjnego kalibracji i person (pula 22 modeli, 18.11.2026): testy
 * kalibracji, person i suwaków mierzą ranking na tym stanie, a nie na każdej kolejnej puli. Wpływ nowych
 * rekordów na ranking pilnuje osobny test w `tests/persona.test.ts`.
 */
export const ADDED_AFTER_REFERENCE_IDS = ['motorola-edge-60-pro-12-512', 'tcl-50-nxtpaper-5g-8-256'];

/** Pula 22 modeli ze stanu referencyjnego kalibracji (bez rekordów z `ADDED_AFTER_REFERENCE_IDS`). */
export const REFERENCE_POOL: Phone[] = POOL.filter((phone) => !ADDED_AFTER_REFERENCE_IDS.includes(phone.id));

/**
 * Pula, w której przy budżecie sesji mieszczą się dokładnie 2 telefony (najtańsze) — do testów uzupełniania
 * karty „Powyżej budżetu”. Liczona z danych, więc nie zależy od tego, ile telefonów jest w puli.
 */
export function poolWithTwoInBudget(budget = 1500): Phone[] {
  const cheapest = POOL.filter((phone) => phone.price.pln <= budget)
    .sort((a, b) => a.price.pln - b.price.pln)
    .slice(0, 2)
    .map((phone) => phone.id);
  return POOL.filter((phone) => phone.price.pln > budget || cheapest.includes(phone.id));
}

/** Budżet, przy którym w puli mieszczą się dokładnie 2 telefony (środek między 2. a 3. najtańszym). */
export function tightBudget(): number {
  const prices = POOL.map((phone) => phone.price.pln).sort((a, b) => a - b);
  return Math.floor((prices[1]! + prices[2]!) / 2);
}

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
