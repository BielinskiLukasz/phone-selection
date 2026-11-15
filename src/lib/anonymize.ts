import { CRITERIA, groupOf, labelOf } from '@/data/criteria';
import type { AnonCard, AnonCriterion, AnonFact, FactKey, Phone, Specs } from '@/types';
import type { RankResult, RankedPhone } from '@/types';
import { DEFAULT_BUDGET, NEUTRAL_SCORE } from './scoringConfig';
import { matchDisplay } from './matchDisplay';
import { rawScore } from './scoring';

/**
 * Dane anonimowej karty (E2-08) — UI-SPEC sekcja 4, PROJECT sekcja 8.
 * Czyta realny schemat `phones.json` (opisy aparatów jako tekst, `displayInch`,
 * `panel`, `ip`, `refreshHz` liczba albo zakres) i nigdy nie przepuszcza pól `reveal`.
 */

export const NO_DATA = 'brak danych';

export const PERFORMANCE_LABEL = {
  high: 'wysoka',
  medium: 'średnia',
  basic: 'podstawowa',
} as const;

export type PerformanceClass = keyof typeof PERFORMANCE_LABEL;

/** Klasa wydajności z oceny `smoothness` (UI-SPEC 4): ≥75 wysoka, 55-74 średnia, <55 podstawowa. */
export function performanceClass(smoothness: number | null | undefined): PerformanceClass {
  const score =
    typeof smoothness === 'number' && Number.isFinite(smoothness) ? smoothness : NEUTRAL_SCORE;
  if (score >= 75) return 'high';
  if (score >= 55) return 'medium';
  return 'basic';
}

/** Polska odmiana: 1 rok, 2-4 lata, 5+ lat. */
export function plural(value: number, one: string, few: string, many: string): string {
  const abs = Math.abs(Math.round(value));
  if (abs === 1) return one;
  const rest10 = abs % 10;
  const rest100 = abs % 100;
  if (rest10 >= 2 && rest10 <= 4 && (rest100 < 12 || rest100 > 14)) return few;
  return many;
}

export function yearsLabel(value: number): string {
  return `${value} ${plural(value, 'rok', 'lata', 'lat')}`;
}

function decimal(value: number): string {
  return String(value).replace('.', ',');
}

function join(parts: (string | null | undefined)[]): string | null {
  const filled = parts.filter((part): part is string => typeof part === 'string' && part.length > 0);
  return filled.length > 0 ? filled.join(' · ') : null;
}

function fact(key: FactKey, label: string, value: string | null): AnonFact {
  return { key, label, value: value ?? NO_DATA, missing: value === null };
}

/* ── Parsowanie opisów ze źródeł ── */

/** „50 MP f/1.8 z OIS” → 50. Brak liczby Mpix → null (nie zgadujemy). */
export function megapixels(text: string | null | undefined): number | null {
  if (typeof text !== 'string') return null;
  const match = /(\d+(?:[.,]\d+)?)\s*(?:MP|Mpix|megapiksel)/i.exec(text);
  if (!match?.[1]) return null;
  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** „3x zoom optyczny” → „3x”, „zoom optyczny 3,5x” → „3,5x”. */
export function zoomFactor(text: string | null | undefined): string | null {
  if (typeof text !== 'string') return null;
  const match = /(\d+(?:[.,]\d+)?)\s*x\b/i.exec(text);
  return match?.[1] ? `${match[1]}x` : null;
}

export function hasStabilization(text: string | null | undefined): boolean {
  return typeof text === 'string' && /\bOIS\b|stabilizac/i.test(text);
}

/** Nazwy własne paneli (Super AMOLED, CrystalRes, pOLED) sprowadzamy do klasy technologii. */
export function panelLabel(panel: string | null | undefined): string | null {
  if (typeof panel !== 'string' || panel.trim().length === 0) return null;
  const text = panel.replace(/\([^)]*\)/g, ' ').trim();
  if (/amoled/i.test(text)) return 'AMOLED';
  if (/poled|oled/i.test(text)) return 'OLED';
  if (/ips|lcd|tft/i.test(text)) return 'LCD';
  return null;
}

/** Odświeżanie: 120 albo „60-120” (zakres ze źródeł) → tekst z Hz. */
export function refreshLabel(refreshHz: number | string | null | undefined): string | null {
  if (typeof refreshHz === 'number' && Number.isFinite(refreshHz) && refreshHz > 0) {
    return `${refreshHz} Hz`;
  }
  if (typeof refreshHz === 'string' && /\d/.test(refreshHz)) return `${refreshHz.trim()} Hz`;
  return null;
}

