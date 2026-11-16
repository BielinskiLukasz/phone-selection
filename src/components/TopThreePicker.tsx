import { useState } from 'react';
import { GROUPS } from '@/data/criteria';
import { groupImportance } from '@/lib/weights';
import type { GroupId, TopThreeAnswer, Weights } from '@/types';
import { cn } from '@/utils/cn';

interface TopThreePickerProps {
  picks: GroupId[];
  weights: Weights;
  onToggle: (id: GroupId) => void;
}

/**
 * Krok G1 „Trzy najważniejsze rzeczy” (E4-05, UI-SPEC 3.2).
 * Dotknięcie dodaje kafelek do trójki z numerem 1-3, ponowne dotknięcie zdejmuje
 * i przelicza numerację. Obok pokazujemy ważność grupy, którą ten wybór ustawia.
 */
export function TopThreePicker({ picks, weights, onToggle }: TopThreePickerProps) {
  const [blocked, setBlocked] = useState<GroupId | null>(null);

  const importance = groupImportance(
    weights,
    picks.length === 3 ? ({ picks: picks as [GroupId, GroupId, GroupId] } satisfies TopThreeAnswer) : null,
  );

  function handleToggle(id: GroupId) {
    if (!picks.includes(id) && picks.length >= 3) {
      setBlocked(id);
      window.setTimeout(() => setBlocked(null), 1200);
      return;
    }
    setBlocked(null);
    onToggle(id);
  }

  return (
    <div>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {GROUPS.map((group) => {
          const position = picks.indexOf(group.id);
          const picked = position >= 0;
          const value = importance[group.id] ?? 0;

          return (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => handleToggle(group.id)}
                aria-pressed={picked}
                className={cn(
                  'group relative flex h-full w-full flex-col gap-2 rounded-[var(--radius-card)] border p-4 text-left transition-[border-color,background-color,transform] duration-200',
                  picked
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-px hover:border-[var(--color-accent)]',
                  blocked === group.id && 'animate-[shake_240ms_ease-in-out]',
                )}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      'num flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-200',
                      picked
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]'
                        : 'border-[var(--color-border-strong)] text-[var(--color-muted)]',
                    )}
                    aria-hidden="true"
                  >
                    {picked ? position + 1 : '·'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-tight font-semibold tracking-tight">
                      {group.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)]">
                      {group.description}
                    </span>
                  </span>
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                    <span
                      className="bar-grow block h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
                      style={{ width: `${Math.min(100, (value / 5) * 100)}%` }}
                    />
                  </span>
                  <span className="num shrink-0 text-[11px] font-semibold text-[var(--color-muted)]">
                    {value.toFixed(1).replace('.', ',')}
                    <span className="text-[10px] font-normal"> / 5</span>
                  </span>
                  <span className="num shrink-0 text-[10px] tracking-[0.1em] text-[var(--color-border-strong)] uppercase">
                    {group.criteria.length} kryter.
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p aria-live="polite" className="num mt-3 min-h-5 text-[11px] tracking-[0.08em] text-[var(--color-warn)] uppercase">
        {blocked ? 'Wybrano już trzy — odznacz jedną, żeby dodać inną' : ''}
      </p>
    </div>
  );
}
