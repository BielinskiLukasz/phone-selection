import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'neutral' | 'accent' | 'warn' | 'ok' | 'outline';

const tones: Record<Tone, string> = {
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]',
  warn: 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]',
  ok: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]',
  outline: 'border border-[var(--color-border)] text-[var(--color-muted)]',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** Etykieta techniczna: mono, małe kapitaliki (motyw ciemny lubi je wszędzie). */
  mono?: boolean;
}

export function Badge({ children, tone = 'neutral', className, mono = true }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] leading-none font-medium',
        mono && 'num uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
