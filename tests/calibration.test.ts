import { describe, expect, it } from 'vitest';
import { REFERENCE_POOL as POOL } from './data';
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

describe('E9-03 / E10 · wybór BLEND na puli referencyjnej (22 modele)', () => {
  it('przy BLEND 0,5 rozstęp wyników jest wyraźny, ale nie przerysowany', () => {
    const at05 = spread(run('żona', WIFE.answers, WIFE_PICKS, 0.5));
    const at0 = spread(run('żona', WIFE.answers, WIFE_PICKS, 0));
    const at1 = spread(run('żona', WIFE.answers, WIFE_PICKS, 1));

    /* Pula 22 modeli (18.11.2026): rozstęp u „żony” 0 → 32,5 · 0,5 → 38,5 · 1 → 47,3. Od 15 do 18 modeli było ok. 24,
       skok do ok. 38 robi Galaxy A17 5G 4/128 GB — najsłabszy w puli (dół normalizacji min-max). Pilnujemy:
       0,5 wyraźne (> 15), nie większe niż przy 1, bliskie rozstępowi przy 0 (< 8) i nie przerysowane (< 45). */
    expect(at05).toBeLessThan(at1);
    expect(Math.abs(at05 - at0)).toBeLessThan(8);
    expect(at05).toBeGreaterThan(15);
    expect(at05).toBeLessThan(45);
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

    /* Dlatego 1 odpada: filtr 256 GB przestawia #1 na Xiaomi 15T (48 pkt baterii) — poza remisem. Przy 0,75 po FP3-03
       lider zostaje w trójce, ale #1 po filtrze to Note 17 Pro — niezmiennik trzyma tylko w postaci „lider w trójce”. */
    const plain = run('żona', WIFE.answers, WIFE_PICKS, 1);
    const filtered = run('żona', WIFE.answers, WIFE_PICKS, 1, { minStorageGb: 256 });
    expect(filtered.cards[0]!.phoneId).toBe('xiaomi-15t-12-512');
    expect(filtered.cards[0]!.phoneId).not.toBe(plain.cards[0]!.phoneId);
  });

  it('9.3 (persona „bateria”): Redmi Note 17 Pro (8340 mAh) jest w trójce przy każdym BLEND, a #1 to POCO F7 (od BLEND 0,25)', () => {
    /* Pula 22 modeli: POCO F7 (6500 mAh, ładowanie 100 pkt, tańszy o ok. 260 zł) wyprzedza Note 17 Pro dzięki ważności
       ceny 3,88 (cena jest w trójce tej persony). Przy BLEND 0 prowadzi Honor Magic 7 Lite. Decyzja z 18.11.2026:
       przyjmujemy to jako stan referencyjny (spec 9.3), bez zmian w silniku. */
    expect(run('bateria', BATTERY.answers, BATTERY_PICKS, 0.5).cards[0]!.phoneId).toBe('poco-f7-12-256');
    expect(run('bateria', BATTERY.answers, BATTERY_PICKS, 0).cards[0]!.phoneId).toBe(
      'honor-magic-7-lite-8-256',
    );
    for (const blend of [0, 0.25, 0.5, 0.75, 1]) {
      expect(
        run('bateria', BATTERY.answers, BATTERY_PICKS, blend).cards.map((card) => card.phoneId),
        `BLEND ${blend}`,
      ).toContain('redmi-note-17-pro-5g-8-512');
    }
    /* U „żony” Redmi Note 17 Pro prowadzi od BLEND 0 do 0,5 (mimo braku 4K); od 0,75 wygrywa POCO F7. */
    for (const blend of [0, 0.25, 0.5]) {
      expect(run('żona', WIFE.answers, WIFE_PICKS, blend).cards[0]!.phoneId, `BLEND ${blend}`).toBe(
        'redmi-note-17-pro-5g-8-512',
      );
    }
    expect(run('żona', WIFE.answers, WIFE_PICKS, 0.75).cards[0]!.phoneId).toBe('poco-f7-12-256');
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
    /* 31,1 pkt na puli 22 modeli (25,0 na 15 — różnicę robi Galaxy A17 5G 4/128 GB i Edge 60 Neo). */
    expect(spread(run('pomiń', skipAll(), null, BLEND))).toBeLessThan(35);

    const derived = deriveFromAnswers({}, null);
    const extreme = rank({
      phones: POOL,
      weights: derived.weights,
      groupImportance: {
        ...derived.groupImportance,
        battery: 5,
        camera: 0,
        storage: 0,
        longevity: 0,
        smooth: 0,
        size: 0,
        price: 0,
      },
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
    expect(wife.ranked[0]!.phoneId).toBe('redmi-note-17-pro-5g-8-512');
    expect(wife.ranked[0]!.practicalTieWith).toBe('poco-f7-12-256');
  });
});
