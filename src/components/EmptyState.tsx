import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  note?: string;
  action?: ReactNode;
  compact?: boolean;
}

/** Pusty stan ekranu (UI-SPEC 3.1, 3.7). */
export function EmptyState({ icon, title, note, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`surface flex flex-col items-start gap-3 ${
        compact ? 'p-4' : 'p-[var(--pad-card)]'
      }`}
    >
      {icon ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-surface-2)] text-[var(--color-muted)]">
          {icon}
        </span>
      ) : null}
      <h2 className="text-lg font-semibold tracking-tight text-balance">{title}</h2>
      {note ? (
        <p className="max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">{note}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
