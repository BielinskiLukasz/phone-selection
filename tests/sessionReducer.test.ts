import { describe, expect, it } from 'vitest';
import {
  computeRankingSnapshot,
  reducer,
  selectSession,
  selectUnfinished,
} from '../src/lib/sessionReducer';
import {
  BACKUP_KEY,
  MAX_SESSIONS,
  emptyState,
  loadState,
  memoryStorage,
  saveState,
} from '../src/lib/storage';
import {
  createSession,
  defaultFilters,
  isSession,
  isSessionLike,
  neutralGroupImportance,
  neutralWeights,
  newSessionId,
  quizProgress,
  sanitizeSession,
  sortSessions,
} from '../src/lib/session';
import { clearAll, readBackup } from '../src/lib/storage';
import { revealInfo } from '../src/features/sessions/useReveal';
import { PHONES } from '../src/data/phones';
import { DEFAULT_BUDGET } from '../src/lib/scoringConfig';
import type { AppState } from '../src/types/state';
import type { Phone } from '../src/types';

const NOW = new Date('2026-11-15T10:00:00.000Z');
const LATER = new Date('2026-11-15T10:05:00.000Z');

function withSession(state: AppState = emptyState(), id = 's-1'): AppState {
  return reducer(state, { type: 'session/create', mode: 'quiz', id, now: NOW });
}

function sessionOf(state: AppState, id = 's-1') {
  const session = selectSession(state, id);
  if (!session) throw new Error('Brak sesji w stanie.');
  return session;
}

describe('E3-05 · reducer: utworzenie sesji', () => {
  it('nowa sesja ma wagi neutralne, filtry domyślne i snapshot rankingu', () => {
    const state = withSession();
    const session = sessionOf(state);

    expect(state.sessions.length).toBe(1);
    expect(state.activeSessionId).toBe('s-1');
    expect(session.mode).toBe('quiz');
    expect(session.status).toBe('in_progress');
    expect(session.weights.battery).toBe(2);
    expect(session.groupImportance.battery).toBeCloseTo(1.3, 5);
    expect(session.filters.budgetMax).toBe(DEFAULT_BUDGET);
    expect(session.picks).toEqual([]);

    expect(session.ranking).not.toBeNull();
    expect(session.ranking!.cards.length).toBe(3);
    expect(session.ranking!.poolSize).toBe(PHONES.length);
  });

  it('E3-06 · snapshot zapisuje wersję danych, wagi i ważności grup', () => {
    const snapshot = sessionOf(withSession()).ranking!;
    /* Etap 10: `_meta.generatedOn` = 16.11.2026 (nowe rekordy i przeliczone oceny baterii). */
    expect(snapshot.dataVersion).toBe('2026-11-16');
    expect(snapshot.weights.battery).toBe(2);
    expect(snapshot.groupImportance.camera).toBeCloseTo(1.3, 5);
    expect(snapshot.entries.length).toBe(PHONES.length);
    expect(snapshot.entries[0]!.place).toBe(1);
    expect(typeof snapshot.computedAt).toBe('string');
  });

  it('akcja dla nieistniejącej sesji nie zmienia stanu', () => {
    const state = withSession();
    expect(reducer(state, { type: 'session/answer', sessionId: 'nie-ma', questionId: 'A1', optionId: 'A1-a' })).toBe(
      state,
    );
  });
});

