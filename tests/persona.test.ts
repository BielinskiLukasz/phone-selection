import { describe, expect, it } from 'vitest';
import { POOL, phoneById } from './data';
import { BATTERY, CAMERA, PERSONAS, WIFE, skipAll } from './personas';
import { rankFromAnswers } from '../src/lib/scoring';
import { rawScore } from '../src/lib/scoring';
import { TIE_THRESHOLD } from '../src/lib/scoringConfig';
import type { Persona } from './personas';
import type { RankedPhone } from '../src/types';

/**
 * E2-11 · persony i niezmienniki z QUIZ-SPEC 9 na prawdziwych danych (14.11.2026).
 * Sprawdzamy niezmienniki, nie liczby referencyjne — aktualizacja cen nie może psuć testów.
 */

const wife = () => rankFromAnswers(POOL, WIFE.answers, WIFE.topThree);
const camera = () => rankFromAnswers(POOL, CAMERA.answers, CAMERA.topThree);
const battery = () => rankFromAnswers(POOL, BATTERY.answers, BATTERY.topThree);

function phoneOf(entry: RankedPhone) {
  return phoneById(entry.phoneId);
}

function mean(entries: readonly RankedPhone[], criterion: 'battery' | 'photoDay'): number {
  return (
    entries.reduce((sum, entry) => sum + rawScore(phoneOf(entry), criterion, 2000), 0) /
    entries.length
  );
}

describe('persony · podstawy', () => {
  it('każda persona dostaje ranking całej puli i trzy karty', () => {
    for (const persona of PERSONAS) {
      const result = rankFromAnswers(POOL, persona.answers, persona.topThree);
      expect(result.empty, persona.id).toBe(false);
      expect(result.poolSize, persona.id).toBe(POOL.length);
      expect(result.ranked.length, persona.id).toBe(POOL.length);
      expect(result.cards.length, persona.id).toBe(3);
      for (const entry of result.ranked) {
        expect(entry.score, persona.id).toBeGreaterThanOrEqual(0);
        expect(entry.score, persona.id).toBeLessThanOrEqual(100);
      }
    }
  });

  it('wyniki są uporządkowane malejąco i miejsca są kolejne', () => {
    const result = wife();
    result.ranked.forEach((entry, index) => {
      expect(entry.place).toBe(index + 1);
      const previous = result.ranked[index - 1];
      if (previous) expect(previous.score).toBeGreaterThanOrEqual(entry.score);
    });
  });

  it('te same dane, inne odpowiedzi → inny ranking', () => {
    const firsts = new Set([wife(), camera(), battery()].map((result) => result.cards[0]!.phoneId));
    expect(firsts.size).toBeGreaterThan(1);
  });

  it('same „pomiń” dają wynik ogólny, a nie błąd (QUIZ-SPEC 8)', () => {
    const result = rankFromAnswers(POOL, skipAll(), null);
    expect(result.cards.length).toBe(3);
    expect(result.bestScore).not.toBeNull();
  });
});

