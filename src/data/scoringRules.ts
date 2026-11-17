/**
 * Reguły wyprowadzania ocen obiektywnych — PROJECT 7.5 + poprawka C1 (etap 0).
 *
 * To jedyna definicja wzorów dla pól liczonych z danych sprzętowych. Oceny w
 * `phones.json` muszą z nich wynikać; spójność pilnuje `tests/score-rules.test.ts`.
 *
 * C1 (zatwierdzone): dane „miękkie” przeliczamy tylko z udokumentowanych liczb,
 * a każdy wyjątek jest opisany w `basis` rekordu.
 */

/* ── Bateria ── */

export const BATTERY_CAPACITY_FLOOR_MAH = 4000;
export const BATTERY_CAPACITY_SPAN_MAH = 4000;

/** Pojemność: 4000 mAh = 0, 8000 mAh = 100 (D4, etap 10; powyżej 8000 mAh obcięte do 100). */
export function batteryCapacityScore(mah: number | null | undefined): number | null {
  if (typeof mah !== 'number' || !Number.isFinite(mah)) return null;
  return clamp(((mah - BATTERY_CAPACITY_FLOOR_MAH) / BATTERY_CAPACITY_SPAN_MAH) * 100);
}

/**
 * Wytrzymałość z testu GSMArena („estimated battery endurance”, godziny aktywnego
 * użycia): 40 h = 0, 70 h = 100.
 */
export const ENDURANCE_GSMARENA_FLOOR_H = 40;
export const ENDURANCE_GSMARENA_SPAN_H = 30;

export function enduranceFromGsmarenaHours(hours: number): number {
  return clamp(((hours - ENDURANCE_GSMARENA_FLOOR_H) / ENDURANCE_GSMARENA_SPAN_H) * 100);
}

/** Wytrzymałość z testu PCMark (91mobiles): 8 h = 0, 20 h = 100. */
export const ENDURANCE_PCMARK_FLOOR_H = 8;
export const ENDURANCE_PCMARK_SPAN_H = 12;

export function enduranceFromPcmarkHours(hours: number): number {
  return clamp(((hours - ENDURANCE_PCMARK_FLOOR_H) / ENDURANCE_PCMARK_SPAN_H) * 100);
}

/** `battery` = 0,5 × pojemność + 0,5 × wytrzymałość. */
export function batteryScore(
  mah: number | null | undefined,
  endurance: number | null | undefined,
): number | null {
  const capacity = batteryCapacityScore(mah);
  if (capacity === null || typeof endurance !== 'number' || !Number.isFinite(endurance)) return null;
  return Math.round(0.5 * capacity + 0.5 * clamp(endurance));
}

/* ── Ładowanie ── */

export const CHARGING_FLOOR_W = 15;
export const CHARGING_SPAN_W = 75;
export const WIRELESS_CHARGING_BONUS = 8;
/** C1: zawartość pudełka nie zmienia oceny ładowania (informacja dla użytkowniczki, nie jakość). */
export const CHARGER_IN_BOX_EFFECT = 0;

export function chargingScore(
  watts: number | null | undefined,
  wireless: boolean | null | undefined,
): number | null {
  if (typeof watts !== 'number' || !Number.isFinite(watts)) return null;
  const base = ((watts - CHARGING_FLOOR_W) / CHARGING_SPAN_W) * 100;
  return Math.round(clamp(base + (wireless === true ? WIRELESS_CHARGING_BONUS : 0) + CHARGER_IN_BOX_EFFECT));
}

/* ── Aktualizacje ── */

export const UPDATES_FULL_SUPPORT_YEARS = 7;

/**
 * `updates` = lata / 7 × 100, gdzie lata = średnia z liczby dużych wersji systemu
 * i lat poprawek. Gdy znana jest tylko jedna składowa — liczymy z niej.
 */
