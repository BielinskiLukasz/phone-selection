import { useMemo } from 'react';
import type { Session } from '@/types/state';

/**
 * Które telefony są już odsłonięte i którym wyborem są z kolei (E3-10).
 * Plakietki „Wybór 1/2”, „Wybór 2/2” (UI-SPEC 3.4, PROJECT 8).
 */

export interface RevealInfo {
  /** phoneId w kolejności dodawania wyborów. */
  revealedIds: string[];
  /** Łączna liczba wyborów w sesji — mianownik plakietki. */
  total: number;
  /** Numer wyboru (od 1) albo null, gdy karta jest jeszcze anonimowa. */
  orderOf(phoneId: string): number | null;
  /** „1/2” albo null. */
  labelFor(phoneId: string): string | null;
  isRevealed(phoneId: string): boolean;
}

const EMPTY: RevealInfo = {
  revealedIds: [],
  total: 0,
  orderOf: () => null,
  labelFor: () => null,
  isRevealed: () => false,
};

export function revealInfo(session: Session | null | undefined): RevealInfo {
  const picks = session?.picks ?? [];
  if (picks.length === 0) return EMPTY;

  const revealedIds = picks.map((pick) => pick.phoneId);
  const total = revealedIds.length;
  const order = new Map(revealedIds.map((phoneId, index) => [phoneId, index + 1]));

  return {
    revealedIds,
    total,
    orderOf: (phoneId) => order.get(phoneId) ?? null,
    labelFor: (phoneId) => {
      const position = order.get(phoneId);
      return position ? `${position}/${total}` : null;
    },
    isRevealed: (phoneId) => order.has(phoneId),
  };
}

export function useReveal(session: Session | null | undefined): RevealInfo {
  return useMemo(() => revealInfo(session), [session]);
}
