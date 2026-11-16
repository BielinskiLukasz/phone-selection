import type { ScoreConfidence } from '@/types';
import { ConfidenceIcon } from './ConfidenceIcon';

interface ScoreBarProps {
  label: string;
  groupLabel: string;
  score: number;
  estimated: boolean;
  confidence: ScoreConfidence;
  basis: string;
  basisCaption: string;
  estimatedCaption: string;
  confidenceLabels: { high: string; medium: string; low: string; caption: string };
  delay?: number;
}

/** Pasek oceny 0-100 z grupą, pewnością i uzasadnieniem (UI-SPEC 3.5). */
export function ScoreBar({
  label,
  groupLabel,
  score,
  estimated,
  confidence,
  basis,
  basisCaption,
  estimatedCaption,
  confidenceLabels,
  delay = 0,
}: ScoreBarProps) {
  return (
    <li className="group/score grid gap-1 border-b border-[var(--color-border)] py-2.5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[13px] font-medium">{label}</span>
        <span className="num rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
          {groupLabel}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <ConfidenceIcon confidence={confidence} labels={confidenceLabels} />
          <span className="num w-8 text-right text-sm font-bold tabular-nums">
            {estimated ? '—' : score}
          </span>
        </span>
      </div>

      <span className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
        <span
          className="bar-grow block h-full rounded-full bg-[var(--color-accent)] transition-[width,opacity] duration-300 group-hover/score:opacity-100"
          style={{
            width: `${Math.min(100, Math.max(0, score))}%`,
            opacity: estimated ? 0.35 : 0.85,
            animationDelay: `${delay}ms`,
          }}
        />
      </span>

      {estimated ? (
        <span className="num text-[10px] tracking-[0.1em] text-[var(--color-warn)] uppercase">
          {estimatedCaption}
        </span>
      ) : null}

      <span className="text-[11px] leading-relaxed text-[var(--color-muted)]">
        <span className="num tracking-[0.1em] uppercase">{basisCaption}: </span>
        {basis}
      </span>
    </li>
  );
}
