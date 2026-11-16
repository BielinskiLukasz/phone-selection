import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Raport luk danych (B9): co blokuje zamknięcie etapu 0 i wydania (etap 9).
 *
 *   npm run data-gaps            raport
 *   npm run data-gaps -- --strict  próg wydania: kod 1 przy `needs_confirmation`
 *                                  albo cenach starszych niż 7 dni (DoD etapu 9)
 */

interface Record_ {
  id: string;
  status?: string;
  price?: { pln?: number; checkedAt?: string };
  specs?: Record<string, unknown>;
  scores?: Record<string, number | null>;
  scoreConfidence?: Record<string, string>;
  scoresEstimatedNeutral?: string[];
  sources?: string[];
}

const STRICT = process.argv.includes('--strict');
const RELEASE_MAX_PRICE_AGE_DAYS = 7;
const path = resolve(process.cwd(), 'src/data/phones.json');
const data = JSON.parse(readFileSync(path, 'utf8')) as { phones?: Record_[] };
const phones = data.phones ?? [];
const now = Date.now();

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const time = new Date(`${iso}T00:00:00.000Z`).getTime();
  return Number.isNaN(time) ? null : Math.floor((now - time) / 86_400_000);
}

const SPEC_FIELDS = [
  'batteryMah', 'batteryEndurance', 'chargingW', 'wirelessCharging', 'chargerInBox', 'displayInch',
  'panel', 'refreshHz', 'peakNits', 'weightG', 'ip', 'microSd', 'nfc', 'updatesYears',
  'updatesOsGenerations', 'updatesSecurityYears',
] as const;

let gaps = 0;
let blocking = 0;

console.log('RAPORT LUK DANYCH — src/data/phones.json');
console.log(`${'telefon'.padEnd(34)}${'status'.padEnd(12)}${'cena (dni)'.padEnd(12)}braki`);
console.log('─'.repeat(96));

for (const phone of phones) {
  const missingSpecs = SPEC_FIELDS.filter((field) => {
    const value = phone.specs?.[field];
    return value === null || value === undefined;
  });
  const estimated = phone.scoresEstimatedNeutral ?? [];
  const lowConfidence = Object.entries(phone.scoreConfidence ?? {})
    .filter(([, level]) => level === 'low')
    .map(([criterion]) => criterion);
  const age = daysSince(phone.price?.checkedAt);
  const needsConfirmation = phone.status === 'needs_confirmation' || phone.status === 'unverified';
  const staleForRelease = age !== null && age > RELEASE_MAX_PRICE_AGE_DAYS;

  const notes = [
    missingSpecs.length > 0 ? `specs null: ${missingSpecs.join(', ')}` : null,
    estimated.length > 0 ? `oceny szacowane: ${estimated.join(', ')}` : null,
    lowConfidence.length > 0 ? `pewność low: ${lowConfidence.join(', ')}` : null,
    (phone.sources ?? []).length === 0 ? 'brak źródeł' : null,
  ].filter((note): note is string => note !== null);

  gaps += notes.length;
  if (needsConfirmation || (STRICT && staleForRelease)) blocking += 1;

  console.log(
    `${phone.id.padEnd(34)}${String(phone.status ?? '—').padEnd(12)}${
      age === null ? '—' : `${age} dni${STRICT && staleForRelease ? ' ⚠' : ''}`
    }`.padEnd(58) + (notes.length > 0 ? notes.join(' | ') : 'komplet'),
  );
}

console.log('─'.repeat(96));
console.log(
  `Rekordy: ${phones.length} · pozycje z lukami: ${gaps} · ` +
    `potwierdzenia wymagane: ${phones.filter((phone) => phone.status === 'needs_confirmation').length} · ` +
    `ceny starsze niż ${RELEASE_MAX_PRICE_AGE_DAYS} dni: ${
      phones.filter((phone) => (daysSince(phone.price?.checkedAt) ?? 0) > RELEASE_MAX_PRICE_AGE_DAYS).length
    }`,
);

if (STRICT) {
  const stale = phones.filter(
    (phone) => (daysSince(phone.price?.checkedAt) ?? 0) > RELEASE_MAX_PRICE_AGE_DAYS,
  );
  if (blocking > 0 || stale.length > 0) {
    console.error(
      `\nPróg wydania nieosiągnięty: ${blocking} rekord(ów) do potwierdzenia, ${stale.length} z ceną starszą niż ${RELEASE_MAX_PRICE_AGE_DAYS} dni.`,
    );
    process.exitCode = 1;
  } else {
    console.log('Próg wydania osiągnięty.');
  }
}
