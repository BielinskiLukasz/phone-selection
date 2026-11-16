import { describe, expect, it } from 'vitest';
import { POOL, phoneById } from './data';
import { createSession } from '../src/lib/session';
import { reducer } from '../src/lib/sessionReducer';
import { emptyState } from '../src/lib/storage';
import {
  HISTORY_FILE_KIND,
  buildHistoryFile,
  historyFileName,
  mergeSessions,
  parseHistory,
  serializeHistory,
} from '../src/lib/historyTransfer';
import { decodeResume, encodeResume, resumeHash } from '../src/lib/resumeLink';
import {
  absoluteDate,
  historyStats,
  relativeDate,
  resumeViewFor,
  summarizeSession,
} from '../src/features/history/historyModel';
import type { Session } from '../src/types/state';

const NOW = new Date('2026-11-16T12:00:00.000Z');
const LABELS = { inProgress: 'W trakcie', completed: 'Ukończona' };

function answeredSession(id: string, updatedAt: Date, picks = 0): Session {
  let state = reducer(emptyState(), {
    type: 'session/create',
    mode: 'quiz',
    id,
    now: new Date('2026-11-16T10:00:00.000Z'),
  });
  state = reducer(state, { type: 'session/answer', sessionId: id, questionId: 'A1', optionId: 'A1-c', now: updatedAt });
  state = reducer(state, { type: 'session/answer', sessionId: id, questionId: 'B1', optionId: 'B1-c', now: updatedAt });
  if (picks > 0) {
    const cards = state.sessions[0]!.ranking!.cards;
    for (let index = 0; index < picks; index += 1) {
      state = reducer(state, { type: 'session/pick', sessionId: id, phoneId: cards[index]!, now: updatedAt });
    }
  }
  return state.sessions[0]!;
}

describe('E7-07 · eksport i import', () => {
  it('plik ma znacznik aplikacji, wersję i sesje od najnowszej', () => {
    const sessions = [
      answeredSession('a', new Date('2026-11-16T09:00:00.000Z')),
      answeredSession('b', new Date('2026-11-16T11:00:00.000Z')),
    ];
    const file = buildHistoryFile(sessions, NOW);

    expect(file.app).toBe(HISTORY_FILE_KIND);
    expect(file.version).toBe(1);
    expect(file.exportedAt).toBe(NOW.toISOString());
    expect(file.sessions.map((session) => session.id)).toEqual(['b', 'a']);
    expect(historyFileName(NOW)).toBe('wybor-telefonu-historia-2026-11-16.json');
  });

  it('parseHistory przyjmuje plik, surową tablicę i odrzuca obce albo nowsze', () => {
    const sessions = [answeredSession('a', NOW)];
    const text = serializeHistory(sessions, NOW);

    expect(parseHistory(text).sessions.length).toBe(1);
    expect(parseHistory(text).errors).toEqual([]);
    expect(parseHistory(JSON.stringify(sessions)).sessions.length).toBe(1);

    expect(parseHistory('{nie json').errors.length).toBeGreaterThan(0);
    expect(parseHistory(JSON.stringify({ app: 'inna-aplikacja', sessions })).errors[0]).toContain('innej aplikacji');
    expect(
      parseHistory(JSON.stringify({ app: HISTORY_FILE_KIND, version: 9, sessions })).errors[0],
    ).toContain('nowszej wersji');
    expect(parseHistory(JSON.stringify({ app: HISTORY_FILE_KIND, version: 1 })).errors[0]).toContain(
      'nie zawiera listy sesji',
    );
  });

  it('uszkodzone wpisy są pomijane z komunikatem, nie wywracają importu', () => {
    const valid = answeredSession('a', NOW);
    const parsed = parseHistory(JSON.stringify({ app: HISTORY_FILE_KIND, version: 1, sessions: [valid, 'śmieć', { id: '' }] }));
    expect(parsed.sessions.length).toBe(1);
    expect(parsed.errors.join(' ')).toContain('Pominięto 2');
  });

  it('6. scalanie nie tworzy duplikatów: ten sam id wygrywa nowszą wersją', () => {
    const existing = [answeredSession('a', new Date('2026-11-16T10:00:00.000Z'))];
    const sameIdOlder = [{ ...existing[0]!, updatedAt: '2026-11-15T10:00:00.000Z' }];
    const sameIdNewer = [{ ...existing[0]!, updatedAt: '2026-11-17T10:00:00.000Z', status: 'completed' as const }];

    const duplicated = mergeSessions(existing, sameIdOlder);
    expect(duplicated.sessions.length).toBe(1);
    expect(duplicated.duplicates).toBe(1);
    expect(duplicated.added).toBe(0);

    const refreshed = mergeSessions(existing, sameIdNewer);
    expect(refreshed.sessions.length).toBe(1);
    expect(refreshed.updated).toBe(1);
    expect(refreshed.sessions[0]!.status).toBe('completed');

    const added = mergeSessions(existing, [answeredSession('b', NOW)]);
    expect(added.sessions.length).toBe(2);
    expect(added.added).toBe(1);
  });

  it('import ponad limit przycina do 50 najnowszych', () => {
    const many = Array.from({ length: 60 }, (_unused, index) =>
      createSession('quiz', new Date(2026, 10, 16, 12, index), `s-${index}`),
    );
    const merged = mergeSessions([], many);
    expect(merged.sessions.length).toBe(50);
    expect(merged.trimmed).toBe(10);
  });
});

