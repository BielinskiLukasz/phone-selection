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
export const BATTERY_CAPACITY_SPAN_MAH = 3000;

/** Pojemność: 4000 mAh = 0, 7000 mAh = 100. */
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
  { score: 88, label: 'IP66/IP68' },
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
  if (has68) return rating.includes('IP66') ? 88 : 90;
  if (rating.includes('IP67')) return 80;
  if (rating.includes('IP66')) return 70;
  if (rating.includes('IP64') || rating.includes('IP65')) return 55;
  if (rating.includes('IP53') || rating.includes('IP54')) return 45;
  return null;
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
