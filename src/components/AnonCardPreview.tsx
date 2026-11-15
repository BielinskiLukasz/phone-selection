import { strings } from '@/data/strings';
import { Badge } from './Badge';
import {
  BatteryIcon,
  CameraIcon,
  LockIcon,
  ScreenIcon,
  StorageIcon,
  UpdateIcon,
} from './Icons';

const featureIcons = [BatteryIcon, CameraIcon, StorageIcon, UpdateIcon, ScreenIcon];

interface AnonCardPreviewProps {
  rank: number;
  /** Szerokości dekoracyjnych pasków (0-100) — sam ranking liczy etap 2. */
  bars: number[];
  compact?: boolean;
}

/**
 * Wizualna makieta anonimowej karty (UI-SPEC 3.4). Nie zawiera danych telefonu:
 * pula jest pusta, a nazwy i tak nie wolno pokazać przed wyborem.
 */
export function AnonCardPreview({ rank, bars, compact = false }: AnonCardPreviewProps) {
  return (
    <article
      className={`surface group relative flex flex-col gap-3 overflow-hidden ${
        compact ? 'p-4' : 'p-[var(--pad-card)]'
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-[3px] bg-[var(--color-accent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden="true"
      />

      <header className="flex items-baseline justify-between gap-3">
        <h3 className="flex items-baseline gap-2 text-base font-semibold tracking-tight">
          <span className="label-mono">{strings.proposal}</span>
          <span className="num text-2xl leading-none font-bold">#{rank}</span>
        </h3>
        <Badge tone="outline" className="gap-1">
          <LockIcon className="h-3 w-3" />
          {strings.hiddenName}
        </Badge>
      </header>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="label-mono">{strings.matchLabel}</span>
          <span className="num text-sm font-semibold text-[var(--color-accent-ink)]">
            {strings.redacted}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <div
            className="shimmer bar-grow h-full rounded-full bg-[var(--color-accent)] opacity-35"
            style={{ width: `${bars[0] ?? 60}%`, animationDelay: `${rank * 90}ms` }}
          />
        </div>
      </div>

      <div className="flex items-baseline gap-2 border-t border-dashed border-[var(--color-border)] pt-3">
        <span className="label-mono">{strings.priceLabel}</span>
        <span className="num text-lg font-semibold">
          {strings.redacted} <span className="text-xs font-medium">zł</span>
        </span>
        <span className="ml-auto text-[11px] text-[var(--color-muted)]">{strings.priceNote}</span>
      </div>

      <ul className="grid gap-1.5">
        {strings.anonFeatureRows.map((row, index) => {
          const Icon = featureIcons[index] ?? ScreenIcon;
          return (
            <li key={row} className="flex items-center gap-2.5">
              <span className="text-[var(--color-muted)]">
                <Icon className="h-[17px] w-[17px]" />
              </span>
              <span className="w-[42%] shrink-0 truncate text-xs text-[var(--color-muted)]">
                {row}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                <span
                  className="shimmer bar-grow block h-full rounded-full bg-[color-mix(in_srgb,var(--color-muted)_45%,transparent)]"
                  style={{ width: `${bars[index + 1] ?? 50}%`, animationDelay: `${index * 120}ms` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
