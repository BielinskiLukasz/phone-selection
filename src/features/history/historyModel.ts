import { PHONES, phoneById } from '@/data/phones';
import { SHORT_QUIZ_IDS } from '@/data/questions';
import { exclusionReason, formatExclusionsSummary } from '@/lib/exclusions';
import { quizProgress } from '@/lib/session';
import { MODE_LABEL } from '@/types/state';
import type { Session } from '@/types/state';

/**
 * Model listy historii (E7-01…E7-03, E11-10) — czysta logika.
 * Nazwy telefonów pokazujemy przy wyborach (już odsłoniętych, PROJECT 8) oraz przy
 * wykluczeniach świadomie ustawionych przez użytkowniczkę w danej sesji.
 */

export interface PickSummary {
  phoneId: string;
  name: string;
  brand: string;
  place: number | null;
  at: string;
  /** Telefon był wcześniej wybrany, a później wykluczony (ETAP-11, test akceptacyjny 8). */
  nowExcluded: boolean;
}

export interface SessionSummary {
  id: string;
  mode: Session['mode'];
  modeLabel: string;
  status: Session['status'];
  statusLabel: string;
  updatedLabel: string;
  updatedAbsolute: string;
  createdAbsolute: string;
  progress: { answered: number; total: number } | null;
  picks: PickSummary[];
  picksText: string | null;
  /** „Xiaomi, Pixel 9a 8/128 GB” ze snapshotu sesji albo `null` (E11-10). */
  exclusionsText: string | null;
  dataVersion: string | null;
  computedAt: string | null;
  bestMatchPercent: number | null;
  /** Ekran, na którym wznawiamy tę sesję (wznawianie nigdy nie wraca do `exclude`, E11-06). */
  resumeView: 'quiz' | 'sliders' | 'tune' | 'cards';
  canResume: boolean;
}

const DAY_MS = 86_400_000;

/** „dziś”, „wczoraj”, „3 dni temu”, a dalej pełna data. */
export function relativeDate(iso: string, now: Date = new Date()): string {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return '—';

  const startOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(new Date(time))) / DAY_MS);

  if (days <= 0) return `dziś ${new Date(time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
  if (days === 1) return 'wczoraj';
  if (days < 7) return `${days} dni temu`;
  if (days < 31) return `${Math.round(days / 7)} tyg. temu`;
  return new Date(time).toLocaleDateString('pl-PL');
}

export function absoluteDate(iso: string): string {
  const time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return '—';
  return new Date(time).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Ekran wznowienia: hybryda wraca do dostrojenia, gdy krótki quiz jest wypełniony.
 * Gdy krok wykluczeń ma status `done`, wznowienie nie wraca do `exclude` (E11-06).
 */
export function resumeViewFor(session: Session): 'quiz' | 'sliders' | 'tune' | 'cards' {
  /* FP5-04: propozycje policzone, ale bez wyboru → wracamy do trzech kart, nie do pytań. */
  if (session.status === 'awaiting_pick' && session.ranking) return 'cards';
  if (session.mode === 'sliders') return 'sliders';
  if (session.mode === 'quiz') return 'quiz';

  const answeredShort = SHORT_QUIZ_IDS.filter((id) => session.answers[id] !== undefined);
  return answeredShort.length === SHORT_QUIZ_IDS.length ? 'tune' : 'quiz';
}

export function summarizeSession(
  session: Session,
  statusLabels: { inProgress: string; completed: string; awaitingPick?: string },
): SessionSummary {
  const progress = session.mode === 'sliders' ? null : quizProgress(session);
  const snapshotFilters = session.ranking?.filters ?? session.filters;
  const picks: PickSummary[] = session.picks.map((pick) => {
    const phone = phoneById(pick.phoneId);
    const snapshotEntry = session.ranking?.entries.find((entry) => entry.phoneId === pick.phoneId);
    const place = snapshotEntry?.place ?? null;
    const excluded =
      snapshotEntry?.excluded ?? (phone ? exclusionReason(phone, snapshotFilters) : null);
    return {
      phoneId: pick.phoneId,
      name: phone?.reveal.name ?? pick.phoneId,
      brand: phone?.reveal.brand ?? '',
      place,
      at: pick.at,
      nowExcluded: excluded === 'brand' || excluded === 'model',
    };
  });

  const firstPick = picks[0];
  const firstEntry = firstPick
    ? session.ranking?.entries.find((entry) => entry.phoneId === firstPick.phoneId)
    : undefined;
  const exclusionsText = formatExclusionsSummary(PHONES, snapshotFilters);

  return {
    id: session.id,
    mode: session.mode,
    modeLabel: MODE_LABEL[session.mode],
    status: session.status,
    statusLabel:
      session.status === 'completed'
        ? statusLabels.completed
        : session.status === 'awaiting_pick'
          ? (statusLabels.awaitingPick ?? statusLabels.inProgress)
          : statusLabels.inProgress,
    updatedLabel: relativeDate(session.updatedAt),
    updatedAbsolute: absoluteDate(session.updatedAt),
    createdAbsolute: absoluteDate(session.createdAt),
    progress,
    picks,
    picksText:
      picks.length === 0
        ? null
        : picks.length === 1
          ? `${firstPick?.name ?? '—'}${firstPick?.place ? ` · miejsce ${firstPick.place}` : ''}`
          : `${picks.length} wybory: ${picks.map((pick) => pick.name).join(', ')}`,
    exclusionsText,
    dataVersion: session.ranking?.dataVersion ?? null,
    computedAt: session.ranking?.computedAt ?? null,
    bestMatchPercent: firstEntry?.matchPercent ?? null,
    resumeView: resumeViewFor(session),
    canResume: session.status !== 'completed',
  };
}

export interface HistoryStats {
  total: number;
  inProgress: number;
  completed: number;
  picks: number;
  lastUpdated: string | null;
}

export function historyStats(sessions: readonly Session[], now: Date = new Date()): HistoryStats {
  const sorted = [...sessions].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return {
    total: sessions.length,
    inProgress: sessions.filter((session) => session.status !== 'completed').length,
    completed: sessions.filter((session) => session.status === 'completed').length,
    picks: sessions.reduce((sum, session) => sum + session.picks.length, 0),
    lastUpdated: sorted[0] ? relativeDate(sorted[0].updatedAt, now) : null,
  };
}
