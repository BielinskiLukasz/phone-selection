import { useState } from 'react';
import { sessionTexts, strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import type { SpecRow } from '@/lib/cardSpecs';
import type { AnonCard, FactKey } from '@/types';
import { DetailsAccordion } from './DetailsAccordion';
import { Button, Callout, Chip, Meter } from './ui';
import {
  BatteryIcon,
  CameraIcon,
  ExpandIcon,
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
        'surface group relative flex flex-col overflow-hidden transition-[border-color] duration-[var(--motion-fast)] hover:border-[var(--color-accent)] focus-within:border-[var(--color-accent)]',
        first && 'border-[var(--color-accent)]',
      )}
    >
      {/* UIP2-04 (FIX-UI §5.5, D4): hierarchia cena → dopasowanie → cechy; miejsce jako plakietka, nie 34 px. */}
      <header className="flex flex-wrap items-center gap-2 p-[var(--pad-card)] pb-3">
        <h2 className="flex flex-wrap items-center gap-2">
          <Chip tone={first ? 'accent' : 'neutral'}>
            <span className="num">#{card.place}</span>
          </Chip>
          <span className="sr-only">
            {strings.proposal} #{card.place}
          </span>
          {first ? <Chip tone="ok">{strings.cardsBestMatch}</Chip> : null}
        </h2>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          {card.practicalTieWithPlace ? (
            <Chip tone="neutral" title={sessionTexts.practicalTie(card.practicalTieWithPlace)}>
              {sessionTexts.practicalTie(card.practicalTieWithPlace)}
            </Chip>
          ) : null}
          {first ? (
            <Chip tone="neutral" icon={<LockIcon />}>
              {strings.hiddenName}
            </Chip>
          ) : null}
        </span>
      </header>

      {/* Cena — największa liczba na karcie; dopasowanie jako mniejsza liczba + pasek (FIX-UI §5.5) */}
      <div className="grid gap-3 px-[var(--pad-card)] pb-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <p className="num text-price text-[var(--color-text)]" aria-label={`${Math.round(card.pricePln)} zł`}>
            {Math.round(card.pricePln)} <span className="text-small font-semibold text-[var(--color-muted)]">zł</span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-[var(--color-muted)]">
            <span>{sessionTexts.priceWithDate(card.priceCheckedAt)}</span>
            {card.stretch ? (
              <Chip tone="accent" size="sm" className="num" title={sessionTexts.stretchBadge(card.stretch.extraPln, card.stretch.extraPoints)}>
                <span data-testid="stretch-badge">{sessionTexts.stretchBadge(card.stretch.extraPln, card.stretch.extraPoints)}</span>
              </Chip>
            ) : card.overBudgetBy ? (
              <Chip tone="warn" size="sm">
                {sessionTexts.overBudgetBy(card.overBudgetBy)}
              </Chip>
            ) : (
              <Chip tone="ok" size="sm">
                {strings.cardsInBudget}
              </Chip>
            )}
          </p>
          {card.promoEndsAt || card.regularPricePln ? (
            <p className="num mt-1 text-small text-[var(--color-warn)]">
              {sessionTexts.pricePromoAnon(card.promoEndsAt, card.regularPricePln)}
            </p>
          ) : null}
        </div>
        <div className="min-w-[9rem] sm:text-right" title={strings.matchTooltip}>
          <p className="flex items-baseline gap-1.5 sm:justify-end">
            <span className="label">{strings.cardsMatch}</span>
            <span className="num text-h3 text-[var(--color-text)]">{card.matchPercent}%</span>
          </p>
          <Meter
            value={card.matchPercent}
            label={strings.cardsMatch}
            valueText={`${card.matchPercent}% — ${card.matchLabel}`}
            height="md"
            className="mt-1.5"
          />
          <p className="mt-1 text-small text-[var(--color-muted)]">{card.matchLabel}</p>
        </div>
        {card.priceUnavailableSince ? (
          <Callout tone="warn" role="status" title={strings.priceUnavailableTitle} className="sm:col-span-2">
            {sessionTexts.priceUnavailableNote(card.priceUnavailableSince, card.currentMarketPricePln)}
          </Callout>
        ) : null}
      </div>

      {/* FP3-02: plakietka kompromisu w priorytecie (bez kary punktowej — decyzja użytkownika). */}
      {card.priorityTradeoffs.length > 0 ? (
        <div className="px-[var(--pad-card)] pb-3" data-testid="tradeoff-badge">
          <Callout tone="warn" title={strings.tradeoffLabel}>
            {sessionTexts.tradeoffNote(card.priorityTradeoffs)}
          </Callout>
        </div>
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
                  'num text-small leading-snug break-words',
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
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <span className="label-mono">{fact.label}</span>
                    <span
                      className={cn(
                        'num text-small break-words text-[var(--color-text)]',
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
            <div className="border-t border-[var(--color-border)] px-[var(--pad-card)] py-1">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowAllFacts((current) => !current)}
                aria-expanded={showAllFacts}
                iconRight={<ExpandIcon className={cn('transition-transform duration-[var(--motion-fast)]', showAllFacts && 'rotate-180')} />}
                className="justify-between px-2"
              >
                {showAllFacts ? strings.cardsHideFacts : `${strings.cardsShowAllFacts} (${card.facts.length})`}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <DetailsAccordion card={card} specs={specs} alwaysOpen={alwaysOpenDetails} />

      <div className="mt-auto p-[var(--pad-card)] pt-4">
        <Button variant="primary" size="lg" fullWidth onClick={onSelect} icon={<LockIcon />}>
          {strings.cardsChoose}
        </Button>
      </div>
    </article>
  );
}
