import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * UIP1-01 · plakietka (FIX-UI §4): „#1”, „Powyżej budżetu”, „Wybór 1/2”, „Wykluczony”.
 * Zawsze z tekstem (kolor nigdy sam, FIX-UI §7). Liczby renderuj z klasą `num` w treści.
 */
export type ChipTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

interface ChipProps {
  tone?: ChipTone;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
  title?: string;
}

const TONE: Record<ChipTone, string> = {
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] border-transparent',
  ok: 'bg-[var(--color-ok-soft)] text-[var(--color-ok)] border-transparent',
  warn: 'bg-[var(--color-warn-soft)] text-[var(--color-warn)] border-transparent',
  danger: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-transparent',
  info: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-transparent',
};

export function Chip({ tone = 'neutral', size = 'md', icon, className, children, title }: ChipProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-chip)] border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-label' : 'px-2.5 py-1 text-label',
        TONE[tone],
        className,
      )}
    >
      {icon ? <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3" aria-hidden="true">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
