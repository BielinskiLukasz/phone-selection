import { useEffect, useMemo, useRef, useState } from 'react';
import { PHONES, phoneById } from '@/data/phones';
import { formatDate, priceFreshness } from '@/data/pool';
import { sessionTexts, strings } from '@/data/strings';
import type { Session } from '@/types/state';
import { useAppState } from '@/features/state/StateProvider';
import { useReveal } from '@/features/sessions/useReveal';
import { toAnonCardsFromSnapshot } from '@/lib/anonymize';
import { specRows } from '@/lib/cardSpecs';
import type { ExclusionSelection } from '@/lib/exclusions';
import { PhoneCardAnon } from '@/components/PhoneCardAnon';
import { PhoneCardRevealed } from '@/components/PhoneCardRevealed';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { ExclusionSheet } from '@/components/ExclusionSheet';
import { Toast } from '@/components/Toast';
import { Reveal } from '@/components/Reveal';
import { Badge } from '@/components/Badge';
import { RouteChip } from '@/components/RouteChip';
import { AlertIcon, ArrowRightIcon, HistoryIcon, ListIcon, SlidersIcon } from '@/components/Icons';
import { Button } from '@/components/ui';

const SPEC_LABELS = {
  display: strings.cardsSpecDisplay,
  performance: strings.cardsSpecPerformance,
  battery: strings.cardsSpecBattery,
  charging: strings.cardsSpecCharging,
  charger: strings.cardsSpecCharger,
  weight: strings.cardsSpecWeight,
  storage: strings.cardsSpecStorage,
  updates: strings.cardsSpecUpdates,
  durability: strings.cardsSpecDurability,
  connectivity: strings.cardsSpecConnectivity,
};

interface CardsScreenProps {
  session: Session;
}

/**
 * Ekran trzech kart (E6-01…E6-09): anonimowe propozycje, potwierdzenie wyboru,
 * ujawnienie nazwy i linków, wielokrotny wybór z numeracją „Wybór n/m”.
 */
