import type { CriterionId } from './criteria';

export type ScoreConfidence = 'high' | 'medium' | 'low';

export type PhoneScores = Record<Exclude<CriterionId, 'value'>, number> & {
  value: number | null;
};

export interface Price {
  pln: number;
  checkedAt: string;
  source: string;
  note?: string | null;
}

export interface ShopLink {
  url: string;
  shop?: string;
}

export interface PhoneSpecs {
  batteryMah?: number | null;
  chargingW?: number | null;
  wirelessCharging?: boolean | null;
  display?: {
    sizeInches?: number | null;
    panel?: string | null;
    refreshHz?: number | null;
  } | null;
  weightG?: number | null;
  dimensionsMm?: { height?: number; width?: number; depth?: number } | null;
  ipRating?: string | null;
  microSd?: boolean | null;
  cameras?: {
    mainMp?: number | null;
    mainOis?: boolean | null;
    ultrawideMp?: number | null;
    telephotoMp?: number | null;
    selfieMp?: number | null;
  } | null;
  updates?: { osVersions?: number | null; securityYears?: number | null } | null;
  chip?: string | null;
  connectivity?: string | null;
}

export interface Phone {
  id: string;
  reveal: { name: string; brand: string; shopLinks: (ShopLink | string)[] };
  variant: { ramGb: number; storageGb: number; variantOf?: string | null };
  price: Price;
  specs: PhoneSpecs;
  scores: PhoneScores;
  basis: Partial<Record<CriterionId, string>>;
  scoreConfidence?: Partial<Record<CriterionId, ScoreConfidence>>;
  scoresEstimatedNeutral?: CriterionId[];
  status: 'ok' | 'over_budget' | 'variant_swapped' | 'unverified';
}

export interface PhoneData {
  _meta: { generatedOn: string | null; note?: string };
  phones: Phone[];
}