import type { Phone } from '../types/phone';
import type { Filters } from '../types/ranking';
import { SITE_BUDGET_MAX } from './scoringConfig';

export function getCandidatePool(phones: readonly Phone[], filters: Partial<Filters> = {}): Phone[] {
  return phones.filter((phone) =>
    phone.price.pln > 0 &&
    phone.price.pln <= SITE_BUDGET_MAX &&
    (filters.minStorageGb === undefined || phone.variant.storageGb >= filters.minStorageGb) &&
    (!filters.requireMicroSd || phone.specs.microSd === true),
  );
}

export function countPool(phones: readonly Phone[], filters: Partial<Filters> = {}): number {
  return getCandidatePool(phones, filters).length;
}