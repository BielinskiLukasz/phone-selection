import type { ExclusionReason, Filters, Phone } from '@/types';
import { buildPool } from './pool';
import { CARD_COUNT, TIE_THRESHOLD } from './scoringConfig';

/**
 * Czysta logika wykluczeń marek i modeli (etap 11, E11-03/E11-04) — bez Reacta i bez DOM.
 *
 * Zasady (ETAP-11, decyzje 2-8):
 * - wykluczenie działa na dwóch poziomach: całe marki (`excludedBrands`, bez rozróżniania
 *   wielkości liter — obejmuje też modele dodane w przyszłości) i pojedyncze `phone.id`,
 * - normalizacja i pełny ranking liczą się na pełnej puli po filtrach twardych,
 * - wykluczenia filtrują wyłącznie dobór trzech kart (w tym uzupełnienie powyżej budżetu),
 * - nie można wykluczyć wszystkiego (`remaining === 0` → błąd), 1-2 → ostrzeżenie.
 */

export type ExclusionValidationStatus = 'ok' | 'warn' | 'error';

export interface ExclusionValidation {
  status: ExclusionValidationStatus;
  remaining: number;
  excluded: number;
  total: number;
  canProceed: boolean;
}

export interface ExclusionSelection {
  excludedBrands: string[];
  excludedPhoneIds: string[];
}

export interface BrandCatalogItem {
  id: string;
  brand: string;
  modelName: string;
}

export interface BrandCatalogGroup {
  brand: string;
  count: number;
  models: BrandCatalogItem[];
}

function brandKey(brand: string): string {
  return brand.trim().toLowerCase();
}

/** Ustandaryzowana marka rekordu (E11-02), z bezpiecznym fallbackiem na `reveal.brand`. */
export function brandOf(phone: Phone): string {
  const top = typeof phone.brand === 'string' ? phone.brand.trim() : '';
  return top.length > 0 ? top : phone.reveal.brand.trim();
}

/** Nazwa modelu bez marki (E11-02), z fallbackiem ucinającym prefiks marki z `reveal.name`. */
export function modelNameOf(phone: Phone): string {
  const top = typeof phone.modelName === 'string' ? phone.modelName.trim() : '';
  if (top.length > 0) return top;
  const brand = brandOf(phone);
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return phone.reveal.name.replace(new RegExp(`^${escaped}\\s+`, 'i'), '').trim() || phone.reveal.name;
}

/** Oczyszcza tablicę stringów z duplikatów, pustych wartości i uszkodzonych typów z magazynu. */
export function sanitizeStringList(value: unknown, caseInsensitive = false): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (trimmed.length === 0) continue;
    const key = caseInsensitive ? trimmed.toLowerCase() : trimmed;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }

  return out;
}

export function normalizeExclusions(
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'> | null | undefined,
): ExclusionSelection {
  return {
    excludedBrands: sanitizeStringList(filters?.excludedBrands, true),
    excludedPhoneIds: sanitizeStringList(filters?.excludedPhoneIds, false),
  };
}

export function hasExclusions(
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'> | null | undefined,
): boolean {
  const { excludedBrands, excludedPhoneIds } = normalizeExclusions(filters);
  return excludedBrands.length > 0 || excludedPhoneIds.length > 0;
}

export function isBrandExcluded(
  brand: string,
  filters: Pick<Filters, 'excludedBrands'> | null | undefined,
): boolean {
  const target = brandKey(brand);
  if (target.length === 0) return false;
  return sanitizeStringList(filters?.excludedBrands, true).some((item) => brandKey(item) === target);
}

/**
 * Powód wykluczenia telefonu: `'brand'` ma pierwszeństwo przed `'model'` i działa
 * także na telefony tej marki dodane do danych w przyszłości (decyzja 8).
 */
export function exclusionReason(
  phone: Phone,
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'> | null | undefined,
): ExclusionReason {
  if (!filters) return null;
  if (isBrandExcluded(brandOf(phone), filters)) return 'brand';
  const ids = sanitizeStringList(filters.excludedPhoneIds, false);
  if (ids.includes(phone.id)) return 'model';
  return null;
}

/** Zbiór identyfikatorów wszystkich wykluczonych telefonów z podanej listy (marki ∪ modele). */
export function effectiveExcludedIds(
  phones: readonly Phone[],
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'> | null | undefined,
): Set<string> {
  const excluded = new Set<string>();
  if (!filters) return excluded;
  for (const phone of phones) {
    if (exclusionReason(phone, filters) !== null) excluded.add(phone.id);
  }
  return excluded;
}

