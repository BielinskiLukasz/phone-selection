import { useState } from 'react';
import { sessionTexts, strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import type { SpecRow } from '@/lib/cardSpecs';
import type { AnonCard, FactKey } from '@/types';
import { DetailsAccordion } from './DetailsAccordion';
import {
  BatteryIcon,
  CameraIcon,
  LockIcon,
  RulerIcon,
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
  dimensions: RulerIcon,
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
const FACTS_COLLAPSED = 4;

export function PhoneCardAnon({ card, specs, alwaysOpenDetails, onSelect }: PhoneCardAnonProps) {
  const { state } = useAppState();
  const [showAllFacts, setShowAllFacts] = useState(false);

  /* E8-05: ciemny motyw to „odczyty techniczne” — wszystkie cechy w tabeli, bez rozwijania. */
  const dense = state.theme === 'dark';
  const visibleFacts = dense || showAllFacts ? card.facts : card.facts.slice(0, FACTS_COLLAPSED);
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
        {card.promoEndsAt || card.regularPricePln ? (
          <span className="num basis-full text-[11px] text-[var(--color-warn)]">
            {sessionTexts.pricePromoAnon(card.promoEndsAt, card.regularPricePln)}
          </span>
        ) : null}
        {card.stretch ? (
          <span
            data-testid="stretch-badge"
            className="num ml-auto rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-accent-ink)] uppercase"
          >
            {sessionTexts.stretchBadge(card.stretch.extraPln, card.stretch.extraPoints)}
          </span>
        ) : card.overBudgetBy ? (
          <span className="num ml-auto rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-warn)] uppercase">
            {sessionTexts.overBudgetBy(card.overBudgetBy)}
          </span>
        ) : null}
        {card.priceUnavailableSince ? (
          <span role="status" className="basis-full text-[11px] leading-relaxed text-[var(--color-warn)]">
            <strong className="font-semibold">{strings.priceUnavailableTitle}.</strong>{' '}
            {sessionTexts.priceUnavailableNote(card.priceUnavailableSince)}
          </span>
        ) : null}
      </div>

      {/* FP3-02: plakietka kompromisu w priorytecie (bez kary punktowej — decyzja użytkownika). */}
      {card.priorityTradeoffs.length > 0 ? (
        <p
          data-testid="tradeoff-badge"
          className="mx-[var(--pad-card)] mt-3 rounded-[var(--radius-card)] border border-[var(--color-warn)] bg-[var(--color-warn-soft)] px-3 py-2 text-[12px] leading-relaxed text-[var(--color-warn)]"
        >
          <strong className="font-semibold">{strings.tradeoffLabel}:</strong> {sessionTexts.tradeoffNote(card.priorityTradeoffs)}
        </p>
      ) : null}

      {/* Cechy: jasny motyw pokazuje 4 od razu i pozwala rozwinąć, ciemny — wszystkie w tabeli (UI-SPEC 6) */}
      {dense ? (
        <dl className="grid gap-px bg-[var(--color-border)]">
          {card.facts.map((fact) => (
            <div
              key={fact.key}
              className="grid grid-cols-[36%_minmax(0,1fr)] items-baseline gap-2 bg-[var(--color-surface)] px-[var(--pad-card)] py-1.5 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
            >
              <dt className="label-mono truncate">{fact.label}</dt>
              <dd
                className={cn(
                  'num text-[11.5px] leading-snug break-words',
                  fact.missing && 'text-[var(--color-muted)] italic',
                )}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <>
          <ul className="grid gap-px bg-[var(--color-border)]">
            {visibleFacts.map((fact) => {
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

          {card.facts.length > FACTS_COLLAPSED ? (
            <button
              type="button"
              onClick={() => setShowAllFacts((current) => !current)}
              aria-expanded={showAllFacts}
              className="num flex min-h-11 w-full items-center gap-2 border-t border-[var(--color-border)] px-[var(--pad-card)] text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-accent-ink)]"
            >
              {showAllFacts
                ? strings.cardsHideFacts
                : `${strings.cardsShowAllFacts} (${card.facts.length})`}
              <span
                className={cn('ml-auto transition-transform duration-200', showAllFacts && 'rotate-180')}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
          ) : null}
        </>
      )}

      <DetailsAccordion card={card} specs={specs} alwaysOpen={alwaysOpenDetails} />

      <div className="mt-auto p-[var(--pad-card)] pt-4">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-bg)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-accent)] hover:text-[var(--color-on-accent)] active:scale-[0.98]"
        >
          <LockIcon className="h-4 w-4" />
          {strings.cardsChoose}
        </button>
      </div>
    </article>
  );
}
