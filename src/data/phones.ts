import phonesData from './phones.json';
import type { Phone, PhonesData } from '@/types';

const data = phonesData as PhonesData;

/** Wszystkie rekordy z pliku, także szkice kandydatów (`unverified` / `needs_confirmation`) bez specyfikacji. */
export const ALL_RECORDS: Phone[] = data.phones ?? [];

/**
 * Rekord nadaje się do rankingu tylko z kompletem sekcji; szkic kandydata (sam `reveal` i status)
 * nie ma `variant`, `specs`, `price`, `scores` ani `basis`, więc wyjątek w `price.pln` wywalał całą aplikację.
 */
export function isCompleteRecord(phone: Phone): boolean {
  const record = phone as unknown as Record<string, unknown>;
  return ['variant', 'specs', 'price', 'scores', 'basis'].every(
    (key) => typeof record[key] === 'object' && record[key] !== null,
  );
}

/** Kompletne rekordy, także oznaczone `over_budget` — do wyszukiwania po id (stare sesje mogą wskazywać taki telefon). */
const COMPLETE_RECORDS: Phone[] = ALL_RECORDS.filter(isCompleteRecord);

/**
 * Pula produkcyjna i wersja danych (do snapshotu rankingu w sesji, E3-06). Bez rekordów `over_budget`: nie wejdą do
 * żadnego rankingu, więc nie mogą też zawyżać liczników puli, katalogu marek ani pytania o microSD.
 */
export const PHONES: Phone[] = COMPLETE_RECORDS.filter((phone) => phone.status !== 'over_budget');

/** `_meta.generatedOn` — wersja danych, przy której liczony był ranking. */
export const DATA_VERSION: string | null = data._meta?.generatedOn ?? null;

export const DATA_BUDGET_LIMIT: number = data._meta?.budgetMaxPln ?? 2000;

export function phoneById(id: string): Phone | undefined {
  return COMPLETE_RECORDS.find((phone) => phone.id === id);
}