/** Telefony z puli po filtrach twardych, które NIE są wykluczone. */
export function remainingPhones(phones: readonly Phone[], filters: Filters): Phone[] {
  const pool = buildPool(phones, filters);
  const excluded = effectiveExcludedIds(pool, filters);
  return pool.filter((phone) => !excluded.has(phone.id));
}

/** Liczba telefonów, które zostają do kart po filtrach twardych i wykluczeniach. */
export function remainingCount(phones: readonly Phone[], filters: Filters): number {
  return remainingPhones(phones, filters).length;
}

/** Liczba telefonów w puli (po filtrach twardych) pominiętych przez wykluczenia. */
export function excludedInPoolCount(phones: readonly Phone[], filters: Filters): number {
  const pool = buildPool(phones, filters);
  return effectiveExcludedIds(pool, filters).size;
}

/** Walidacja wykluczeń (decyzja 7): 0 = blokada, 1-2 = ostrzeżenie, ≥3 = ok. */
export function validateExclusions(phones: readonly Phone[], filters: Filters): ExclusionValidation {
  const pool = buildPool(phones, filters);
  const excluded = effectiveExcludedIds(pool, filters).size;
  const remaining = pool.length - excluded;

  if (remaining <= 0) {
    return { status: 'error', remaining: 0, excluded, total: pool.length, canProceed: false };
  }
  if (remaining < CARD_COUNT) {
    return { status: 'warn', remaining, excluded, total: pool.length, canProceed: true };
  }
  return { status: 'ok', remaining, excluded, total: pool.length, canProceed: true };
}

/** Przełącza wykluczenie całej marki. */
export function toggleBrandExclusion(
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'>,
  brand: string,
): ExclusionSelection {
  const current = normalizeExclusions(filters);
  const key = brandKey(brand);
  const exists = current.excludedBrands.some((item) => brandKey(item) === key);

  return {
    excludedBrands: exists
      ? current.excludedBrands.filter((item) => brandKey(item) !== key)
      : [...current.excludedBrands, brand.trim()],
    excludedPhoneIds: current.excludedPhoneIds,
  };
}

/**
 * Uwzględnia ponownie wskazany telefon (E11-09). Gdy był wykluczony przez całą markę,
 * zdejmuje markę i przenosi pozostałe jej modele do `excludedPhoneIds`.
 */
export function includePhoneAgain(
  phones: readonly Phone[],
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'>,
  phoneId: string,
): ExclusionSelection {
  const current = normalizeExclusions(filters);
  const target = phones.find((phone) => phone.id === phoneId);
  const nextIds = new Set(current.excludedPhoneIds.filter((id) => id !== phoneId));

  if (!target) {
    return { excludedBrands: current.excludedBrands, excludedPhoneIds: [...nextIds] };
  }

  const key = brandKey(brandOf(target));
  const wasBrandExcluded = current.excludedBrands.some((item) => brandKey(item) === key);
  if (!wasBrandExcluded) {
    return { excludedBrands: current.excludedBrands, excludedPhoneIds: [...nextIds] };
  }

  for (const sibling of phones) {
    if (sibling.id !== phoneId && brandKey(brandOf(sibling)) === key) {
      nextIds.add(sibling.id);
    }
  }

  return {
    excludedBrands: current.excludedBrands.filter((item) => brandKey(item) !== key),
    excludedPhoneIds: [...nextIds],
  };
}

/** Przełącza wykluczenie pojedynczego modelu (uwzględnia też stan wykluczonej marki). */
export function toggleModelExclusion(
  phones: readonly Phone[],
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'>,
  phoneId: string,
): ExclusionSelection {
  const target = phones.find((phone) => phone.id === phoneId);
  if (target && exclusionReason(target, filters) !== null) {
    return includePhoneAgain(phones, filters, phoneId);
  }
  const current = normalizeExclusions(filters);
  return {
    excludedBrands: current.excludedBrands,
    excludedPhoneIds: current.excludedPhoneIds.includes(phoneId)
      ? current.excludedPhoneIds.filter((id) => id !== phoneId)
      : [...current.excludedPhoneIds, phoneId],
  };
}

/**
 * Dobiera do `cardCount` kart z pełnego rankingu (E11-04, E11-08):
 * tylko niewykluczone, najpierw mieszczące się w budżecie, potem uzupełnienie
 * powyżej budżetu wyłącznie z niewykluczonych; numeracja kart 1..k.
 */
/**
 * FP3-05: budżet elastyczny. `stretch` = { budgetMax, budgetStretch, priceOf } — gdy ustawione, karty to
 * (cardCount − 1) najlepsze telefony w budżecie oraz jeden najlepszy z pasma (budgetMax, budgetStretch],
 * jeśli ma wyższy wynik niż najlepszy telefon w budżecie. Gdy w paśmie nie ma lepszego — trzecia karta
 * z budżetu jak dotąd. Plakietka „Dopłata +X zł za +Y pkt” jest liczona na karcie z cen i S (anonymize).
 */