export function updatesScore(
  osVersions: number | null | undefined,
  securityYears: number | null | undefined,
  fallbackYears?: number | null,
): number | null {
  const os = positive(osVersions);
  const sec = positive(securityYears);
  if (os !== null && sec !== null) {
    return Math.round(clamp(((os + sec) / 2 / UPDATES_FULL_SUPPORT_YEARS) * 100));
  }
  const single = os ?? sec ?? positive(fallbackYears);
  if (single === null) return null;
  return Math.round(clamp((single / UPDATES_FULL_SUPPORT_YEARS) * 100));
}

/* ── Pamięć ── */

export const STORAGE_SCORES: Readonly<Record<number, number>> = { 128: 40, 256: 75, 512: 100 };
export const MICROSD_BONUS = 5;

export function storageScore(storageGb: number, microSd: boolean | null | undefined): number {
  const base = STORAGE_SCORES[storageGb] ?? (storageGb >= 512 ? 100 : storageGb >= 256 ? 75 : 40);
  return Math.round(clamp(base + (microSd === true ? MICROSD_BONUS : 0)));
}

/* ── Odporność (PROJECT 7.5 + wiersz dodany w C1) ── */

export const DURABILITY_RULES: readonly { score: number; label: string }[] = [
  { score: 100, label: 'IP68/IP69 + MIL-STD' },
  { score: 95, label: 'IP68/IP69 bez MIL-STD' },
  { score: 90, label: 'IP68' },
  { score: 92, label: 'IP66/IP68' },
  { score: 80, label: 'IP67' },
  { score: 70, label: 'IP66' },
  { score: 55, label: 'IP64/IP65' },
  { score: 45, label: 'IP53/IP54' },
];

export function durabilityScore(
  ip: string | null | undefined,
  militaryStandard?: string | null,
): number | null {
  if (typeof ip !== 'string' || ip.trim().length === 0) return null;
  const rating = ip.toUpperCase();
  const has68 = rating.includes('IP68');
  const has69 = rating.includes('IP69');
  const mil = typeof militaryStandard === 'string' && /MIL-STD/i.test(militaryStandard);

  if (has68 && has69) return mil ? 100 : 95;
  if (has69) return mil ? 100 : 95;
  /* FP4-05: IP66 + IP68 to więcej niż samo IP68 (strumienie wody + zanurzenie) → 92, nie 88. */
  if (has68) return rating.includes('IP66') ? 92 : 90;
  if (rating.includes('IP67')) return 80;
  if (rating.includes('IP66')) return 70;
  if (rating.includes('IP64') || rating.includes('IP65')) return 55;
  if (rating.includes('IP53') || rating.includes('IP54')) return 45;
  return null;
}

/* ── Wymiary i waga (poręczność — im mniejszy, smuklejszy i lżejszy, tym wyżej) ── */

/** Waga: 165 g = 100 pkt (bardzo lekki), 235 g = 0 pkt (bardzo ciężki). */
export const WEIGHT_LIGHT_G = 165;
export const WEIGHT_SPAN_G = 70;

/** Powierzchnia obudowy (wysokość × szerokość): 11 000 mm² = 100, 13 200 mm² = 0. */
export const FOOTPRINT_COMPACT_MM2 = 11_000;
export const FOOTPRINT_SPAN_MM2 = 2_200;

/** Grubość obudowy: 6,5 mm = 100 pkt, 9,5 mm = 0 pkt. */
export const THICKNESS_SLIM_MM = 6.5;
export const THICKNESS_SPAN_MM = 3.0;

export interface ParsedDimensions {
  heightMm: number;
  widthMm: number;
  thicknessMm: number;
}

/** Parsuje zapis „156,5 x 74,6 x 7,3” albo „156.5 × 74.6 × 7.3” do trzech liczb w mm. */
export function parseDimensionsMm(text: string | null | undefined): ParsedDimensions | null {
  if (typeof text !== 'string') return null;
  const match =
    /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i.exec(text);
  if (!match?.[1] || !match[2] || !match[3]) return null;
  const heightMm = Number(match[1].replace(',', '.'));
  const widthMm = Number(match[2].replace(',', '.'));
  const thicknessMm = Number(match[3].replace(',', '.'));
  if (!positive(heightMm) || !positive(widthMm) || !positive(thicknessMm)) return null;
  return { heightMm, widthMm, thicknessMm };
}

