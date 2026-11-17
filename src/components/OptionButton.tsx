import type { Ref } from 'react';
import type { QuizOption } from '@/types';
import { CheckIcon } from './Icons';
import { cn } from '@/utils/cn';

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
 * UIP2-03 (FIX-UI §5.3, D12): bez liter A-E (sugerowały test szkolny) i bez podglądu wag `sets`;
 * wskaźnik wyboru to radio-kropka po lewej (zgodnie z `role=radio`), check po prawej po wybraniu.
 * „Nie wiem / pomiń” zostaje w radiogroup (klawiatura, testy), ale jest wizualnie najsłabszy.
 */
export function OptionButton({ option, selected, onSelect, tabIndex, buttonRef, onKeyDown }: OptionButtonProps) {
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
        'group flex w-full items-center gap-3 rounded-[var(--radius-control)] border px-4 text-left',
        'transition-[border-color,background-color,color] duration-[var(--motion-fast)] active:scale-[0.995]',
        skip ? 'min-h-11 py-2' : 'min-h-14 py-3.5',
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
          : skip
            ? 'border-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)]',
      )}
    >
      {!skip ? (
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-[var(--motion-fast)]',
            selected
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
              : 'border-[var(--color-border-strong)] group-hover:border-[var(--color-accent)]',
          )}
          aria-hidden="true"
        >
          {selected ? <span className="h-2 w-2 rounded-full bg-[var(--color-on-accent)]" /> : null}
        </span>
      ) : null}

      <span className={cn('min-w-0 flex-1 leading-snug', skip ? 'text-small' : 'text-body font-medium')}>
        {option.label}
      </span>

      {selected ? <CheckIcon className="h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" /> : null}
    </button>
  );
}
