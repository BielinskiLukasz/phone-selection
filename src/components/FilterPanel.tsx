import { sessionTexts, strings } from '@/data/strings';
import type { Filters } from '@/types';
import { cn } from '@/utils/cn';

interface FilterPanelProps {
  filters: Filters;
  total: number;
  matches: number;
  inBudget: number;
  onBudget: (value: number) => void;
  onStorage: (value: number | null) => void;
  onMicroSd: (value: boolean) => void;
}

const BUDGETS = [1500, 1800, 2000] as const;

function Segment({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        'relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border px-4 text-sm transition-[border-color,background-color,transform] duration-200 hover:-translate-y-px',
        checked
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)]',
      )}
    >
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={cn(
          'h-3.5 w-3.5 shrink-0 rounded-full border transition-colors duration-200',
          checked ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border-strong)]',
        )}
        aria-hidden="true"
      />
      {label}
    </label>
  );
}

/** Filtry twarde: budżet, pamięć, microSD + licznik puli na żywo (E5-03, E5-04). */
export function FilterPanel({
  filters,
  total,
  matches,
  inBudget,
  onBudget,
  onStorage,
  onMicroSd,
}: FilterPanelProps) {
  const overBudgetMessage = sessionTexts.overBudgetMessage(inBudget);

  return (
    <section className="surface overflow-hidden p-0" aria-labelledby="filtry-naglowek">
      <header className="flex flex-wrap items-baseline gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <h2 id="filtry-naglowek" className="label-mono">
          {strings.filtersTitle}
        </h2>
        <span className="text-[11px] text-[var(--color-muted)]">{strings.filtersNote}</span>
      </header>

      <div className="grid gap-5 p-[var(--pad-card)] sm:grid-cols-2">
        <fieldset>
          <legend className="label-mono">{strings.budgetLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {BUDGETS.map((value) => (
              <Segment
                key={value}
                name="filtr-budzet"
                label={`do ${value} zł`}
                checked={filters.budgetMax === value}
                onChange={() => onBudget(value)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label-mono">{strings.storageLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Segment
              name="filtr-pamiec"
              label={strings.storageAny}
              checked={typeof filters.minStorageGb !== 'number'}
              onChange={() => onStorage(null)}
            />
            <Segment
              name="filtr-pamiec"
              label={strings.storage256}
              checked={filters.minStorageGb === 256}
              onChange={() => onStorage(256)}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="label-mono">{strings.microSdLabel}</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Segment
              name="filtr-microsd"
              label={strings.microSdAny}
              checked={filters.requireMicroSd !== true}
              onChange={() => onMicroSd(false)}
            />
            <Segment
              name="filtr-microsd"
              label={strings.microSdRequired}
              checked={filters.requireMicroSd === true}
              onChange={() => onMicroSd(true)}
            />
          </div>
        </fieldset>

        {/* Licznik na żywo (E5-04) */}
        <div
          aria-live="polite"
          className="flex flex-col justify-center rounded-[var(--radius-card)] bg-[var(--color-surface-2)] px-4 py-3"
        >
          <span className="label-mono">pula po filtrach</span>
          <p className="num mt-1 text-3xl leading-none font-bold tracking-tight">
            {matches}
            <span className="text-base font-medium text-[var(--color-muted)]"> / {total}</span>
          </p>
          <p className="mt-1.5 text-xs text-[var(--color-muted)]">
            {sessionTexts.poolMatches(matches, total)}
          </p>
        </div>
      </div>

      {matches === 0 || overBudgetMessage ? (
        <div className="grid gap-2 border-t border-[var(--color-border)] px-[var(--pad-card)] py-3">
          {matches === 0 ? (
            <p className="text-sm text-[var(--color-warn)]">{strings.noPhonesMatch}</p>
          ) : null}
          {overBudgetMessage ? (
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">{overBudgetMessage}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
