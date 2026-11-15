export const CRITERION_IDS = [
  'battery',
  'charging',
  'photoDay',
  'photoIndoor',
  'photoMotion',
  'selfie',
  'video',
  'zoom',
  'storage',
  'updates',
  'smoothness',
  'display',
  'durability',
  'value',
] as const;

export type CriterionId = (typeof CRITERION_IDS)[number];

export const GROUP_IDS = ['battery', 'camera', 'storage', 'longevity', 'smooth', 'price'] as const;

export type GroupId = (typeof GROUP_IDS)[number];