export interface UpdatesInfo {
  osUpdates: number | null;
  securityYears: number | null;
  years: number | null;
}

/**
 * Lata wsparcia z pól liczbowych, a gdy ich brak — z opisu ze źródła
 * („3 aktualizacje systemu Android i 4 lata poprawek zabezpieczeń”).
 */
export function updatesInfo(specs: Specs): UpdatesInfo {
  const num = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

  /* `updates` bywa opisem ze źródła albo obiektem z liczbami — obsługujemy oba zapisy. */
  const structured =
    typeof specs.updates === 'object' && specs.updates !== null ? specs.updates : null;

  let osUpdates = num(specs.updatesOsGenerations) ?? num(structured?.osVersions ?? structured?.osUpdates);
  let securityYears = num(specs.updatesSecurityYears) ?? num(structured?.securityYears);

  if (osUpdates === null || securityYears === null) {
    const text = [typeof specs.updates === 'string' ? specs.updates : null, specs.updatesNote]
      .filter((part): part is string => typeof part === 'string')
      .join(' ');

    if (osUpdates === null) {
      const os = /(\d+)\s*(?:duże|dużych)?\s*(?:aktualizacje|aktualizacji|generacje|generacji|wersje|wersji)/i.exec(
        text,
      );
      if (os?.[1]) osUpdates = num(Number(os[1]));
    }
    if (securityYears === null) {
      const security = /(\d+)\s*(?:lata|lat)\s*poprawek/i.exec(text);
      if (security?.[1]) securityYears = num(Number(security[1]));
    }
  }

  return { osUpdates, securityYears, years: num(specs.updatesYears) };
}

/* ── Wiersze cech w stałej kolejności (UI-SPEC 4) ── */

export function batteryFact(specs: Specs): AnonFact {
  const mah = typeof specs.batteryMah === 'number' && specs.batteryMah > 0 ? specs.batteryMah : null;
  const watts =
    typeof specs.chargingW === 'number' && specs.chargingW > 0 ? specs.chargingW : null;

  return fact(
    'battery',
    'Bateria',
    join([
      mah ? `${mah} mAh` : null,
      watts ? `ładowanie ${watts} W` : null,
      specs.wirelessCharging === true
        ? 'ładowanie bezprzewodowe'
        : specs.wirelessCharging === false
          ? 'bez ładowania bezprzewodowego'
          : null,
    ]),
  );
}

/**
 * `telephoto: null` jest niejednoznaczne (brak aparatu albo brak danych), więc brak
 * teleobiektywu bierzemy z uzasadnienia oceny `zoom`, które cytuje źródło.
 */
/** Liczba Mpix z opisu („50 MP f/1.8 z OIS”) albo z pola liczbowego (`mainMp`). */
function cameraMp(text: string | null | undefined, numeric: number | null | undefined): number | null {
  return megapixels(text) ?? (typeof numeric === 'number' && numeric > 0 ? numeric : null);
}

export function cameraFact(phone: Phone): AnonFact {
  const cameras = phone.specs.cameras ?? {};

  const mainMp = cameraMp(cameras.main, cameras.mainMp);
  const stabilized = hasStabilization(cameras.main) || cameras.mainOis === true;
  const mainText = mainMp ? `Główny ${mainMp} MP${stabilized ? ' ze stabilizacją' : ''}` : null;

  const selfieMp = cameraMp(cameras.selfie, cameras.selfieMp);
  const ultraMp = cameraMp(cameras.ultrawide, cameras.ultraWideMp ?? cameras.ultrawideMp);

  const telephotoMp = cameraMp(cameras.telephoto, cameras.telephotoMp);
  const telephotoZoom = zoomFactor(cameras.telephoto);
  /* Brak teleobiektywu: jawne 0, albo null potwierdzony w uzasadnieniu oceny `zoom`. */
  const noTelephoto =
    cameras.telephotoMp === 0 ||
    (cameras.telephoto === null &&
      cameras.telephotoMp == null &&
      /brak teleobiektywu|bez teleobiektywu/i.test(phone.basis.zoom ?? phone.basis.photoDay ?? ''));

  const teleText = telephotoMp
    ? `przybliżanie ${telephotoMp} MP${telephotoZoom ? ` (${telephotoZoom})` : ''}`
    : telephotoZoom
      ? `przybliżanie ${telephotoZoom}`
      : noTelephoto
        ? 'bez aparatu do przybliżania'
        : null;

  return fact(
    'camera',
    'Aparat',
    join([
      mainText,
      selfieMp ? `selfie ${selfieMp} MP` : null,
      teleText,
      ultraMp ? `szeroki kąt ${ultraMp} MP` : null,
    ]),
  );
}

