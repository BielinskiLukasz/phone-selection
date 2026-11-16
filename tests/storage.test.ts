import { beforeEach, describe, expect, it } from 'vitest';
import {
  BACKUP_KEY,
  MAX_SESSIONS,
  SCHEMA_VERSION,
  STORAGE_KEY,
  THEME_KEY,
  emptyState,
  loadState,
  memoryStorage,
  migrate,
  normalizeState,
  readBackup,
  saveState,
  serialize,
  serializeSlim,
  type StorageAdapter,
} from '../src/lib/storage';
import { createSession, sanitizeSession, trimSessions } from '../src/lib/session';
import type { AppState } from '../src/types/state';
import { computeRankingSnapshot } from '../src/lib/sessionReducer';

/** Adapter rzucający błąd przy zapisie — symulacja limitu albo blokady. */
function failingStorage(failOn: (value: string) => boolean = () => true): StorageAdapter & {
  writes: string[];
} {
  const map = new Map<string, string>();
  const writes: string[] = [];
  return {
    writes,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      if (failOn(value)) throw new Error('QuotaExceededError');
      map.set(key, value);
      (writes as string[]).push(value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('E3-02 · klucz, zapis i odczyt', () => {
  it('stan zapisuje się pod kluczem wybor-telefonu:v1 z wersją schematu', () => {
    const storage = memoryStorage();
    const state = emptyState('dark');
    expect(saveState(state, storage).ok).toBe(true);

    const raw = storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).schemaVersion).toBe(SCHEMA_VERSION);
    expect(storage.getItem(THEME_KEY)).toBe('dark');
  });

  it('komunikaty są stanem uruchomieniowym i nie trafiają do magazynu', () => {
    const state: AppState = { ...emptyState(), notices: ['quota-exceeded'] };
    expect(serialize(state)).not.toContain('quota-exceeded');
    expect(JSON.parse(serialize(state)).notices).toEqual([]);
  });

  it('odczyt zapisanego stanu oddaje te same sesje', () => {
    const storage = memoryStorage();
    const session = createSession('quiz', new Date('2026-11-15T10:00:00.000Z'), 'sesja-1');
    saveState({ ...emptyState(), sessions: [session], activeSessionId: 'sesja-1' }, storage);

    const loaded = loadState(storage);
    expect(loaded.persistent).toBe(true);
    expect(loaded.state.sessions.length).toBe(1);
    expect(loaded.state.sessions[0]!.id).toBe('sesja-1');
    expect(loaded.state.activeSessionId).toBe('sesja-1');
  });

  it('pusty magazyn daje pusty stan bez komunikatów', () => {
    const loaded = loadState(memoryStorage());
    expect(loaded.state.sessions).toEqual([]);
    expect(loaded.notices).toEqual([]);
    expect(loaded.persistent).toBe(true);
  });
});

describe('E3-03 · migracje', () => {
  it('7. stan ze starszej wersji przechodzi migrację bez utraty sesji', () => {
    const legacy = {
      version: 0,
      dark: true,
      activeId: 'stara-1',
      history: [
        {
          id: 'stara-1',
          mode: 'sliders',
          savedAt: '2026-10-01T12:00:00.000Z',
          completed: true,
          answers: { A1: 'A1-c' },
          picks: [{ phoneId: 'motorola-edge-60-12-256', at: '2026-10-01T12:05:00.000Z' }],
        },
        { id: 'stara-2', mode: 'quiz', savedAt: '2026-10-02T12:00:00.000Z' },
        'uszkodzony-wpis',
      ],
    };

    const { state, migratedFrom } = migrate(legacy);
    expect(migratedFrom).toBe(0);
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);

    const normalized = normalizeState(state);
    expect(normalized.state.sessions.length).toBe(2);
    expect(normalized.state.theme).toBe('dark');
    expect(normalized.state.activeSessionId).toBe('stara-1');

    const first = normalized.state.sessions.find((item) => item.id === 'stara-1')!;
    expect(first.mode).toBe('sliders');
    expect(first.status).toBe('completed');
    expect(first.answers).toEqual({ A1: 'A1-c' });
    expect(first.picks.length).toBe(1);
    expect(first.weights.battery).toBe(2); // brak wag w v0 → wartości neutralne
  });

  it('E11-01 · migracja v1 → v2 uzupełnia puste wykluczenia i exclusionsStep = done', () => {
    const v1 = {
      schemaVersion: 1,
      theme: 'light',
      activeSessionId: 'sesja-v1',
      sessions: [
        {
          id: 'sesja-v1',
          createdAt: '2026-11-14T10:00:00.000Z',
          updatedAt: '2026-11-14T10:05:00.000Z',
          mode: 'quiz',
          status: 'in_progress',
          answers: { A1: 'A1-b' },
          filters: { budgetMax: 1800, minStorageGb: 256 },
          picks: [],
        },
      ],
    };

    const { state, migratedFrom } = migrate(v1);
    expect(migratedFrom).toBe(1);
    expect(state.schemaVersion).toBe(2);

    const normalized = normalizeState(state);
    const session = normalized.state.sessions[0]!;
    expect(session.exclusionsStep).toBe('done');
    expect(session.filters.excludedBrands).toEqual([]);
    expect(session.filters.excludedPhoneIds).toEqual([]);
    expect(session.filters.budgetMax).toBe(1800);
    expect(session.filters.minStorageGb).toBe(256);
  });

  it('migracja z nieznanej wersji źródłowej nie pętli się', () => {
    const { state } = migrate({ schemaVersion: 0 });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('stan z nowszej wersji nie jest nadpisywany, a aplikacja startuje od pustego', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99, sessions: [], theme: 'dark' }));

    const loaded = loadState(storage);
    expect(loaded.state.sessions).toEqual([]);
    expect(loaded.notices).toContain('corrupted-data');
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull(); // dane zostają nienaruszone
  });
});

