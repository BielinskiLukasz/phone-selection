import { describe, expect, it } from 'vitest';
import { PHONES } from '../src/data/phones';
import { GROUPS } from '../src/data/criteria';
import { reducer } from '../src/lib/sessionReducer';
import { deriveFromAnswers, answersToCriterionWeights, groupImportance } from '../src/lib/weights';
import { rank } from '../src/lib/scoring';
import { emptyState } from '../src/lib/storage';
import {
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  computedCriterionWeights,
  computedFromAnswers,
  computedGroupImportance,
  formatSliderValue,
  groupSliderState,
  isGroupModified,
  modifiedGroups,
  neutralSliderValues,
  sliderAriaValueText,
  sliderLabel,
  sliderValueText,
  toSliderValue,
} from '../src/features/sliders/sliderModel';
import { WIFE } from './personas';
import { CRITERION_IDS } from '../src/data/criteria';
import type { Session } from '../src/types/state';

const NOW = new Date('2026-11-16T12:00:00.000Z');

function sessionWith(mode: 'quiz' | 'sliders' | 'hybrid', id = 's-1'): Session {
  const state = reducer(emptyState(), { type: 'session/create', mode, id, now: NOW });
  const session = state.sessions.find((item) => item.id === id);
  if (!session) throw new Error('Brak sesji.');
  return session;
}

describe('E5-01 · etykiety i format suwaka', () => {
  it('skala 0-5 z krokiem 0,1 (wartości wyliczone bywają ułamkowe)', () => {
    expect(SLIDER_MIN).toBe(0);
    expect(SLIDER_MAX).toBe(5);
    expect(SLIDER_STEP).toBe(0.1);
    expect(toSliderValue(1.3)).toBe(1.3);
    expect(toSliderValue(2.5)).toBe(2.5);
    expect(toSliderValue(9)).toBe(5);
    expect(toSliderValue(-2)).toBe(0);
    expect(toSliderValue(null)).toBe(2);
  });

  it('etykieta słowna i format „3 z 5, ważne” (UI-SPEC 3.3)', () => {
    expect(sliderLabel(0)).toBe('ignoruj');
    expect(sliderLabel(1.3)).toBe('mało ważne');
    expect(sliderLabel(2)).toBe('neutralnie');
    expect(sliderLabel(3)).toBe('ważne');
    expect(sliderLabel(4)).toBe('bardzo ważne');
    expect(sliderLabel(5)).toBe('kluczowe');

    expect(sliderValueText(3)).toBe('3 z 5, ważne');
    expect(sliderValueText(1.3)).toBe('1,3 z 5, mało ważne');
    expect(sliderAriaValueText(5)).toBe('5 z 5, kluczowe');
    expect(formatSliderValue(2.5)).toBe('2,5');
  });

  it('start neutralny: grupy 2 i kryteria 2 (QUIZ-SPEC 6)', () => {
    const neutral = neutralSliderValues();
    for (const group of GROUPS) expect(neutral.groups[group.id]).toBe(2);
    for (const id of CRITERION_IDS) expect(neutral.weights[id]).toBe(2);

    /* Tryb suwaków startuje na skali suwaka (QUIZ-SPEC 6), quiz/hybryda z wzoru 1,3. */
    for (const state of groupSliderState(sessionWith('sliders'))) {
      expect(state.value).toBe(2);
      for (const criterion of state.criteria) expect(criterion.value).toBe(2);
    }
    for (const state of groupSliderState(sessionWith('hybrid'))) {
      expect(state.value).toBeCloseTo(1.3, 1);
      expect(state.computed).toBeCloseTo(1.3, 5);
    }
  });
});

