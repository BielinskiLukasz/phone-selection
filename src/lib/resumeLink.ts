import type { Answers, GroupId } from '@/types';
import type { Mode, Session } from '@/types/state';
import { QUESTIONS, findOption } from '@/data/questions';

/**
 * Link do wznowienia na drugim urządzeniu (E7-06).
 *
 * `#/r/<kod>`, gdzie kod to base64url z `{ v, mode, answers, topThree }`.
 * **Bez wyborów (`picks`)** — one odkrywałyby nazwy telefonów (ETAP-7, „Ryzyka”).
 * Otwarcie linku tworzy nową sesję i przelicza ranking aktualnymi danymi.
 */

export const RESUME_LINK_VERSION = 1;

export interface ResumePayload {
  v: number;
  mode: Mode;
  answers: Answers;
  topThree: [GroupId, GroupId, GroupId] | null;
}

function toBase64Url(text: string): string {
  const bytes = encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_match, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  return btoa(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const padded = code.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (code.length % 4)) % 4);
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
}

export function encodeResume(session: Session): string {
  const payload: ResumePayload = {
    v: RESUME_LINK_VERSION,
    mode: session.mode,
    answers: session.answers,
    topThree: session.topThree ? [...session.topThree.picks] : null,
  };
  return toBase64Url(JSON.stringify(payload));
}

export function resumeHash(session: Session): string {
  return `#/r/${encodeResume(session)}`;
}

function isMode(value: unknown): value is Mode {
  return value === 'quiz' || value === 'sliders' || value === 'hybrid';
}

function isGroupId(value: unknown): value is GroupId {
  return (
    value === 'battery' ||
    value === 'camera' ||
    value === 'storage' ||
    value === 'longevity' ||
    value === 'smooth' ||
    value === 'size' ||
    value === 'price'
  );
}

/** Dekoduje i waliduje kod: tylko znane pytania, opcje i grupy. */
export function decodeResume(code: string): { payload: ResumePayload | null; reason: string | null } {
  let raw: unknown;
  try {
    raw = JSON.parse(fromBase64Url(code));
  } catch {
    return { payload: null, reason: 'Kod linku jest uszkodzony albo niekompletny.' };
  }

  if (typeof raw !== 'object' || raw === null) {
    return { payload: null, reason: 'Kod nie zawiera stanu sesji.' };
  }

  const record = raw as Record<string, unknown>;
  if (record.v !== RESUME_LINK_VERSION) {
    return { payload: null, reason: `Nieobsługiwana wersja linku (v${String(record.v)}).` };
  }
  if (!isMode(record.mode)) {
    return { payload: null, reason: 'Nieznany tryb sesji w linku.' };
  }
  if (typeof record.answers !== 'object' || record.answers === null || Array.isArray(record.answers)) {
    return { payload: null, reason: 'Brak odpowiedzi w linku.' };
  }

  const answers: Answers = {};
  for (const [questionId, optionId] of Object.entries(record.answers as Record<string, unknown>)) {
    if (typeof optionId !== 'string') continue;
    const question = QUESTIONS.find((item) => item.id === questionId);
    if (!question) continue;
    if (!findOption(questionId, optionId)) continue;
    answers[questionId] = optionId;
  }

  let topThree: [GroupId, GroupId, GroupId] | null = null;
  if (Array.isArray(record.topThree) && record.topThree.length === 3) {
    const picks = record.topThree as unknown[];
    if (picks.every(isGroupId)) {
      const unique = picks.filter((id, index) => picks.indexOf(id) === index);
      if (unique.length === 3) topThree = [unique[0] as GroupId, unique[1] as GroupId, unique[2] as GroupId];
    }
  }

  return {
    payload: { v: RESUME_LINK_VERSION, mode: record.mode, answers, topThree },
    reason: null,
  };
}
