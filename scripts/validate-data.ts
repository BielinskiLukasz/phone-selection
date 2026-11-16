import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const CRITERIA = [
  'battery',
  'charging',
  'photoDay',
  'photoIndoor',
  'photoMotion',
  'selfie',
  'video',
  'zoom',
  'storage',
  'updates',
  'smoothness',
  'display',
  'durability',
  'value',
] as const;

type DataRecord = Record<string, unknown>;

function isRecord(value: unknown): value is DataRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Liczba, której może celowo brakować: `null` = „sprawdzone, brak danej cechy”,
 * `undefined` = „pole nieuzupełnione” (PROJECT 13: brak danych to null, nie zgadywanie).
 */
function optionalNumber(value: unknown): number | null | undefined {
  if (value === null) return null;
  return typeof value === 'number' ? value : undefined;
}

function positive(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * Klasyfikacja pola liczbowego. Porównanie z 0 musi iść PRZED `positive()`:
 * jako type guard zawęża ona gałąź else do `null | undefined`, więc test
 * `value === 0` po niej byłby porównaniem bez pokrycia typów (TS2367).
 */
function classifyNumber(value: number | null | undefined): 'ok' | 'zero' | 'missing' | 'invalid' {
  if (value === 0) return 'zero';
  if (positive(value)) return 'ok';
  if (value === null || value === undefined) return 'missing';
  return 'invalid';
}

function validDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : null;
}

