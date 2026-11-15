import { CRITERIA, CRITERION_IDS } from '../../src/data/criteria';
import type { CriterionId, Phone, PhoneScores, Specs } from '../../src/types';

/**
 * Kontrolowana pula testowa (dane syntetyczne, oznaczone marką „TestBrand”).
 *
 * Służy do przypadków, których nie da się pewnie sprawdzić na danych produkcyjnych:
 * deterministyczne remisy, telefony ponad limitem, slot microSD, pamięć 128 GB.
 * Celowo miesza **oba zapisy specyfikacji** — płaski (`displayInch`, `updatesYears`,
 * aparaty jako opisy) i ustrukturyzowany (`display: {…}`, `updates: {…}`, `mainMp`),
 * żeby `lib/anonymize.ts` miał regresję na oba.
 */

export interface PhoneSeed {
  id: string;
  name: string;
  brand?: string;
  price: number;
  ramGb?: number;
  storageGb: number;
  specs?: Specs;
  /** Jedna wartość dla wszystkich kryteriów albo nadpisania wybranych. */
  score?: number | Partial<Record<CriterionId, number>>;
  status?: Phone['status'];
  checkedAt?: string;
}

const NEUTRAL = 50;
const CHECKED_AT = '2026-11-14';

/** Buduje kompletny rekord `Phone` z ziarna — oceny i uzasadnienia dla 14 kryteriów. */
export function buildPhone(seed: PhoneSeed): Phone {
  const scores = {} as PhoneScores;
  const basis = {} as Record<CriterionId, string>;

  for (const definition of CRITERIA) {
    const id: CriterionId = definition.id;
    if (id === 'value') {
      scores.value = null;
      basis.value = 'Liczone w aplikacji z ceny i budżetu sesji.';
      continue;
    }
    const override =
      typeof seed.score === 'number' ? seed.score : (seed.score?.[id] ?? NEUTRAL);
    scores[id] = override;
    basis[id] = `Wartość testowa ${override} — ${definition.label.toLowerCase()}.`;
  }

  const url = `https://example.test/oferta/${seed.id}`;
  const confidence = Object.fromEntries(
    CRITERION_IDS.map((id: CriterionId) => [id, 'medium'] as const),
  ) as Phone['scoreConfidence'];

  return {
    id: seed.id,
    status: seed.status ?? 'ok',
    reveal: {
      name: seed.name,
      brand: seed.brand ?? 'TestBrand',
      shopLinks: [{ label: 'sklep-testowy', url }],
    },
    variant: {
      ramGb: seed.ramGb ?? 8,
      storageGb: seed.storageGb,
      fromList: seed.name,
      variantOf: null,
    },
    price: {
      pln: seed.price,
      source: 'sklep-testowy',
      url,
      checkedAt: seed.checkedAt ?? CHECKED_AT,
      providedBy: 'test',
      note: null,
      otherObservations: [],
    },
    specs: seed.specs ?? {},
    scores,
    basis,
    sources: ['https://example.test/zrodlo'],
    scoreConfidence: confidence,
    scoresEstimatedNeutral: [],
  };
}

/** Alias o tej samej sygnaturze — dla czytelniejszego zapisu w testach. */
export const makePhone = buildPhone;

/* ── Pula: pięć telefonów pokrywających brzegowe przypadki ── */

export const FIXTURE_PHONES: Phone[] = [
  buildPhone({
    id: 'test-tani-256',
    name: 'TestBrand Alpha 256',
    price: 1299,
    storageGb: 256,
    specs: {
      batteryMah: 6000,
      chargingW: 45,
      wirelessCharging: false,
      microSd: false,
      ip: 'IP68',
      displayInch: 6.7,
      panel: 'AMOLED',
      refreshHz: 120,
      weightG: 195,
      updatesYears: 6,
      chip: 'TestChip 700',
      cameras: { main: '50 MP z OIS', ultrawide: '8 MP', selfie: '32 MP', telephoto: null },
    },
    score: { battery: 80, charging: 40, storage: 75, smoothness: 60, display: 70, photoDay: 65 },
  }),
  buildPhone({
    /* Zapis ustrukturyzowany: display/updates jako obiekty, aparaty jako liczby Mpix. */
    id: 'test-srodkowy-256',
    name: 'TestBrand Beta 256',
    price: 1699,
    storageGb: 256,
    specs: {
      batteryMah: 5200,
      chargingW: 68,
      wirelessCharging: false,
      microSd: false,
      ip: 'IP67',
      display: { sizeInches: 6.6, panel: 'pOLED', refreshHz: 120 },
      updates: { osVersions: 3, securityYears: 4 },
      cameras: { mainMp: 50, mainOis: true, selfieMp: 32, telephotoMp: 0, ultraWideMp: 13 },
    },
    score: { battery: 60, charging: 71, storage: 75, smoothness: 76, display: 80, photoDay: 78 },
  }),
  buildPhone({
    id: 'test-drogi-512-microsd',
    name: 'TestBrand Gamma 512',
    price: 1999,
    ramGb: 12,
    storageGb: 512,
    specs: {
      batteryMah: 5500,
      chargingW: 90,
      wirelessCharging: true,
      microSd: true,
      ip: 'IP68/IP69',
      displayInch: 6.8,
      panel: 'Super AMOLED',
      refreshHz: '60-144',
      updatesOsGenerations: 4,
      updatesSecurityYears: 6,
      cameras: { main: '200 MP (1/1,56″) z OIS', telephoto: '50 MP peryskopowy, zoom 3,5x' },
    },
    score: { battery: 66, charging: 100, storage: 100, smoothness: 85, display: 88, photoDay: 82 },
  }),
  buildPhone({
    id: 'test-mala-pamiec-128',
    name: 'TestBrand Delta 128',
    price: 1599,
    storageGb: 128,
    specs: {
      batteryMah: 5100,
      chargingW: 30,
      wirelessCharging: true,
      microSd: false,
      ip: 'IP68',
      displayInch: 6.3,
      panel: 'pOLED',
      refreshHz: '60-120',
      updatesYears: 7,
      cameras: { main: '48 MP f/1.7', ultrawide: '13 MP', selfie: '13 MP', telephoto: null },
    },
    score: { battery: 58, charging: 28, storage: 40, updates: 100, smoothness: 70, photoDay: 85 },
  }),
  buildPhone({
    id: 'test-ponad-limit-2100',
    name: 'TestBrand Omega Limit',
    price: 2100,
    storageGb: 256,
    status: 'over_budget',
    specs: { batteryMah: 7000, chargingW: 68, microSd: false, ip: 'IP68/IP69' },
    score: { battery: 95, charging: 71, storage: 75 },
  }),
];

/** Aliasy — różne nazwy tej samej puli, żeby importy w testach były czytelne. */
export const PHONES: Phone[] = FIXTURE_PHONES;
export const phones: Phone[] = FIXTURE_PHONES;
export const FIXTURE_POOL: Phone[] = FIXTURE_PHONES;

/** Pula bez telefonu ponad limitem (9… tu: 4 rekordy) — do testów rankingu. */
export const FIXTURE_POOL_WITHIN_LIMIT: Phone[] = FIXTURE_PHONES.filter(
  (phone) => phone.price.pln <= 2000,
);

export function fixtureById(id: string): Phone {
  const found = FIXTURE_PHONES.find((phone) => phone.id === id);
  if (!found) throw new Error(`Brak telefonu „${id}” w puli testowej.`);
  return found;
}
