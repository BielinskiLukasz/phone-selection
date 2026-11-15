import { describe, expect, it } from 'vitest';
import { CRITERIA, validatePhoneData } from '../scripts/validate-data';

const today = new Date('2026-11-15T00:00:00.000Z');

function sampleData() {
  return {
    _meta: { generatedOn: '2026-11-15' },
    phones: [
      {
        id: 'example-phone',
        reveal: {
          name: 'Example phone',
          brand: 'Example',
          shopLinks: [{ url: 'https://example.com/phone', shop: 'Example shop' }],
        },
        variant: { ramGb: 8, storageGb: 256 },
        price: { pln: 1800, checkedAt: '2026-11-15', source: 'Example shop' },
        specs: { batteryMah: 5000 } as Record<string, unknown>,
        scores: Object.fromEntries(CRITERIA.map((criterion) => [criterion, criterion === 'value' ? null : 50])),
        basis: Object.fromEntries(CRITERIA.map((criterion) => [criterion, 'Synthetic test data'])),
        status: 'ok',
      },
    ],
  };
}

describe('phone data validation', () => {
  it('accepts a complete record', () => {
    expect(validatePhoneData(sampleData(), today).errors).toEqual([]);
  });

  it('rejects a price above the hard limit', () => {
    const data = sampleData();
    data.phones[0]!.price.pln = 2100;
    expect(validatePhoneData(data, today).errors.some((error) => error.includes('2000'))).toBe(true);
  });

  it('warns when a price is older than 30 days', () => {
    const data = sampleData();
    data.phones[0]!.price.checkedAt = '2026-09-01';
    expect(validatePhoneData(data, today).warnings.some((warning) => warning.includes('30 dni'))).toBe(true);
  });

  it('traktuje telephotoMp = 0 jako celowy brak teleobiektywu', () => {
    const data = sampleData();
    data.phones[0]!.specs = { batteryMah: 5000, cameras: { mainMp: 50, telephotoMp: 0 } };
    const result = validatePhoneData(data, today);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some((warning) => warning.includes('telephotoMp'))).toBe(false);
  });

  it('odróżnia brak danych o teleobiektywie od wartości niepoprawnej', () => {
    const missing = sampleData();
    missing.phones[0]!.specs = { batteryMah: 5000, cameras: { mainMp: 50, telephotoMp: null } };
    expect(
      validatePhoneData(missing, today).warnings.some((warning) => warning.includes('telephotoMp')),
    ).toBe(true);

    const invalid = sampleData();
    invalid.phones[0]!.specs = { batteryMah: 5000, cameras: { mainMp: 50, telephotoMp: -3 } };
    expect(
      validatePhoneData(invalid, today).errors.some((error) => error.includes('telephotoMp')),
    ).toBe(true);
  });

  it('allows the empty phase-one placeholder without inventing phone data', () => {
    const result = validatePhoneData({ _meta: { generatedOn: null }, phones: [] }, today);
    expect(result.errors).toEqual([]);
    expect(result.warnings.length).toBe(1);
  });
});