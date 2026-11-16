import { DATA_VERSION, PHONES } from '@/data/phones';
import type { Filters, GroupId, GroupImportance, Phone, Weights } from '@/types';
import type {
  AppState,
  Mode,
  NoticeCode,
  RankingSnapshot,
  Session,
  SessionStatus,
  Theme,
} from '@/types/state';
import { createSession, nowIso, sortSessions, trimSessions } from './session';
import { rank } from './scoring';
import { deriveFromAnswers } from './weights';
import { MAX_SESSIONS } from './storage';

/**
 * Reducer stanu (E3-05, E3-06, E3-09) — czyste przejścia, bez `localStorage`
 * i bez Reacta. Zapis robi `StateProvider`, snapshot rankingu liczy `computeRanking`.
 */

export type Action =
  | { type: 'session/create'; mode: Mode; id?: string; now?: Date }
  | { type: 'session/activate'; sessionId: string | null }
  | { type: 'session/answer'; sessionId: string; questionId: string; optionId: string; now?: Date }
  | {
      type: 'session/top-three';
      sessionId: string;
      picks: [GroupId, GroupId, GroupId] | null;
      now?: Date;
    }
  | { type: 'session/filters'; sessionId: string; filters: Partial<Filters>; now?: Date }
  | {
      type: 'session/override-weights';
      sessionId: string;
      weights?: Partial<Weights>;
      groupImportance?: Partial<GroupImportance>;
      now?: Date;
    }
  | { type: 'session/compute-ranking'; sessionId: string; phones?: readonly Phone[]; now?: Date }
  | { type: 'session/pick'; sessionId: string; phoneId: string; now?: Date }
  | { type: 'session/status'; sessionId: string; status: SessionStatus; now?: Date }
  | { type: 'session/reset-progress'; sessionId: string; now?: Date }
  | { type: 'session/restore-computed'; sessionId: string; now?: Date }
  | { type: 'session/delete'; sessionId: string }
  | { type: 'theme/set'; theme: Theme }
  | { type: 'theme/toggle' }
  | { type: 'notice/dismiss'; code: NoticeCode }
  | { type: 'state/replace'; state: AppState }
  | { type: 'state/reset' };

/* ── Selektory ── */

export function selectSession(state: AppState, id: string | null | undefined): Session | null {
  if (!id) return null;
  return state.sessions.find((session) => session.id === id) ?? null;
}

export function selectActiveSession(state: AppState): Session | null {
  return selectSession(state, state.activeSessionId);
}

/** Najnowsza nieukończona sesja — do baneru „Wróć do rozpoczętego wyboru”. */
export function selectUnfinished(state: AppState): Session | null {
  return (
    sortSessions(state.sessions.filter((session) => session.status === 'in_progress'))[0] ?? null
  );
}

/* ── Snapshot rankingu (E3-06) ── */

export function computeRankingSnapshot(
  session: Session,
  phones: readonly Phone[] = PHONES,
  now: Date = new Date(),
): RankingSnapshot {
  const result = rank({
    phones,
    weights: session.weights,
    groupImportance: session.groupImportance,
    filters: session.filters,
  });

  return {
    computedAt: nowIso(now),
    dataVersion: DATA_VERSION,
    poolSize: result.poolSize,
    inBudgetCount: result.inBudgetCount,
    bestScore: result.bestScore,
    weights: session.weights,
    groupImportance: session.groupImportance,
    filters: session.filters,
    entries: result.ranked.map((entry) => ({
      phoneId: entry.phoneId,
      place: entry.place,
      score: entry.score,
      matchPercent: entry.matchPercent,
      inBudget: entry.inBudget,
      overBudgetBy: entry.overBudgetBy,
      practicalTieWith: entry.practicalTieWith,
    })),
    cards: result.cards.map((card) => card.phoneId),
  };
}

/* ── Pomocnicze przejścia ── */

function withSession(
  state: AppState,
  sessionId: string,
  update: (session: Session) => Session,
  now: Date,
): AppState {
  let touched = false;
  const sessions = state.sessions.map((session) => {
    if (session.id !== sessionId) return session;
    touched = true;
    return { ...update(session), updatedAt: nowIso(now) };
  });
  if (!touched) return state;

  const trimmed = trimSessions(sessions, MAX_SESSIONS);
  const notices: NoticeCode[] =
    trimmed.trimmed > 0 && !state.notices.includes('sessions-trimmed')
      ? [...state.notices, 'sessions-trimmed']
      : state.notices;

  return { ...state, sessions: trimmed.sessions, notices };
}