describe('E7-06 · link do wznowienia', () => {
  it('kod zawiera odpowiedzi i trójkę, ale nie wybory (nie odkrywa nazw)', () => {
    const session = answeredSession('a', NOW, 2);
    const code = encodeResume(session);

    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(code).not.toContain('=');
    const decoded = decodeResume(code).payload!;
    expect(decoded.answers).toEqual(session.answers);
    expect(JSON.stringify(decoded)).not.toContain(session.picks[0]!.phoneId);
    expect(resumeHash(session)).toBe(`#/r/${code}`);
  });

  it('trójka G1 przechodzi przez link, a uszkodzony kod daje powód', () => {
    const session: Session = {
      ...answeredSession('a', NOW),
      topThree: { picks: ['battery', 'camera', 'storage'] },
    };
    expect(decodeResume(encodeResume(session)).payload!.topThree).toEqual(['battery', 'camera', 'storage']);

    expect(decodeResume('!!!').payload).toBeNull();
    expect(decodeResume('!!!').reason).toBeTruthy();
    expect(decodeResume(btoa('{"v":99,"mode":"quiz","answers":{}}').replace(/=+$/, '')).reason).toContain(
      'Nieobsługiwana wersja',
    );
    expect(decodeResume(btoa('{"v":1,"mode":"bad-mode","answers":{}}').replace(/=+$/, '')).reason).toContain(
      'tryb',
    );
    expect(decodeResume(btoa('{"v":1,"mode":"quiz","answers":7}').replace(/=+$/, '')).reason).toContain(
      'odpowiedzi',
    );
  });

  it('nieznane pytania i opcje są odfiltrowane, a polskie znaki przeżywają kodowanie', () => {
    const dirty = btoa(
      unescape(
        encodeURIComponent(
          JSON.stringify({
            v: 1,
            mode: 'quiz',
            answers: { A1: 'A1-c', Z9: 'Z9-a', A2: 'A2-nieistniejąca' },
            topThree: ['battery', 'battery', 'camera'],
          }),
        ),
      ),
    ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const decoded = decodeResume(dirty).payload!;
    expect(decoded.answers).toEqual({ A1: 'A1-c' });
    expect(decoded.topThree).toBeNull(); // duplikat grupy → niepełna trójka
  });
});

describe('E7-01 · model listy historii', () => {
  it('daty względne: dziś, wczoraj, dni i tygodnie', () => {
    expect(relativeDate('2026-11-16T09:30:00.000Z', NOW)).toContain('dziś');
    expect(relativeDate('2026-11-15T09:30:00.000Z', NOW)).toBe('wczoraj');
    expect(relativeDate('2026-11-13T09:30:00.000Z', NOW)).toBe('3 dni temu');
    expect(relativeDate('2026-10-26T09:30:00.000Z', NOW)).toContain('tyg. temu');
    expect(absoluteDate('2026-11-16T09:30:00.000Z')).toContain('2026');
  });

  it('wznawianie prowadzi do właściwego ekranu trybu', () => {
    expect(resumeViewFor(createSession('quiz', NOW))).toBe('quiz');
    expect(resumeViewFor(createSession('sliders', NOW))).toBe('sliders');

    const hybrid = createSession('hybrid', NOW);
    expect(resumeViewFor(hybrid)).toBe('quiz');

    const shortDone: Session = {
      ...hybrid,
      answers: { A1: 'A1-a', A2: 'A2-a', B1: 'B1-a', B2: 'B2-a', B3: 'B3-a', C1: 'C1-a', F1: 'F1-a' },
    };
    expect(resumeViewFor(shortDone)).toBe('tune');
  });

  it('podsumowanie sesji: status, postęp, wybory z nazwami i miejscem', () => {
    const session = answeredSession('a', NOW, 1);
    const summary = summarizeSession(session, LABELS);

    expect(summary.statusLabel).toBe('Ukończona');
    expect(summary.progress).toEqual({ answered: 2, total: 18 });
    expect(summary.picks.length).toBe(1);
    expect(summary.picks[0]!.name).toBe(phoneById(summary.picks[0]!.phoneId).reveal.name);
    expect(summary.picksText).toContain('miejsce');
    expect(summary.bestMatchPercent).toBeGreaterThan(0);
    expect(summary.dataVersion).toBe('2026-11-16');
    expect(summary.resumeView).toBe('quiz');
    expect(summary.canResume).toBe(false);

    const fresh = summarizeSession(createSession('sliders', NOW, 'b'), LABELS);
    expect(fresh.statusLabel).toBe('W trakcie');
    expect(fresh.progress).toBeNull();
    expect(fresh.picksText).toBeNull();
    expect(fresh.canResume).toBe(true);
  });

  it('statystyki historii liczą sesje, wybory i ostatnią zmianę', () => {
    const sessions = [
      answeredSession('a', new Date('2026-11-16T09:00:00.000Z'), 1),
      answeredSession('b', new Date('2026-11-16T11:00:00.000Z')),
    ];
    const stats = historyStats(sessions, NOW);
    expect(stats).toMatchObject({ total: 2, inProgress: 1, completed: 1, picks: 1 });
    expect(stats.lastUpdated).toContain('dziś');
  });
});

describe('E7-05 · nowa sesja nie rusza starych', () => {
  it('utworzenie sesji zostawia poprzednie bez zmian', () => {
    const first = answeredSession('a', NOW, 1);
    let state = reducer(emptyState(), { type: 'state/replace', state: { ...emptyState(), sessions: [first] } });
    const before = JSON.stringify(first);

    state = reducer(state, { type: 'session/create', mode: 'sliders', id: 'b', now: NOW });
    expect(state.sessions.length).toBe(2);
    expect(JSON.stringify(state.sessions.find((session) => session.id === 'a'))).toBe(before);
    expect(state.activeSessionId).toBe('b');
  });

  it('sesja z linku ma te same odpowiedzi i ranking z aktualnych danych', () => {
    const source = answeredSession('a', NOW);
    const code = encodeResume(source);
    const payload = decodeResume(code).payload!;

    const state = reducer(emptyState(), {
      type: 'session/create',
      mode: payload.mode,
      id: 'z-linku',
      answers: payload.answers,
      topThree: payload.topThree,
      now: NOW,
    });
    const created = state.sessions[0]!;

    expect(created.answers).toEqual(source.answers);
    expect(created.ranking).not.toBeNull();
    expect(created.ranking!.dataVersion).toBe('2026-11-16');
    expect(created.ranking!.cards.length).toBe(3);
    expect(created.ranking!.poolSize).toBe(POOL.length);
    expect(created.status).toBe('in_progress');
    expect(created.picks).toEqual([]);
  });
});