describe('E3-05 · reducer: odpowiedzi, trójka, filtry, korekta ręczna', () => {
  it('1. odpowiedź zmienia wagi, snapshot i znacznik zapisu', () => {
    const state = reducer(withSession(), {
      type: 'session/answer',
      sessionId: 's-1',
      questionId: 'A2',
      optionId: 'A2-c',
      now: LATER,
    });
    const session = sessionOf(state);

    expect(session.answers).toEqual({ A2: 'A2-c' });
    expect(session.weights.battery).toBe(5);
    // grupa bez trójki: 0,5 + 0,4 × średnia ODPOWIEDZIANYCH kryteriów (tylko battery 5)
    expect(session.groupImportance.battery).toBeCloseTo(2.5, 5);
    expect(session.groupImportance.camera).toBeCloseTo(1.3, 5);
    expect(session.updatedAt).toBe(LATER.toISOString());
    expect(session.ranking!.computedAt).toBe(LATER.toISOString());
  });

  it('1. dwie odpowiedzi przeżywają „odświeżenie strony” (zapis i odczyt)', () => {
    const storage = memoryStorage();
    let state = withSession();
    state = reducer(state, { type: 'session/answer', sessionId: 's-1', questionId: 'A1', optionId: 'A1-b', now: LATER });
    state = reducer(state, { type: 'session/answer', sessionId: 's-1', questionId: 'B1', optionId: 'B1-c', now: LATER });
    expect(saveState(state, storage).ok).toBe(true);

    const reloaded = loadState(storage).state;
    const session = sessionOf(reloaded);
    expect(session.answers).toEqual({ A1: 'A1-b', B1: 'B1-c' });
    expect(session.weights.photoIndoor).toBe(5);
    expect(session.ranking!.cards.length).toBe(3);
  });

  it('krok G1 ustawia ważności 5/4/3', () => {
    const state = reducer(withSession(), {
      type: 'session/top-three',
      sessionId: 's-1',
      picks: ['battery', 'camera', 'storage'],
      now: LATER,
    });
    const session = sessionOf(state);
    expect(session.topThree?.picks).toEqual(['battery', 'camera', 'storage']);
    expect(session.groupImportance.battery).toBe(5);
    expect(session.groupImportance.camera).toBe(4);
    expect(session.groupImportance.storage).toBe(3);
  });

  it('4. filtr budżetu 1500 zł zmienia snapshot: od etapu 10 trzy karty w budżecie, żadna powyżej (D6)', () => {
    const state = reducer(withSession(), {
      type: 'session/filters',
      sessionId: 's-1',
      filters: { budgetMax: 1500 },
      now: LATER,
    });
    const snapshot = sessionOf(state).ranking!;
    expect(snapshot.filters.budgetMax).toBe(1500);
    expect(snapshot.inBudgetCount).toBe(3);

    const over = snapshot.entries.filter(
      (entry) => snapshot.cards.includes(entry.phoneId) && entry.overBudgetBy !== null,
    );
    /* Do etapu 9 w budżecie były dwa telefony i trzecią kartę dokładał najlepszy z puli (15T, +499 zł). */
    expect(over.length).toBe(0);
    for (const id of snapshot.cards) {
      expect(snapshot.entries.find((entry) => entry.phoneId === id)!.overBudgetBy).toBeNull();
    }
  });

  it('filtr pamięci 256 GB usuwa telefony 128 GB ze snapshotu', () => {
    const state = reducer(withSession(), {
      type: 'session/filters',
      sessionId: 's-1',
      filters: { minStorageGb: 256 },
      now: LATER,
    });
    const snapshot = sessionOf(state).ranking!;
    expect(snapshot.poolSize).toBe(PHONES.length - 2);
    expect(snapshot.entries.map((entry) => entry.phoneId)).not.toContain('pixel-10a-8-128');
  });

  it('ręczna korekta wag ma pierwszeństwo przed kolejną odpowiedzią (QUIZ-SPEC 7)', () => {
    let state = reducer(withSession(), {
      type: 'session/override-weights',
      sessionId: 's-1',
      weights: { battery: 5 },
      groupImportance: { battery: 4 },
      now: LATER,
    });
    expect(sessionOf(state).manualOverride).toBe(true);
    expect(sessionOf(state).groupImportance.battery).toBe(4);

    state = reducer(state, {
      type: 'session/answer',
      sessionId: 's-1',
      questionId: 'B3',
      optionId: 'B3-c',
      now: LATER,
    });
    expect(sessionOf(state).answers.B3).toBe('B3-c');
    expect(sessionOf(state).groupImportance.battery).toBe(4);
    expect(sessionOf(state).weights.battery).toBe(5);
  });

  it('„Wyczyść odpowiedzi” wraca do stanu neutralnego w tej samej sesji', () => {
    let state = reducer(withSession(), {
      type: 'session/answer',
      sessionId: 's-1',
      questionId: 'A1',
      optionId: 'A1-d',
      now: LATER,
    });
    state = reducer(state, { type: 'session/reset-progress', sessionId: 's-1', now: LATER });
    const session = sessionOf(state);
    expect(session.id).toBe('s-1');
    expect(session.answers).toEqual({});
    expect(session.weights.battery).toBe(2);
    expect(session.ranking).not.toBeNull();
  });
});

