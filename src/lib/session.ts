import { CRITERION_IDS, GROUP_IDS } from '@/data/criteria';
import { PHONES } from '@/data/phones';
import { activeQuestions, isSkipAnswer } from '@/data/questions';
import type { Filters, GroupImportance, Weights } from '@/types';
import type { Mode, Session } from '@/types/state';
import { DEFAULT_BUDGET, DEFAULT_WEIGHT, GROUP_BASE, GROUP_FACTOR } from './scoringConfig';

/** Fabryki i pomocniki sesji (E3-01/E3-09) — współdzielone przez magazyn i reducer. */

export function neutralWeights(): Weights {
  const weights = {} as Weights;
  for (const id of CRITERION_IDS) weights[id] = DEFAULT_WEIGHT;
  return weights;
}

/** Grupa bez odpowiedzi: 0,5 + 0,4 × 2 = 1,3 (QUIZ-SPEC 2.2). */
export function neutralGroupImportance(): GroupImportance {
  const importance = {} as GroupImportance;
  for (const id of GROUP_IDS) importance[id] = GROUP_BASE + GROUP_FACTOR * DEFAULT_WEIGHT;
  return importance;
}

/** Tryb suwaków: ważności grup startują na 2 (QUIZ-SPEC 6 — „grupy 2, kryteria 2”). */
export function flatGroupImportance(value: number = DEFAULT_WEIGHT): GroupImportance {
  const importance = {} as GroupImportance;
  for (const id of GROUP_IDS) importance[id] = value;
  return importance;
}

export function defaultFilters(): Filters {
  return { budgetMax: DEFAULT_BUDGET, minStorageGb: null, requireMicroSd: false };
}

/** `crypto.randomUUID()` z awaryjnym generatorem (ETAP-3, „Ryzyka”). */
export function newSessionId(random: () => number = Math.random): string {
  const cryptoRef = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
    return cryptoRef.randomUUID().replace(/-/g, '').slice(0, 12);
  }
  const stamp = Date.now().toString(36);
  const dice = () => Math.floor(random() * 36).toString(36);
  return `${stamp}-${dice()}${dice()}${dice()}${dice()}`;
}

export function nowIso(now: Date = new Date()): string {
  return now.toISOString();
}

export function createSession(mode: Mode, now: Date = new Date(), id?: string): Session {
  const stamp = nowIso(now);
  return {
    id: id ?? newSessionId(),
    createdAt: stamp,
    updatedAt: stamp,
    mode,
    status: 'in_progress',
    answers: {},
    topThree: null,
    weights: neutralWeights(),
    /* Suwaki ustawiają G_g wprost, więc start jest na skali suwaka (2), nie z wzoru (1,3). */
    groupImportance: mode === 'sliders' ? flatGroupImportance() : neutralGroupImportance(),
    filters: defaultFilters(),
    ranking: null,
    picks: [],
    manualOverride: false,
  };
}

/** Postęp quizu do baneru „Wróć do rozpoczętego wyboru (pytanie 7 z 17)”. */
export function quizProgress(session: Session): { answered: number; total: number } {
  const total = activeQuestions(PHONES).length;
  const answered = Object.keys(session.answers).filter(
    (questionId) => !isSkipAnswer(session.answers, questionId),
  ).length;
  return { answered, total };
}

export function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.createdAt === 'string' &&
    (candidate.mode === 'quiz' || candidate.mode === 'sliders' || candidate.mode === 'hybrid') &&
    (candidate.status === 'in_progress' || candidate.status === 'completed') &&
    Array.isArray(candidate.picks)
  );
}

/**
 * Rekord, który da się naprawić: wystarczy identyfikator i znany tryb.
 * Resztę (daty, status, wagi, filtry) uzupełnia `sanitizeSession`.
 */
export function isSessionLike(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    (candidate.mode === 'quiz' || candidate.mode === 'sliders' || candidate.mode === 'hybrid')
  );
}

/**
 * Uzupełnia braki w zapisanym rekordzie wartościami neutralnymi — uszkodzony albo
 * niekompletny wpis nie może wywrócić aplikacji (UI-SPEC 10).
 */
export function sanitizeSession(value: unknown): Session | null {
  if (!isSessionLike(value)) return null;
  const record = value as Partial<Session>;
  const base = createSession(record.mode ?? 'quiz');

  return {
    ...base,
    ...record,
    id: record.id as string,
    mode: record.mode ?? base.mode,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : base.createdAt,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : base.updatedAt,
    status: record.status === 'completed' ? 'completed' : 'in_progress',
    answers: record.answers && typeof record.answers === 'object' ? record.answers : {},
    weights: { ...base.weights, ...(record.weights ?? {}) },
    groupImportance: { ...base.groupImportance, ...(record.groupImportance ?? {}) },
    filters: { ...base.filters, ...(record.filters ?? {}) },
    picks: (record.picks ?? []).filter(
      (pick): pick is { phoneId: string; at: string } =>
        typeof pick === 'object' && pick !== null && typeof pick.phoneId === 'string',
    ),
    ranking: record.ranking ?? null,
    topThree: record.topThree ?? null,
    manualOverride: record.manualOverride === true,
  };
}

/** Sesje od najnowszej; limit `max` najnowszych (E3-09). */
export function sortSessions(sessions: readonly Session[]): Session[] {
  return [...sessions].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function trimSessions(
  sessions: readonly Session[],
  max: number,
): { sessions: Session[]; trimmed: number } {
  const sorted = sortSessions(sessions);
  if (sorted.length <= max) return { sessions: sorted, trimmed: 0 };
  return { sessions: sorted.slice(0, max), trimmed: sorted.length - max };
}
