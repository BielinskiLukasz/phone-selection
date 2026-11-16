import { GROUPS } from '@/data/criteria';
import { phoneById } from '@/data/phones';
import { sessionTexts, strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import { useReveal } from '@/features/sessions/useReveal';
import { quizProgress } from '@/lib/session';
import type { Session } from '@/types/state';
import { Badge } from './Badge';
import { RouteChip } from './RouteChip';
import { CheckIcon, HistoryIcon, LockIcon } from './Icons';

interface SessionPanelProps {
  session: Session | null;
  hash: string;
}

function Field({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-[var(--color-surface)] px-3 py-2.5">
      <p className="label-mono">{label}</p>
      <p className="num mt-1 truncate text-sm font-semibold" title={value}>
        {value}
      </p>
      {note ? <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">{note}</p> : null}
    </div>
  );
}

function HarnessButton({
  label,
  onClick,
  danger = false,
  done = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  done?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`num inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-[11px] tracking-[0.06em] transition-[transform,border-color,background-color] duration-200 hover:-translate-y-px ${
        danger
          ? 'border-[var(--color-warn)] text-[var(--color-warn)] hover:bg-[var(--color-warn-soft)]'
          : done
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
            : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]'
      }`}
    >
      {done ? <CheckIcon className="h-3.5 w-3.5" /> : null}
      {label}
    </button>
  );
}

/**
 * Odczyt zapisanej sesji (etap 3): co leży w `localStorage`, jak wygląda snapshot
 * rankingu i które karty są już odsłonięte. Bez nazw telefonów — tylko miejsca i ceny.
 */
export function SessionPanel({ session, hash }: SessionPanelProps) {
  const { dispatch, persistent } = useAppState();
  const reveal = useReveal(session);

  if (!session) {
    return (
      <div className="surface mt-8 flex items-start gap-3 p-4">
        <span className="mt-0.5 text-[var(--color-muted)]">
          <LockIcon className="h-4 w-4" />
        </span>
        <p className="num text-[11px] leading-relaxed tracking-[0.08em] text-[var(--color-muted)] uppercase">
          {strings.sessionPreviewNote}
        </p>
      </div>
    );
  }

  const progress = quizProgress(session);
  const snapshot = session.ranking;
  const answered = Object.keys(session.answers).length > 0;

  const placeOf = (phoneId: string): number | null =>
    snapshot?.entries.find((entry) => entry.phoneId === phoneId)?.place ?? null;

  return (
    <div className="surface mt-8 overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="label-mono flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          {strings.sessionPanelTitle}
        </span>
        <Badge tone={session.status === 'completed' ? 'accent' : 'outline'}>
          {session.status === 'completed' ? strings.statusCompleted : strings.statusInProgress}
        </Badge>
        <Badge tone={persistent ? 'outline' : 'warn'}>
          {persistent ? strings.storagePersistent : strings.storageMemoryMode}
        </Badge>
        <span className="ml-auto hidden sm:block">
          <RouteChip hash={hash} tone="default" copyable={false} />
        </span>
      </div>

      <dl className="grid gap-px bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
        <Field label={strings.sessionFieldId} value={session.id} note={strings.storageKey} />
        <Field
          label={strings.sessionFieldMode}
          value={
            session.mode === 'quiz'
              ? strings.quiz
              : session.mode === 'sliders'
                ? strings.sliders
                : strings.quizAndSliders
          }
          note={`${strings.sessionFieldOverride}: ${session.manualOverride ? 'tak' : 'nie'}`}
        />
        <Field
          label={strings.sessionFieldAnswers}
          value={sessionTexts.answersCount(progress.answered, progress.total)}
          note={strings.sessionFieldUpdated + ` ${new Date(session.updatedAt).toLocaleTimeString('pl-PL')}`}
        />
        <Field
          label={strings.sessionFieldFilters}
          value={`${session.filters.budgetMax} zł${
            session.filters.minStorageGb ? ` · min ${session.filters.minStorageGb} GB` : ''
          }`}
          note={session.filters.requireMicroSd ? 'microSD wymagane' : 'microSD obojętne'}
        />
      </dl>

      <div className="grid gap-4 border-t border-[var(--color-border)] px-[var(--pad-card)] py-4 lg:grid-cols-2">
        <div>
          <p className="label-mono">{strings.sessionFieldWeights}</p>
          <ul className="mt-2 grid gap-1.5">
            {GROUPS.map((group) => {
              const value = session.groupImportance[group.id] ?? 0;
              return (
                <li key={group.id} className="flex items-center gap-2">
                  <span className="w-[46%] shrink-0 truncate text-[11px] text-[var(--color-muted)]">
                    {group.label}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                    <span
                      className="bar-grow block h-full rounded-full bg-[var(--color-accent)] opacity-70"
                      style={{ width: `${Math.min(100, (value / 5) * 100)}%` }}
                    />
                  </span>
                  <span className="num w-8 shrink-0 text-right text-[11px] font-semibold">
                    {sessionTexts.weightValue(value)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="label-mono">{strings.sessionFieldRanking}</p>
          {snapshot ? (
            <>
              <ul className="mt-2 grid gap-1.5">
                {snapshot.cards.map((phoneId, index) => {
                  const entry = snapshot.entries.find((item) => item.phoneId === phoneId);
                  const phone = phoneById(phoneId);
                  return (
                    <li
                      key={phoneId}
                      className="flex items-center gap-2 rounded-[6px] border border-[var(--color-border)] px-2.5 py-1.5"
                    >
                      <span className="num text-[11px] font-bold text-[var(--color-accent-ink)]">
                        #{index + 1}
                      </span>
                      <span className="num text-xs font-semibold">
                        {entry?.matchPercent ?? '—'}%
                      </span>
                      <span className="num ml-auto text-[11px] text-[var(--color-muted)]">
                        {phone ? `${Math.round(phone.price.pln)} zł` : '—'}
                      </span>
                      {entry?.overBudgetBy ? (
                        <Badge tone="warn">+{entry.overBudgetBy} zł</Badge>
                      ) : null}
                      {reveal.labelFor(phoneId) ? (
                        <Badge tone="accent">
                          {strings.revealedBadge} {reveal.labelFor(phoneId)}
                        </Badge>
                      ) : (
                        <span className="text-[var(--color-muted)]">
                          <LockIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="num mt-2 text-[11px] leading-relaxed text-[var(--color-muted)]">
                {sessionTexts.snapshot(snapshot.poolSize, snapshot.dataVersion, snapshot.computedAt)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-[var(--color-muted)]">{strings.snapshotNone}</p>
          )}

          <p className="label-mono mt-4">{strings.sessionFieldPicks}</p>
          {session.picks.length === 0 ? (
            <p className="mt-1 text-xs text-[var(--color-muted)]">{strings.noSessionsYet}</p>
          ) : (
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {session.picks.map((pick, index) => (
                <li key={`${pick.phoneId}-${index}`}>
                  <Badge tone="accent">
                    {strings.revealedBadge} {index + 1}/{session.picks.length} · propozycja #
                    {placeOf(pick.phoneId) ?? '—'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-dashed border-[var(--color-border-strong)] px-[var(--pad-card)] py-4">
        <p className="label-mono">{strings.harnessTitle}</p>
        <p className="mt-1.5 max-w-prose text-[11px] leading-relaxed text-[var(--color-muted)]">
          {strings.harnessNote}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <HarnessButton
            label={strings.harnessAnswer}
            done={answered}
            onClick={() =>
              dispatch({
                type: 'session/answer',
                sessionId: session.id,
                questionId: 'A2',
                optionId: 'A2-c',
              })
            }
          />
          <HarnessButton
            label={strings.harnessTopThree}
            done={session.topThree !== null}
            onClick={() =>
              dispatch({
                type: 'session/top-three',
                sessionId: session.id,
                picks: ['battery', 'camera', 'storage'],
              })
            }
          />
          <HarnessButton
            label={strings.harnessBudget}
            done={session.filters.budgetMax === 1500}
            onClick={() =>
              dispatch({ type: 'session/filters', sessionId: session.id, filters: { budgetMax: 1500 } })
            }
          />
          <HarnessButton
            label={strings.harnessStorage}
            done={session.filters.minStorageGb === 256}
            onClick={() =>
              dispatch({
                type: 'session/filters',
                sessionId: session.id,
                filters: { minStorageGb: 256 },
              })
            }
          />
          <HarnessButton
            label={strings.harnessRecompute}
            onClick={() => dispatch({ type: 'session/compute-ranking', sessionId: session.id })}
          />
          <HarnessButton
            label={strings.harnessPickFirst}
            done={reveal.total > 0}
            onClick={() => {
              const first = session.ranking?.cards[0];
              if (first) dispatch({ type: 'session/pick', sessionId: session.id, phoneId: first });
            }}
          />
          <HarnessButton
            label={strings.harnessPickSecond}
            done={reveal.total > 1}
            onClick={() => {
              const second = session.ranking?.cards[1];
              if (second) dispatch({ type: 'session/pick', sessionId: session.id, phoneId: second });
            }}
          />
          <HarnessButton
            label={strings.harnessComplete}
            done={session.status === 'completed'}
            onClick={() =>
              dispatch({ type: 'session/status', sessionId: session.id, status: 'completed' })
            }
          />
          <HarnessButton
            label={strings.harnessReset}
            onClick={() => dispatch({ type: 'session/reset-progress', sessionId: session.id })}
          />
          <HarnessButton
            label={strings.harnessDelete}
            danger
            onClick={() => {
              dispatch({ type: 'session/delete', sessionId: session.id });
              window.location.hash = '#/';
            }}
          />
        </div>
      </div>
    </div>
  );
}
