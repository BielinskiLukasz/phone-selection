import { cn } from '@/utils/cn';

/**
 * UIP1-02 · pasek 0-100 (FIX-UI §4): dopasowanie na karcie, oceny kryteriów, mini-paski grup w rankingu,
 * ważności w podsumowaniu quizu. Wartość liczbowa zawsze w `aria-valuetext` (kolor nigdy sam).
 */
export type MeterTone = 'accent' | 'ok' | 'warn' | 'muted';

interface MeterProps {
  value: number;
  max?: number;
  tone?: MeterTone;
  height?: 'xs' | 'sm' | 'md';
  label: string;
  valueText?: string;
  showValue?: boolean;
  animate?: boolean;
  className?: string;
}

const TONE: Record<MeterTone, string> = {
  accent: 'bg-[var(--color-accent)]',
  ok: 'bg-[var(--color-ok)]',
  warn: 'bg-[var(--color-warn)]',
  muted: 'bg-[var(--color-border-strong)]',
};

const HEIGHT = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' } as const;

export function Meter({
  value,
  max = 100,
  tone = 'accent',
  height = 'sm',
  label,
  valueText,
  showValue = false,
  animate = true,
  className,
}: MeterProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={valueText ?? `${Math.round(clamped)} z ${max}`}
        className={cn('block w-full min-w-6 overflow-hidden rounded-[var(--radius-chip)] bg-[var(--color-surface-2)]', HEIGHT[height])}
      >
        <span
          className={cn('block h-full rounded-[var(--radius-chip)]', TONE[tone], animate && 'bar-grow')}
          style={{ width: `${Math.max(percent > 0 ? 2 : 0, percent)}%` }}
        />
      </span>
      {showValue ? <span className="num shrink-0 text-label text-[var(--color-muted)]">{Math.round(clamped)}</span> : null}
    </span>
  );
}
