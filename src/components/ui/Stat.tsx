import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * UIP1-02 · liczba z etykietą (FIX-UI §4): cena, dopasowanie, „pytanie 7 z 16”, „W budżecie: 12 z 15”.
 * Liczba w `num` (tabular-nums); rozmiar z tokenów `--text-*`, bez literałów px.
 */
interface StatProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  hint?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'end';
  className?: string;
}

const SIZE = { sm: 'text-h3', md: 'text-h2', lg: 'text-price' } as const;

export function Stat({ label, value, unit, hint, size = 'md', align = 'start', className }: StatProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', align === 'end' && 'items-end text-right', className)}>
      <span className="label">{label}</span>
      <span className={cn('num tabular-nums text-[var(--color-text)]', SIZE[size])}>
        {value}
        {unit ? <span className="ml-1 text-small font-semibold text-[var(--color-muted)]">{unit}</span> : null}
      </span>
      {hint ? <span className="text-small text-[var(--color-muted)]">{hint}</span> : null}
    </div>
  );
}