export function CardsScreen({ session }: CardsScreenProps) {
  const { dispatch, startSession, state } = useAppState();
  const reveal = useReveal(session);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [pending, setPending] = useState<string | null>(null);
  const [exclusionsOpen, setExclusionsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const snapshot = session.ranking;
  const cards = useMemo(
    () =>
      snapshot
        ? toAnonCardsFromSnapshot(PHONES, snapshot, session.filters.budgetMax, {
            priorityGroups: session.topThree?.picks ?? null,
            weights: session.weights,
          })
        : [],
    [snapshot, session.filters.budgetMax, session.topThree, session.weights],
  );
  const specsByCard = useMemo(
    () =>
      cards.map((card) => {
        const phone = phoneById(card.phoneId);
        return phone ? specRows(phone, SPEC_LABELS, PHONES) : [];
      }),
    [cards],
  );

  const freshness = useMemo(
    () => priceFreshness(PHONES.map((phone) => phone.price.checkedAt)),
    [],
  );

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [session.id]);

  const pendingCard = cards.find((card) => card.phoneId === pending) ?? null;
  const answersView = session.mode === 'sliders' ? 'sliders' : session.mode === 'hybrid' ? 'tune' : 'quiz';
  const fewInBudget = snapshot !== null && snapshot.inBudgetCount < 3 && cards.length === 3;
  const excludedCount = snapshot
    ? (snapshot.excludedCount ??
      snapshot.entries.filter(
        (entry) => entry.excluded === 'brand' || entry.excluded === 'model',
      ).length)
    : 0;

  function confirmPick() {
    if (!pending) return;
    dispatch({ type: 'session/pick', sessionId: session.id, phoneId: pending });
    setToast(strings.cardsToastRevealed);
    setPending(null);
  }

  function saveExclusions(next: ExclusionSelection) {
    /* E11-08: `session/exclusions` nie przelicza ocen — tylko wybiera karty z `entries`. */
    dispatch({
      type: 'session/exclusions',
      sessionId: session.id,
      excludedBrands: next.excludedBrands,
      excludedPhoneIds: next.excludedPhoneIds,
      step: 'done',
    });
    setExclusionsOpen(false);
    setToast(strings.excludeToastUpdated);
  }

  function startOver() {
    const id = startSession(session.mode);
    window.location.hash = `#/s/${id}/exclude`;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:pt-10 lg:max-w-6xl">
      <div className="flex flex-wrap items-center gap-2">
        <RouteChip hash={`#/s/${session.id}/cards`} tone="active" />
        <Badge tone="outline">
          {session.mode === 'quiz'
            ? strings.quiz
            : session.mode === 'sliders'
              ? strings.sliders
              : strings.quizAndSliders}
        </Badge>
        {reveal.total > 0 ? (
          <Badge tone="accent">
            {strings.sessionFieldPicks}: {reveal.total}
          </Badge>
        ) : null}
        <span className="num ml-auto hidden text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase sm:block">
          {snapshot
            ? `dane z ${snapshot.dataVersion ?? '—'} · pula ${snapshot.poolSize}`
            : 'brak rankingu'}
        </span>
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 max-w-[24ch] text-[clamp(2.2rem,7vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.045em] outline-none"
      >
        {strings.cards}
      </h1>
      <p className="mt-3 max-w-prose text-base leading-relaxed text-[var(--color-muted)]">
        {strings.cardsIntro}
      </p>

      {/* E11-08: informacja o pominiętych wykluczonych telefonach i szybka zmiana */}
      {excludedCount > 0 ? (
        <div
          role="status"
          className="mt-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs leading-relaxed text-[var(--color-muted)]"
        >
          <span className="min-w-0 flex-1">{sessionTexts.cardsExcludedSkipped(excludedCount)}</span>
          <button
            type="button"
            onClick={() => setExclusionsOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface-2)] px-4 text-xs font-semibold text-[var(--color-text)] transition-colors duration-200 hover:border-[var(--color-accent)]"
          >
            {strings.excludeChange}
          </button>
        </div>
      ) : null}

      {fewInBudget ? (
        <p className="num mt-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-3 py-2 text-[11px] tracking-[0.08em] text-[var(--color-warn)] uppercase">
          <AlertIcon className="h-3.5 w-3.5" />
          {strings.cardsFewInBudget}
        </p>
      ) : null}

      {freshness.stale ? (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-warn)] bg-[var(--color-warn-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--color-warn)]"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong className="font-semibold">{strings.cardsPricesStale}.</strong>{' '}
            {sessionTexts.pricesStaleNote(freshness.oldest ?? '', freshness.days)}
          </span>
        </p>
      ) : (
        <p className="num mt-3 text-[11px] tracking-[0.1em] text-[var(--color-border-strong)] uppercase">
          ceny z {freshness.oldest ? formatDate(freshness.oldest) : '—'} · {freshness.days} dni temu
        </p>
      )}

      {!snapshot ? (
        <div className="surface mt-8 flex flex-col items-start gap-3 p-[var(--pad-card)]">
          <p className="text-sm text-[var(--color-muted)]">{strings.cardsNoRanking}</p>
          <Button
            variant="primary"
            onClick={() => dispatch({ type: 'session/compute-ranking', sessionId: session.id })}
            iconRight={<ArrowRightIcon />}
          >
            {strings.cardsRecompute}
          </Button>
        </div>
      ) : cards.length === 0 ? (
        <div className="surface mt-8 p-[var(--pad-card)]">
          <p className="text-sm font-semibold">{strings.noPhonesMatch}</p>
          <Button
            variant="secondary"
            className="mt-3"
            href={`#/s/${session.id}/${answersView}`}
          >
            {strings.changeFilters}
          </Button>
        </div>
      ) : (
        <>
          {cards.length < 3 ? (
            <p className="num mt-4 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
              {sessionTexts.poolSmall(cards.length)}
            </p>
          ) : null}

          <div className="mt-6 grid gap-5 lg:grid-cols-3 lg:items-start">
            {cards.map((card, index) => {
              const phone = phoneById(card.phoneId);
              const order = reveal.orderOf(card.phoneId);

              return (
                <Reveal key={card.phoneId} delay={index * 70}>
                  {order && phone ? (
                    <PhoneCardRevealed
                      card={card}
                      phone={phone}
                      pickLabel={sessionTexts.pickBadge(order, reveal.total)}
                      specs={specsByCard[index] ?? []}
                      alwaysOpenDetails={state.theme === 'dark'}
                      onExcludeBrand={() =>
                        saveExclusions({
                          excludedBrands: [
                            ...(session.filters.excludedBrands ?? []).filter((brand) => brand !== phone.brand),
                            phone.brand ?? phone.reveal.brand,
                          ],
                          excludedPhoneIds: [...(session.filters.excludedPhoneIds ?? [])],
                        })
                      }
                    />
                  ) : (
                    <PhoneCardAnon
                      card={card}
                      specs={specsByCard[index] ?? []}
                      alwaysOpenDetails={state.theme === 'dark'}
                      onSelect={() => setPending(card.phoneId)}
                    />
                  )}
                </Reveal>
              );
            })}
          </div>
        </>
      )}

      {/* Dolne działania (UI-SPEC 3.4) */}
      <nav
        aria-label={strings.cards}
        className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-6"
      >
        <Button
          variant="secondary"
          size="lg"
          icon={<HistoryIcon className="h-4 w-4" />}
          onClick={startOver}
        >
          {strings.cardsStartOver}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          icon={session.mode === 'sliders' ? (
            <SlidersIcon className="h-4 w-4" />
          ) : (
            <ListIcon className="h-4 w-4" />
          )}
          href={`#/s/${session.id}/${answersView}`}
        >
          {strings.cardsChangeAnswers}
        </Button>

        {excludedCount === 0 && snapshot ? (
          <Button variant="secondary" size="lg" onClick={() => setExclusionsOpen(true)}>
            {strings.excludeChange}
          </Button>
        ) : null}

        {reveal.total > 0 ? (
          <Button
            variant="primary"
            size="lg"
            iconRight={<ArrowRightIcon className="h-4 w-4" />}
            href={`#/s/${session.id}/ranking`}
          >
            {strings.cardsFullRanking}
          </Button>
        ) : (
          <span className="num ml-auto text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
            {strings.cardsFullRanking} — po pierwszym wyborze
          </span>
        )}
      </nav>

      <ConfirmSheet
        open={pendingCard !== null}
        title={
          pendingCard
            ? sessionTexts.confirmTitle(pendingCard.place)
            : strings.cardsConfirmTitle
        }
        body={strings.cardsConfirmBody}
        confirmLabel={strings.cardsConfirmReveal}
        cancelLabel={strings.cardsConfirmBack}
        onConfirm={confirmPick}
        onCancel={() => setPending(null)}
      />

      <ExclusionSheet
        open={exclusionsOpen}
        phones={PHONES}
        filters={snapshot?.filters ?? session.filters}
        onSave={saveExclusions}
        onCancel={() => setExclusionsOpen(false)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
