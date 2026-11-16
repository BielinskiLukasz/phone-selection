import { useState } from 'react';
import { strings } from '@/data/strings';
import {
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  formatSliderValue,
  sliderLabel,
  type GroupSliderState,
} from '@/features/sliders/sliderModel';
import type { CriterionId, GroupId } from '@/types';
import { CriterionSliders } from './CriterionSliders';
import { cn } from '@/utils/cn';

interface GroupSliderProps {
  state: GroupSliderState;
  /** Wartość zmieniona ręcznie względem wyliczonej z odpowiedzi. */
  modified: boolean;
  onChange: (id: GroupId, value: number) => void;
  onCriterionChange: (id: CriterionId, value: number) => void;
}

const QUICK_VALUES = [0, 1, 2, 3, 4, 5] as const;

/**
 * Suwak ważności grupy 0-5 (E5-01). Ustawia `G_g` wprost — znacznik na torze
 * pokazuje wartość wyliczoną z odpowiedzi, żeby korekta była widoczna.
 */
export function GroupSlider({ state, modified, onChange, onCriterionChange }: GroupSliderProps) {
  const [open, setOpen] = useState(false);
  const fill = (state.value / SLIDER_MAX) * 100;
  const computedFill = (state.computed / SLIDER_MAX) * 100;

  return (
    <section
      className={cn(
        'surface group/slider relative overflow-hidden p-[var(--pad-card)] transition-[border-color,box-shadow] duration-200',
        modified && 'border-[var(--color-accent)]',
      )}
    >
      <header className="flex flex-wrap items-start gap-x-3 gap-y-1">
        <h3 className="text-[17px] leading-tight font-semibold tracking-tight">{state.label}</h3>
        <span className="num shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {state.criteria.length} kryter.
        </span>
        <span className="num ml-auto flex items-baseline gap-1.5">
          <span className="text-2xl leading-none font-bold tabular-nums">
            {formatSliderValue(state.value)}
          </span>
          <span className="text-[11px] text-[var(--color-muted)]">/ 5</span>
          <span
            className={cn(
              'ml-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase',
              modified
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
            )}
          >
            {sliderLabel(state.value)}
          </span>
        </span>
      </header>

      <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted)]">{state.description}</p>

      <div className="relative mt-2">
        <input
          type="range"
          className="range-slider relative z-10"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={state.value}
          style={{ ['--range-fill' as string]: `${fill}%` }}
          aria-label={`${state.label}: ${strings.slidersGroupHint}`}
          aria-valuetext={state.ariaValueText}
          onChange={(event) => onChange(state.id, Number(event.target.value))}
        />
        {/* Znacznik wartości wyliczonej z odpowiedzi */}
        <span
          className="pointer-events-none absolute top-1/2 z-0 h-4 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-text)] opacity-35"
          style={{ left: `calc(${computedFill}% + 6px)` }}
          aria-hidden="true"
          title={`${strings.computedBadge}: ${formatSliderValue(state.computed)}`}
        />
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span className="label-mono mr-1">{strings.slidersGroupHint}</span>
        {QUICK_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(state.id, value)}
            aria-label={`${state.label}: ${value} z 5`}
            aria-pressed={Math.round(state.value) === value && Math.abs(state.value - value) < 0.05}
            className={cn(
              'num h-8 w-8 rounded-[var(--radius-pill)] border text-[11px] font-semibold transition-[background-color,border-color,transform] duration-200 hover:-translate-y-px',
              Math.abs(state.value - value) < 0.05
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]',
            )}
          >
            {value}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="num ml-auto inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-3 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
        >
          {open ? strings.slidersHideDetails : strings.slidersDetails}
          <span className={cn('transition-transform duration-200', open && 'rotate-90')}>▸</span>
        </button>
      </div>

      {open ? (
        <div className="step-in mt-4 border-t border-dashed border-[var(--color-border)] pt-4">
          <CriterionSliders
            criteria={state.criteria}
            shareLabel={strings.slidersShares}
            onChange={onCriterionChange}
          />
        </div>
      ) : null}
    </section>
  );
}