describe('E5-01/E5-02 · stan suwaków z sesji', () => {
  it('suwak grupy pokazuje G_g, a suwaki kryteriów wagi i udziały', () => {
    const session = sessionWith('sliders');
    const states = groupSliderState(session);

    expect(states.length).toBe(6);
    expect(states.map((state) => state.id)).toEqual(GROUPS.map((group) => group.id));

    const camera = states.find((state) => state.id === 'camera')!;
    expect(camera.criteria.length).toBe(6);
    for (const criterion of camera.criteria) {
      expect(criterion.share).toBeCloseTo(1 / 6, 5); // równe wagi → równe udziały
      expect(criterion.ariaValueText).toContain('z 5');
    }
  });

  it('ręczna zmiana jest widoczna jako różnica wobec wartości wyliczonej', () => {
    const session = sessionWith('hybrid');
    expect(modifiedGroups(session)).toEqual([]);

    const changed = reducer(emptyState(), { type: 'state/replace', state: { ...emptyState(), sessions: [session] } });
    const modified = reducer(changed, {
      type: 'session/override-weights',
      sessionId: session.id,
      groupImportance: { battery: 5 },
      now: NOW,
    });
    const updated = modified.sessions[0]!;

    expect(updated.manualOverride).toBe(true);
    expect(isGroupModified(updated, 'battery')).toBe(true);
    expect(isGroupModified(updated, 'camera')).toBe(false);
    expect(modifiedGroups(updated)).toEqual(['battery']);
  });

  it('punkt odniesienia liczy się z odpowiedzi, nie ze snapshotu z ręcznymi wagami', () => {
    let session = sessionWith('hybrid');
    for (const [questionId, optionId] of Object.entries(WIFE.answers)) {
      session = reducer({ ...emptyState(), sessions: [session], activeSessionId: session.id, schemaVersion: 1, theme: 'light', notices: [] }, {
        type: 'session/answer',
        sessionId: session.id,
        questionId,
        optionId,
        now: NOW,
      }).sessions[0]!;
    }

    session = reducer(
      { ...emptyState(), sessions: [session], activeSessionId: session.id, schemaVersion: 1, theme: 'light', notices: [] },
      { type: 'session/top-three', sessionId: session.id, picks: WIFE.topThree!.picks, now: NOW },
    ).sessions[0]!;

    const before = computedGroupImportance(session);
    expect(before.camera).toBeCloseTo(4.24, 2); // G1: aparat na drugim miejscu + korekta z odpowiedzi
    const overridden = reducer(
      { ...emptyState(), sessions: [session], activeSessionId: session.id, schemaVersion: 1, theme: 'light', notices: [] },
      {
        type: 'session/override-weights',
        sessionId: session.id,
        groupImportance: { battery: 0 },
        now: NOW,
      },
    ).sessions[0]!;

    expect(overridden.groupImportance.battery).toBe(0);
    expect(computedGroupImportance(overridden).battery).toBeCloseTo(before.battery, 5);
    expect(computedFromAnswers(overridden).groupImportance.camera).toBeCloseTo(4.24, 2);
    /* Waga kryterium battery u „żony” to 3 (A1 i A2 po 3) — ważność grupy 5 daje dopiero G1. */
    expect(computedCriterionWeights(overridden).battery).toBe(3);
  });
});

describe('E5-05/E5-08 · spójność z silnikiem (test akceptacyjny 1)', () => {
  it('suwaki „bateria 5, reszta 0” dają ranking identyczny z wyliczeniem silnika', () => {
    let session = sessionWith('sliders');
    const state = { ...emptyState(), sessions: [session], activeSessionId: session.id, schemaVersion: 1, theme: 'light' as const, notices: [] as never[] };

    const importance = { ...groupImportance(answersToCriterionWeights({}), null) };
    for (const group of GROUPS) importance[group.id] = group.id === 'battery' ? 5 : 0;

    session = reducer(state, {
      type: 'session/override-weights',
      sessionId: session.id,
      groupImportance: importance,
      now: NOW,
    }).sessions[0]!;

    const expected = rank({
      phones: PHONES,
      weights: session.weights,
      groupImportance: session.groupImportance,
      filters: session.filters,
    });

    expect(session.ranking).not.toBeNull();
    expect(session.ranking!.cards).toEqual(expected.cards.map((card) => card.phoneId));
    expect(session.ranking!.entries.map((entry) => entry.score)).toEqual(
      expected.ranked.map((entry) => entry.score),
    );
    /* Bateria 5 i reszta 0 → wygrywa najmocniejsza bateria w puli (Realme 96, Edge 70 Fusion 90). */
    expect(session.ranking!.cards[0]).toBe('realme-16-pro-plus-5g-8-256');
    expect(session.ranking!.cards[1]).toBe('motorola-edge-70-fusion-12-256');
  });
});

