import { CRITERION_IDS } from '../data/criteria';
import type { Phone } from '../types/phone';
import type { AnonymousCard, AnonymousFeature, RankedPhone } from '../types/ranking';

function fact(key: AnonymousFeature['key'], parts: string[]): AnonymousFeature {
  return { key, text: parts.length ? parts.join(' · ') : 'brak danych', missing: parts.length === 0 };
}

function positive(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function performanceClass(score: number): string {
  if (score >= 75) return 'wydajność wysoka';
  if (score >= 55) return 'wydajność średnia';
  return 'wydajność podstawowa';
}

export function toAnonCard(phone: Phone, ranked: RankedPhone): AnonymousCard {
  if (ranked.phoneId !== phone.id) throw new Error('Ranking and phone do not match.');
  const { specs } = phone;

  const battery: string[] = [];
  const batteryMah = specs.batteryMah;
  const chargingW = specs.chargingW;
  if (positive(batteryMah)) battery.push(`${batteryMah} mAh`);
  if (positive(chargingW)) battery.push(`ładowanie ${chargingW} W`);
  if (specs.wirelessCharging === true) battery.push('ładowanie bezprzewodowe');
  if (specs.wirelessCharging === false) battery.push('bez ładowania bezprzewodowego');

  const camera: string[] = [];
  const mainMp = specs.cameras?.mainMp;
  const ultrawideMp = specs.cameras?.ultrawideMp;
  const selfieMp = specs.cameras?.selfieMp;
  const telephotoMp = specs.cameras?.telephotoMp;
  if (positive(mainMp)) {
    camera.push(`główny ${mainMp} MP${specs.cameras?.mainOis === true ? ' ze stabilizacją' : specs.cameras?.mainOis === false ? ' bez stabilizacji' : ''}`);
  }
  if (positive(ultrawideMp)) camera.push(`szeroki kąt ${ultrawideMp} MP`);
  if (positive(selfieMp)) camera.push(`selfie ${selfieMp} MP`);
  if (telephotoMp === 0) camera.push('bez aparatu do przybliżania');
  else if (positive(telephotoMp)) camera.push(`aparat do przybliżania ${telephotoMp} MP`);

  const storage: string[] = [];
  if (positive(phone.variant.storageGb)) storage.push(`${phone.variant.storageGb} GB`);
  if (specs.microSd === true) storage.push('karta microSD');
  if (specs.microSd === false) storage.push('bez karty microSD');

  const updates: string[] = [];
  const osVersions = specs.updates?.osVersions;
  const securityYears = specs.updates?.securityYears;
  if (positive(osVersions)) updates.push(`${osVersions} aktualizacje systemu`);
  if (positive(securityYears)) updates.push(`${securityYears} lat poprawek`);

  const ipCodes = typeof specs.ipRating === 'string'
    ? [...new Set(specs.ipRating.match(/IP\d{2}/g) ?? [])].slice(0, 2)
    : [];
  const durability = ipCodes.length ? [`odporność ${ipCodes.join('/')}`] : [];

  const display: string[] = [];
  const sizeInches = specs.display?.sizeInches;
  const refreshHz = specs.display?.refreshHz;
  if (positive(sizeInches)) {
    display.push(`${sizeInches.toLocaleString('pl-PL', { maximumFractionDigits: 2 })} cala`);
  }
  const panel = specs.display?.panel?.toLowerCase() ?? '';
  if (panel.includes('amoled')) display.push('AMOLED');
  else if (panel.includes('oled')) display.push('OLED');
  else if (panel.includes('lcd')) display.push('LCD');
  if (positive(refreshHz)) display.push(`${refreshHz} Hz`);
  display.push(phone.scoresEstimatedNeutral?.includes('smoothness')
    ? 'wydajność: brak danych'
    : performanceClass(phone.scores.smoothness));

  const features = [
    fact('battery', battery),
    fact('camera', camera),
    fact('storage', storage),
    fact('updates', updates),
    fact('durability', durability),
    fact('display', display),
  ];

  // Raw basis text can contain brand and chip names; only curated facts cross this boundary.
  const details = CRITERION_IDS.map((criterion) => {
    const estimated = phone.scoresEstimatedNeutral?.includes(criterion) ?? false;
    return {
      criterion,
      score: ranked.rawScores[criterion],
      confidence: estimated ? 'low' : (phone.scoreConfidence?.[criterion] ?? 'medium'),
      estimated,
      explanation: estimated
        ? 'Brak potwierdzonych danych; ocena jest szacunkiem.'
        : criterion === 'value'
          ? 'Ocena obliczona z ceny i budżetu.'
          : 'Ocena wyprowadzona z danych porównawczych.',
    };
  });

  return {
    position: ranked.position,
    matchPercent: ranked.matchPercent,
    price: { pln: phone.price.pln, checkedAt: phone.price.checkedAt },
    ...(ranked.overBudgetBy !== undefined ? { overBudgetBy: ranked.overBudgetBy } : {}),
    ...(ranked.tieWith !== undefined ? { tieWith: ranked.tieWith } : {}),
    features,
    details,
  };
}