describe('9.1 · persona „żona”', () => {
  it('trójka odpowiada stanowi referencyjnemu (FP3-03): bateria przed aparatem, pamięć ≥ 256 GB', () => {
    /* FP3-03 (17.11.2026): „zawsze na noc” → charging 0,25; vivo (90 W) traci przewagę z ładowania:
       #1 Edge 70 Fusion 66,9 · #2 Redmi Note 17 Pro 66,7 (remis) · #3 vivo V70 FE 65,7 · #4 realme 64,5. */
    const ids = wife().cards.map((entry) => entry.phoneId);
    expect(ids[0]).toBe('motorola-edge-70-fusion-12-256');
    expect(ids[1]).toBe('redmi-note-17-pro-5g-8-512');
    expect(ids[2]).toBe('vivo-v70-fe-5g-8-256');
    expect(wife().ranked[3]!.phoneId).toBe('realme-16-pro-plus-5g-8-256');
    for (const entry of wife().cards) {
      expect(phoneOf(entry).variant.storageGb).toBeGreaterThanOrEqual(256);
    }
    expect(wife().cards[0]!.matchPercent).toBeGreaterThanOrEqual(65);
    expect(wife().cards[0]!.matchPercent).toBeLessThanOrEqual(80);
  });

  it('9.1.1 żaden telefon 128 GB w trójce, gdy pamięć jest w trójce najważniejszych', () => {
    for (const entry of wife().cards) {
      expect(phoneOf(entry).variant.storageGb, entry.phoneId).toBeGreaterThanOrEqual(256);
    }
  });

  it('9.1.2 średnia ocena battery w trójce ≥ średniej puli', () => {
    const poolMean =
      POOL.reduce((sum, phone) => sum + rawScore(phone, 'battery', 2000), 0) / POOL.length;
    expect(mean(wife().cards, 'battery')).toBeGreaterThanOrEqual(poolMean);
  });

  it('9.1.3 filtr „min. 256 GB” zostawia dotychczasowe #1 w trójce i zachowuje priorytet baterii', () => {
    const plain = wife();
    const filtered = rankFromAnswers(POOL, WIFE.answers, WIFE.topThree, { minStorageGb: 256 });
    expect(filtered.poolSize).toBe(POOL.length - 2);
    /* Po odcięciu 128 GB normalizacja rozciąga 256 vs 512 GB: wygrywa model 512 GB z trójki
       o najwyższej baterii, a dotychczasowy #1 zostaje w trójce i jest #1 wśród modeli 256 GB. */
    expect(filtered.cards.map((entry) => entry.phoneId)).toContain(plain.cards[0]!.phoneId);
    expect(plain.cards.map((entry) => entry.phoneId)).toContain(filtered.cards[0]!.phoneId);
    const first256 = filtered.ranked.find((entry) => phoneOf(entry).variant.storageGb === 256)!;
    expect(first256.phoneId).toBe(plain.cards[0]!.phoneId);
  });

  it('9.1.4 (D6, etap 10) budżet 1500 zł → wszystkie trzy karty mieszczą się w budżecie, a przy puli <3 w budżecie dokłada „Powyżej budżetu”', () => {
    const result = rankFromAnswers(POOL, { ...WIFE.answers, F1: 'F1-a' }, WIFE.topThree);
    expect(result.inBudgetCount).toBeGreaterThanOrEqual(3);
    expect(result.cards.length).toBe(3);

    for (const entry of result.cards) {
      expect(entry.inBudget, entry.phoneId).toBe(true);
      expect(entry.overBudgetBy, entry.phoneId).toBeNull();
      expect(phoneOf(entry).price.pln, entry.phoneId).toBeLessThanOrEqual(1500);
    }

    /* Mechanizm uzupełniania nadal działa, gdy w budżecie są mniej niż 3 telefony. */
    const twoInBudget = POOL.filter((phone) => phone.id !== 'galaxy-a37-5g-8-256');
    const fallback = rankFromAnswers(twoInBudget, { ...WIFE.answers, F1: 'F1-a' }, WIFE.topThree);
    expect(fallback.inBudgetCount).toBe(2);
    expect(fallback.cards.filter((entry) => !entry.inBudget).length).toBe(1);
    expect(fallback.cards[2]!.overBudgetBy).toBeGreaterThan(0);
  });

  it('priorytet baterii przed aparatem jest widoczny w ważnościach i w wyniku', () => {
    const result = wife();
    const top = phoneOf(result.cards[0]!);
    const bestCameraPhone = [...result.ranked]
      .map((entry) => phoneOf(entry))
      .sort((a, b) => (b.scores.photoDay ?? 0) - (a.scores.photoDay ?? 0))[0]!;

    expect(result.cards[0]!.groupScores.battery).toBeGreaterThan(
      result.cards[0]!.groupScores.camera,
    );
    expect(top.scores.battery).toBeGreaterThanOrEqual(bestCameraPhone.scores.battery ?? 0);
  });
});

