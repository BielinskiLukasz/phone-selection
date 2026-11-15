import { MATCH_LABELS, MATCH_LABEL_THRESHOLDS } from './scoringConfig';

/**
 * Sposób pokazywania „% dopasowania” (E2-09) — decyzja z QUIZ-SPEC 10.1.
 *
 * Wybrany wariant: **surowe `round(S)` jako liczba + opis słowny**, a przeskalowanie
 * (najlepszy w puli = 100%) tylko w szczegółach karty.
 *
 * Dlaczego: wyniki żyją w wąskim przedziale (ok. 50-72), więc sama liczba słabo różnicuje
 * propozycje — opis słowny robi to lepiej. Przeskalowanie na karcie głównej zawsze dawałoby
 * 100% dla pierwszej propozycji i ukrywało, jak blisko siebie są telefony, a `round(S)`
 * jest stabilny między sesjami (snapshot rankingu nie zmienia znaczenia po tygodniu).
 */

export type MatchLabelId = keyof typeof MATCH_LABELS;

export function matchLabelId(score: number): MatchLabelId {
  if (score >= MATCH_LABEL_THRESHOLDS.veryGood) return 'veryGood';
  if (score >= MATCH_LABEL_THRESHOLDS.good) return 'good';
  return 'average';
}

export function matchLabel(score: number): string {
  return MATCH_LABELS[matchLabelId(score)];
}

/** Przeskalowanie: najlepszy wynik w puli = 100%. */
export function rescaledPercent(score: number, bestScore: number | null): number | null {
  if (typeof bestScore !== 'number' || bestScore <= 0) return null;
  return Math.round((score / bestScore) * 100);
}

export interface MatchDisplay {
  /** Liczba pokazywana na karcie. */
  percent: number;
  /** Opis słowny pokazywany obok liczby. */
  label: string;
  /** Do szczegółów: względem najlepszego w puli. */
  rescaledPercent: number | null;
  /** Surowe S, do porównań i snapshotu. */
  raw: number;
}

export function matchDisplay(score: number, bestScore: number | null = null): MatchDisplay {
  return {
    percent: Math.round(score),
    label: matchLabel(score),
    rescaledPercent: rescaledPercent(score, bestScore),
    raw: score,
  };
}
