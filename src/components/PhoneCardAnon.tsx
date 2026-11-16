import { sessionTexts, strings } from '@/data/strings';
import type { SpecRow } from '@/lib/cardSpecs';
import type { AnonCard, FactKey } from '@/types';
import { DetailsAccordion } from './DetailsAccordion';
import {
  BatteryIcon,
  CameraIcon,
  LockIcon,
  ScreenIcon,
  ShieldIcon,
  StorageIcon,
  UpdateIcon,
} from './Icons';
import { cn } from '@/utils/cn';

const FACT_ICONS: Record<FactKey, typeof BatteryIcon> = {
  battery: BatteryIcon,
  camera: CameraIcon,
  storage: StorageIcon,
  updates: UpdateIcon,
  durability: ShieldIcon,
  displayPerformance: ScreenIcon,
};

interface PhoneCardAnonProps {
  card: AnonCard;
  specs: SpecRow[];
  alwaysOpenDetails: boolean;
  onSelect: () => void;
}

/**
 * Anonimowa karta propozycji (E6-02, E6-04; UI-SPEC 3.4 i 4).
 * Nie dostaje obiektu `Phone` — tylko zanonimizowane dane z `lib/anonymize`.
 */
export function PhoneCardAnon({ card, specs, alwaysOpenDetails, onSelect }: PhoneCardAnonProps) {
  const first = card.place === 1;

  return (
    <article
      className={cn(
        'surface group relative flex flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1',
        first && 'border-[var(--color-accent)]',
      )}
    >
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-[3px] transition-opacity duration-200',
          first ? 'bg-[var(--color-accent)] opacity-100' : 'bg-[var(--color-border-strong)] opacity-0 group-hover:opacity-60',
        )}
        aria-hidden="true"
      />

      <header className="flex flex-wrap items-start gap-2 p-[var(--pad-card)] pb-3">
        <h2 className="flex items-baseline gap-2">
          <span className="label-mono">{strings.proposal}</span>
          <span className="num text-[34px] leading-none font-bold tracking-[-0.04em]">
            #{card.place}
          </span>
        </h2>

        <span className="ml-auto flex flex-col items-end gap-1.5">
          {card.practicalTieWithPlace ? (
            <span className="num rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] px-2.5 py-1 text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
              {sessionTexts.practicalTie(card.practicalTieWithPlace)}
            </span>
          ) : null}
          {first ? (
            <span className="num flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] tracking-[0.1em] text-[var(--color-accent-ink)] uppercase">
              <LockIcon className="h-3 w-3" />
              {strings.hiddenName}
            </span>
          ) : null}
        </span>
      </header>

      {/* Dopasowanie */}
      <div className="px-[var(--pad-card)]">
        <div className="flex items-end gap-3">
          <span className="label-mono pb-1">{strings.cardsMatch}</span>
          <span className="num ml-auto text-[40px] leading-none font-bold tracking-[-0.05em] tabular-nums">
            {card.matchPercent}
            <span className="text-lg font-semibold text-[var(--color-muted)]">%</span>
          </span>
        </div>
        <span className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <span
            className="bar-grow block h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${Math.min(100, card.matchPercent)}%` }}
          />
        </span>
        <p className="num mt-1.5 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {card.matchLabel}
          {card.matchRescaledPercent ? ` · ${card.matchRescaledPercent}% najlepszego` : ''}
        </p>
      </div>

      {/* Cena */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-dashed border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="num text-2xl font-bold tracking-tight tabular-nums">
          {Math.round(card.pricePln)} <span className="text-sm font-semibold">zł</span>
        </span>
        <span className="text-[11px] text-[var(--color-muted)]">
          {sessionTexts.priceWithDate(card.priceCheckedAt)}
        </span>
        {card.overBudgetBy ? (
          <span className="num ml-auto rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-warn)] uppercase">
            {sessionTexts.overBudgetBy(card.overBudgetBy)}
          </span>
        ) : null}
      </div>

      {/* Sześć wierszy cech w stałej kolejności */}
      <ul className="grid gap-px bg-[var(--color-border)]">
        {card.facts.map((fact) => {
          const Icon = FACT_ICONS[fact.key];
          return (
            <li
              key={fact.key}
              className="flex items-start gap-3 bg-[var(--color-surface)] px-[var(--pad-card)] py-2.5 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
            >
              <span className="mt-0.5 shrink-0 text-[var(--color-muted)]">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="grid min-w-0 gap-0.5">
                <span className="label-mono">{fact.label}</span>
                <span
                  className={cn(
                    'num text-[12px] leading-relaxed break-words',
                    fact.missing && 'text-[var(--color-muted)] italic',
                  )}
                >
                  {fact.value}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <DetailsAccordion card={card} specs={specs} alwaysOpen={alwaysOpenDetails} />

      <div className="mt-auto p-[var(--pad-card)] pt-4">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-bg)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-accent)] hover:text-white active:scale-[0.98]"
        >
          <LockIcon className="h-4 w-4" />
          {strings.cardsChoose}
        </button>
      </div>
    </article>
  );
}
