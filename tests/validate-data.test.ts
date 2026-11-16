import { describe, expect, it } from 'vitest';
import { CRITERIA, validatePhoneData } from '../scripts/validate-data';

const today = new Date('2026-11-15T00:00:00.000Z');

function sampleData() {
  return {
    _meta: { generatedOn: '2026-11-15' },
    phones: [
      {
        id: 'example-phone',
        brand: 'Example',
        modelName: 'phone',
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

  it('brak teleobiektywu udokumentowany w basis.zoom nie jest luką w danych', () => {
    const data = sampleData();
    data.phones[0]!.specs = {
      batteryMah: 5000,
      cameras: { main: '50 MP z OIS', telephoto: null },
    };
    data.phones[0]!.basis.zoom = 'brak teleobiektywu (zoom 2x z kadrowania)';
    const result = validatePhoneData(data, today);
    expect(result.errors).toEqual([]);
    expect(result.warnings.some((warning) => warning.includes('telephoto'))).toBe(false);
  });

  it('odróżnia nieudokumentowany brak danych od opisu bez liczby Mpix', () => {
    const missing = sampleData();
    missing.phones[0]!.specs = { batteryMah: 5000, cameras: { main: '50 MP', telephoto: null } };
    expect(
      validatePhoneData(missing, today).warnings.some((warning) => warning.includes('telephoto')),
    ).toBe(true);

    const invalid = sampleData();
    invalid.phones[0]!.specs = {
      batteryMah: 5000,
      cameras: { main: '50 MP', telephoto: 'bardzo dobry zoom' },
    };
    expect(
      validatePhoneData(invalid, today).errors.some((error) => error.includes('telephoto')),
    ).toBe(true);

    const valid = sampleData();
    valid.phones[0]!.specs = {
      batteryMah: 5000,
      cameras: { main: '50 MP', telephoto: '50 MP peryskopowy, zoom optyczny 3,5x' },
    };
    expect(validatePhoneData(valid, today).errors).toEqual([]);
  });

  it('allows the empty phase-one placeholder without inventing phone data', () => {
    const result = validatePhoneData({ _meta: { generatedOn: null }, phones: [] }, today);
    expect(result.errors).toEqual([]);
    expect(result.warnings.length).toBe(1);
  });

  it('E11-02: wymaga ustandaryzowanych pól brand i modelName bez powtórzonej marki', () => {
    const missingBrand = sampleData();
    (missingBrand.phones[0] as Record<string, unknown>).brand = '';
    expect(validatePhoneData(missingBrand, today).errors.some((e) => e.includes('.brand'))).toBe(true);

    const missingModel = sampleData();
    (missingModel.phones[0] as Record<string, unknown>).modelName = '';
    expect(validatePhoneData(missingModel, today).errors.some((e) => e.includes('.modelName'))).toBe(true);

    const repeatedBrand = sampleData();
    repeatedBrand.phones[0]!.modelName = 'Example phone';
    expect(validatePhoneData(repeatedBrand, today).errors.some((e) => e.includes('.modelName'))).toBe(true);
  });
});