describe('E3-10 · wybory i odsłanianie', () => {
  it('5. dwa wybory dają plakietki 1/2 i 2/2 w kolejności dodania', () => {
    const created = withSession();
    const cards = sessionOf(created).ranking!.cards;

    let state = reducer(created, {
      type: 'session/pick',
      sessionId: 's-1',
      phoneId: cards[0]!,
      now: LATER,
    });
    state = reducer(state, { type: 'session/pick', sessionId: 's-1', phoneId: cards[1]!, now: LATER });

    const session = sessionOf(state);
    expect(session.status).toBe('completed');
    expect(session.picks.map((pick) => pick.phoneId)).toEqual([cards[0], cards[1]]);

    const reveal = revealInfo(session);
    expect(reveal.total).toBe(2);
    expect(reveal.labelFor(cards[0]!)).toBe('1/2');
    expect(reveal.labelFor(cards[1]!)).toBe('2/2');
    expect(reveal.labelFor(cards[2]!)).toBeNull();
    expect(reveal.isRevealed(cards[0]!)).toBe(true);
  });

  it('ten sam telefon nie trafia na listę wyborów dwa razy', () => {
    const created = withSession();
    const first = sessionOf(created).ranking!.cards[0]!;
    let state = reducer(created, { type: 'session/pick', sessionId: 's-1', phoneId: first, now: LATER });
    state = reducer(state, { type: 'session/pick', sessionId: 's-1', phoneId: first, now: LATER });
    expect(sessionOf(state).picks.length).toBe(1);
  });

  it('brak wyborów → pusty obiekt odsłonięć', () => {
    const reveal = revealInfo(sessionOf(withSession()));
    expect(reveal.total).toBe(0);
    expect(reveal.revealedIds).toEqual([]);
    expect(revealInfo(null).labelFor('x')).toBeNull();
  });
});

describe('E3-06 · stabilność snapshotu', () => {
  it('6. zmiana danych telefonów nie zmienia zapisanego snapshotu', () => {
    const created = withSession();
    const before = sessionOf(created).ranking!;
    const frozenCopy = JSON.parse(JSON.stringify(before));

    const modified: Phone[] = PHONES.map((phone) => ({
      ...phone,
      price: { ...phone.price, pln: phone.price.pln - 300 },
      scores: { ...phone.scores, battery: 99 },
    }));

    const after = reducer(created, {
      type: 'session/compute-ranking',
      sessionId: 's-1',
      phones: modified,
      now: LATER,
    });

    expect(frozenCopy).toEqual(before); // stary obiekt nietknięty
    expect(sessionOf(after).ranking!.computedAt).toBe(LATER.toISOString());
    expect(sessionOf(after).ranking!.entries[0]!.score).not.toBe(before.entries[0]!.score);
  });

  it('snapshot liczony poza reducerem daje ten sam wynik', () => {
    const session = createSession('sliders', NOW, 's-2');
    expect(computeRankingSnapshot(session, PHONES, NOW).computedAt).toBe(NOW.toISOString());
  });
});

