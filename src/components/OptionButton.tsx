import type { Ref } from 'react';
import type { QuizOption } from '@/types';
import { CheckIcon } from './Icons';
import { cn } from '@/utils/cn';

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

interface OptionButtonProps {
  option: QuizOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
  /** Roving tabindex w radiogroup (UI-SPEC 8). */
  tabIndex: number;
  buttonRef?: Ref<HTMLButtonElement>;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * Odpowiedź jako duży przycisk jednokrotnego wyboru (E4-02).
 * „Nie wiem / pomiń” jest wizualnie słabszy (UI-SPEC 3.2).
 */
export function OptionButton({
  option,
  index,
  selected,
  onSelect,
  tabIndex,
  buttonRef,
  onKeyDown,
}: OptionButtonProps) {
  const skip = option.skip === true;

  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={cn(
        'group flex w-full items-center gap-3 rounded-[var(--radius-card)] px-4 text-left transition-[border-color,background-color,transform] duration-200 sm:gap-4',
        skip ? 'min-h-12 border border-dashed py-2.5' : 'min-h-14 border py-3.5',
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
          : skip
            ? 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-px hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]',
        'active:scale-[0.995]',
      )}
    >
      <span
        className={cn(
          'num flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-200',
          selected
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]'
            : skip
              ? 'border-[var(--color-border-strong)] text-[var(--color-border-strong)]'
              : 'border-[var(--color-border-strong)] text-[var(--color-muted)] group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent-ink)]',
        )}
        aria-hidden="true"
      >
        {selected ? <CheckIcon className="h-3.5 w-3.5" /> : (LETTERS[index] ?? index + 1)}
      </span>

      <span
        className={cn(
          'min-w-0 flex-1 leading-snug',
          skip ? 'text-sm text-[var(--color-muted)]' : 'text-[15px] font-medium sm:text-base',
          selected && 'text-[var(--color-accent-ink)]',
        )}
      >
        {option.label}
      </span>

      {!skip && option.sets ? (
        <span className="num hidden shrink-0 text-[10px] tracking-[0.12em] text-[var(--color-border-strong)] uppercase transition-colors duration-200 group-hover:text-[var(--color-muted)] lg:block">
          {Object.entries(option.sets)
            .map(([criterion, value]) => `${criterion} ${value}`)
            .join(' · ')}
        </span>
      ) : null}
    </button>
  );
}
