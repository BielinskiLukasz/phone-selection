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

describe('E9-03 / E10 · wybór BLEND na puli 15 modeli', () => {
  it('przy BLEND 0,5 rozstęp wyników jest wyraźny, ale nie przerysowany', () => {
    const at05 = spread(run('żona', WIFE.answers, WIFE_PICKS, 0.5));
    const at0 = spread(run('żona', WIFE.answers, WIFE_PICKS, 0));
    const at1 = spread(run('żona', WIFE.answers, WIFE_PICKS, 1));

    expect(at05).toBeGreaterThan(at0);
    expect(at05).toBeLessThan(at1);
    expect(at05).toBeGreaterThan(19);
    expect(at05).toBeLessThan(30);
  });

  it('9.1.3 przy BLEND ≤ 0,5 zachowuje lidera w trójce i priorytet baterii, a przy 0,75 łamie go', () => {
    for (const blend of [0, 0.25, 0.5]) {
      const plain = run('żona', WIFE.answers, WIFE_PICKS, blend);
      const filtered = run('żona', WIFE.answers, WIFE_PICKS, blend, { minStorageGb: 256 });
      expect(filtered.cards.map((card) => card.phoneId), `BLEND ${blend}`).toContain(
        plain.cards[0]!.phoneId,
      );
      const winnerBattery =
        POOL.find((phone) => phone.id === filtered.cards[0]!.phoneId)!.scores.battery ?? 0;
      expect(winnerBattery, `BLEND ${blend}`).toBeGreaterThanOrEqual(75);
    }

    /* Dlatego 0,75/1 odpadają: filtr 256 GB wyrzuca lidera poza trójkę i winduje model o słabszej baterii. */
    const plain = run('żona', WIFE.answers, WIFE_PICKS, 0.75);
    const filtered = run('żona', WIFE.answers, WIFE_PICKS, 0.75, { minStorageGb: 256 });
    expect(filtered.cards.map((card) => card.phoneId)).not.toContain(plain.cards[0]!.phoneId);
    expect(filtered.cards[0]!.phoneId).toBe('xiaomi-15t-12-512');
  });

  it('9.3 (persona „bateria” stawia na największą baterię 8340 mAh) nie działa przy BLEND 0, a przy BLEND 0,5 równoważy też aparat u „żony”', () => {
    expect(run('bateria', BATTERY.answers, BATTERY_PICKS, 0.5).cards[0]!.phoneId).toBe(
      'redmi-note-17-pro-5g-8-512',
    );
    /* Przy BLEND 0 wygrywa tańszy Redmi Note 15 Pro (6580 mAh) zamiast 8340 mAh. */
    expect(run('bateria', BATTERY.answers, BATTERY_PICKS, 0).cards[0]!.phoneId).toBe(
      'redmi-note-15-pro-5g-8-256',
    );
    /* Przy BLEND 0,25 u „żony” wygrywa Redmi Note 17 Pro mimo braku 4K; przy 0,5 prowadzi zbalansowane 7000 mAh. */
    expect(run('żona', WIFE.answers, WIFE_PICKS, 0.25).cards[0]!.phoneId).toBe(
      'redmi-note-17-pro-5g-8-512',
    );
    expect(run('żona', WIFE.answers, WIFE_PICKS, 0.5).cards[0]!.phoneId).toBe(
      'vivo-v70-fe-5g-8-256',
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

  it('skonfigurowana wartość to 0,5, a próg remisu poprawnie odróżnia wyraźną przewagę od remisu 7000 mAh', () => {
    expect(BLEND).toBe(0.5);
    expect(TIE_THRESHOLD).toBe(2);

    const cam = run('aparat', CAMERA.answers, CAMERA_PICKS, BLEND);
    expect(cam.ranked[0]!.score - cam.ranked[1]!.score).toBeGreaterThan(TIE_THRESHOLD);
    expect(cam.ranked[0]!.practicalTieWith).toBeNull();

    const wife = run('żona', WIFE.answers, WIFE_PICKS, BLEND);
    expect(wife.ranked[0]!.score - wife.ranked[1]!.score).toBeLessThan(TIE_THRESHOLD);
    expect(wife.ranked[0]!.practicalTieWith).toBe('motorola-edge-70-fusion-12-256');
  });
});
