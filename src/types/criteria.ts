/**
 * Identyfikatory kryteriów i grup (E2-01) — QUIZ-SPEC 2.1, PROJECT 7.1.
 * Osobny moduł, żeby typy danych i typy silnika nie definiowały ich podwójnie.
 */

export type GroupId = 'battery' | 'camera' | 'storage' | 'longevity' | 'smooth' | 'price';

export type CriterionId =
  | 'battery'
  | 'charging'
  | 'photoDay'
  | 'photoIndoor'
  | 'photoMotion'
  | 'selfie'
  | 'video'
  | 'zoom'
  | 'storage'
  | 'updates'
  | 'smoothness'
  | 'display'
  | 'durability'
  | 'value';

export type ScoreConfidence = 'high' | 'medium' | 'low';
