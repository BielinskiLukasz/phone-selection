import type { AppState, LoadResult, NoticeCode, Session, Theme } from '@/types/state';
import { newSessionId, sanitizeSession, sortSessions, trimSessions } from './session';

/**
 * Magazyn stanu (E3-02, E3-03, E3-04, E3-09) — PROJECT 9, UI-SPEC 10.
 *
 * - klucz główny `wybor-telefonu:v1` z numerem wersji schematu,
 * - migracje `migrations[wersja]` (przenoszą z `wersja` do `wersja + 1`),
 * - uszkodzony JSON: kopia surowych danych pod `wybor-telefonu:backup` i pusty stan,
 * - brak albo błąd `localStorage`: tryb awaryjny w pamięci z flagą `persistent = false`,
 * - przekroczony limit: druga próba zapisu bez snapshotów rankingu i komunikat,
 * - limit `MAX_SESSIONS` najnowszych sesji z komunikatem o przycięciu.
 */

export const STORAGE_KEY = 'wybor-telefonu:v1';
export const BACKUP_KEY = 'wybor-telefonu:backup';
export const THEME_KEY = 'wybor-telefonu:theme';
export const SCHEMA_VERSION = 3;
export const MAX_SESSIONS = 50;
export const SAVE_DEBOUNCE_MS = 300;

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Magazyn w pamięci — tryb awaryjny i testy. */
export function memoryStorage(): StorageAdapter {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

/** `localStorage` albo `null`, gdy jest niedostępny (tryb prywatny, blokada, błąd). */
export function browserStorage(): StorageAdapter | null {
  try {
    const storage = window.localStorage;
    const probe = `${STORAGE_KEY}:probe`;
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function emptyState(theme: Theme = 'light', notices: NoticeCode[] = []): AppState {
  return { schemaVersion: SCHEMA_VERSION, sessions: [], activeSessionId: null, theme, notices };
}

export type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migracje schematu. Indeks = wersja źródłowa.
 * v0 → v1: płaska `history` bez wag i filtrów, motyw jako `dark: boolean`.
 */
export const migrations: Record<number, Migration> = {
  0: (raw) => {
    const history = Array.isArray(raw.history) ? raw.history : [];
    const sessions = history
      .map((entry) => {
        if (typeof entry !== 'object' || entry === null) return null;
        const record = entry as Record<string, unknown>;
        const mode = record.mode;
        return sanitizeSession({
          /* Brak identyfikatora w starym zapisie nie może oznaczać utraty sesji. */
          id: typeof record.id === 'string' && record.id.length > 0 ? record.id : newSessionId(),
          createdAt: typeof record.savedAt === 'string' ? record.savedAt : undefined,
          updatedAt: typeof record.savedAt === 'string' ? record.savedAt : undefined,
          mode: mode === 'sliders' || mode === 'hybrid' ? mode : 'quiz',
          status: record.completed === true ? 'completed' : 'in_progress',
          answers: record.answers ?? {},
          picks: Array.isArray(record.picks) ? record.picks : [],
        });
      })
      .filter((session): session is Session => session !== null);

    return {
      schemaVersion: 1,
      sessions,
      activeSessionId: typeof raw.activeId === 'string' ? raw.activeId : null,
      theme: raw.dark === true ? 'dark' : 'light',
      notices: [],
    };
  },
  /* E11-01 · v1 → v2: domyślne puste wykluczenia i `exclusionsStep: 'done'` dla istniejących sesji. */
  1: (raw) => {
    const entries = Array.isArray(raw.sessions) ? raw.sessions : [];
    const sessions = entries.map((entry) => {
      if (typeof entry !== 'object' || entry === null) return entry;
      const session = entry as Record<string, unknown>;
      const rawFilters =
        typeof session.filters === 'object' && session.filters !== null
          ? (session.filters as Record<string, unknown>)
          : {};
      const filters = {
        ...rawFilters,
        excludedBrands: Array.isArray(rawFilters.excludedBrands) ? rawFilters.excludedBrands : [],
        excludedPhoneIds: Array.isArray(rawFilters.excludedPhoneIds)
          ? rawFilters.excludedPhoneIds
          : [],
      };
      return {
        ...session,
        exclusionsStep: session.exclusionsStep === 'pending' ? 'pending' : 'done',
        filters,
      };
    });

    return {
      ...raw,
      schemaVersion: 2,
      sessions,
    };
  },
  /* FP5-04 · v2 → v3: sesje „ukończone” bez żadnego wyboru stają się `awaiting_pick` (ranking jest, wyboru nie ma). */
  2: (raw) => {
    const entries = Array.isArray(raw.sessions) ? raw.sessions : [];
    const sessions = entries.map((entry) => {
      if (typeof entry !== 'object' || entry === null) return entry;
      const session = entry as Record<string, unknown>;
      const picks = Array.isArray(session.picks) ? session.picks : [];
      const status =
        session.status === 'completed' && picks.length === 0
          ? 'awaiting_pick'
          : session.status === 'completed' || session.status === 'awaiting_pick' || session.status === 'in_progress'
            ? session.status
            : 'in_progress';
      return { ...session, status };
    });
    return { ...raw, schemaVersion: 3, sessions };
  },
};

function versionOf(raw: Record<string, unknown>): number {
  if (typeof raw.schemaVersion === 'number') return raw.schemaVersion;
  if (typeof raw.version === 'number') return raw.version;
  return SCHEMA_VERSION;
}

export function migrate(raw: Record<string, unknown>): {
  state: Record<string, unknown>;
  migratedFrom: number | null;
} {
  let current: Record<string, unknown> = raw;
  let version = versionOf(raw);
  const start = version;
  let guard = 0;

  while (version < SCHEMA_VERSION && guard < 10) {
    const step = migrations[version];
    if (!step) break;
    current = step(current);
    const declared = versionOf(current);
    /* Migracja deklaruje nową wersję; jeśli nie, licznik idzie w górę sam. */
    version = declared > version ? declared : version + 1;
    guard += 1;
  }

  return { state: current, migratedFrom: start === SCHEMA_VERSION ? null : start };
}

export function isAppState(value: unknown): value is AppState {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<AppState>;
  return Array.isArray(candidate.sessions) && typeof candidate.schemaVersion === 'number';
}

function themeOf(raw: object): Theme {
  return (raw as { theme?: unknown }).theme === 'dark' ? 'dark' : 'light';
}

/** Walidacja kształtu: sesje po `sanitizeSession`, reszta z wartościami domyślnymi. */
export function normalizeState(value: unknown): { state: AppState; droppedSessions: number } {
  if (!isAppState(value)) return { state: emptyState(), droppedSessions: 0 };

  const raw = value as { activeSessionId?: unknown };
  const sessions: Session[] = [];
  let dropped = 0;

  for (const entry of value.sessions) {
    const session = sanitizeSession(entry);
    if (session) sessions.push(session);
    else dropped += 1;
  }

  const activeSessionId =
    typeof raw.activeSessionId === 'string' && sessions.some((item) => item.id === raw.activeSessionId)
      ? raw.activeSessionId
      : null;

  return {
    state: {
      schemaVersion: SCHEMA_VERSION,
      sessions: sortSessions(sessions),
      activeSessionId,
      theme: themeOf(raw),
      notices: [],
    },
    droppedSessions: dropped,
  };
}

export function readTheme(storage: StorageAdapter | null): Theme {
  if (!storage) return 'light';
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isAppState(parsed)) return themeOf(parsed);
    }
    return storage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Odczyt stanu wraz z diagnostyką (tryb awaryjny, uszkodzone dane, przycięcie). */
export function loadState(storage: StorageAdapter | null = browserStorage()): LoadResult {
  if (!storage) {
    return {
      state: emptyState('light', ['storage-unavailable']),
      persistent: false,
      notices: ['storage-unavailable'],
      backupKey: null,
    };
  }

  const theme = readTheme(storage);
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      state: emptyState(theme, ['storage-unavailable']),
      persistent: false,
      notices: ['storage-unavailable'],
      backupKey: null,
    };
  }

  if (raw === null) {
    return { state: emptyState(theme), persistent: true, notices: [], backupKey: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    /* Uszkodzony zapis: kopia surowych danych i start od pustego stanu (UI-SPEC 10). */
    let backupKey: string | null = BACKUP_KEY;
    try {
      storage.setItem(BACKUP_KEY, raw);
      storage.removeItem(STORAGE_KEY);
    } catch {
      backupKey = null;
    }
    return {
      state: emptyState(theme, ['corrupted-data']),
      persistent: true,
      notices: ['corrupted-data'],
      backupKey,
    };
  }

  const record = parsed as Record<string, unknown>;
  if (versionOf(record) > SCHEMA_VERSION) {
    /* Stan z nowszej wersji — nie nadpisujemy, startujemy od pustego. */
    return {
      state: emptyState(theme, ['corrupted-data']),
      persistent: true,
      notices: ['corrupted-data'],
      backupKey: null,
    };
  }

  const { state: migrated } = migrate(record);
  const { state, droppedSessions } = normalizeState(migrated);
  const notices: NoticeCode[] = [...state.notices];
  if (droppedSessions > 0) notices.push('corrupted-data');

  const trimmed = trimSessions(state.sessions, MAX_SESSIONS);
  if (trimmed.trimmed > 0) notices.push('sessions-trimmed');

  return {
    state: { ...state, sessions: trimmed.sessions, notices },
    persistent: true,
    notices,
    backupKey: null,
  };
}

/** Zapis bez komunikatów — one są wyłącznie stanem uruchomieniowym. */
export function serialize(state: AppState): string {
  return JSON.stringify({ ...state, notices: [], lastImport: null });
}

/** Zapis bez snapshotów rankingu — druga próba, gdy magazyn zgłasza limit. */
export function serializeSlim(state: AppState): string {
  const sessions = state.sessions.map((session) => ({ ...session, ranking: null }));
  return JSON.stringify({ ...state, sessions, notices: [], lastImport: null });
}

export function saveState(
  state: AppState,
  storage: StorageAdapter | null = browserStorage(),
): { ok: boolean; persistent: boolean; notices: NoticeCode[] } {
  if (!storage) {
    return { ok: false, persistent: false, notices: ['storage-unavailable'] };
  }

  try {
    storage.setItem(STORAGE_KEY, serialize(state));
    storage.setItem(THEME_KEY, state.theme);
    return { ok: true, persistent: true, notices: [] };
  } catch {
    /* Przekroczony limit: próbujemy bez snapshotów, potem zostaje pamięć. */
    try {
      storage.setItem(STORAGE_KEY, serializeSlim(state));
      storage.setItem(THEME_KEY, state.theme);
      return { ok: true, persistent: true, notices: ['quota-exceeded'] };
    } catch {
      return { ok: false, persistent: false, notices: ['quota-exceeded'] };
    }
  }
}

/** Kopia uszkodzonych danych — do podglądu w narzędziach deweloperskich. */
export function readBackup(storage: StorageAdapter | null = browserStorage()): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}

export function clearAll(storage: StorageAdapter | null = browserStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
    storage.removeItem(BACKUP_KEY);
  } catch {
    /* ignorujemy: brak dostępu do magazynu nie może wywrócić aplikacji */
  }
}