describe('E3-05 · porządkowanie, motyw i synchronizacja', () => {
  it('usuwanie sesji czyści aktywną i pozostawia resztę', () => {
    let state = withSession(emptyState(), 's-1');
    state = reducer(state, { type: 'session/create', mode: 'sliders', id: 's-2', now: LATER });
    expect(state.sessions.length).toBe(2);

    state = reducer(state, { type: 'session/delete', sessionId: 's-2' });
    expect(state.sessions.map((session) => session.id)).toEqual(['s-1']);
    expect(state.activeSessionId).toBeNull();
  });

  it(`limit ${MAX_SESSIONS} sesji: najstarsze przycięte z komunikatem`, () => {
    let state = emptyState();
    for (let index = 0; index < MAX_SESSIONS + 5; index += 1) {
      state = reducer(state, {
        type: 'session/create',
        mode: 'quiz',
        id: `s-${index}`,
        now: new Date(2026, 10, 15, 12, index),
      });
    }
    expect(state.sessions.length).toBe(MAX_SESSIONS);
    expect(state.notices).toContain('sessions-trimmed');
    expect(state.sessions.some((session) => session.id === `s-${MAX_SESSIONS + 4}`)).toBe(true);
    expect(state.sessions.some((session) => session.id === 's-0')).toBe(false);
  });

  it('motyw przełącza się i zapisuje w stanie', () => {
    let state = reducer(emptyState(), { type: 'theme/toggle' });
    expect(state.theme).toBe('dark');
    state = reducer(state, { type: 'theme/set', theme: 'light' });
    expect(state.theme).toBe('light');
  });

  it('E3-08 · stan z innej karty wygrywa, komunikaty zostają lokalne', () => {
    const local: AppState = { ...emptyState(), notices: ['quota-exceeded'] };
    const remote = withSession(emptyState(), 'z-innej-karty');
    const merged = reducer(local, { type: 'state/replace', state: remote });

    expect(merged.sessions.map((session) => session.id)).toEqual(['z-innej-karty']);
    expect(merged.notices).toEqual(['quota-exceeded']);
  });

  it('komunikat można zamknąć, a stan wyzerować', () => {
    let state: AppState = { ...emptyState(), notices: ['corrupted-data'] };
    state = reducer(state, { type: 'notice/dismiss', code: 'corrupted-data' });
    expect(state.notices).toEqual([]);

    state = withSession(state, 's-9');
    state = reducer(state, { type: 'state/reset' });
    expect(state.sessions).toEqual([]);
    expect(state.activeSessionId).toBeNull();
  });

  it('selektor nieukończonej sesji zwraca najnowszą', () => {
    let state = withSession(emptyState(), 'starsza');
    state = reducer(state, {
      type: 'session/create',
      mode: 'hybrid',
      id: 'nowsza',
      now: LATER,
    });
    expect(selectUnfinished(state)?.id).toBe('nowsza');

    state = reducer(state, { type: 'session/status', sessionId: 'nowsza', status: 'completed', now: LATER });
    expect(selectUnfinished(state)?.id).toBe('starsza');
  });
});

describe('E3-01 · pomocniki sesji', () => {
  it('nowa sesja ma wartości neutralne i poprawny tryb', () => {
    const session = createSession('hybrid', NOW, 'id-1');
    expect(session.id).toBe('id-1');
    expect(session.mode).toBe('hybrid');
    expect(session.status).toBe('in_progress');
    expect(session.createdAt).toBe(NOW.toISOString());
    expect(neutralWeights().display).toBe(2);
    expect(neutralGroupImportance().camera).toBeCloseTo(1.3, 5);
    expect(defaultFilters()).toEqual({ budgetMax: 2000, minStorageGb: null, requireMicroSd: false });
  });

  it('identyfikatory sesji są unikalne i bezpieczne w adresie hashowym', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newSessionId()));
    expect(ids.size).toBe(200);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
      expect(id.includes('/')).toBe(false);
    }
    expect(newSessionId(() => 0.5)).toMatch(/^[a-z0-9-]+$/);
  });

  it('postęp quizu liczy odpowiedzi bez „pomiń” (18 pytań, w tym warunkowe C3)', () => {
    const fresh = createSession('quiz', NOW, 'p-1');
    expect(quizProgress(fresh)).toEqual({ answered: 0, total: 18 });

    const answered: typeof fresh = {
      ...fresh,
      answers: { A1: 'A1-c', A2: 'A2-skip', B1: 'B1-a' },
    };
    expect(quizProgress(answered)).toEqual({ answered: 2, total: 18 });
  });

  it('sesje sortują się od najnowszej, a walidacja rozróżnia rekord pełny od naprawialnego', () => {
    const older = createSession('quiz', NOW, 'a');
    const newer = createSession('quiz', LATER, 'b');
    expect(sortSessions([older, newer]).map((session) => session.id)).toEqual(['b', 'a']);

    expect(isSession(older)).toBe(true);
    expect(isSession({ id: 'x', mode: 'quiz' })).toBe(false);
    expect(isSessionLike({ id: 'x', mode: 'quiz' })).toBe(true);
    expect(isSessionLike({ id: 'x', mode: 'coś' })).toBe(false);
    expect(sanitizeSession({ id: 'x', mode: 'sliders' })?.status).toBe('in_progress');
  });

  it('czyszczenie magazynu i odczyt kopii zapasowej są odporne na brak dostępu', () => {
    expect(readBackup(null)).toBeNull();
    expect(() => clearAll(null)).not.toThrow();

    const storage = memoryStorage();
    storage.setItem(BACKUP_KEY, 'kopia');
    clearAll(storage);
    expect(readBackup(storage)).toBeNull();
  });
});
