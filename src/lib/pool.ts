import type { Filters, Phone } from '@/types';
import { BUDGET_LIMIT } from './scoringConfig';

/**
 * Pula kandydatów (E2-06) — QUIZ-SPEC 2.5.
 * Filtry twarde liczone PRZED normalizacją i rankingiem.
 */

/** Telefon mieści się w twardym limicie strony (2000 zł). */
export function withinSiteLimit(phone: Phone): boolean {
  return typeof phone.price.pln === 'number' && phone.price.pln <= BUDGET_LIMIT;
}

/** Telefon mieści się w budżecie sesji (z odpowiedzi F1 albo z suwaków). */
export function inBudget(phone: Phone, budgetMax: number): boolean {
  return phone.price.pln <= budgetMax;
}

export function meetsStorageFilter(phone: Phone, filters: Filters): boolean {
  const min = filters.minStorageGb;
  if (typeof min !== 'number') return true;
  return phone.variant.storageGb >= min;
}

export function meetsMicroSdFilter(phone: Phone, filters: Filters): boolean {
  if (filters.requireMicroSd !== true) return true;
  return phone.specs.microSd === true;
}

/** Wszystkie twarde warunki udziału w puli. */
export function matchesFilters(phone: Phone, filters: Filters): boolean {
  return (
    withinSiteLimit(phone) &&
    phone.status !== 'over_budget' &&
    meetsStorageFilter(phone, filters) &&
    meetsMicroSdFilter(phone, filters)
  );
}

export function buildPool(phones: readonly Phone[], filters: Filters): Phone[] {
  return phones.filter((phone) => matchesFilters(phone, filters));
}

export function countPool(phones: readonly Phone[], filters: Filters): number {
  return buildPool(phones, filters).length;
}

/** Telefony z puli mieszczące się w budżecie sesji. */
export function inBudgetSubset(pool: readonly Phone[], budgetMax: number): Phone[] {
  return pool.filter((phone) => inBudget(phone, budgetMax));
}

/** Czy któryś telefon w puli ma slot microSD — warunek pytania C3. */
export function anyMicroSd(phones: readonly Phone[]): boolean {
  return phones.some((phone) => phone.specs.microSd === true);
}
