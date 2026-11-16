import type { ScoreConfidence } from '@/types';

interface ConfidenceIconProps {
  confidence: ScoreConfidence;
  labels: { high: string; medium: string; low: string; caption: string };
}

/**
 * Pewność oceny: pełne / połowa / puste kółko dla `high` / `medium` / `low`
 * (UI-SPEC 3.5). Informacja nigdy nie idzie samym kolorem — jest też etykieta.
 */
export function ConfidenceIcon({ confidence, labels }: ConfidenceIconProps) {
  const label =
    confidence === 'high' ? labels.high : confidence === 'medium' ? labels.medium : labels.low;
  const text = `${labels.caption}: ${label}`;

  return (
    <span
      className="inline-flex items-center gap-1 text-[var(--color-muted)]"
      title={text}
      aria-label={text}
      role="img"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
        <circle
          cx="8"
          cy="8"
          r="6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.65"
        />
        {confidence === 'high' ? (
          <circle cx="8" cy="8" r="6.2" fill="currentColor" />
        ) : null}
        {confidence === 'medium' ? (
          <path d="M8 1.8a6.2 6.2 0 0 0 0 12.4z" fill="currentColor" />
        ) : null}
      </svg>
      <span className="num text-[10px] tracking-[0.1em] uppercase">{label}</span>
    </span>
  );
}
