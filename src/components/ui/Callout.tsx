import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * UIP1-02 · jeden wzorzec komunikatu (FIX-UI §4, §5.5): stare ceny, mało w budżecie, wykluczenia,
 * brak zapisu, pula 0. Zastępuje sześć różnych banerów. Semantyka przez `role` (status/alert).
 */
export type CalloutTone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger' | 'info';

interface CalloutProps {
  tone?: CalloutTone;
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  role?: 'status' | 'alert' | 'note';
  className?: string;
  children?: ReactNode;
}

const TONE: Record<CalloutTone, string> = {
  neutral: 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]',
  accent: 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]',
  ok: 'border-[var(--color-ok)] bg-[var(--color-ok-soft)] text-[var(--color-ok)]',
  warn: 'border-[var(--color-warn)] bg-[var(--color-warn-soft)] text-[var(--color-warn)]',
  danger: 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
  info: 'border-[var(--color-info)] bg-[var(--color-info-soft)] text-[var(--color-info)]',
};

export function Callout({ tone = 'neutral', title, icon, action, role, className, children }: CalloutProps) {
  return (
    <div
      role={role === 'note' ? undefined : role}
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-small leading-relaxed',
        TONE[tone],
        className,
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-0.5')}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}
