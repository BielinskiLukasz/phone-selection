// Keep the displayed percentage equal to the actual weighted score until real-data calibration.
export function toMatchPercent(score: number): number {
  return Math.round(Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0)));
}

export function formatMatchPercent(percent: number): string {
  return `${toMatchPercent(percent)}%`;
}