export function storageFact(phone: Phone): AnonFact {
  const microSd = phone.specs.microSd;
  return fact(
    'storage',
    'Pamięć',
    join([
      `${phone.variant.storageGb} GB`,
      microSd === true
        ? 'karta microSD'
        : microSd === false
          ? 'bez karty microSD'
          : `karta microSD: ${NO_DATA}`,
    ]),
  );
}

export function updatesFact(specs: Specs): AnonFact {
  const { osUpdates, securityYears, years } = updatesInfo(specs);

  if (osUpdates !== null) {
    const os = `${osUpdates} ${plural(osUpdates, 'aktualizacja', 'aktualizacje', 'aktualizacji')} systemu`;
    return fact(
      'updates',
      'Aktualizacje',
      securityYears !== null ? `${os}, ${yearsLabel(securityYears)} poprawek` : `${os}, poprawki: ${NO_DATA}`,
    );
  }

  if (years !== null) return fact('updates', 'Aktualizacje', `${yearsLabel(years)} aktualizacji`);
  if (securityYears !== null) {
    return fact('updates', 'Aktualizacje', yearsLabel(securityYears) + ' poprawek');
  }

  return fact('updates', 'Aktualizacje', null);
}

const IP_DESCRIPTIONS: readonly [RegExp, string][] = [
  [/ip68.*ip69|ip69.*ip68/i, 'Wodoszczelny i pyłoszczelny (IP68/IP69)'],
  [/ip66.*ip68|ip68.*ip66/i, 'Odporny na silne strugi wody i wodoszczelny (IP66/IP68)'],
  [/ip69/i, 'Wodoszczelny i odporny na strugi wody (IP69)'],
  [/ip68/i, 'Wodoszczelny i pyłoszczelny (IP68)'],
  [/ip67/i, 'Odporny na kurz i krótkie zanurzenie (IP67)'],
  [/ip66/i, 'Odporny na kurz i silne strugi wody (IP66)'],
  [/ip6[45]/i, 'Odporny na zachlapania (IP64/IP65)'],
  [/ip5[34]/i, 'Odporny na zachlapania (IP53/IP54)'],
];

export function durabilityFact(specs: Specs): AnonFact {
  const rating = typeof specs.ip === 'string' ? specs.ip.trim() : '';
  if (rating.length === 0) return fact('durability', 'Odporność', null);

  const known = IP_DESCRIPTIONS.find(([pattern]) => pattern.test(rating));
  return fact('durability', 'Odporność', known ? known[1] : `Odporność ${rating.toUpperCase()}`);
}

export function displayPerformanceFact(phone: Phone, performance: PerformanceClass): AnonFact {
  const { specs } = phone;
  /* Ekran z pól płaskich albo z obiektu `specs.display` (dane ustrukturyzowane). */
  const structured =
    typeof specs.display === 'object' && specs.display !== null ? specs.display : null;

  const sizeValue = specs.displayInch ?? structured?.sizeInches ?? structured?.inches ?? null;
  const size = typeof sizeValue === 'number' && sizeValue > 0 ? sizeValue : null;
  const panel = panelLabel(specs.panel ?? structured?.panel);
  const refresh = refreshLabel(specs.refreshHz ?? structured?.refreshHz);

  const display = size
    ? `${decimal(size)}″${panel ? ` ${panel}` : ''}${refresh ? ` ${refresh}` : ''}`
    : join([panel, refresh]);

  return fact(
    'displayPerformance',
    'Ekran i wydajność',
    join([display ?? `ekran: ${NO_DATA}`, `wydajność ${PERFORMANCE_LABEL[performance]}`]),
  );
}

/* ── Anonimizacja i test wycieku (E2-12) ── */

/** Słowa generyczne, które nie identyfikują marki — nie trafiają na listę tokenów. */
const GENERIC_WORDS = new Set([
  'pro', 'plus', 'max', 'ultra', 'lite', 'neo', 'mini', 'note', 'phone', 'edition', 'gb', '5g',
  '4g', 'the', 'and', 'with', 'gen', 'dual', 'sim',
]);

/**
 * Słownictwo własne karty (etykiety i sformułowania z UI-SPEC 4). Nigdy nie jest
 * tokenem marki, nawet gdy takie słowo trafi do nazwy modelu — inaczej test wycieku
 * oznaczyłby fałszywie np. etykietę „Pamięć”.
 */