export interface StretchOptions {
  budgetMax: number;
  budgetStretch: number | null | undefined;
  priceOf: (phoneId: string) => number | null;
}

export function selectCardsFromFullRanking<
  T extends {
    phoneId: string;
    place: number;
    score: number;
    inBudget: boolean;
    practicalTieWith: string | null;
    excluded?: ExclusionReason;
  },
>(
  fullRanking: readonly T[],
  cardCount: number = CARD_COUNT,
  stretch?: StretchOptions,
): { cards: T[]; inBudgetCount: number; excludedCount: number } {
  const excludedCount = fullRanking.filter(
    (entry) => entry.excluded === 'brand' || entry.excluded === 'model',
  ).length;
  const eligible = fullRanking.filter(
    (entry) => entry.excluded !== 'brand' && entry.excluded !== 'model',
  );
  const withinBudget = eligible.filter((entry) => entry.inBudget);
  const aboveBudget = eligible.filter((entry) => !entry.inBudget);

  let ordered: T[] = [...withinBudget, ...aboveBudget];
  if (stretch && typeof stretch.budgetStretch === 'number' && stretch.budgetStretch > stretch.budgetMax && cardCount > 1) {
    const bestInBudget = withinBudget[0]?.score ?? Number.NEGATIVE_INFINITY;
    const candidate = aboveBudget.find((entry) => {
      const price = stretch.priceOf(entry.phoneId);
      return price !== null && price <= stretch.budgetStretch! && entry.score > bestInBudget;
    });
    if (candidate) {
      /* Dwie najlepsze w budżecie + jedna z pasma dopłaty; braki w budżecie dopełnia reszta pasma/ponad. */
      const base = withinBudget.slice(0, cardCount - 1);
      const rest = [...withinBudget.slice(cardCount - 1), ...aboveBudget.filter((entry) => entry !== candidate)];
      ordered = [...base, candidate, ...rest];
    }
  }

  const picked = ordered
    .slice(0, cardCount)
    .map((entry, index) => ({ ...entry, place: index + 1, practicalTieWith: null as string | null }));

  /* Praktyczny remis na karcie dotyczy sąsiada wśród wyświetlanych niewykluczonych kart. */
  picked.forEach((card, index) => {
    const previous = picked[index - 1];
    const next = picked[index + 1];
    if (previous && Math.abs(previous.score - card.score) < TIE_THRESHOLD) {
      card.practicalTieWith = previous.phoneId;
    } else if (next && Math.abs(card.score - next.score) < TIE_THRESHOLD) {
      card.practicalTieWith = next.phoneId;
    }
  });

  return { cards: picked, inBudgetCount: withinBudget.length, excludedCount };
}

/** Pogrupowany katalog marek i modeli — wyłącznie nazwy, bez cech i cen (decyzja 6). */
export function buildBrandCatalog(phones: readonly Phone[]): BrandCatalogGroup[] {
  const byKey = new Map<string, BrandCatalogGroup>();

  for (const phone of phones) {
    const brand = brandOf(phone);
    const key = brandKey(brand);
    const existing = byKey.get(key);
    const item: BrandCatalogItem = { id: phone.id, brand, modelName: modelNameOf(phone) };
    if (existing) {
      existing.models.push(item);
      existing.count = existing.models.length;
    } else {
      byKey.set(key, { brand, count: 1, models: [item] });
    }
  }

  return [...byKey.values()]
    .map((group) => ({
      ...group,
      models: [...group.models].sort((a, b) => a.modelName.localeCompare(b.modelName, 'pl')),
    }))
    .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, 'pl'));
}

/** Zwięzły opis wykluczeń do historii sesji („Xiaomi, Pixel 9a 8/128 GB”) albo `null`. */
export function formatExclusionsSummary(
  phones: readonly Phone[],
  filters: Pick<Filters, 'excludedBrands' | 'excludedPhoneIds'> | null | undefined,
): string | null {
  const { excludedBrands, excludedPhoneIds } = normalizeExclusions(filters);
  if (excludedBrands.length === 0 && excludedPhoneIds.length === 0) return null;

  const byId = new Map(phones.map((phone) => [phone.id, phone]));
  const parts: string[] = [...excludedBrands];

  for (const id of excludedPhoneIds) {
    const phone = byId.get(id);
    if (phone && isBrandExcluded(brandOf(phone), { excludedBrands })) continue;
    parts.push(phone ? `${brandOf(phone)} ${modelNameOf(phone)}` : id);
  }

  return parts.length > 0 ? parts.join(', ') : null;
}
