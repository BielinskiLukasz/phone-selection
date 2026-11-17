import type { CriterionId, ScoreConfidence } from './criteria';

/**
 * Typy danych telefonów (E2-01) — PROJECT 13 i realny schemat `src/data/phones.json`
 * (`_meta.schemaVersion = 1`).
 *
 * Zasada z PROJECT 13: brak danych to `null`, nigdy wartość zgadywana.
 */

export type PhoneStatus =
  | 'ok'
  | 'over_budget'
  | 'variant_swapped'
  | 'unverified'
  | 'needs_confirmation';

export interface ShopLink {
  /** Etykieta sklepu (w danych: `label`), pokazywana dopiero po ujawnieniu karty. */
  label?: string;
  /** Alias historyczny. */
  shop?: string;
  url: string;
  note?: string | null;
  /* FP1-06: cena, data i typ oferty przy każdym linku — bez „szoku cenowego” po kliknięciu. */
  pricePln?: number | null;
  checkedAt?: string | null;
  kind?: 'shop' | 'official' | 'marketplace' | 'compare' | null;
}

/** Dane ujawniane dopiero po wyborze karty (PROJECT 8) — w tym zdjęcia produktu. */
export interface Reveal {
  name: string;
  brand: string;
  /** Zdjęcie studyjne (przód + tył) pokazywane na miniaturze w rankingu i na karcie po wyborze. */
  imageUrl?: string | null;
  /** Zdjęcie prasowe w wyższej rozdzielczości — do rozwiniętych szczegółów i powiększenia. */
  photoUrl?: string | null;
  shopLinks: (ShopLink | string)[];
  /* FP1-06: stały przycisk „Sprawdź aktualną cenę” (porównywarka) — osobno od linków sklepów. */
  priceCompareUrl?: string | null;
  /* FP1-09: ręczna weryfikacja przed zakupem (wariant, cena, promocja, ładowarka, wsparcie, Mi Band) z datą. */
  verifiedForPurchaseAt?: string | null;
  verifiedForPurchase?: string[] | null;
}

export interface PriceObservation {
  pln: number;
  source: string;
  url?: string;
  checkedAt: string;
  providedBy?: string;
  note?: string | null;
}

export interface Price {
  pln: number;
  source: string;
  url?: string;
  /** Data sprawdzenia ceny, format RRRR-MM-DD. */
  checkedAt: string;
  providedBy?: string;
  /** @deprecated FP1-08: zastąpione przez `userNote` (dla użytkowniczki) i `auditNote` (notatki weryfikacyjne). */
  note?: string | null;
  userNote?: string | null;
  auditNote?: string | null;
  /* FP1-04: promocje — cena regularna, data końca i warunek (kod, limit sztuk, marketplace). */
  regularPricePln?: number | null;
  promoEndsAt?: string | null;
  promoCondition?: string | null;
  /* FP1-01: data, od której oferta z `pln` jest niedostępna (sprzedaż zakończona / cena wzrosła ponad limit). */
  priceUnavailableSince?: string | null;
  otherObservations?: PriceObservation[];
}

export interface Variant {
  ramGb: number;
  storageGb: number;
  /** Pozycja z listy wejściowej, z której pochodzi wariant. */
  fromList?: string | null;
  label?: string | null;
  variantOf?: string | null;
}

/**
 * Aparaty jako opisy ze źródeł (np. „50 MP f/1.8 z OIS”, „50 MP peryskopowy, zoom 3,5x”).
 * `null` = telefon nie ma tego aparatu albo brak danych; liczby Mpix wyciąga `lib/anonymize.ts`.
 */
export interface CameraSpecs {
  /* Forma produkcyjna: opisy ze źródeł („50 MP f/1.8 z OIS”). */
  main?: string | null;
  ultrawide?: string | null;
  macro?: string | null;
  selfie?: string | null;
  telephoto?: string | null;
  /* Forma liczbowa (dane ustrukturyzowane / starsze fixture): liczba Mpix. */
  mainMp?: number | null;
  mainOis?: boolean | null;
  ultrawideMp?: number | null;
  ultraWideMp?: number | null;
  selfieMp?: number | null;
  telephotoMp?: number | null;
}