const UI_VOCABULARY = new Set([
  'bateria', 'ładowanie', 'bezprzewodowe', 'bezprzewodowego', 'aparat', 'główny', 'selfie',
  'przybliżania', 'przybliżanie', 'szeroki', 'kąt', 'pamięć', 'karta', 'microsd', 'aktualizacje',
  'aktualizacja', 'aktualizacji', 'systemu', 'poprawek', 'poprawki', 'odporność', 'odporny',
  'wodoszczelny', 'pyłoszczelny', 'zachlapania', 'zanurzenie', 'strugi', 'wody', 'kurz',
  'ekran', 'wydajność', 'wysoka', 'średnia', 'podstawowa', 'brak', 'danych', 'cena',
  'orientacyjna', 'sprawdź', 'sklepie', 'stabilizacją', 'stabilizacji', 'roku', 'rok', 'lata',
  'lat', 'mp', 'mah', 'hz', 'gb', 'test', 'testowa', 'testowy', 'wartość', 'kryterium',
]);

/** Marki, serie, nazwy chipów, nakładek i komponentów — zawsze zakazane na karcie. */
const KNOWN_FORBIDDEN = [
  'samsung', 'galaxy', 'google', 'pixel', 'xiaomi', 'redmi', 'poco', 'motorola', 'moto',
  'nothing', 'realme', 'oneplus', 'oppo', 'vivo', 'huawei', 'honor', 'iphone', 'apple',
  'snapdragon', 'dimensity', 'tensor', 'exynos', 'mediatek', 'kirin', 'qualcomm', 'miui',
  'hyperos', 'oneui', 'coloros', 'ios', 'sony', 'lytia', 'gorilla', 'corning', 'crystalres',
  'victus', 'allegro', 'empik', 'sferis', 'morele', 'mediaexpert', 'komputronik', 'proshop',
  'mediamarkt', 'x-kom',
] as const;

/**
 * Tokeny z `reveal` i `specs.chip` (E2-12). Z nazw bierzemy tylko wyrazy zaczynające się
 * wielką literą albo zawierające cyfrę — czyli marki i kody modeli, nie polskie słowa
 * z opisów („do potwierdzenia: adres oferty…”).
 */
function addTokens(target: Set<string>, text: string | null | undefined): void {
  if (typeof text !== 'string') return;
  for (const raw of text.split(/[^A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ._-]+/u)) {
    const word = raw.replace(/^[-._]+|[-._]+$/g, '');
    if (word.length === 0) continue;
    const lower = word.toLowerCase();
    if (GENERIC_WORDS.has(lower) || UI_VOCABULARY.has(lower) || /^\d+$/.test(lower)) continue;
    if (word.length < 3 && !/\d/.test(word)) continue;
    const isModelToken = /^[A-Z]/.test(word) || /\d/.test(word);
    if (!isModelToken) continue;
    target.add(lower);
  }
}

/**
 * Lista tokenów budowana z `reveal` i `specs.chip` (E2-12) plus stała lista marek.
 * `pool` dokłada nazwy pozostałych telefonów: uzasadnienia ocen cytują porównania
 * („aparaty jak w 9a”, „wyniki 15T Pro”), więc zakazane są wszystkie modele z puli.
 */
export function collectForbiddenTokens(phone: Phone, pool: readonly Phone[] = []): string[] {
  const tokens = new Set<string>(KNOWN_FORBIDDEN);

  for (const record of [phone, ...pool]) {
    addTokens(tokens, record.reveal.name);
    addTokens(tokens, record.reveal.brand);
    addTokens(tokens, record.specs.chip);
    for (const link of record.reveal.shopLinks) {
      addTokens(tokens, typeof link === 'string' ? link : (link.label ?? link.shop ?? ''));
    }
  }

  return [...tokens].sort();
}

/** Zamienia zakazane słowa na „—”, żeby uzasadnienia ocen nie zdradzały modelu. */
export function redact(text: string, tokens: readonly string[]): string {
  let result = text;
  for (const token of tokens) {
    if (token.length < 2) continue;
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    /* Token jako początek wyrazu: łapie też odmianę („Exynosa”, „Pixelu”). */
    result = result.replace(new RegExp(`\\b${escaped}[A-Za-z0-9ąćęłńóśźż]*`, 'gi'), '—');
  }
  return result;
}

/**
 * Klucze pomijane przez test wycieku: `phoneId` to wewnętrzny slug (np. „galaxy-a57-8-256”),
 * potrzebny do zapisu wyborów w sesji, ale nigdy nierenderowany na karcie.
 */
const LEAK_IGNORED_KEYS = new Set(['phoneId']);

