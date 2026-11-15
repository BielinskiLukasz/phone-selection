import type { CriterionId, GroupId } from './criteria';
import type { Phone, ScoreConfidence } from './phone';

export type Answers = Readonly<Record<string, string | undefined>>;
export type CriterionWeights = Record<CriterionId, number>;
export type GroupWeights = Record<GroupId, number>;
export type GroupScores = Record<GroupId, number>;

export interface Filters {
  budgetMax: number;
  minStorageGb?: number;
  requireMicroSd?: boolean;
}

export interface QuizOption {
  id: string;
  label: string;
  sets?: Partial<Record<CriterionId, number>>;
  budgetMax?: 1500 | 1800 | 2000;
  minStorageGb?: 256;
  skip?: true;
}

export interface QuizQuestion {
  id: string;
  block: 'battery' | 'camera' | 'storage' | 'everyday' | 'display' | 'budget';
  text: string;
  why: string;
  options: QuizOption[];
  inShortQuiz?: boolean;
  appliesWhen?: (phones: readonly Phone[]) => boolean;
}

export interface TopThreeAnswer {
  picks: readonly [GroupId, GroupId, GroupId];
}

export interface RankedPhone {
  phoneId: string;
  position: number;
  score: number;
  matchPercent: number;
  rawScores: Record<CriterionId, number>;
  normalizedScores: Record<CriterionId, number>;
  groupScores: GroupScores;
  overBudgetBy?: number;
  tieWith?: number;
}

export interface RankInput {
  phones: readonly Phone[];
  answers?: Answers;
  topThree?: readonly GroupId[];
  filters?: Partial<Filters>;
  criterionWeights?: CriterionWeights;
  groupWeights?: GroupWeights;
}

export interface RankingResult {
  filters: Filters;
  criterionWeights: CriterionWeights;
  groupWeights: GroupWeights;
  ranking: RankedPhone[];
  cards: RankedPhone[];
}

export interface AnonymousFeature {
  key: 'battery' | 'camera' | 'storage' | 'updates' | 'durability' | 'display';
  text: string;
  missing: boolean;
}

export interface AnonymousScore {
  criterion: CriterionId;
  score: number;
  confidence: ScoreConfidence;
  estimated: boolean;
  explanation: string;
}

export interface AnonymousCard {
  position: number;
  matchPercent: number;
  price: Pick<Phone['price'], 'pln' | 'checkedAt'>;
  overBudgetBy?: number;
  tieWith?: number;
  features: AnonymousFeature[];
  details: AnonymousScore[];
}