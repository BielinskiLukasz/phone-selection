import { useEffect, useMemo, useRef } from 'react';
import { PHONES, phoneById } from '@/data/phones';
import { GROUPS } from '@/data/criteria';
import { strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import { groupSliderState, isGroupModified } from '@/features/sliders/sliderModel';
import { buildPool, inBudgetSubset } from '@/lib/pool';
import { matchLabel } from '@/lib/matchDisplay';
import type { CriterionId, GroupId } from '@/types';
import type { Session } from '@/types/state';
import { GroupSlider } from '@/components/GroupSlider';
import { FilterPanel } from '@/components/FilterPanel';
import { Badge } from '@/components/Badge';
import { RouteChip } from '@/components/RouteChip';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LockIcon,
  SlidersIcon,
  UpdateIcon,
} from '@/components/Icons';

interface SlidersScreenProps {
  session: Session;
  /** `sliders` = tryb suwaków, `tune` = dostrojenie po krótkim quizie (hybryda). */
  variant: 'sliders' | 'tune';
}

/**
 * Tryb suwaków i ekran dostrojenia (E5-01…E5-08). Ten sam ekran w dwóch wariantach:
 * suwaki startują neutralnie, dostrojenie pokazuje wartości wyliczone z krótkiego quizu.
 */
export function SlidersScreen({ session, variant }: SlidersScreenProps) {
  const { dispatch } = useAppState();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const states = useMemo(() => groupSliderState(session), [session]);
  const pool = useMemo(() => buildPool(PHONES, session.filters), [session.filters]);
  const inBudget = useMemo(
    () => inBudgetSubset(pool, session.filters.budgetMax).length,
    [pool, session.filters.budgetMax],
  );

  const answersCount = Object.keys(session.answers).length;
  const modifiedGroups = states.filter((state) => isGroupModified(session, state.id)).length;
  const hash = `#/s/${session.id}/${variant === 'tune' ? 'tune' : 'sliders'}`;

  /* Snapshot trzyma karty jako identyfikatory; szczegóły bierzemy z `entries`. */
  const preview = useMemo(() => {
    const snapshot = session.ranking;
    if (!snapshot) return [];
    return snapshot.cards.flatMap((phoneId) => {
      const entry = snapshot.entries.find((item) => item.phoneId === phoneId);
      return entry ? [entry] : [];
    });
  }, [session.ranking]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [variant]);

  function setGroup(id: GroupId, value: number) {
    dispatch({
      type: 'session/override-weights',
      sessionId: session.id,
      groupImportance: { [id]: value },
    });
  }

  function setCriterion(id: CriterionId, value: number) {
    dispatch({ type: 'session/override-weights', sessionId: session.id, weights: { [id]: value } });
  }

  function setBudget(value: number) {
    dispatch({ type: 'session/filters', sessionId: session.id, filters: { budgetMax: value } });
  }

  function setStorage(value: number | null) {
    dispatch({ type: 'session/filters', sessionId: session.id, filters: { minStorageGb: value } });
  }

  function setMicroSd(value: boolean) {
    dispatch({ type: 'session/filters', sessionId: session.id, filters: { requireMicroSd: value } });
  }

  function finish() {
    dispatch({ type: 'session/compute-ranking', sessionId: session.id });
    dispatch({ type: 'session/status', sessionId: session.id, status: 'completed' });
    window.location.hash = `#/s/${session.id}/cards`;
  }

  const title = variant === 'tune' ? strings.tune : strings.sliders;
  const lead = variant === 'tune' ? strings.tuneLead : strings.slidersLead;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:pb-16 sm:pt-10">
      <div className="flex flex-wrap items-center gap-2">
        <RouteChip hash={hash} tone="active" />
        {variant === 'tune' ? <Badge tone="accent">{strings.computedBadge}</Badge> : null}
        {session.manualOverride ? <Badge tone="warn">ręczna korekta</Badge> : null}
        <span className="num ml-auto text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          sesja {session.id}
        </span>
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 flex items-center gap-3 text-[clamp(2.1rem,7vw,3.2rem)] leading-[1.02] font-bold tracking-[-0.04em] outline-none"
      >
        <span className="text-[var(--color-accent)]">
          {variant === 'tune' ? (
            <UpdateIcon className="h-7 w-7" />
          ) : (
            <SlidersIcon className="h-7 w-7" />
          )}
        </span>
        {title}
      </h1>

      <div className="rule-draw mt-4 h-px w-full bg-[var(--color-border)]" />

      <div className="mt-5 flex flex-wrap items-start gap-4">
        <p className="max-w-prose flex-1 border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
          {lead}
        </p>

        {variant === 'tune' ? (
          <button
            type="button"
            onClick={() =>
              dispatch({ type: 'session/restore-computed', sessionId: session.id })
            }
            disabled={!session.manualOverride && modifiedGroups === 0}
            className="num inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 text-[11px] tracking-[0.12em] text-[var(--color-accent-ink)] uppercase transition-transform duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
          >
            <UpdateIcon className="h-4 w-4" />
            {strings.restoreComputed}
          </button>
        ) : null}
      </div>

      {variant === 'tune' ? (
        <p className="num mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
          <span>
            {answersCount} {answersCount === 1 ? 'odpowiedź' : 'odpowiedzi'} z krótkiego quizu
          </span>
          {session.topThree ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                trójka:{' '}
                {session.topThree.picks
                  .map((id) => GROUPS.find((group) => group.id === id)?.label ?? id)
                  .join(' › ')}
              </span>
            </>
          ) : (
            <>
              <span aria-hidden="true">·</span>
              <span>krok G1 pominięty</span>
            </>
          )}
        </p>
      ) : null}

      {session.manualOverride ? (
        <p className="mt-4 text-xs leading-relaxed text-[var(--color-warn)]">
          {strings.manualOverrideNote}
        </p>
      ) : null}

      {/* Suwaki grup: jedna kolumna na telefonie, dwie od 1024 px (UI-SPEC 7) */}
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {states.map((state) => (
          <GroupSlider
            key={state.id}
            state={state}
            modified={isGroupModified(session, state.id)}
            onChange={setGroup}
            onCriterionChange={setCriterion}
          />
        ))}
      </div>

      <div className="mt-6">
        <FilterPanel
          filters={session.filters}
          total={PHONES.length}
          matches={pool.length}
          inBudget={inBudget}
          onBudget={setBudget}
          onStorage={setStorage}
          onMicroSd={setMicroSd}
        />
      </div>

      {/* Podgląd na żywo: trzy najlepsze propozycje, bez nazw (anonimowość do wyboru) */}
      <section
        className="surface mt-6 overflow-hidden p-0"
        aria-labelledby="podglad-naglowek"
        data-testid="podglad"
      >
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
          <h2 id="podglad-naglowek" className="label-mono">
            {strings.previewTitle}
          </h2>
          <span className="num ml-auto text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
            {session.ranking
              ? `najlepsze ${session.ranking.entries[0]?.matchPercent ?? '—'}% · pula ${session.ranking.poolSize}`
              : '—'}
          </span>
        </header>

        {preview.length === 0 ? (
          <p className="px-[var(--pad-card)] py-6 text-sm text-[var(--color-muted)]">
            {strings.noPhonesMatch}
          </p>
        ) : (
          <ul className="grid gap-px bg-[var(--color-border)] sm:grid-cols-3">
            {preview.map((entry, index) => {
              const phone = phoneById(entry.phoneId);
              return (
                <li
                  key={entry.phoneId}
                  className="group bg-[var(--color-surface)] p-4 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
                >
                  <span className="flex items-center gap-2">
                    <span className="num text-xs font-bold text-[var(--color-accent-ink)]">
                      #{index + 1}
                    </span>
                    <span className="num ml-auto text-lg font-bold tabular-nums">
                      {entry.matchPercent}%
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                    <span
                      className="bar-grow block h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
                      style={{ width: `${Math.min(100, entry.matchPercent)}%` }}
                    />
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                    <span className="num">{matchLabel(entry.score)}</span>
                    <span className="num ml-auto font-semibold text-[var(--color-text)]">
                      {phone ? `${Math.round(phone.price.pln)} zł` : '—'}
                    </span>
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {entry.overBudgetBy ? (
                      <span className="num rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2 py-0.5 text-[var(--color-warn)]">
                        +{entry.overBudgetBy} zł
                      </span>
                    ) : null}
                    <span className="num flex items-center gap-1 text-[var(--color-muted)]">
                      <LockIcon className="h-3 w-3" />
                      {strings.hiddenName}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="border-t border-[var(--color-border)] px-[var(--pad-card)] py-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
          {strings.previewNote}
        </p>
      </section>

      {/* Główna czynność: w treści od 640 px, w pasku na dole poniżej (UI-SPEC 7) */}
      <div className="mt-8 hidden flex-wrap items-center gap-3 sm:flex">
        <button
          type="button"
          onClick={finish}
          className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] dark:text-[#08130c]"
        >
          {strings.quizShowResults}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
        {variant === 'tune' ? (
          <a
            href={`#/s/${session.id}/quiz`}
            className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-5 text-sm transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {strings.backToQuestions}
          </a>
        ) : null}
        <a
          href="#/"
          className="num ml-auto inline-flex min-h-11 items-center text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:text-[var(--color-text)]"
        >
          {strings.backHome}
        </a>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={finish}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] text-sm font-semibold text-white dark:text-[#08130c]"
        >
          {strings.quizShowResults}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>

      <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-5">
        <span className="num text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {variant === 'tune' ? 'hybryda: krótki quiz + dostrojenie' : 'tryb suwaków'} ·{' '}
          {GROUPS.length} grup · {strings.quizSavedNote}
        </span>
        <span className="num ml-auto text-[11px] tracking-[0.12em] text-[var(--color-border-strong)] uppercase">
          {modifiedGroups > 0
            ? `${modifiedGroups} × ręcznie`
            : variant === 'tune'
              ? 'wartości wyliczone'
              : 'wartości neutralne'}
        </span>
      </footer>
    </div>
  );
}