/** Ekran jako obiekt — alternatywa dla pól `displayInch` / `panel` / `refreshHz`. */
export interface DisplaySpec {
  sizeInches?: number | null;
  inches?: number | null;
  panel?: string | null;
  refreshHz?: number | string | null;
  peakNits?: number | null;
}

/** Wsparcie aktualizacjami jako obiekt — alternatywa dla `updatesYears` i pól pochodnych. */
export interface UpdatesSpec {
  osVersions?: number | null;
  osUpdates?: number | null;
  securityYears?: number | null;
  years?: number | null;
}

export interface Specs {
  /* FP1-07 / FP4-03: koniec poprawek bezpieczeństwa (RRRR-MM), data premiery i uwagi o opasce (Mi Band 6). */
  securitySupportUntil?: string | null;
  supportNote?: string | null;
  releasedAt?: string | null;
  wearableNotes?: string | null;
  displayInch?: number | null;
  /** Opis ekranu jako tekst albo obiekt z przekątną, panelem i odświeżaniem. */
  display?: string | DisplaySpec | null;
  panel?: string | null;
  /** Liczba (120) albo zakres ze źródeł („60-120”). */
  refreshHz?: number | string | null;
  resolution?: string | null;
  peakNits?: number | null;
  ramGb?: number | null;
  ramType?: string | null;
  storageGb?: number | null;
  storageType?: string | null;
  microSd?: boolean | null;
  chip?: string | null;
  batteryMah?: number | null;
  /** Wytrzymałość 0-100 — drugi składnik oceny `battery` (reguły w `data/scoringRules.ts`). */
  batteryEndurance?: number | null;
  batteryNote?: string | null;
  batteryType?: string | null;
  batteryCycles?: number | null;
  batteryTests?: string[];
  realWorldBattery?: string | null;
  chargingW?: number | null;
  chargingNote?: string | null;
  chargingTests?: string | null;
  chargerInBox?: boolean | null;
  wirelessCharging?: boolean | null;
  wirelessW?: number | null;
  ip?: string | null;
  ipNote?: string | null;
  militaryStandard?: string | null;
  glass?: string | null;
  back?: string | null;
  frame?: string | null;
  weightG?: number | null;
  weightNote?: string | null;
  heightMm?: number | null;
  widthMm?: number | null;
  thicknessMm?: number | null;
  dimensionsMm?: string | null;
  cameras?: CameraSpecs | null;
  video?: string | null;
  os?: string | null;
  updatesYears?: number | null;
  updatesOsGenerations?: number | null;
  updatesSecurityYears?: number | null;
  updatesNote?: string | null;
  /** Opis wsparcia jako tekst albo obiekt z liczbą wersji i latami poprawek. */
  updates?: string | UpdatesSpec | null;
  sim?: string | null;
  nfc?: boolean | null;
  wifi?: string | null;
  bluetooth?: string | null;
  connectivity?: string | null;
  fingerprint?: string | null;
  speakers?: string | null;
  stereoSpeakers?: boolean | null;
  satelliteSos?: boolean | null;
  polishLaunchPricePln?: number | string | null;
  performanceNote?: string | null;
  refreshNote?: string | null;
  sourceNote?: string | null;
  reviewNotes?: string[];
}

/** Oceny 0-100; `null` dozwolone wyłącznie dla `value` (liczone z ceny). */
export type PhoneScores = Record<CriterionId, number | null>;

export interface Phone {
  id: string;
  /** Ustandaryzowana nazwa marki — do filtra wykluczeń (etap 11, E11-02); nie trafia na anonimową kartę. */
  brand: string;
  /** Nazwa modelu bez marki — do listy wykluczeń (etap 11, E11-02); nie trafia na anonimową kartę. */
  modelName: string;
  status: PhoneStatus;
  reveal: Reveal;
  variant: Variant;
  price: Price;
  specs: Specs;
  scores: PhoneScores;
  basis: Partial<Record<CriterionId, string>>;
  /** Źródła, z których pochodzą dane (nie trafiają na kartę anonimową). */
  sources?: string[];
  scoreConfidence?: Partial<Record<CriterionId, ScoreConfidence>>;
  scoresEstimatedNeutral?: CriterionId[];
}

export interface PhonesData {
  _meta: {
    schemaVersion?: number;
    currency?: string;
    budgetMaxPln?: number;
    generatedOn: string | null;
    rules?: string[];
    scoresNote?: string;
    note?: string;
  };
  phones: Phone[];
}
