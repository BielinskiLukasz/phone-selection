import { CRITERION_IDS } from '../../src/types/criteria';
import type { Phone, PhoneScores } from '../../src/types/phone';

interface Profile {
  id: string;
  brand: string;
  price: number;
  storageGb: number;
  battery: number;
  charging: number;
  camera: number;
}

export function makePhone(profile: Profile): Phone {
  const scores: PhoneScores = {
    battery: profile.battery,
    charging: profile.charging,
    photoDay: profile.camera,
    photoIndoor: profile.camera,
    photoMotion: profile.camera,
    selfie: profile.camera,
    video: profile.camera,
    zoom: profile.camera,
    storage: profile.storageGb === 512 ? 100 : profile.storageGb === 256 ? 75 : 40,
    updates: 70,
    durability: 70,
    display: 60,
    smoothness: 60,
    value: null,
  };

  return {
    id: profile.id,
    reveal: {
      name: `Device ${profile.brand}`,
      brand: profile.brand,
      shopLinks: [{ url: `https://example.com/${profile.id}`, shop: 'Example' }],
    },
    variant: { ramGb: 8, storageGb: profile.storageGb },
    price: { pln: profile.price, checkedAt: '2026-11-15', source: 'Fixture store' },
    specs: {
      batteryMah: 5000,
      chargingW: 45,
      wirelessCharging: false,
      display: { sizeInches: 6.7, panel: `${profile.brand} AMOLED`, refreshHz: 120 },
      ipRating: `${profile.brand} IP68`,
      microSd: false,
      cameras: { mainMp: 50, mainOis: true, ultrawideMp: 12, telephotoMp: 0, selfieMp: 32 },
      updates: { osVersions: 4, securityYears: 5 },
      chip: `${profile.brand} Processor Z9`,
    },
    scores,
    basis: Object.fromEntries(CRITERION_IDS.map((criterion) => [criterion, `${profile.brand} laboratory notes`])),
    scoreConfidence: { battery: 'high', photoDay: 'medium' },
    scoresEstimatedNeutral: [],
    status: 'ok',
  };
}

// Synthetic profiles test algorithmic behavior; these are not real phone recommendations.
export const SYNTHETIC_PHONES: Phone[] = [
  makePhone({ id: 'sample-one', brand: 'Orion', price: 1399, storageGb: 256, battery: 98, charging: 90, camera: 30 }),
  makePhone({ id: 'sample-two', brand: 'Vega', price: 1650, storageGb: 256, battery: 85, charging: 80, camera: 75 }),
  makePhone({ id: 'sample-three', brand: 'Lyra', price: 1720, storageGb: 256, battery: 35, charging: 30, camera: 98 }),
  makePhone({ id: 'sample-four', brand: 'Nova', price: 1499, storageGb: 128, battery: 55, charging: 40, camera: 80 }),
  makePhone({ id: 'sample-five', brand: 'Astra', price: 1900, storageGb: 512, battery: 65, charging: 60, camera: 70 }),
  makePhone({ id: 'sample-six', brand: 'Cygnus', price: 1999, storageGb: 256, battery: 40, charging: 50, camera: 90 }),
];