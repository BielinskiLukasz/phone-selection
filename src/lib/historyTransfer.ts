import type { Session } from '@/types/state';
import { sanitizeSession, sortSessions, trimSessions } from './session';
import { MAX_SESSIONS } from './storage';

/**
 * Eksport i import historii jako plik JSON (E7-07) — kopia zapasowa i przenoszenie
 * między urządzeniami. Scalanie bez duplikatów: ten sam `id` wygrywa nowszą wersją.
 */

export const HISTORY_FILE_KIND = 'wybor-telefonu/historia';
export const HISTORY_FILE_VERSION = 1;

export interface HistoryFile {
  app: typeof HISTORY_FILE_KIND;
  version: number;
  exportedAt: string;
  sessions: Session[];
}

export interface ParseResult {
  sessions: Session[];
  errors: string[];
}

export function buildHistoryFile(sessions: readonly Session[], now: Date = new Date()): HistoryFile {
  return {
    app: HISTORY_FILE_KIND,
    version: HISTORY_FILE_VERSION,
    exportedAt: now.toISOString(),
    sessions: sortSessions(sessions as Session[]),
  };
}

export function serializeHistory(sessions: readonly Session[], now: Date = new Date()): string {
  return JSON.stringify(buildHistoryFile(sessions, now), null, 2);
}

/** Walidacja pliku: rozpoznajemy też surową tablicę sesji (np. z ręcznej kopii). */
export function parseHistory(text: string): ParseResult {
  const errors: string[] = [];
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch {
    return { sessions: [], errors: ['Plik nie jest poprawnym JSON-em.'] };
  }

  let candidates: unknown[] = [];
  if (Array.isArray(raw)) {
    candidates = raw;
  } else if (typeof raw === 'object' && raw !== null) {
    const record = raw as Record<string, unknown>;
    if (record.app !== undefined && record.app !== HISTORY_FILE_KIND) {
      errors.push(`Plik z innej aplikacji (${String(record.app)}).`);
      return { sessions: [], errors };
    }
    if (typeof record.version === 'number' && record.version > HISTORY_FILE_VERSION) {
      errors.push(`Plik z nowszej wersji (${record.version}) — zaktualizuj stronę.`);
      return { sessions: [], errors };
    }
    if (Array.isArray(record.sessions)) candidates = record.sessions;
    else errors.push('Plik nie zawiera listy sesji.');
  } else {
    errors.push('Nieoczekiwana zawartość pliku.');
  }

  const sessions: Session[] = [];
  let dropped = 0;
  for (const candidate of candidates) {
    const session = sanitizeSession(candidate);
    if (session) sessions.push(session);
    else dropped += 1;
  }
  if (dropped > 0) errors.push(`Pominięto ${dropped} uszkodzonych wpisów.`);

  return { sessions: sortSessions(sessions), errors };
}

export interface MergeResult {
  sessions: Session[];
  added: number;
  updated: number;
  duplicates: number;
  trimmed: number;
}

/** Scalanie: ten sam `id` wygrywa nowszym `updatedAt`, potem limit 50 najnowszych. */
export function mergeSessions(
  existing: readonly Session[],
  incoming: readonly Session[],
  max: number = MAX_SESSIONS,
): MergeResult {
  const byId = new Map<string, Session>();
  for (const session of existing) byId.set(session.id, session);

  let added = 0;
  let updated = 0;
  let duplicates = 0;

  for (const session of incoming) {
    const current = byId.get(session.id);
    if (!current) {
      byId.set(session.id, session);
      added += 1;
      continue;
    }
    if (session.updatedAt > current.updatedAt) {
      byId.set(session.id, session);
      updated += 1;
    } else {
      duplicates += 1;
    }
  }

  const trimmed = trimSessions([...byId.values()], max);
  return {
    sessions: trimmed.sessions,
    added,
    updated,
    duplicates,
    trimmed: trimmed.trimmed,
  };
}

export function historyFileName(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  return `wybor-telefonu-historia-${stamp}.json`;
}

/** Pobranie pliku w przeglądarce (bez zależności od Reacta). */
export function downloadHistory(sessions: readonly Session[], now: Date = new Date()): string {
  const name = historyFileName(now);
  const content = serializeHistory(sessions, now);

  /* Środowiska bez `URL.createObjectURL` (starsze przeglądarki, jsdom): zapis przez data URL. */
  if (typeof URL.createObjectURL !== 'function') {
    const anchor = document.createElement('a');
    anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(content)}`;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    return name;
  }

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return name;
}

export function readHistoryFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku.'));
    reader.readAsText(file);
  });
}