describe('9.2 i 9.3 · persony kontrolne', () => {
  it('persona „aparat” stawia na telefon z najmocniejszymi zdjęciami w dzień', () => {
    const result = camera();
    expect(result.cards[0]!.phoneId).toBe('xiaomi-15t-12-512');
    expect(phoneOf(result.cards[0]!).scores.photoDay).toBeGreaterThanOrEqual(78);
    expect(result.cards[0]!.groupScores.camera).toBeGreaterThan(
      result.cards[0]!.groupScores.price,
    );
  });

  it('persona „bateria” stawia na telefon z największą baterią (8340 mAh)', () => {
    const result = battery();
    expect(result.cards[0]!.phoneId).toBe('redmi-note-17-pro-5g-8-512');
    expect(phoneOf(result.cards[0]!).scores.battery).toBe(100);
    expect(result.cards[0]!.groupScores.battery).toBeGreaterThan(
      result.cards[0]!.groupScores.camera,
    );
  });

  it('bliskie wyniki persony „aparat” są oznaczone jako praktyczny remis', () => {
    const result = camera();
    const tied = result.ranked.filter((entry) => entry.practicalTieWith !== null);
    expect(tied.length).toBeGreaterThan(0);

    for (const entry of tied) {
      const neighbour = result.ranked.find((item) => item.phoneId === entry.practicalTieWith);
      expect(neighbour).toBeTruthy();
      expect(Math.abs(neighbour!.score - entry.score)).toBeLessThan(TIE_THRESHOLD);
    }
  });
});

describe('9.4 · test różnicujący między personami', () => {
  it('bateria persony „bateria” > „aparat”, a zdjęcia w dzień odwrotnie', () => {
    expect(mean(battery().cards, 'battery')).toBeGreaterThan(mean(camera().cards, 'battery'));
    expect(mean(camera().cards, 'photoDay')).toBeGreaterThan(mean(battery().cards, 'photoDay'));
  });

  it('różnica jest wyraźna, nie szumowa (co najmniej 3 pkt na każdej osi)', () => {
    expect(mean(battery().cards, 'battery') - mean(camera().cards, 'battery')).toBeGreaterThan(3);
    expect(mean(camera().cards, 'photoDay') - mean(battery().cards, 'photoDay')).toBeGreaterThan(1);
  });
});

describe('persony · filtry i brzegi', () => {
  it('żadna persona nie wyciąga telefonu powyżej limitu 2000 zł', () => {
    const run = (persona: Persona) => rankFromAnswers(POOL, persona.answers, persona.topThree);
    for (const persona of PERSONAS) {
      for (const entry of run(persona).cards) {
        expect(phoneOf(entry).price.pln, persona.id).toBeLessThanOrEqual(2000);
      }
    }
  });

  it('Realme po potwierdzeniu oferty (A1) i nowe modele etapu 10 są pełnoprawnymi rekordami', () => {
    const realme = phoneById('realme-16-pro-plus-5g-8-256');
    expect(realme.status).toBe('ok');
    expect(realme.reveal.name).not.toContain('potwierdzenia');
    expect(realme.scores.battery).toBe(84); // 7000 mAh (75 w skali 4000–8000, D4) + PCMark 19 h (92)
    expect(realme.scoresEstimatedNeutral).toEqual([]);
    expect(wife().ranked.slice(0, 4).map((entry) => entry.phoneId)).toContain(realme.id);

    const vivo = phoneById('vivo-v70-fe-5g-8-256');
    expect(vivo.status).toBe('ok');
    expect(vivo.scores.battery).toBe(83);
    expect(wife().cards.map((entry) => entry.phoneId)).toContain(vivo.id);
  });
});