describe('DoD · trzy tryby kończą się tym samym kształtem sesji (test akceptacyjny 5)', () => {
  function finish(mode: 'quiz' | 'sliders' | 'hybrid'): Session {
    const id = `tryb-${mode}`;
    const created = reducer(emptyState(), { type: 'session/create', mode, id, now: NOW });

    if (mode === 'quiz') {
      let state = created;
      for (const [questionId, optionId] of Object.entries(WIFE.answers)) {
        state = reducer(state, { type: 'session/answer', sessionId: id, questionId, optionId, now: NOW });
      }
      state = reducer(state, {
        type: 'session/top-three',
        sessionId: id,
        picks: WIFE.topThree!.picks,
        now: NOW,
      });
      return reducer(state, { type: 'session/status', sessionId: id, status: 'completed', now: NOW })
        .sessions[0]!;
    }

    if (mode === 'sliders') {
      const target = deriveFromAnswers(WIFE.answers, WIFE.topThree);
      let state = reducer(created, {
        type: 'session/override-weights',
        sessionId: id,
        weights: target.weights,
        groupImportance: target.groupImportance,
        now: NOW,
      });
      state = reducer(state, {
        type: 'session/filters',
        sessionId: id,
        filters: target.filters,
        now: NOW,
      });
      return reducer(state, { type: 'session/status', sessionId: id, status: 'completed', now: NOW })
        .sessions[0]!;
    }

    /* Hybryda: krótki quiz, potem dostrojenie do tych samych wartości. */
    const shortAnswers: Record<string, string> = {
      A1: WIFE.answers.A1!,
      A2: WIFE.answers.A2!,
      B1: WIFE.answers.B1!,
      B2: WIFE.answers.B2!,
      B3: WIFE.answers.B3!,
      C1: WIFE.answers.C1!,
      F1: WIFE.answers.F1!,
    };
    let state = created;
    for (const [questionId, optionId] of Object.entries(shortAnswers)) {
      state = reducer(state, { type: 'session/answer', sessionId: id, questionId, optionId, now: NOW });
    }
    state = reducer(state, {
      type: 'session/top-three',
      sessionId: id,
      picks: WIFE.topThree!.picks,
      now: NOW,
    });
    const target = deriveFromAnswers(WIFE.answers, WIFE.topThree);
    state = reducer(state, {
      type: 'session/override-weights',
      sessionId: id,
      weights: target.weights,
      groupImportance: target.groupImportance,
      now: NOW,
    });
    state = reducer(state, { type: 'session/filters', sessionId: id, filters: target.filters, now: NOW });
    return reducer(state, { type: 'session/status', sessionId: id, status: 'completed', now: NOW })
      .sessions[0]!;
  }

  it('weights, groupImportance, filters i ranking mają ten sam kształt i te same wartości', () => {
    const quiz = finish('quiz');
    const sliders = finish('sliders');
    const hybrid = finish('hybrid');

    for (const session of [quiz, sliders, hybrid]) {
      expect(Object.keys(session.weights).sort()).toEqual([...CRITERION_IDS].sort());
      expect(Object.keys(session.groupImportance).sort()).toEqual(GROUPS.map((g) => g.id).sort());
      expect(session.filters.budgetMax).toBe(2000);
      expect(session.status).toBe('completed');
      expect(session.ranking).not.toBeNull();
      expect(session.ranking!.entries.length).toBe(PHONES.length);
      expect(session.ranking!.cards.length).toBe(3);
      expect(session.ranking!.dataVersion).toBe('2026-11-14');
    }

    expect(sliders.groupImportance).toEqual(quiz.groupImportance);
    expect(sliders.weights).toEqual(quiz.weights);
    expect(sliders.filters).toEqual(quiz.filters);
    expect(hybrid.groupImportance).toEqual(quiz.groupImportance);
    expect(hybrid.ranking!.cards).toEqual(quiz.ranking!.cards);
    expect(hybrid.ranking!.entries.map((entry) => entry.matchPercent)).toEqual(
      quiz.ranking!.entries.map((entry) => entry.matchPercent),
    );

    /* Tryb suwaków i hybryda oznaczają ręczne wartości, quiz nie. */
    expect(quiz.manualOverride).toBe(false);
    expect(sliders.manualOverride).toBe(true);
    expect(hybrid.manualOverride).toBe(true);
  });
});
