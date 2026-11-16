/**
 * Barrel typów (E2-01). Re-eksport **jawny**, bez `export *`:
 * `./criteria`, `./phone` i `./ranking` współdzielą nazwy `CriterionId`, `GroupId`
 * i `Phone`, a podwójny eksport tej samej nazwy kończy się błędem TS2308.
 */

export type { CriterionId, GroupId, ScoreConfidence } from './criteria';

export type {
  CameraSpecs,
  DisplaySpec,
  Phone,
  PhoneScores,
  PhoneStatus,
  PhonesData,
  Price,
  PriceObservation,
  Reveal,
  ShopLink,
  Specs,
  UpdatesSpec,
  Variant,
} from './phone';

export type {
  AnonCard,
  AnonCriterion,
  AnonFact,
  Answers,
  BudgetOption,
  CriterionShares,
  ExclusionReason,
  FactKey,
  Filters,
  GroupImportance,
  QuizBlock,
  QuizOption,
  QuizQuestion,
  RankInput,
  RankResult,
  RankedPhone,
  TopThreeAnswer,
  Weights,
} from './ranking';
