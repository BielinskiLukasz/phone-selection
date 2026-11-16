import phonesData from './phones.json';
import type { Phone, PhonesData } from '@/types';

/** Pula produkcyjna i wersja danych (do snapshotu rankingu w sesji, E3-06). */
const data = phonesData as PhonesData;

export const PHONES: Phone[] = data.phones ?? [];

/** `_meta.generatedOn` — wersja danych, przy której liczony był ranking. */
export const DATA_VERSION: string | null = data._meta?.generatedOn ?? null;

export const DATA_BUDGET_LIMIT: number = data._meta?.budgetMaxPln ?? 2000;

export function phoneById(id: string): Phone | undefined {
  return PHONES.find((phone) => phone.id === id);
}
