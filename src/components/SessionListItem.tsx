import { sessionTexts, strings } from '@/data/strings';
import type { SessionSummary } from '@/features/history/historyModel';
import { ArrowRightIcon, HistoryIcon, LockIcon, ScreenIcon } from './Icons';
import { cn } from '@/utils/cn';
import { Button, Chip } from './ui';

interface SessionListItemProps {
  summary: SessionSummary;
  index: number;
  isLast: boolean;
  onDelete: () => void;
  onCopyLink: () => void;
}

/**
 * Wiersz listy historii (E7-01, UI-SPEC 3.7): data, tryb, status, postęp,
 * „Wybrano: …”, oraz Wznów / Podgląd / Link / Usuń.
 */
export function SessionListItem({ summary, index, isLast, onDelete, onCopyLink }: SessionListItemProps) {
  const completed = summary.status === 'completed';
  /* E7-02/E7-03: ukończona sesja otwiera karty ze snapshotu, przerwana — ekran wznowienia. */
  const targetHref = `#/s/${summary.id}/${completed ? 'cards' : summary.resumeView}`;
  const progressPercent = summary.progress
    ? Math.min(100, (summary.progress.answered / summary.progress.total) * 100)
    : 0;

  return (
    <li className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4">
      {/* Szyna czasu: punkt statusu i linia do następnego wpisu */}
      <div className="relative flex flex-col items-center pt-5">
        <span
          className={cn(
            'relative z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2',
            completed
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
              : 'border-[var(--color-accent)] bg-[var(--color-surface)]',
          )}
          aria-hidden="true"
        >
          {!completed ? <span className="breathe h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" /> : null}
        </span>
        <span className="num mt-2 text-[10px] tracking-[0.14em] text-[var(--color-border-strong)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        {!isLast ? (
          <span
            className="absolute top-8 bottom-[-24px] w-px bg-[var(--color-border)]"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <article
        className={cn(
          'surface screen-in group mb-4 flex flex-col gap-3 p-[var(--pad-card)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5',
          !completed && 'border-l-2 border-l-[var(--color-accent)]',
        )}
        style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
      >
        <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-h3 text-[var(--color-text)]">{summary.modeLabel}</h3>
          {/* UIP2-09 (FIX-UI §5.8): status jako Chip — ukończona = ok, w toku = accent. */}
          <Chip tone={completed ? 'ok' : 'accent'}>{summary.statusLabel}</Chip>
          <span className="num ml-auto text-small text-[var(--color-muted)]" title={summary.updatedAbsolute}>
            {summary.updatedLabel}
          </span>
        </header>

        {/* Postęp albo wybory */}
        {summary.picks.length > 0 ? (
          <div className="grid gap-1.5">
            <span className="label-mono">{strings.historySelectedLabel}</span>
            <ul className="flex flex-wrap gap-1.5">
              {summary.picks.map((pick, pickIndex) => (
                <li key={`${pick.phoneId}-${pickIndex}`} className="flex flex-wrap items-center gap-1.5">
                  <span className="num inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] text-[var(--color-accent-ink)]">
                    {pick.place ? `#${pick.place}` : <LockIcon className="h-3 w-3" />}
                    {pick.name}
                    <span className="text-[10px] opacity-80">
                      {sessionTexts.pickBadge(pickIndex + 1, summary.picks.length)}
                    </span>
                  </span>
                  {pick.nowExcluded ? (
                    <span className="num rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-warn)]">
                      {strings.historyNowExcluded}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            {summary.bestMatchPercent !== null ? (
              <span className="num text-[11px] text-[var(--color-muted)]">
                dopasowanie pierwszego wyboru {summary.bestMatchPercent}%
              </span>
            ) : null}
          </div>
        ) : summary.progress ? (
          <div className="grid gap-1.5">
            <span className="label-mono">
              {strings.historyProgressLabel} · {sessionTexts.progress(summary.progress.answered, summary.progress.total)}
            </span>
            <span className="flex h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <span
                className="bar-grow block h-full rounded-full bg-[var(--color-accent)] opacity-80"
                style={{ width: `${progressPercent}%` }}
              />
            </span>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-muted)]">
            {summary.mode === 'sliders' ? strings.historyEmptyLead : strings.noSessionsYet}
          </p>
        )}

        {summary.exclusionsText ? (
          <p className="text-xs leading-relaxed text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-text)]">
              {strings.historyExcludedLabel}
            </span>{' '}
            {summary.exclusionsText}
          </p>
        ) : null}

        <p className="num flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[0.08em] text-[var(--color-muted)] uppercase">
          <span className="flex items-center gap-1.5">
            <HistoryIcon className="h-3.5 w-3.5" />
            {strings.sessionFieldId}: {summary.id}
          </span>
          {summary.dataVersion ? (
            <span>
              {strings.historyDataFrom} {summary.dataVersion}
            </span>
          ) : null}
          {summary.computedAt ? (
            <span className="flex items-center gap-1.5">
              <ScreenIcon className="h-3.5 w-3.5" />
              {strings.historyRankingFrom} {new Date(summary.computedAt).toLocaleDateString('pl-PL')}
            </span>
          ) : null}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3">
          <Button href={targetHref} variant={completed ? 'secondary' : 'primary'} iconRight={<ArrowRightIcon />}>
            {completed ? strings.historyPreviewAction : strings.historyResume}
          </Button>

          <Button
            variant="secondary"
            icon={<LockIcon className="h-3.5 w-3.5" />}
            onClick={onCopyLink}
          >
            {strings.historyCopyLink}
          </Button>

          <Button
            variant="danger"
            className="ml-auto"
            onClick={onDelete}
          >
            {strings.historyDelete}
          </Button>
        </div>
      </article>
    </li>
  );
}
