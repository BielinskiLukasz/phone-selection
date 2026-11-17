import { GROUPS, groupLabel } from '@/data/criteria';
import { sessionTexts } from '@/data/strings';
import { strings } from '@/data/strings';
import type { SpecRow } from '@/lib/cardSpecs';
import type { AnonCard } from '@/types';
import { ScoreBar } from './ScoreBar';
import { NO_DATA } from '@/lib/anonymize';

interface DetailsAccordionProps {
  card: AnonCard;
  specs: SpecRow[];
  /** W ciemnym motywie szczegóły są widoczne od razu (UI-SPEC 3.5). */
  alwaysOpen: boolean;
}

const CONFIDENCE_LABELS = {
  high: strings.cardsConfidenceHigh,
  medium: strings.cardsConfidenceMedium,
  low: strings.cardsConfidenceLow,
  caption: strings.cardsConfidence,
};

/** Rozwijane szczegóły karty: oceny kryteriów z uzasadnieniami i pełne dane (E6-03). */
export function DetailsAccordion({ card, specs, alwaysOpen }: DetailsAccordionProps) {
  const grouped = GROUPS.flatMap((group) =>
    card.criteria.filter((criterion) => criterion.groupId === group.id),
  );

  const content = (
    <div className="grid gap-6 px-[var(--pad-card)] py-4 lg:grid-cols-2">
      <section>
        <h3 className="label-mono">{strings.cardsDetailsScores}</h3>
        {card.matchRescaledPercent ? (
          <p className="num mt-1 text-[11px] text-[var(--color-muted)]">{sessionTexts.matchRescaledDetails(card.matchRescaledPercent)}</p>
        ) : null}
        <ul className="mt-2">
          {grouped.map((criterion, index) => (
            <ScoreBar
              key={criterion.id}
              label={criterion.label}
              groupLabel={groupLabel(criterion.groupId)}
              score={criterion.score}
              estimated={criterion.estimated}
              confidence={criterion.confidence}
              basis={criterion.basis}
              basisCaption={strings.cardsBasis}
              estimatedCaption={strings.cardsEstimated}
              confidenceLabels={CONFIDENCE_LABELS}
              delay={Math.min(index * 40, 320)}
            />
          ))}
        </ul>
      </section>

      <section>
        <h3 className="label-mono">{strings.cardsDetailsSpecs}</h3>
        <dl className="mt-2 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-border)]">
          {specs.map((row) => (
            <div key={row.key} className="grid gap-0.5 bg-[var(--color-surface)] px-3 py-2 sm:grid-cols-[38%_1fr] sm:gap-2">
              <dt className="label-mono">{row.label}</dt>
              <dd className="num text-[12px] leading-relaxed break-words">
                {row.value || NO_DATA}
                {row.key === 'updates' && !row.missing ? (
                  <span className="mt-1 block font-sans text-[11px] leading-snug text-[var(--color-muted)]">
                    {strings.cardsUpdatesHelp}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
          {strings.dataWarning}
        </p>
      </section>
    </div>
  );

  if (alwaysOpen) {
    return <div className="border-t border-[var(--color-border)]">{content}</div>;
  }

  return (
    <details className="group border-t border-[var(--color-border)]">
      <summary className="num flex min-h-12 cursor-pointer list-none items-center gap-2 px-[var(--pad-card)] py-3 text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-accent-ink)] [&::-webkit-details-marker]:hidden">
        {strings.cardsMoreDetails}
        <span className="ml-auto transition-transform duration-200 group-open:rotate-90">▸</span>
      </summary>
      {content}
    </details>
  );
}
