import { describe, expect, it } from 'vitest';
import { POOL } from './data';
import { WIFE, CAMERA, BATTERY, skipAll } from './personas';
import { rank } from '../src/lib/scoring';
import { deriveFromAnswers } from '../src/lib/weights';
import { BLEND, TIE_THRESHOLD } from '../src/lib/scoringConfig';
import type { Answers, GroupId } from '../src/types';

/**
 * E9-03 · kalibracja: `BLEND` zmierzona na personach i realnych zestawach odpowiedzi.
 * Test zamyka wnioski z przeglądu — zmiana stałej bez ponownego pomiaru wywali się tutaj.
 */

function run(_label: string, answers: Answers, picks: [GroupId, GroupId, GroupId] | null, blend: number, extra = {}) {
  const derived = deriveFromAnswers(answers, picks ? { picks } : null);
  return rank({
    phones: POOL,
    weights: derived.weights,
    groupImportance: derived.groupImportance,
    filters: { ...derived.filters, ...extra },
    blend,
  });
}

const spread = (result: ReturnType<typeof run>) =>
  result.ranked[0]!.score - result.ranked[result.ranked.length - 1]!.score;

const WIFE_PICKS: [GroupId, GroupId, GroupId] = ['battery', 'camera', 'storage'];
const BATTERY_PICKS: [GroupId, GroupId, GroupId] = ['battery', 'price', 'longevity'];
const CAMERA_PICKS: [GroupId, GroupId, GroupId] = ['camera', 'storage', 'smooth'];

describe('E9-03 · wybór BLEND', () => {
  it('przy BLEND 0,5 rozstęp wyników jest wyraźny, ale nie przerysowany', () => {
    const at05 = spread(run('żona', WIFE.answers, WIFE_PICKS, 0.5));
    const at0 = spread(run('żona', WIFE.answers, WIFE_PICKS, 0));
    const at1 = spread(run('żona', WIFE.answers, WIFE_PICKS, 1));

    /* Pomiar po etapie 10 (15 telefonów, wzór baterii D4): rozstęp 0 → 20,7 · 0,25 → 20,2 · 0,5 → 19,8 ·
       0,75 → 21,3 · 1 → 24,3. Normalizacja min-max nie zwiększa już rozstępu monotonicznie (do etapu 9: 0 < 0,5 < 1),
       więc pilnujemy: 0,5 jest wyraźne (> 15), łagodniejsze niż 1 i nie odbiega od 0 o więcej niż 3 pkt. */
    expect(at05).toBeLessThan(at1);
    expect(at05).toBeGreaterThan(15);
    expect(at05).toBeLessThan(30);
    expect(Math.abs(at05 - at0)).toBeLessThan(3);
  });

  it('9.1.3 (filtr 256 GB nie zmienia #1) działa dla BLEND ≤ 0,5 i łamie się przy 0,75', () => {
    for (const blend of [0, 0.25, 0.5]) {
      const plain = run('żona', WIFE.answers, WIFE_PICKS, blend);
      const filtered = run('żona', WIFE.answers, WIFE_PICKS, blend, { minStorageGb: 256 });
      expect(filtered.cards[0]!.phoneId, `BLEND ${blend}`).toBe(plain.cards[0]!.phoneId);
    }

    /* Dlatego 0,75/1 odpadają: filtr pamięci przestawia zwycięzcę. */
    const plain = run('żona', WIFE.answers, WIFE_PICKS, 0.75);
    const filtered = run('żona', WIFE.answers, WIFE_PICKS, 0.75, { minStorageGb: 256 });
    expect(filtered.cards[0]!.phoneId).not.toBe(plain.cards[0]!.phoneId);
  });

  it('9.3 (persona „bateria” stawia na największą baterię) działa dla każdej wartości BLEND od etapu 10', () => {
    /* Do etapu 9 przy 0 i 0,25 wygrywał tańszy Redmi Note 15 Pro; z Redmi Note 17 Pro (8340 mAh, battery 100)
       referencja 9.3 jest stabilna niezależnie od BLEND. */
    for (const blend of [0, 0.25, 0.5, 0.75, 1]) {
      expect(run('bateria', BATTERY.answers, BATTERY_PICKS, blend).cards[0]!.phoneId, `BLEND ${blend}`).toBe(
        'redmi-note-17-pro-5g-8-512',
      );
    }
  });

  it('9.2 i 9.4 są stabilne dla każdej wartości BLEND', () => {
    for (const blend of [0, 0.25, 0.5, 0.75, 1]) {
      expect(run('aparat', CAMERA.answers, CAMERA_PICKS, blend).cards[0]!.phoneId, `BLEND ${blend}`).toBe(
        'xiaomi-15t-12-512',
      );
      const batteryCards = run('bateria', BATTERY.answers, BATTERY_PICKS, blend).cards.map(
        (card) => POOL.find((phone) => phone.id === card.phoneId)!.scores.battery ?? 0,
      );
      const cameraCards = run('aparat', CAMERA.answers, CAMERA_PICKS, blend).cards.map(
        (card) => POOL.find((phone) => phone.id === card.phoneId)!.scores.battery ?? 0,
      );
      const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
      expect(mean(batteryCards), `BLEND ${blend}`).toBeGreaterThan(mean(cameraCards));
    }
  });

  it('odpowiedzi „pomiń” dają wynik ogólny, a skrajne suwaki — maksymalny rozstęp', () => {
    expect(spread(run('pomiń', skipAll(), null, BLEND))).toBeLessThan(25);

    const derived = deriveFromAnswers({}, null);
    const extreme = rank({
      phones: POOL,
      weights: derived.weights,
      groupImportance: { ...derived.groupImportance, battery: 5, camera: 0, storage: 0, longevity: 0, smooth: 0, price: 0 },
      filters: { budgetMax: 2000 },
      blend: BLEND,
    });
    expect(spread(extreme)).toBeGreaterThan(60);
  });

  it('skonfigurowana wartość to 0,5, a próg remisu nie daje fałszywych remisów u person', () => {
    expect(BLEND).toBe(0.5);
    expect(TIE_THRESHOLD).toBe(2);

    /* Etap 10: u „żony” #1 (Redmi Note 17 Pro 67,7) i #2 (Edge 70 Fusion 67,0) dzieli 0,7 pkt — to prawdziwy,
       nie fałszywy remis i karta ma go pokazać. Brak fałszywych remisów sprawdzamy na personach kontrolnych. */
    const wife = run('żona', WIFE.answers, WIFE_PICKS, BLEND);
    expect(wife.ranked[0]!.practicalTieWith).toBe(wife.ranked[1]!.phoneId);

    const batteryRun = run('bateria', BATTERY.answers, BATTERY_PICKS, BLEND);
    expect(batteryRun.ranked[0]!.score - batteryRun.ranked[1]!.score).toBeGreaterThan(TIE_THRESHOLD);
    expect(batteryRun.ranked[0]!.practicalTieWith).toBeNull();

    const cameraRun = run('aparat', CAMERA.answers, CAMERA_PICKS, BLEND);
    expect(cameraRun.ranked[0]!.score - cameraRun.ranked[1]!.score).toBeGreaterThan(TIE_THRESHOLD);
    expect(cameraRun.ranked[0]!.practicalTieWith).toBeNull();
  });
});
