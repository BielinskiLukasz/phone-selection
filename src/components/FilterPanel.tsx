import { sessionTexts, strings } from '@/data/strings';
import type { Filters } from '@/types';
import { cn } from '@/utils/cn';

interface FilterPanelProps {
  filters: Filters;
  total: number;
  matches: number;
  inBudget: number;
  excludedCount?: number;
  onBudget: (value: number, stretch?: number | null) => void;
  onStorage: (value: number | null) => void;
  onMicroSd: (value: boolean) => void;
  onOpenExclusions?: () => void;
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
  excludedCount = 0,
  onBudget,
  onStorage,
  onMicroSd,
  onOpenExclusions,
}: FilterPanelProps) {
  const overBudgetMessage = sessionTexts.overBudgetMessage(inBudget);
  const fewRemaining = matches > 0 && matches < 3 && excludedCount > 0;

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
                checked={filters.budgetMax === value && !filters.budgetStretch}
                onChange={() => onBudget(value, null)}
              />
            ))}
            {/* FP3-05: budżet elastyczny — 2 karty ≤ 1500 zł + 1 karta ≤ 1800 zł z plakietką dopłaty. */}
            <Segment
              name="filtr-budzet"
              label={strings.budgetFlexible}
              checked={filters.budgetMax === 1500 && filters.budgetStretch === 1800}
              onChange={() => onBudget(1500, 1800)}
            />
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
          <span className="label">{strings.filtersCounterLabel}</span>
          {/* FP3-06: licznik mówi, ile telefonów faktycznie mieści się w budżecie (nie zawsze 15/15). */}
          <p className="num mt-1 text-h2 text-[var(--color-text)]">
            {inBudget}
            <span className="text-small font-medium text-[var(--color-muted)]"> / {total}</span>
          </p>
          <p className="mt-1.5 text-small text-[var(--color-muted)]">
            {sessionTexts.inBudgetCount(inBudget, filters.budgetMax, total)}
          </p>
          <p className="text-small text-[var(--color-muted)]">{sessionTexts.poolMatches(matches, total)}</p>
        </div>
      </div>

      {/* E11-07: wiersz „Wykluczenia” otwierający okno wyboru marek i modeli */}
      {onOpenExclusions ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-[var(--pad-card)] py-3">
          <div className="min-w-0 flex-1">
            <span className="label-mono">{strings.excludeFilterLabel}</span>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              {excludedCount > 0
                ? sessionTexts.filterExcludedCount(excludedCount)
                : strings.excludeFilterNone}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenExclusions}
            className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-medium transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
          >
            {excludedCount > 0 ? strings.excludeChange : strings.excludeFilterOpen}
          </button>
        </div>
      ) : null}

      {matches === 0 || fewRemaining || overBudgetMessage ? (
        <div className="grid gap-2 border-t border-[var(--color-border)] px-[var(--pad-card)] py-3">
          {matches === 0 ? (
            <p className="text-sm text-[var(--color-warn)]">{strings.noPhonesMatch}</p>
          ) : null}
          {fewRemaining ? (
            <p className="text-xs text-[var(--color-warn)]">
              {sessionTexts.excludeFewWarning(matches)}
            </p>
          ) : null}
          {overBudgetMessage ? (
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">{overBudgetMessage}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
