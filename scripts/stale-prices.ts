import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `npm run stale-prices` (E9-05): które ceny są starsze niż próg wydania.
 *
 *   npm run stale-prices               próg 7 dni (DoD etapu 9)
 *   npm run stale-prices -- --days=3   własny próg
 *
 * Kod wyjścia 1, gdy którakolwiek cena jest przeterminowana — do wpięcia w CI przed wydaniem.
 */

export const RELEASE_MAX_AGE_DAYS = 7;

export interface PhonePriceRecord {
  id: string;
  reveal?: { name?: string };
  price?: { pln?: number; checkedAt?: string };
}

export interface PriceAge {
  id: string;
  name: string;
  pln: number;
  checkedAt: string;
  days: number;
}

export function priceAges(
  phones: readonly PhonePriceRecord[],
  now: Date = new Date(),
): PriceAge[] {
  return phones.flatMap((phone) => {
    const checkedAt = phone.price?.checkedAt;
    if (typeof checkedAt !== 'string') return [];
    const time = new Date(`${checkedAt}T00:00:00.000Z`).getTime();
    if (Number.isNaN(time)) return [];
    return [
      {
        id: phone.id,
        name: phone.reveal?.name ?? phone.id,
        pln: phone.price?.pln ?? 0,
        checkedAt,
        days: Math.max(0, Math.floor((now.getTime() - time) / 86_400_000)),
      },
    ];
  });
}

export function stalePrices(
  phones: readonly PhonePriceRecord[],
  now: Date = new Date(),
  maxAgeDays: number = RELEASE_MAX_AGE_DAYS,
): PriceAge[] {
  return priceAges(phones, now).filter((entry) => entry.days > maxAgeDays);
}

function runCli(): void {
  const daysArg = process.argv.find((arg) => arg.startsWith('--days='));
  const parsed = daysArg ? Number(daysArg.split('=')[1]) : RELEASE_MAX_AGE_DAYS;
  const maxAge = Number.isFinite(parsed) ? parsed : RELEASE_MAX_AGE_DAYS;

  const path = resolve(process.cwd(), 'src/data/phones.json');
  const data = JSON.parse(readFileSync(path, 'utf8')) as { phones?: PhonePriceRecord[] };
  const ages = priceAges(data.phones ?? []).sort((a, b) => b.days - a.days);
  const stale = ages.filter((entry) => entry.days > maxAge);

  console.log(`WIEK CEN (próg ${maxAge} dni) — ${ages.length} telefonów`);
  for (const entry of ages) {
    const flag = entry.days > maxAge ? 'PRZETERMINOWANA' : 'ok';
    console.log(
      `  ${entry.checkedAt}  ${String(entry.days).padStart(3)} dni  ${flag.padEnd(15)} ${entry.name} (${entry.pln} zł)`,
    );
  }

  if (stale.length > 0) {
    console.error(
      `\n${stale.length} cen starszych niż ${maxAge} dni — przed wydaniem odśwież (README: „Aktualizacja cen”).`,
    );
    process.exitCode = 1;
    return;
  }
  console.log('\nWszystkie ceny świeże.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli();
}
