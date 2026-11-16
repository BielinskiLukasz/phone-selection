import { quizBlocks } from '@/data/strings';
import type { QuizBlock } from '@/types';
import { BLOCK_ORDER } from '@/features/quiz/quizFlow';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  answered: number;
  total: number;
  block: QuizBlock | null;
  /** Kroki zakończone: podsumowanie albo G1. */
  stage?: 'questions' | 'top-three' | 'summary';
}

/** Pasek postępu z podziałem na bloki i licznikiem (E4-03, UI-SPEC 3.2). */
export function ProgressBar({ answered, total, block, stage = 'questions' }: ProgressBarProps) {
  const percent = total > 0 ? Math.min(100, (answered / total) * 100) : 0;
  const activeIndex = block ? BLOCK_ORDER.indexOf(block) : -1;

  const valueText =
    stage === 'summary'
      ? 'podsumowanie odpowiedzi'
      : stage === 'top-three'
        ? 'trzy najważniejsze rzeczy'
        : `pytanie ${Math.min(answered + 1, total)} z ${total}`;

  return (
    <div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-valuetext={valueText}
        aria-label={valueText}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-accent)] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
        {stage !== 'questions' ? (
          <div className="absolute inset-0 rounded-full bg-[var(--color-accent)] opacity-25 breathe" />
        ) : null}
      </div>

      <ol className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {BLOCK_ORDER.map((id, index) => {
          const done = activeIndex > index || stage !== 'questions';
          const active = activeIndex === index && stage === 'questions';
          return (
            <li
              key={id}
              title={quizBlocks[id].title}
              className={cn(
                'num flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2 py-1 text-[10px] tracking-[0.1em] uppercase transition-colors duration-200',
                active && 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]',
                done && !active && 'border-[var(--color-border)] text-[var(--color-muted)]',
                !done && !active && 'border-transparent text-[var(--color-border-strong)]',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors duration-200',
                  active || done ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border-strong)]',
                )}
              />
              <span className="hidden sm:inline">{quizBlocks[id].title.split(' ')[0]}</span>
              <span className="sm:hidden">{index + 1}</span>
            </li>
          );
        })}
        <li className="num ml-auto shrink-0 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {answered} / {total}
        </li>
      </ol>
    </div>
  );
}
