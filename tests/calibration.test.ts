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

    expect(at05).toBeGreaterThan(at0);
    expect(at05).toBeLessThan(at1);
    expect(at05).toBeGreaterThan(20);
    expect(at05).toBeLessThan(30);
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

  it('9.3 (persona „bateria” stawia na największą baterię) działa od BLEND 0,5', () => {
    expect(run('bateria', BATTERY.answers, BATTERY_PICKS, 0.5).cards[0]!.phoneId).toBe(
      'motorola-edge-70-fusion-12-256',
    );
    /* Przy 0 i 0,25 wygrywa tańszy Redmi — niezgodne z referencją QUIZ-SPEC 9.3. */
    expect(run('bateria', BATTERY.answers, BATTERY_PICKS, 0.25).cards[0]!.phoneId).toBe(
      'redmi-note-15-pro-5g-8-256',
    );
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

    const wife = run('żona', WIFE.answers, WIFE_PICKS, BLEND);
    expect(wife.ranked[0]!.score - wife.ranked[1]!.score).toBeGreaterThan(TIE_THRESHOLD);
    expect(wife.ranked[0]!.practicalTieWith).toBeNull();
  });
});