export function weightLightnessScore(weightG: number | null | undefined): number | null {
  const w = positive(weightG);
  if (w === null) return null;
  return clamp(((WEIGHT_LIGHT_G + WEIGHT_SPAN_G - w) / WEIGHT_SPAN_G) * 100);
}

export function footprintCompactnessScore(
  heightMm: number | null | undefined,
  widthMm: number | null | undefined,
): number | null {
  const h = positive(heightMm);
  const w = positive(widthMm);
  if (h === null || w === null) return null;
  const area = h * w;
  return clamp(((FOOTPRINT_COMPACT_MM2 + FOOTPRINT_SPAN_MM2 - area) / FOOTPRINT_SPAN_MM2) * 100);
}

export function thicknessSlimnessScore(thicknessMm: number | null | undefined): number | null {
  const t = positive(thicknessMm);
  if (t === null) return null;
  return clamp(((THICKNESS_SLIM_MM + THICKNESS_SPAN_MM - t) / THICKNESS_SPAN_MM) * 100);
}

/**
 * `compactness` = 0,45 × lekkość (g) + 0,45 × mała powierzchnia (wys. × szer.) + 0,10 × smukłość (mm).
 * Gdy znana jest tylko część składowych, wagi przeskalowują się proporcjonalnie; brak danych → null.
 */
export function compactnessScore(input: {
  weightG?: number | null;
  heightMm?: number | null;
  widthMm?: number | null;
  thicknessMm?: number | null;
  dimensionsMm?: string | null;
}): number | null {
  const parsed = parseDimensionsMm(input.dimensionsMm);
  const weight = weightLightnessScore(input.weightG);
  const footprint = footprintCompactnessScore(
    input.heightMm ?? parsed?.heightMm,
    input.widthMm ?? parsed?.widthMm,
  );
  const slimness = thicknessSlimnessScore(input.thicknessMm ?? parsed?.thicknessMm);

  const parts: [number, number][] = [];
  if (weight !== null) parts.push([0.45, weight]);
  if (footprint !== null) parts.push([0.45, footprint]);
  if (slimness !== null) parts.push([0.1, slimness]);
  if (parts.length === 0) return null;

  const weightSum = parts.reduce((sum, [w]) => sum + w, 0);
  const total = parts.reduce((sum, [w, value]) => sum + w * value, 0) / weightSum;
  return Math.round(clamp(total));
}

/* ── Ekran: reguła sprzętowa, gdy brak niezależnych pomiarów (C1) ── */

export const DISPLAY_NITS_TIERS: readonly { minNits: number; score: number }[] = [
  { minNits: 3000, score: 80 },
  { minNits: 1500, score: 70 },
  { minNits: 1000, score: 60 },
];
export const DISPLAY_HIGH_REFRESH_HZ = 144;
export const DISPLAY_HIGH_REFRESH_BONUS = 5;
/** Test niezależny ma pierwszeństwo przed regułą sprzętową. */
export const DISPLAY_NEUTRAL = 50;

export function displayScoreFromHardware(
  peakNits: number | null | undefined,
  refreshHz: number | string | null | undefined,
): number | null {
  if (typeof peakNits !== 'number' || !Number.isFinite(peakNits)) return null;
  const tier = DISPLAY_NITS_TIERS.find((entry) => peakNits >= entry.minNits);
  if (!tier) return null;
  const refresh = typeof refreshHz === 'number' ? refreshHz : null;
  return Math.round(clamp(tier.score + (refresh !== null && refresh >= DISPLAY_HIGH_REFRESH_HZ ? DISPLAY_HIGH_REFRESH_BONUS : 0)));
}

/* ── Aparat ── */

/** C1: ocena z testu wariantu Pro pomniejszona o 10 pkt, pewność `low`, zdanie w `basis`. */
export const PRO_VARIANT_DISCOUNT = 10;

export function scoreFromProVariant(proScore: number): number {
  return Math.round(clamp(proScore - PRO_VARIANT_DISCOUNT));
}

/* ── Pomocnicze ── */

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function positive(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}