describe('E3-04 · stany awaryjne', () => {
  it('3. brak localStorage → tryb w pamięci z flagą persistent=false', () => {
    const loaded = loadState(null);
    expect(loaded.persistent).toBe(false);
    expect(loaded.notices).toEqual(['storage-unavailable']);
    expect(saveState(emptyState(), null).persistent).toBe(false);
  });

  it('2. uszkodzony JSON → pusty stan, kopia pod kluczem zapasowym i komunikat', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{to nie jest json');

    const loaded = loadState(storage);
    expect(loaded.state.sessions).toEqual([]);
    expect(loaded.notices).toContain('corrupted-data');
    expect(loaded.backupKey).toBe(BACKUP_KEY);
    expect(readBackup(storage)).toBe('{to nie jest json');
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('przekroczony limit: druga próba bez snapshotów, potem tryb w pamięci', () => {
    const base = createSession('quiz');
    const session = { ...base, ranking: computeRankingSnapshot(base) };
    const state = { ...emptyState(), sessions: [session] };

    const slimOnly = failingStorage((value) => value.includes('"ranking":{'));
    const result = saveState(state, slimOnly);
    expect(result.ok).toBe(true);
    expect(result.notices).toContain('quota-exceeded');
    expect(slimOnly.writes.length).toBe(2); // stan + klucz motywu, już bez snapshotu
    expect(JSON.parse(serializeSlim(state)).sessions[0].ranking).toBeNull();

    const always = failingStorage();
    const failed = saveState(state, always);
    expect(failed.ok).toBe(false);
    expect(failed.persistent).toBe(false);
    expect(failed.notices).toContain('quota-exceeded');
  });

  it('niekompletne rekordy sesji są uzupełniane, nie odrzucane', () => {
    const fixed = sanitizeSession({ id: 'x', mode: 'hybrid', status: 'in_progress', picks: [] });
    expect(fixed).not.toBeNull();
    expect(fixed!.weights.battery).toBe(2);
    expect(fixed!.filters.budgetMax).toBe(2000);
    expect(sanitizeSession({ id: '', mode: 'quiz' })).toBeNull();
    expect(normalizeState({ schemaVersion: 1, sessions: ['śmieci'] }).droppedSessions).toBe(1);
  });
});

describe('E3-09 · limit sesji', () => {
  it('magazyn trzyma 50 najnowszych sesji i zgłasza przycięcie', () => {
    const storage = memoryStorage();
    const sessions = Array.from({ length: MAX_SESSIONS + 5 }, (_unused, index) =>
      createSession('quiz', new Date(2026, 10, 15, 12, index), `sesja-${index}`),
    );
    saveState({ ...emptyState(), sessions }, storage);

    const loaded = loadState(storage);
    expect(loaded.state.sessions.length).toBe(MAX_SESSIONS);
    expect(loaded.notices).toContain('sessions-trimmed');
    expect(loaded.state.sessions.some((item) => item.id === 'sesja-54')).toBe(true);
    expect(loaded.state.sessions.some((item) => item.id === 'sesja-0')).toBe(false);
  });

  it('trimSessions zwraca liczbę przyciętych rekordów', () => {
    const sessions = Array.from({ length: 3 }, (_unused, index) =>
      createSession('quiz', new Date(2026, 10, 15, 12, index), `s-${index}`),
    );
    expect(trimSessions(sessions, 2).trimmed).toBe(1);
    expect(trimSessions(sessions, 5).trimmed).toBe(0);
  });
});