/** Wagi i ważności z odpowiedzi; ręczna korekta suwakami ma pierwszeństwo (QUIZ-SPEC 7). */
function recompute(session: Session, now: Date, phones: readonly Phone[] = PHONES): Session {
  if (session.manualOverride) {
    return { ...session, ranking: computeRankingSnapshot(session, phones, now) };
  }

  const derived = deriveFromAnswers(session.answers, session.topThree);
  const next: Session = {
    ...session,
    weights: derived.weights,
    groupImportance: derived.groupImportance,
    filters: { ...derived.filters, requireMicroSd: session.filters.requireMicroSd === true },
  };
  return { ...next, ranking: computeRankingSnapshot(next, phones, now) };
}

/* ── Reducer ── */

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'session/create': {
      const now = action.now ?? new Date();
      const session: Session = {
        ...createSession(action.mode, now, action.id),
        ranking: null,
      };
      const withRanking: Session = { ...session, ranking: computeRankingSnapshot(session, PHONES, now) };
      const trimmed = trimSessions([...state.sessions, withRanking], MAX_SESSIONS);

      return {
        ...state,
        sessions: trimmed.sessions,
        activeSessionId: withRanking.id,
        notices:
          trimmed.trimmed > 0 && !state.notices.includes('sessions-trimmed')
            ? [...state.notices, 'sessions-trimmed']
            : state.notices,
      };
    }

    case 'session/activate':
      return { ...state, activeSessionId: action.sessionId };

    case 'session/answer':
      return withSession(
        state,
        action.sessionId,
        (session) =>
          recompute(
            { ...session, answers: { ...session.answers, [action.questionId]: action.optionId } },
            action.now ?? new Date(),
          ),
        action.now ?? new Date(),
      );

    case 'session/top-three':
      return withSession(
        state,
        action.sessionId,
        (session) =>
          recompute(
            { ...session, topThree: action.picks ? { picks: action.picks } : null },
            action.now ?? new Date(),
          ),
        action.now ?? new Date(),
      );

    case 'session/filters':
      return withSession(
        state,
        action.sessionId,
        (session) => {
          const filters: Filters = { ...session.filters, ...action.filters };
          const next = { ...session, filters };
          return { ...next, ranking: computeRankingSnapshot(next, PHONES, action.now ?? new Date()) };
        },
        action.now ?? new Date(),
      );

    case 'session/override-weights':
      return withSession(
        state,
        action.sessionId,
        (session) => {
          const next: Session = {
            ...session,
            manualOverride: true,
            weights: { ...session.weights, ...(action.weights ?? {}) },
            groupImportance: { ...session.groupImportance, ...(action.groupImportance ?? {}) },
          };
          return { ...next, ranking: computeRankingSnapshot(next, PHONES, action.now ?? new Date()) };
        },
        action.now ?? new Date(),
      );

    case 'session/compute-ranking':
      return withSession(
        state,
        action.sessionId,
        (session) => ({
          ...session,
          ranking: computeRankingSnapshot(
            session,
            action.phones ?? PHONES,
            action.now ?? new Date(),
          ),
        }),
        action.now ?? new Date(),
      );

    case 'session/pick':
      return withSession(
        state,
        action.sessionId,
        (session) => {
          if (session.picks.some((pick) => pick.phoneId === action.phoneId)) {
            return { ...session, status: 'completed' };
          }
          return {
            ...session,
            status: 'completed',
            picks: [...session.picks, { phoneId: action.phoneId, at: nowIso(action.now ?? new Date()) }],
          };
        },
        action.now ?? new Date(),
      );

    case 'session/status':
      return withSession(
        state,
        action.sessionId,
        (session) => ({ ...session, status: action.status }),
        action.now ?? new Date(),
      );

    case 'session/reset-progress':
      return withSession(
        state,
        action.sessionId,
        (session) => recompute(createSession(session.mode, action.now ?? new Date(), session.id), action.now ?? new Date()),
        action.now ?? new Date(),
      );

    /* E5-07: „Przywróć wyliczone” — ręczna korekta znika, wagi wracają z odpowiedzi. */
    case 'session/restore-computed':
      return withSession(
        state,
        action.sessionId,
        (session) => {
          const restored: Session = { ...session, manualOverride: false };
          return recompute(restored, action.now ?? new Date());
        },
        action.now ?? new Date(),
      );

    case 'session/delete': {
      const sessions = state.sessions.filter((session) => session.id !== action.sessionId);
      return {
        ...state,
        sessions,
        activeSessionId:
          state.activeSessionId === action.sessionId ? null : state.activeSessionId,
      };
    }

    case 'theme/set':
      return { ...state, theme: action.theme };

    case 'theme/toggle':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'notice/dismiss':
      return { ...state, notices: state.notices.filter((code) => code !== action.code) };

    /* Synchronizacja kart: ostatni zapis wygrywa, komunikaty zostają lokalne (E3-08). */
    case 'state/replace':
      return { ...action.state, notices: state.notices };

    case 'state/reset':
      return { ...state, sessions: [], activeSessionId: null, notices: [] };

    default:
      return state;
  }
}
