import {
  SLIDER_MAX,
  SLIDER_MIN,
  SLIDER_STEP,
  formatSliderValue,
} from '@/features/sliders/sliderModel';
import type { CriterionSliderState } from '@/features/sliders/sliderModel';
import type { CriterionId } from '@/types';

interface CriterionSlidersProps {
  criteria: readonly CriterionSliderState[];
  shareLabel: string;
  onChange: (id: CriterionId, value: number) => void;
}

/**
 * Suwaki kryteriów w grupie (E5-02) — ustawiają udziały `w_c`, czyli to,
 * jak bardzo kryterium liczy się **wewnątrz swojej grupy**.
 */
export function CriterionSliders({ criteria, shareLabel, onChange }: CriterionSlidersProps) {
  return (
    <ul className="grid gap-3">
      {criteria.map((criterion) => {
        const fill = (criterion.value / SLIDER_MAX) * 100;
        return (
          <li key={criterion.id} className="grid gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">{criterion.label}</span>
              <span className="num text-[11px] text-[var(--color-muted)]">
                {formatSliderValue(criterion.value)} z 5
              </span>
              <span className="num ml-auto flex items-center gap-1.5 text-[11px] text-[var(--color-muted)]">
                {shareLabel}
                <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                  <span
                    className="block h-full rounded-full bg-[var(--color-accent)] opacity-70 transition-[width] duration-200"
                    style={{ width: `${Math.min(100, criterion.share * 100)}%` }}
                  />
                </span>
                <span className="tabular-nums">{Math.round(criterion.share * 100)}%</span>
              </span>
            </div>

            <input
              type="range"
              className="range-slider"
              min={SLIDER_MIN}
              max={SLIDER_MAX}
              step={SLIDER_STEP}
              value={criterion.value}
              style={{ ['--range-fill' as string]: `${fill}%` }}
              aria-label={criterion.label}
              aria-valuetext={criterion.ariaValueText}
              onChange={(event) => onChange(criterion.id, Number(event.target.value))}
            />
          </li>
        );
      })}
    </ul>
  );
}
