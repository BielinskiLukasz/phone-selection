import { sessionTexts, strings } from '@/data/strings';
import type { SessionSummary } from '@/features/history/historyModel';
import { ArrowRightIcon, HistoryIcon, LockIcon, ScreenIcon } from './Icons';
import { cn } from '@/utils/cn';

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
          <h3 className="text-[17px] leading-tight font-semibold tracking-tight">
            {summary.modeLabel}
          </h3>
          <span
            className={cn(
              'num rounded-[var(--radius-pill)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase',
              completed
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
            )}
          >
            {summary.statusLabel}
          </span>
          <span
            className="num ml-auto text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase"
            title={summary.updatedAbsolute}
          >
            {summary.updatedLabel}
          </span>
        </header>

        {/* Postęp albo wybory */}
        {summary.picks.length > 0 ? (
          <div className="grid gap-1.5">
            <span className="label-mono">{strings.historySelectedLabel}</span>
            <ul className="flex flex-wrap gap-1.5">
              {summary.picks.map((pick, pickIndex) => (
                <li key={`${pick.phoneId}-${pickIndex}`}>
                  <span className="num inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] text-[var(--color-accent-ink)]">
                    {pick.place ? `#${pick.place}` : <LockIcon className="h-3 w-3" />}
                    {pick.name}
                    <span className="text-[10px] opacity-70">
                      {summary.picks.length > 1 ? `${pickIndex + 1}/${summary.picks.length}` : ''}
                    </span>
                  </span>
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
          <a
            href={targetHref}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] px-5 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5',
              completed
                ? 'border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]'
                : 'bg-[var(--color-accent)] text-[var(--color-on-accent)]',
            )}
          >
            {completed ? strings.historyPreviewAction : strings.historyResume}
            <ArrowRightIcon className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={onCopyLink}
            className="num inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
          >
            <LockIcon className="h-3.5 w-3.5" />
            {strings.historyCopyLink}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="num ml-auto inline-flex min-h-11 items-center rounded-[var(--radius-pill)] px-4 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:bg-[var(--color-warn-soft)] hover:text-[var(--color-warn)]"
          >
            {strings.historyDelete}
          </button>
        </div>
      </article>
    </li>
  );
}