/** Rekurencyjne przeszukanie obiektu karty pod kątem zakazanych tokenów. */
export function findLeaks(value: unknown, tokens: readonly string[], path = '$'): string[] {
  const found: string[] = [];

  if (typeof value === 'string') {
    const haystack = value.toLowerCase();
    for (const token of tokens) {
      if (token.length >= 2 && haystack.includes(token)) found.push(`${path}: ${token}`);
    }
    return found;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => found.push(...findLeaks(item, tokens, `${path}[${index}]`)));
    return found;
  }

  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (LEAK_IGNORED_KEYS.has(key)) continue;
      found.push(...findLeaks(key, tokens, `${path}.<key>`));
      found.push(...findLeaks(item, tokens, `${path}.${key}`));
    }
  }

  return found;
}

/* ── Karta ── */

export interface AnonCardOptions {
  budgetMax?: number;
  /** Najlepszy wynik w puli — do przeskalowanego procentu w szczegółach. */
  bestScore?: number | null;
  /** Miejsce telefonu, z którym ta karta jest w „praktycznym remisie”. */
  tieWithPlace?: number | null;
  /** Pełna pula — do redagowania nazw innych modeli z uzasadnień ocen. */
  pool?: readonly Phone[];
}

/** Stały tekst przy cenie: nazwa sklepu jest częścią `reveal` i wraca dopiero po wyborze. */
export const PRICE_NOTE = 'cena orientacyjna, sprawdź w sklepie';

/** Buduje dane karty bez pól `reveal` (PROJECT 8: komponent kart nie renderuje nazw). */
export function toAnonCard(
  phone: Phone,
  ranked: RankedPhone,
  options: AnonCardOptions = {},
): AnonCard {
  const budgetMax = options.budgetMax ?? DEFAULT_BUDGET;
  const tokens = collectForbiddenTokens(phone, options.pool ?? []);
  const performance = performanceClass(phone.scores.smoothness);
  const estimatedNeutral = new Set(phone.scoresEstimatedNeutral ?? []);
  const display = matchDisplay(ranked.score, options.bestScore ?? null);

  const criteria: AnonCriterion[] = CRITERIA.map((definition) => {
    const raw = rawScore(phone, definition.id, budgetMax);
    const stored = phone.scores[definition.id];
    const estimated =
      estimatedNeutral.has(definition.id) ||
      (definition.id !== 'value' && (stored === null || stored === undefined));

    return {
      id: definition.id,
      groupId: groupOf(definition.id),
      label: labelOf(definition.id),
      score: Math.round(raw),
      confidence: phone.scoreConfidence?.[definition.id] ?? (estimated ? 'low' : 'medium'),
      basis: redact(phone.basis[definition.id] ?? '', tokens).trim() || NO_DATA,
      estimated,
    };
  });

  return {
    phoneId: phone.id,
    place: ranked.place,
    matchPercent: display.percent,
    matchLabel: display.label,
    matchRescaledPercent: display.rescaledPercent,
    practicalTieWithPlace: options.tieWithPlace ?? null,
    pricePln: phone.price.pln,
    priceCheckedAt: phone.price.checkedAt,
    priceNote: PRICE_NOTE,
    overBudgetBy: ranked.overBudgetBy,
    storageGb: phone.variant.storageGb,
    hasMicroSd: phone.specs.microSd ?? null,
    performanceClass: performance,
    facts: [
      batteryFact(phone.specs),
      cameraFact(phone),
      storageFact(phone),
      updatesFact(phone.specs),
      durabilityFact(phone.specs),
      displayPerformanceFact(phone, performance),
    ],
    groupScores: ranked.groupScores,
    criteria,
  };
}

/** Karty dla całego wyniku rankingu (kolejność jak na ekranie). */
export function toAnonCards(
  phones: readonly Phone[],
  result: RankResult,
  budgetMax?: number,
): AnonCard[] {
  const byId = new Map(phones.map((phone) => [phone.id, phone]));
  const placeById = new Map(result.cards.map((entry) => [entry.phoneId, entry.place]));

  return result.cards.flatMap((ranked) => {
    const phone = byId.get(ranked.phoneId);
    if (!phone) return [];
    return [
      toAnonCard(phone, ranked, {
        budgetMax,
        pool: phones,
        bestScore: result.bestScore,
        tieWithPlace: ranked.practicalTieWith
          ? (placeById.get(ranked.practicalTieWith) ?? null)
          : null,
      }),
    ];
  });
}

/** Rzuca wyjątek, gdyby karta zawierała nazwę, markę albo token chipa. */
export function assertNoLeak(card: AnonCard, phone: Phone, pool: readonly Phone[] = []): void {
  const leaks = findLeaks(card, collectForbiddenTokens(phone, pool));
  if (leaks.length > 0) {
    throw new Error(`Karta anonimizowana zawiera zakazane tokeny: ${leaks.join(', ')}`);
  }
}
