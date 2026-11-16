import { useMemo, useState } from 'react';
import { GROUPS, labelOf } from '@/data/criteria';
import { DATA_VERSION, PHONES, phoneById } from '@/data/phones';
import { sessionTexts, strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import { useReveal } from '@/features/sessions/useReveal';
import { specRows } from '@/lib/cardSpecs';
import { groupScores as computeGroupScores, scoreRanges } from '@/lib/scoring';
import { exclusionReason, includePhoneAgain } from '@/lib/exclusions';
import { buildPool, meetsMicroSdFilter, meetsStorageFilter, withinSiteLimit } from '@/lib/pool';
import { matchLabel } from '@/lib/matchDisplay';
import { NO_DATA } from '@/lib/anonymize';
import type { GroupId } from '@/types';
import type { Session } from '@/types/state';
import { Badge } from '@/components/Badge';
import { RouteChip } from '@/components/RouteChip';
import { ScoreBar } from '@/components/ScoreBar';
import { ArrowLeftIcon, ArrowRightIcon, AlertIcon, CheckIcon, ScreenIcon } from '@/components/Icons';
import { cn } from '@/utils/cn';

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

const CONFIDENCE_LABELS = {
  high: strings.cardsConfidenceHigh,
  medium: strings.cardsConfidenceMedium,
  low: strings.cardsConfidenceLow,
  caption: strings.cardsConfidence,
};

interface RankingScreenProps {
  session: Session;
}

/**
 * Pełny ranking (E9-01, UI-SPEC 3.6): wszystkie telefony z puli z nazwami, dopasowaniem,
 * ceną, odznakami wyborów i mini-paskami sześciu grup; wiersz rozwija szczegóły i linki.
 * Dostępny dopiero po pierwszym wyborze (E9-02) — nazwy są już wtedy jawne.
 */
export function RankingScreen({ session }: RankingScreenProps) {
  const { dispatch } = useAppState();
  const reveal = useReveal(session);
  const [open, setOpen] = useState<string | null>(null);
  const [showOutside, setShowOutside] = useState(false);

  const snapshot = session.ranking;

  /* Starsze snapshoty nie mają GroupScore — odtwarzamy je z zapisanych wag i filtrów. */
  const fallbackGroups = useMemo(() => {
    if (!snapshot) return new Map<string, Record<GroupId, number>>();
    const pool = buildPool(PHONES, snapshot.filters);
    const ranges = scoreRanges(pool, snapshot.filters.budgetMax);
    return new Map(
      pool.map((phone) => [
        phone.id,
        computeGroupScores(phone, ranges, snapshot.weights, snapshot.filters.budgetMax).scores,
      ]),
    );
  }, [snapshot]);

  const outsidePool = useMemo(() => {
    if (!snapshot) return [];
    const inSnapshot = new Set(snapshot.entries.map((entry) => entry.phoneId));
    return PHONES.filter((phone) => !inSnapshot.has(phone.id)).map((phone) => ({
      phone,
      reasons: (
        [
          withinSiteLimit(phone) ? null : strings.rankingReasonBudget,
          meetsStorageFilter(phone, snapshot.filters) ? null : strings.rankingReasonStorage,
          meetsMicroSdFilter(phone, snapshot.filters) ? null : strings.rankingReasonMicroSd,
        ] as (string | null)[]
      ).filter((reason): reason is string => reason !== null),
    }));
  }, [snapshot]);

  if (!snapshot) {
    return (
      <section className="screen-in mx-auto w-full max-w-3xl px-5 py-16">
        <div className="surface flex flex-col items-start gap-3 p-[var(--pad-card)]">
          <h1 className="text-2xl font-bold tracking-tight">{strings.ranking}</h1>
          <p className="text-sm text-[var(--color-muted)]">{strings.rankingNoSnapshot}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: 'session/compute-ranking', sessionId: session.id })}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-[var(--color-on-accent)]"
            >
              {strings.rankingRecompute}
            </button>
            <a
              href={`#/s/${session.id}/cards`}
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-5 text-sm"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {strings.rankingBack}
            </a>
          </div>
        </div>
      </section>
    );
  }

  const staleData = snapshot.dataVersion !== DATA_VERSION;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 sm:pt-10 lg:max-w-5xl">
      <div className="flex flex-wrap items-center gap-2">
        <RouteChip hash={`#/s/${session.id}/ranking`} tone="active" />
        <Badge tone="accent">
          {strings.sessionFieldPicks}: {reveal.total}
        </Badge>
        <span className="num ml-auto hidden text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase sm:block">
          {sessionTexts.poolSummary(snapshot.poolSize, PHONES.length)}
        </span>
      </div>

      <h1 className="mt-5 text-[clamp(2.2rem,7.5vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.045em]">
        {strings.ranking}
      </h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
        {sessionTexts.rankingNote(snapshot.dataVersion)}
      </p>

      {staleData ? (
        <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-warn)] bg-[var(--color-warn-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--color-warn)]">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {strings.rankingDataChanged}
        </p>
      ) : null}

      <a
        href={`#/s/${session.id}/cards`}
        className="num mt-5 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {strings.rankingBack}
      </a>

      {/* Lista rankingowa */}
      <ol className="mt-6 grid gap-2">
        {snapshot.entries.map((entry) => {
          const phone = phoneById(entry.phoneId);
          if (!phone) return null;

          const pickOrder = reveal.orderOf(entry.phoneId);
          const excluded = entry.excluded ?? exclusionReason(phone, snapshot.filters);
          const isExcluded = excluded === 'brand' || excluded === 'model';
          const groups = entry.groupScores ?? fallbackGroups.get(entry.phoneId) ?? null;
          const expanded = open === entry.phoneId;
          const lowConfidence = Object.values(phone.scoreConfidence ?? {}).filter(
            (level) => level === 'low',
          ).length;
          const criteria = GROUPS.flatMap((group) =>
            group.criteria.map((id) => ({
              id,
              groupId: group.id,
              label: '',
              score: phone.scores[id] ?? 0,
              confidence: phone.scoreConfidence?.[id] ?? ('medium' as const),
              basis: phone.basis[id] ?? NO_DATA,
              estimated: (phone.scoresEstimatedNeutral ?? []).includes(id),
            })),
          );

          return (
            <li
              key={entry.phoneId}
              data-excluded={excluded ?? undefined}
              className={cn(
                'surface screen-in overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-px',
                isExcluded && 'border-dashed bg-[var(--color-surface-2)]',
                pickOrder && 'border-[var(--color-accent)]',
                entry.place === 1 &&
                  !pickOrder &&
                  !isExcluded &&
                  'border-l-2 border-l-[var(--color-accent)]',
              )}
              style={{ animationDelay: `${Math.min(entry.place * 30, 300)}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : entry.phoneId)}
                aria-expanded={expanded}
                {...(expanded ? { 'aria-controls': `ranking-${entry.phoneId}` } : {})}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-[var(--pad-card)] py-3 text-left transition-colors duration-200 hover:bg-[var(--color-surface-2)] sm:gap-5"
              >
                <span className="num flex w-9 shrink-0 flex-col items-start">
                  <span className="text-2xl leading-none font-bold tracking-tight">
                    {entry.place}
                  </span>
                  <span className="text-[10px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
                    {entry.score.toFixed(1)} pkt
                  </span>
                </span>

                <span className="grid min-w-0 gap-1.5">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span
                      className={cn(
                        'truncate text-[15px] font-semibold tracking-tight',
                        isExcluded && 'text-[var(--color-muted)] line-through',
                      )}
                    >
                      {phone.reveal.name}
                    </span>
                    {pickOrder ? (
                      <span className="num shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-[var(--color-on-accent)] uppercase">
                        {strings.rankingYourPick} {pickOrder}/{reveal.total}
                      </span>
                    ) : null}
                    {excluded === 'brand' ? (
                      <span className="num shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-warn)]">
                        {strings.rankingExcludedBrand}
                      </span>
                    ) : excluded === 'model' ? (
                      <span className="num shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-warn)]">
                        {strings.rankingExcludedModel}
                      </span>
                    ) : null}
                    {entry.practicalTieWith ? (
                      <span className="num shrink-0 text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                        {sessionTexts.practicalTie(
                          snapshot.entries.find((item) => item.phoneId === entry.practicalTieWith)
                            ?.place ?? 0,
                        )}
                      </span>
                    ) : null}
                  </span>

                  {/* Mini-paski sześciu grup (UI-SPEC 3.6) */}
                  <span className="grid grid-cols-6 gap-1.5">
                    {GROUPS.map((group) => {
                      const value = groups?.[group.id] ?? 0;
                      return (
                        <span
                          key={group.id}
                          className="grid gap-1"
                          title={`${group.label}: ${value.toFixed(0)}`}
                        >
                          <span className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                            <span
                              className="bar-grow block h-full rounded-full bg-[var(--color-accent)] opacity-75"
                              style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
                            />
                          </span>
                          <span className="num hidden truncate text-[9px] tracking-[0.08em] text-[var(--color-muted)] uppercase lg:block">
                            {group.label.split(' ')[0]}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                </span>

                <span className="flex shrink-0 flex-col items-end gap-1">
                  <span className="num text-xl leading-none font-bold tabular-nums">
                    {entry.matchPercent}%
                  </span>
                  <span className="num text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                    {matchLabel(entry.score)}
                  </span>
                  <span className="num text-[13px] font-semibold tabular-nums">
                    {Math.round(phone.price.pln)} zł
                  </span>
                  {!entry.inBudget ? (
                    <span className="num rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2 py-0.5 text-[10px] text-[var(--color-warn)]">
                      +{entry.overBudgetBy} zł
                    </span>
                  ) : null}
                </span>
              </button>

              {/* Zawartość montowana tylko po rozwinięciu — brak ukrytych linków dla czytników. */}
              {expanded ? (
                <div id={`ranking-${entry.phoneId}`} className="step-in">
                  {isExcluded ? (
                    <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-warn-soft)] px-[var(--pad-card)] py-3">
                      <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--color-warn)]">
                        {strings.rankingExcludedExplain}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const next = includePhoneAgain(PHONES, snapshot.filters, phone.id);
                          dispatch({
                            type: 'session/exclusions',
                            sessionId: session.id,
                            excludedBrands: next.excludedBrands,
                            excludedPhoneIds: next.excludedPhoneIds,
                            step: 'done',
                          });
                        }}
                        className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-pill)] border border-[var(--color-warn)] bg-[var(--color-surface)] px-4 text-xs font-semibold text-[var(--color-text)] transition-colors duration-200 hover:border-[var(--color-accent)]"
                      >
                        {strings.rankingIncludeAgain}
                      </button>
                    </div>
                  ) : null}

                  <div className="grid gap-6 border-t border-[var(--color-border)] px-[var(--pad-card)] py-4 lg:grid-cols-2">
                    <section>
                      <h2 className="label-mono">{strings.cardsDetailsScores}</h2>
                      <p className="num mt-1 text-[11px] text-[var(--color-muted)]">
                        {sessionTexts.confidenceSummary(lowConfidence, 13)}
                      </p>
                      <ul className="mt-2">
                        {criteria.map((criterion, index) => (
                          <ScoreBar
                            key={criterion.id}
                            label={labelOf(criterion.id)}
                            groupLabel={GROUPS.find((group) => group.id === criterion.groupId)?.label ?? ''}
                            score={criterion.score}
                            estimated={criterion.estimated}
                            confidence={criterion.confidence}
                            basis={criterion.basis}
                            basisCaption={strings.cardsBasis}
                            estimatedCaption={strings.cardsEstimated}
                            confidenceLabels={CONFIDENCE_LABELS}
                            delay={Math.min(index * 20, 200)}
                          />
                        ))}
                      </ul>
                    </section>

                    <section className="grid gap-5">
                      <div>
                        <h2 className="label-mono">{strings.cardsDetailsSpecs}</h2>
                        <dl className="mt-2 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-border)]">
                          {specRows(phone, SPEC_LABELS, PHONES).map((row) => (
                            <div
                              key={row.key}
                              className="grid gap-0.5 bg-[var(--color-surface)] px-3 py-2 sm:grid-cols-[38%_minmax(0,1fr)] sm:gap-2"
                            >
                              <dt className="label-mono">{row.label}</dt>
                              <dd className="num text-[12px] leading-relaxed break-words">
                                {row.value || NO_DATA}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <div>
                        <h2 className="label-mono">{strings.cardsShopLink}</h2>
                        <ul className="mt-2 grid gap-1.5">
                          {phone.reveal.shopLinks.map((link, index) => {
                            const url = typeof link === 'string' ? link : link.url;
                            const label =
                              typeof link === 'string'
                                ? url.replace(/^https?:\/\//, '')
                                : (link.label ?? link.shop ?? url);
                            return (
                              <li key={`${url}-${index}`}>
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex min-h-11 items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-sm transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[var(--color-accent)]"
                                >
                                  <span className="num min-w-0 flex-1 truncate text-[12px]">{label}</span>
                                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]" />
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                        <p className="num mt-2 text-[11px] text-[var(--color-muted)]">
                          {Math.round(phone.price.pln)} zł · {phone.price.source} ·{' '}
                          {sessionTexts.priceWithDate(phone.price.checkedAt)}
                          {phone.price.note ? ` · ${phone.price.note}` : ''}
                        </p>
                      </div>

                      {(phone.price.otherObservations ?? []).length > 0 ? (
                        <div>
                          <h2 className="label-mono">{strings.rankingObservations}</h2>
                          <ul className="mt-2 grid gap-1">
                            {(phone.price.otherObservations ?? []).map((observation, index) => (
                              <li
                                key={`${observation.url ?? 'obs'}-${index}`}
                                className="num rounded-[6px] bg-[var(--color-surface-2)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-muted)]"
                              >
                                {Math.round(observation.pln)} zł · {observation.source} ·{' '}
                                {sessionTexts.priceWithDate(observation.checkedAt)}
                                {observation.note ? ` — ${observation.note}` : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div>
                        <h2 className="label-mono flex items-center gap-2">
                          <ScreenIcon className="h-3.5 w-3.5" />
                          {strings.rankingSources}
                        </h2>
                        <ul className="mt-2 grid gap-1">
                          {(phone.sources ?? []).map((source) => (
                            <li key={source}>
                              <a
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="num block truncate text-[11px] text-[var(--color-muted)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition-colors duration-200 hover:text-[var(--color-accent-ink)]"
                              >
                                {source.replace(/^https?:\/\//, '')}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {phone.status !== 'ok' ? (
                        <p className="num flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-warn-soft)] px-3 py-2 text-[11px] text-[var(--color-warn)]">
                          <AlertIcon className="h-3.5 w-3.5" />
                          {strings.rankingStatusNeedsConfirmation} ({phone.status})
                        </p>
                      ) : (
                        <p className="num flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                          <CheckIcon className="h-3.5 w-3.5 text-[var(--color-ok)]" />
                          rekord zweryfikowany
                        </p>
                      )}
                    </section>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Telefony odrzucone przez filtry twarde tej sesji */}
      {outsidePool.length > 0 ? (
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setShowOutside((current) => !current)}
            aria-expanded={showOutside}
            className="num inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
          >
            {showOutside ? strings.rankingHideOutside : strings.rankingShowOutside}
            <span className="num rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px]">
              {outsidePool.length}
            </span>
            <span className={cn('transition-transform duration-200', showOutside && 'rotate-180')} aria-hidden="true">
              ▾
            </span>
          </button>

          {showOutside ? (
            <ul className="mt-3 grid gap-1.5">
              {outsidePool.map(({ phone, reasons }) => (
                <li
                  key={phone.id}
                  className="surface flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 opacity-80"
                >
                  <span className="text-sm font-medium">{phone.reveal.name}</span>
                  <span className="num text-[12px] text-[var(--color-muted)]">
                    {Math.round(phone.price.pln)} zł
                  </span>
                  <span className="num ml-auto text-[11px] tracking-[0.08em] text-[var(--color-warn)] uppercase">
                    {reasons.join(' · ') || '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <footer className="mt-10 border-t border-[var(--color-border)] pt-5">
        <p className="num text-[11px] leading-relaxed tracking-[0.08em] text-[var(--color-muted)] uppercase">
          {strings.dataWarning} {strings.footerNote}
        </p>
      </footer>
    </div>
  );
}