function validShopUrl(value: unknown): boolean {
  if (!nonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Pola liczbowe używane przez cechy karty (UI-SPEC 4) i oceny sprzętowe (PROJECT 7.5). */
const NUMERIC_SPECS = [
  'batteryMah',
  'chargingW',
  'displayInch',
  'refreshHz',
  'weightG',
  'updatesYears',
] as const;

const BOOLEAN_SPECS = ['wirelessCharging', 'microSd', 'nfc', 'chargerInBox'] as const;

const CAMERA_SPECS = ['main', 'ultrawide', 'macro', 'selfie', 'telephoto'] as const;

const PHONE_STATUSES = ['ok', 'over_budget', 'variant_swapped', 'unverified', 'needs_confirmation'];

/** „50 MP f/1.8 z OIS” → 50; brak liczby Mpix → null (nie zgadujemy). */
function megapixelsOf(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /(\d+(?:[.,]\d+)?)\s*(?:MP|Mpix|megapiksel)/i.exec(value);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Czy wsparcie aktualizacjami jest opisane (pola składowe albo cytat ze źródła)? */
function hasUpdatesInfo(specs: DataRecord): boolean {
  const positive = (value: unknown): boolean =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;
  if (positive(specs.updatesOsGenerations) || positive(specs.updatesSecurityYears)) return true;

  const text = [specs.updates, specs.updatesNote]
    .filter((part): part is string => typeof part === 'string')
    .join(' ');
  return /(\d+)\s*(?:duże|dużych)?\s*(?:aktualizacje|aktualizacji|generacje|wersje)/i.test(text);
}

/**
 * Walidacja `specs` w schemacie `schemaVersion: 1`.
 * Wartość niepoprawna to błąd, brak pola to ostrzeżenie (karta pokaże „brak danych”).
 */
function validateSpecs(
  specs: DataRecord,
  path: string,
  errors: string[],
  warnings: string[],
  record?: DataRecord,
): void {
  for (const field of NUMERIC_SPECS) {
    const raw = specs[field];
    /* refreshHz bywa zakresem ze źródeł („60-120”) — to poprawny zapis. */
    if (field === 'refreshHz' && typeof raw === 'string' && /\d/.test(raw)) continue;
    /* Wsparcie może być opisane polami składowymi albo cytatem ze źródła — nie dublujemy ostrzeżenia. */
    if (field === 'updatesYears' && hasUpdatesInfo(specs)) continue;

    const status = classifyNumber(optionalNumber(raw));
    if (status === 'ok') continue;
    if (status === 'missing') {
      warnings.push(`${path}.specs.${field}: brak danych — karta pokaże „brak danych”.`);
    } else {
      errors.push(`${path}.specs.${field} musi być dodatnią liczbą albo null.`);
    }
  }

  for (const field of BOOLEAN_SPECS) {
    const value = specs[field];
    if (value === null || value === undefined) {
      warnings.push(`${path}.specs.${field}: brak danych — karta pokaże „brak danych”.`);
    } else if (typeof value !== 'boolean') {
      errors.push(`${path}.specs.${field} musi być true/false albo null.`);
    }
  }

  const ip = specs.ip;
  if (ip === null || ip === undefined) {
    warnings.push(`${path}.specs.ip: brak danych (kryterium durability dostaje wartość neutralną).`);
  } else if (!nonEmptyString(ip)) {
    errors.push(`${path}.specs.ip musi być niepustym stringiem (np. „IP68”) albo null.`);
  }

  const cameras = isRecord(specs.cameras) ? specs.cameras : undefined;
  if (!cameras) {
    warnings.push(`${path}.specs.cameras: brak danych o aparatach (wiersz „Aparat”, UI-SPEC 4).`);
    return;
  }

  for (const field of CAMERA_SPECS) {
    const value = cameras[field];
    if (value === null || value === undefined) continue;
    if (!nonEmptyString(value)) {
      errors.push(`${path}.specs.cameras.${field} musi być opisem ze źródła albo null.`);
    }
  }

  if (megapixelsOf(cameras.main) === null) {
    warnings.push(`${path}.specs.cameras.main: brak liczby Mpix w opisie — karta pokaże „brak danych”.`);
  }

  /* Aparat do przybliżania: `null` = brak teleobiektywu albo brak danych, a „0 MP”
     nie występuje w opisach. Kolejność warunków jest istotna — `positive()` jest
     type guardem, więc po niej typ zawęża się do `null | undefined` i porównanie
     z 0 nie miałoby pokrycia typów (TS2367). */
  const telephotoMp = megapixelsOf(cameras.telephoto);
  if (telephotoMp === 0) {
    // Celowy zapis „0 MP”: telefon bez aparatu do przybliżania.
  } else if (positive(telephotoMp)) {
    // Teleobiektyw o rozdzielczości `telephotoMp` Mpix — wartość poprawna.
  } else if (cameras.telephoto === null || cameras.telephoto === undefined) {
    /* Brak teleobiektywu bywa udokumentowany w uzasadnieniu oceny `zoom` — wtedy to nie luka. */
    const zoomBasis = isRecord(record?.basis) ? String(record.basis.zoom ?? '') : '';
    if (!/brak teleobiektywu|bez teleobiektywu/i.test(zoomBasis)) {
      warnings.push(
        `${path}.specs.cameras.telephoto: brak danych — opisz brak teleobiektywu w basis.zoom.`,
      );
    }
  } else if (!/\d+(?:[.,]\d+)?\s*x/i.test(String(cameras.telephoto))) {
    errors.push(`${path}.specs.cameras.telephoto: opis bez liczby Mpix ani krotności zoomu.`);
  }
}

export function validatePhoneData(data: unknown, now = new Date()) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(data) || !Array.isArray(data.phones)) {
    return { errors: ['Dane muszą mieć tablicę phones.'], warnings };
  }

  if (!isRecord(data._meta)) errors.push('Brakuje obiektu _meta.');
  if (data.phones.length === 0) {
    warnings.push('Baza telefonów jest pusta: etap 0 nie dostarczył jeszcze zweryfikowanych danych.');
  } else if (!isRecord(data._meta) || !validDate(data._meta.generatedOn)) {
    errors.push('_meta.generatedOn musi być poprawną datą YYYY-MM-DD.');
  }

  const ids = new Set<string>();
  for (const [index, value] of data.phones.entries()) {
    const path = `phones[${index}]`;
    if (!isRecord(value)) {
      errors.push(`${path} musi być obiektem.`);
      continue;
    }

    if (!nonEmptyString(value.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id)) {
      errors.push(`${path}.id musi być niepustym slugiem.`);
    } else if (ids.has(value.id)) {
      errors.push(`${path}.id jest duplikatem: ${value.id}.`);
    } else {
      ids.add(value.id);
    }

    if (!isRecord(value.reveal)) {
      errors.push(`${path}.reveal musi być obiektem.`);
    } else {
      if (!nonEmptyString(value.reveal.name) || !nonEmptyString(value.reveal.brand)) {
        errors.push(`${path}.reveal wymaga name i brand.`);
      }
      const links = value.reveal.shopLinks;
      if (!Array.isArray(links) || links.length === 0) {
        errors.push(`${path}.reveal.shopLinks musi zawierać przynajmniej jeden link.`);
      } else {
        for (const [linkIndex, link] of links.entries()) {
          const url = isRecord(link) ? link.url : link;
          if (!validShopUrl(url)) {
            errors.push(`${path}.reveal.shopLinks[${linkIndex}] ma niepoprawny URL.`);
          }
        }
      }
    }

    if (
      !isRecord(value.variant) ||
      !positiveInteger(value.variant.ramGb) ||
      !positiveInteger(value.variant.storageGb)
    ) {
      errors.push(`${path}.variant wymaga dodatnich ramGb i storageGb.`);
    }

    if (!isRecord(value.specs)) {
      errors.push(`${path}.specs musi być obiektem.`);
    } else {
      validateSpecs(value.specs, path, errors, warnings, value);
    }
    if (!PHONE_STATUSES.includes(String(value.status))) {
      errors.push(`${path}.status ma nieznaną wartość.`);
    }

    if (!isRecord(value.price)) {
      errors.push(`${path}.price musi być obiektem.`);
    } else {
      const price = value.price;
      if (typeof price.pln !== 'number' || !Number.isFinite(price.pln) || price.pln <= 0) {
        errors.push(`${path}.price.pln musi być dodatnią liczbą.`);
      } else if (price.pln > 2000) {
        errors.push(`${path}.price.pln przekracza limit 2000 zł.`);
      }
      if (!nonEmptyString(price.source)) errors.push(`${path}.price.source jest wymagane.`);
      const checkedAt = validDate(price.checkedAt);
      if (!checkedAt) {
        errors.push(`${path}.price.checkedAt musi być poprawną datą YYYY-MM-DD.`);
      } else if (now.getTime() - checkedAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
        warnings.push(`${path}: cena nie była sprawdzana od ponad 30 dni.`);
      }
    }

    if (!isRecord(value.scores)) {
      errors.push(`${path}.scores musi być obiektem.`);
    } else {
      for (const criterion of CRITERIA) {
        const score = value.scores[criterion];
        if (criterion === 'value' && score === null) continue;
        if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
          errors.push(`${path}.scores.${criterion} musi być liczbą 0-100 (value może być null).`);
        }
      }
    }

    if (!isRecord(value.basis)) {
      errors.push(`${path}.basis musi być obiektem.`);
    } else {
      for (const criterion of CRITERIA) {
        if (criterion === 'value' && isRecord(value.scores) && value.scores.value === null) {
          continue;
        }
        if (!nonEmptyString(value.basis[criterion])) {
          errors.push(`${path}.basis.${criterion} wymaga uzasadnienia i źródła.`);
        }
      }
    }
  }

  return { errors, warnings };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const path = resolve(process.cwd(), 'src/data/phones.json');
    const data: unknown = JSON.parse(readFileSync(path, 'utf8'));
    const { errors, warnings } = validatePhoneData(data);
    for (const warning of warnings) console.warn(`Ostrzeżenie: ${warning}`);
    for (const error of errors) console.error(`Błąd: ${error}`);
    if (errors.length > 0) process.exitCode = 1;
    else console.log('Walidacja danych zakończona.');
  } catch (error) {
    console.error('Nie udało się odczytać src/data/phones.json:', error);
    process.exitCode = 1;
  }
}