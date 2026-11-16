import type { Phone } from '@/types';
import {
  NO_DATA,
  PERFORMANCE_LABEL,
  collectForbiddenTokens,
  durabilityFact,
  panelLabel,
  performanceClass,
  redact,
  refreshLabel,
  updatesFact,
} from './anonymize';

/**
 * „Pełne dane” w szczegółach karty (UI-SPEC 3.5) — zbudowane tak, żeby komponent
 * nigdy nie dostał obiektu `Phone` z polem `reveal`. Procesor występuje wyłącznie
 * jako klasa wydajności, a każda wartość przechodzi przez redakcję tokenów.
 */

export interface SpecLabels {
  display: string;
  performance: string;
  battery: string;
  charging: string;
  charger: string;
  weight: string;
  storage: string;
  updates: string;
  durability: string;
  connectivity: string;
}

export interface SpecRow {
  key: string;
  label: string;
  value: string;
  missing: boolean;
}

function decimal(value: number): string {
  return String(value).replace('.', ',');
}

export function specRows(
  phone: Phone,
  labels: SpecLabels,
  pool: readonly Phone[] = [],
): SpecRow[] {
  const tokens = collectForbiddenTokens(phone, pool);
  const clean = (text: string): string => redact(text, tokens).trim();
  const { specs } = phone;

  const size = typeof specs.displayInch === 'number' ? specs.displayInch : null;
  const panel = panelLabel(specs.panel);
  const refresh = refreshLabel(specs.refreshHz);
  const display = [
    size ? `${decimal(size)}″` : null,
    panel,
    refresh,
    typeof specs.resolution === 'string' ? specs.resolution : null,
    typeof specs.peakNits === 'number' ? `${specs.peakNits} nitów` : null,
  ]
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' · ');

  const battery = [
    typeof specs.batteryMah === 'number' ? `${specs.batteryMah} mAh` : null,
    typeof specs.batteryCycles === 'number' ? `${specs.batteryCycles} cykli` : null,
    typeof specs.batteryType === 'string' ? clean(specs.batteryType) : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  const charging = [
    typeof specs.chargingW === 'number' ? `${specs.chargingW} W przewodowo` : null,
    specs.wirelessCharging === true
      ? 'ładowanie bezprzewodowe'
      : specs.wirelessCharging === false
        ? 'bez ładowania bezprzewodowego'
        : null,
    typeof specs.wirelessW === 'number' ? `${specs.wirelessW} W bezprzewodowo` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  const weight = [
    typeof specs.weightG === 'number' ? `${specs.weightG} g` : null,
    typeof specs.dimensionsMm === 'string' ? `${specs.dimensionsMm} mm` : null,
    typeof specs.thicknessMm === 'number' ? `${decimal(specs.thicknessMm)} mm grubości` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  const connectivity = [
    specs.nfc === true ? 'NFC' : specs.nfc === false ? 'bez NFC' : null,
    typeof specs.bluetooth === 'string' ? `Bluetooth ${specs.bluetooth}` : null,
    typeof specs.wifi === 'string' ? clean(specs.wifi) : null,
    typeof specs.sim === 'string' ? clean(specs.sim) : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(' · ');

  const durability = durabilityFact(specs);
  const updates = updatesFact(specs);
  const performance = performanceClass(phone.scores.smoothness);

  const rows: SpecRow[] = [
    { key: 'display', label: labels.display, value: display, missing: display.length === 0 },
    {
      key: 'performance',
      label: labels.performance,
      value: `klasa ${PERFORMANCE_LABEL[performance]}`,
      missing: false,
    },
    { key: 'battery', label: labels.battery, value: battery, missing: battery.length === 0 },
    { key: 'charging', label: labels.charging, value: charging, missing: charging.length === 0 },
    {
      key: 'chargerInBox',
      label: labels.charger,
      value:
        specs.chargerInBox === true
          ? 'tak'
          : specs.chargerInBox === false
            ? 'nie'
            : NO_DATA,
      missing: specs.chargerInBox === null || specs.chargerInBox === undefined,
    },
    { key: 'weight', label: labels.weight, value: weight, missing: weight.length === 0 },
    {
      key: 'storage',
      label: labels.storage,
      value: `${phone.variant.storageGb} GB · RAM ${phone.variant.ramGb} GB${
        specs.microSd === true
          ? ' · karta microSD'
          : specs.microSd === false
            ? ' · bez karty microSD'
            : ''
      }`,
      missing: false,
    },
    { key: 'updates', label: labels.updates, value: updates.value, missing: updates.missing },
    {
      key: 'durability',
      label: labels.durability,
      value: [
        durability.value,
        typeof specs.militaryStandard === 'string' ? clean(specs.militaryStandard) : null,
      ]
        .filter((part): part is string => Boolean(part) && part !== NO_DATA)
        .join(' · '),
      missing: durability.missing,
    },
    {
      key: 'connectivity',
      label: labels.connectivity,
      value: connectivity,
      missing: connectivity.length === 0,
    },
  ];

  return rows.map((row) => ({
    ...row,
    value: row.missing ? NO_DATA : clean(row.value) || NO_DATA,
    missing: row.missing || row.value.length === 0,
  }));
}
