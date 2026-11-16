import { PHONES } from './phones';
import { buildBrandCatalog, type BrandCatalogGroup } from '@/lib/exclusions';
import type { Phone } from '@/types';

/**
 * Katalog nazw marek i modeli dla opcjonalnego filtra wykluczeń (E11-11).
 *
 * Ładowany dynamicznie (`import('@/data/exclusionCatalog')`) dopiero wtedy, gdy
 * użytkowniczka włączy „Chcę coś wykluczyć” — osoba klikająca „Pomiń” nie ładuje
 * ani nie renderuje żadnej nazwy marki ani modelu (decyzja 1 i 6).
 */
export function getExclusionCatalog(phones: readonly Phone[] = PHONES): BrandCatalogGroup[] {
  return buildBrandCatalog(phones);
}
