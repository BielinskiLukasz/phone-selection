import { GROUPS, criterion } from '@/data/criteria';
import { criterionShares, deriveFromAnswers } from '@/lib/weights';
import { DEFAULT_WEIGHT, GROUP_BASE } from '@/lib/scoringConfig';
import type { CriterionId, GroupId, Weights } from '@/types';
import type { Session } from '@/types/state';

/**
 * Model suwaków (E5-01, E5-02) — czysta logika, bez Reacta.
 *
 * Ważna różnica semantyczna (ETAP-5, „Ryzyka”): suwak grupy ustawia **ważność grupy `G_g`**,
 * a nie średnią wag kryteriów; suwaki kryteriów ustawiają **udziały wewnątrz grupy `w_c`**.
 * Interfejs mówi o tym wprost: „Jak ważna jest ta rzecz?”.
 */

export const SLIDER_MIN = 0;
export const SLIDER_MAX = 5;
/** Krok 0,1 — wartości wyliczone z odpowiedzi bywają ułamkowe (1,3 / 1,7 / 2,5). */
export const SLIDER_STEP = 0.1;

export const SLIDER_LABELS = {
  ignore: 'ignoruj',
  low: 'mało ważne',
  neutral: 'neutralnie',
  important: 'ważne',
  high: 'bardzo ważne',
  key: 'kluczowe',
} as const;

export type SliderLabelId = keyof typeof SLIDER_LABELS;

export function sliderLabelId(value: number): SliderLabelId {
  if (value < 0.05) return 'ignore';
  if (value < 1.5) return 'low';
  if (value < 2.5) return 'neutral';
  if (value < 3.5) return 'important';
  if (value < 4.5) return 'high';
  return 'key';
}

export function sliderLabel(value: number): string {
  return SLIDER_LABELS[sliderLabelId(value)];
}

/** „3 z 5, ważne” — format z UI-SPEC 3.3. */
export function sliderValueText(value: number): string {
  return `${formatSliderValue(value)} z 5, ${sliderLabel(value)}`;
}

/** `aria-valuetext` dla natywnego `input[type=range]` (UI-SPEC 8). */
export function sliderAriaValueText(value: number): string {
  return sliderValueText(value);
}

export function formatSliderValue(value: number): string {
  const rounded = Math.round(clampSlider(value) * 10) / 10;
  return String(Number.isInteger(rounded) ? rounded : rounded.toFixed(1)).replace('.', ',');
}

export function clampSlider(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_WEIGHT;
  return Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, value));
}

export function toSliderValue(value: number | null | undefined): number {
  return Math.round(clampSlider(value ?? DEFAULT_WEIGHT) * 10) / 10;
}

export interface GroupSliderState {
  id: GroupId;
  label: string;
  description: string;
  /** Ważność grupy G_g — to ją ustawia suwak. */
  value: number;
  valueText: string;
  ariaValueText: string;
  /** Wartość wyliczona z odpowiedzi (do „Przywróć wyliczone” i porównań). */
  computed: number;
  criteria: CriterionSliderState[];
}

export interface CriterionSliderState {
  id: CriterionId;
  label: string;
  /** Waga kryterium w grupie w_c. */
  value: number;
  valueText: string;
  ariaValueText: string;
  /** Wartość wyliczona z odpowiedzi — punkt odniesienia. */
  computed: number;
  /** Udział w grupie (0-1) wynikający z wag — pokazywany jako procent. */
  share: number;
}

/**
 * Wartości wyliczone z odpowiedzi (bez ręcznej korekty) — punkt odniesienia dla plakietki
 * „Wyliczone z Twoich odpowiedzi”, znacznika na torze suwaka i „Przywróć wyliczone”.
 * Liczone zawsze od nowa z `answers` + `topThree`, więc snapshot z ręcznymi wagami
 * nie nadpisuje punktu odniesienia.
 */
export function computedFromAnswers(session: Session): {
  weights: Weights;
  groupImportance: Record<GroupId, number>;
} {
  const derived = deriveFromAnswers(session.answers, session.topThree);
  return { weights: derived.weights, groupImportance: derived.groupImportance };
}

export function computedGroupImportance(session: Session): Record<GroupId, number> {
  return computedFromAnswers(session).groupImportance;
}

export function computedCriterionWeights(session: Session): Weights {
  return computedFromAnswers(session).weights;
}

export function groupSliderState(session: Session): GroupSliderState[] {
  const computed = computedGroupImportance(session);
  const computedWeights = computedCriterionWeights(session);

  return GROUPS.map((group) => {
    /* Udziały liczymy wewnątrz grupy — to one decydują o GroupScore (QUIZ-SPEC 2.2). */
    const shares = criterionShares(session.weights, group.criteria);
    return {
    id: group.id,
    label: group.label,
    description: group.description,
    value: toSliderValue(session.groupImportance[group.id]),
    valueText: sliderValueText(session.groupImportance[group.id] ?? GROUP_BASE),
    ariaValueText: sliderAriaValueText(session.groupImportance[group.id] ?? GROUP_BASE),
    computed: toSliderValue(computed[group.id]),
    criteria: group.criteria.map((id) => ({
      id,
      label: criterion(id).label,
      value: toSliderValue(session.weights[id]),
      valueText: sliderValueText(session.weights[id]),
      ariaValueText: sliderAriaValueText(session.weights[id]),
      computed: toSliderValue(computedWeights[id]),
      share: shares[id] ?? 0,
    })),
    };
  });
}

/** Neutralny start: grupy 2, kryteria 2 (QUIZ-SPEC 6). */
export function neutralSliderValues(): { groups: Record<GroupId, number>; weights: Weights } {
  const groups = {} as Record<GroupId, number>;
  for (const group of GROUPS) groups[group.id] = DEFAULT_WEIGHT;

  const weights = {} as Weights;
  for (const group of GROUPS) {
    for (const id of group.criteria) weights[id] = DEFAULT_WEIGHT;
  }

  return { groups, weights };
}

/** Różnica między wartością ręczną a wyliczoną — do plakietki i testów. */
export function isGroupModified(session: Session, id: GroupId): boolean {
  const computed = computedGroupImportance(session);
  return Math.abs((session.groupImportance[id] ?? 0) - (computed[id] ?? 0)) > 0.001;
}

export function modifiedGroups(session: Session): GroupId[] {
  return GROUPS.filter((group) => isGroupModified(session, group.id)).map((group) => group.id);
}
