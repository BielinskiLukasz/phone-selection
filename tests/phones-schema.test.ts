import { describe, expect, it } from 'vitest';
import phonesData from '../src/data/phones.json';
import { POOL } from './data';
import type { Phone } from '../src/types';
import { CRITERIA as CRITERIA_DEFS, CRITERION_IDS, GROUPS } from '../src/data/criteria';
import { CRITERIA as VALIDATOR_CRITERIA, validatePhoneData } from '../scripts/validate-data';
import { BUDGET_LIMIT } from '../src/lib/scoringConfig';
import { EXPECTED_POOL_SIZE } from '../src/data/pool';

/**
 * E2-10 / E10 · `phones.json` zgodny z typami i ze wspólnym walidatorem.
 * Pula jest pełna (15 telefonów po etapie 10), więc schemat sprawdzamy
 * na danych produkcyjnych, nie na zastępczych.
 */

const STATUSES = ['ok', 'over_budget', 'variant_swapped', 'unverified', 'needs_confirmation'];

function assertPhoneShape(value: unknown, path: string): void {
  expect(typeof value, `${path} musi być obiektem`).toBe('object');
  const phone = value as Partial<Phone>;

  expect(typeof phone.id, `${path}.id`).toBe('string');
  expect(phone.id, `${path}.id slug`).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  expect(STATUSES, `${path}.status`).toContain(phone.status);
  expect(phone.reveal?.name, `${path}.reveal.name`).toBeTruthy();
  expect(phone.reveal?.brand, `${path}.reveal.brand`).toBeTruthy();
  expect(Array.isArray(phone.reveal?.shopLinks), `${path}.reveal.shopLinks`).toBe(true);
  expect((phone.reveal?.shopLinks?.length ?? 0) > 0, `${path}.reveal.shopLinks`).toBe(true);
  expect((phone.variant?.ramGb ?? 0) > 0, `${path}.variant.ramGb`).toBe(true);
  expect((phone.variant?.storageGb ?? 0) > 0, `${path}.variant.storageGb`).toBe(true);
  expect(typeof phone.price?.pln, `${path}.price.pln`).toBe('number');
  expect(phone.price?.checkedAt, `${path}.price.checkedAt`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(typeof phone.specs, `${path}.specs`).toBe('object');
  expect(Array.isArray(phone.sources), `${path}.sources`).toBe(true);

  for (const id of CRITERION_IDS) {
    const score = phone.scores?.[id];
    if (id === 'value') {
      expect(score, `${path}.scores.value liczone w aplikacji`).toBeNull();
      continue;
    }
    expect(typeof score, `${path}.scores.${id}`).toBe('number');
    expect((score as number) >= 0 && (score as number) <= 100, `${path}.scores.${id} 0-100`).toBe(
      true,
    );
    expect((phone.basis?.[id] ?? '').length, `${path}.basis.${id}`).toBeGreaterThan(2);
  }
}

describe('E2-10 · schemat danych', () => {
  it('walidator i definicje kryteriów używają tej samej listy 15 kryteriów', () => {
    expect([...VALIDATOR_CRITERIA].sort()).toEqual([...CRITERION_IDS].sort());
    expect([...CRITERIA_DEFS.map((criterion) => criterion.id)].sort()).toEqual(
      [...CRITERION_IDS].sort(),
    );
    expect(CRITERION_IDS.length).toBe(15);
    expect(GROUPS.flatMap((group) => group.criteria).length).toBe(15);
  });

  it('każde kryterium należy do dokładnie jednej grupy', () => {
    const seen = GROUPS.flatMap((group) => group.criteria);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('phones.json przechodzi walidację bez błędów', () => {
    const { errors } = validatePhoneData(phonesData);
    expect(errors).toEqual([]);
  });

  it('_meta ma wersję schematu, walutę, limit i datę wygenerowania', () => {
    const meta = phonesData._meta;
    expect(meta.schemaVersion).toBe(1);
    expect(meta.currency).toBe('PLN');
    expect(meta.budgetMaxPln).toBe(BUDGET_LIMIT);
    expect(meta.generatedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect((meta.rules ?? []).length).toBeGreaterThan(0);
  });

  it('jest 15 telefonów (po rozszerzeniu w etapie 10), wszystkie nowe i w limicie 2000 zł', () => {
    expect(POOL.length).toBe(EXPECTED_POOL_SIZE);
    expect(EXPECTED_POOL_SIZE).toBe(15);
    for (const phone of POOL) {
      expect(phone.price.pln, phone.id).toBeLessThanOrEqual(BUDGET_LIMIT);
      expect(phone.price.pln, phone.id).toBeGreaterThan(0);
    }
  });

  it('każdy rekord ma kształt typu Phone', () => {
    phonesData.phones.forEach((phone, index) => assertPhoneShape(phone, `phones[${index}]`));
    POOL.forEach((phone, index) => assertPhoneShape(phone, `pool[${index}]`));
  });

  it('identyfikatory są unikalne i zgodne z wariantem pamięci', () => {
    const ids = POOL.map((phone) => phone.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const phone of POOL) {
      expect(phone.id, phone.id).toContain(String(phone.variant.storageGb));
    }
  });

  it('linki do sklepów są poprawnymi adresami https', () => {
    for (const phone of POOL) {
      for (const link of phone.reveal.shopLinks) {
        const url = typeof link === 'string' ? link : link.url;
        expect(url.startsWith('https://'), `${phone.id}: ${url}`).toBe(true);
        expect(/utm_|ceneo_cid/.test(url), `${phone.id}: parametry śledzące`).toBe(false);
      }
      if (phone.price.url) expect(phone.price.url.startsWith('https://'), phone.id).toBe(true);
    }
  });

  it('braki danych są oznaczone, a nie zgadywane (PROJECT 13)', () => {
    /* Po uzupełnieniu źródeł żaden rekord nie ma oceny „z braku danych”… */
    for (const phone of POOL) {
      expect(phone.scoresEstimatedNeutral ?? [], phone.id).toEqual([]);
    }
    /* …ale słabszy dowód jest oznaczony pewnością `low` i opisany w basis. */
    const xiaomi = POOL.find((phone) => phone.id === 'xiaomi-15t-12-512')!;
    expect(xiaomi.scoreConfidence?.photoDay).toBe('low');
    expect(xiaomi.basis.photoDay).toContain('15T Pro');
    expect(xiaomi.basis.display).toMatch(/regu|pomiar/i);
  });

  it('każdy telefon ma źródła, pewność ocen, wymiary z wagą i zdjęcia w reveal', () => {
    for (const phone of POOL) {
      expect((phone.sources ?? []).length, phone.id).toBeGreaterThan(0);
      expect(Object.keys(phone.scoreConfidence ?? {}).length, phone.id).toBe(14);
      for (const value of Object.values(phone.scoreConfidence ?? {})) {
        expect(['high', 'medium', 'low'], phone.id).toContain(value);
      }
      expect((phone.specs.weightG ?? 0) > 0, `${phone.id}.weightG`).toBe(true);
      expect((phone.specs.heightMm ?? 0) > 0, `${phone.id}.heightMm`).toBe(true);
      expect((phone.specs.widthMm ?? 0) > 0, `${phone.id}.widthMm`).toBe(true);
      expect((phone.specs.thicknessMm ?? 0) > 0, `${phone.id}.thicknessMm`).toBe(true);
      expect(phone.specs.dimensionsMm, `${phone.id}.dimensionsMm`).toBeTruthy();
      expect(phone.reveal.imageUrl?.startsWith('https://'), `${phone.id}.imageUrl`).toBe(true);
      expect(phone.reveal.photoUrl?.startsWith('https://'), `${phone.id}.photoUrl`).toBe(true);
    }
  });

  it('po potwierdzeniu oferty (A1) nie ma rekordów `needs_confirmation`', () => {
    expect(POOL.filter((phone) => phone.status === 'needs_confirmation')).toEqual([]);
    const realme = POOL.find((phone) => phone.id === 'realme-16-pro-plus-5g-8-256')!;
    expect(realme.status).toBe('ok');
    /* FP1-08: notatka weryfikacyjna żyje w auditNote, użytkowniczka widzi tylko userNote. */
    expect(realme.price.auditNote ?? '').toContain('potwierdz');
    expect(realme.price.userNote ?? '').toContain('Pro+');
    expect(realme.price.note).toBeUndefined();
    expect(realme.sources!.length).toBeGreaterThan(5);
  });

  it('jedyna luka bez źródła jest jawna: NFC w Realme zostaje null', () => {
    const realme = POOL.find((phone) => phone.id === 'realme-16-pro-plus-5g-8-256')!;
    expect(realme.specs.nfc ?? null).toBeNull();
  });
});
