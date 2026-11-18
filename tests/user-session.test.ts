import { describe, expect, it } from 'vitest';
import fixture from './fixtures/user-session.json';
import { PHONES } from '../src/data/phones';
import { rank } from '../src/lib/scoring';
import { sanitizeSession } from '../src/lib/session';
import type { Session } from '../src/types/state';

/**
 * FP0-02 · „bramka kandydata” (FIX-PHASE §1.2): aktualny algorytm odtwarza top 3 ze snapshotu
 * prawdziwej sesji użytkowniczki. Dopóki `tests/fixtures/user-session.json` zawiera tylko instrukcję
 * (`pending: true`), test jest pomijany — po wklejeniu sesji z eksportu historii zaczyna pilnować,
 * że zmiany w scoringConfig/scoringRules/questions/weights/phones.json nie zmieniają jej kart po cichu.
 */

const raw = fixture as unknown as Record<string, unknown>;
const pending = raw.pending === true || !Array.isArray(raw.picks);
const session: Session | null = pending ? null : sanitizeSession(raw);

describe('FP0-02 · sesja użytkowniczki jako bramka kandydata', () => {
  it.skipIf(pending)('snapshot sesji jest kompletny: ranking, karty i co najmniej jeden wybór', () => {
    expect(session).not.toBeNull();
    expect(session!.ranking).not.toBeNull();
    expect(session!.ranking!.cards.length).toBeGreaterThan(0);
    expect(session!.picks.length).toBeGreaterThan(0);
  });

  it.skipIf(pending)('aktualny algorytm odtwarza top 3 ze snapshotu (ta sama kolejność kart)', () => {
    const snapshot = session!.ranking!;
    const result = rank({
      phones: PHONES,
      weights: snapshot.weights,
      groupImportance: snapshot.groupImportance,
      filters: snapshot.filters,
    });
    const now = result.cards.map((card) => card.phoneId);
    /* `gateReference` = świadomie zaakceptowany stan po zmianie puli (18.11.2026); bez niego — oryginalny snapshot. */
    const reference = (raw.gateReference as { cards?: string[] } | undefined)?.cards;
    const before = reference ?? snapshot.cards;
    /* Zmiana top 3 = świadoma decyzja opisana w planning/E12-zmiany-rankingu.md, nie cicha podmiana. */
    expect(now, `snapshot: ${before.join(' › ')} · teraz: ${now.join(' › ')}`).toEqual(before);
  });

  it.skipIf(pending)('wybrany przez użytkowniczkę telefon nadal jest w puli i poniżej limitu 2000 zł', () => {
    for (const pick of session!.picks) {
      const phone = PHONES.find((item) => item.id === pick.phoneId);
      expect(phone, pick.phoneId).toBeTruthy();
      expect(phone!.price.pln).toBeLessThanOrEqual(2000);
    }
  });

  it('placeholder jest jawny: bez sesji testy bramki są pomijane, nie zielone', () => {
    if (pending) {
      expect(typeof raw.howTo).toBe('string');
    } else {
      expect(session).not.toBeNull();
    }
  });
});
