import { screenPlans, sessionTexts, strings } from '@/data/strings';
import { MODE_ENTRY_VIEW, MODE_LABEL } from '@/types/state';
import { useAppState } from '@/features/state/StateProvider';
import { ScreenShell } from '@/components/ScreenShell';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';
import { ArrowRightIcon, HistoryIcon } from '@/components/Icons';

/**
 * Historia sesji (UI-SPEC 3.7). Pełny ekran z podglądem, wznawianiem i usuwaniem to
 * etap 7; tutaj stan zapisu z etapu 3: ile sesji jest i co zawierają.
 */
export function HistoryScreen() {
  const plan = screenPlans.history;
  const { sessions, persistent } = useAppState();

  return (
    <ScreenShell
      title={strings.history}
      hash="#/history"
      stage={plan.stage}
      stageName={plan.stageName}
      note={sessionTexts.historyStub(sessions.length)}
      plan={plan.items}
      icon={<HistoryIcon className="h-7 w-7" />}
      pager={{ next: '#/s/demo/quiz', nextLabel: strings.quiz }}
    >
      {sessions.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-5 w-5" />}
          title={strings.historyEmpty}
          note={strings.historyEmptyNote}
          action={
            <a
              href="#/"
              className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 dark:text-[#08130c]"
            >
              {strings.startNew}
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          }
        />
      ) : (
        <div className="surface overflow-hidden p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
            <span className="label-mono">{strings.sessionsStored}</span>
            <Badge tone="accent">{sessionTexts.sessionsStored(sessions.length)}</Badge>
            <Badge tone={persistent ? 'outline' : 'warn'}>
              {persistent ? strings.storagePersistent : strings.storageMemoryMode}
            </Badge>
          </div>
          <ul className="grid gap-px bg-[var(--color-border)]">
            {sessions.map((session) => (
              <li key={session.id}>
                <a
                  href={`#/s/${session.id}/${MODE_ENTRY_VIEW[session.mode]}`}
                  className="group flex flex-wrap items-center gap-3 bg-[var(--color-surface)] px-[var(--pad-card)] py-3 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
                >
                  <span className="num shrink-0 text-[11px] text-[var(--color-muted)]">
                    {new Date(session.updatedAt).toLocaleDateString('pl-PL')}
                  </span>
                  <span className="text-sm font-semibold">{MODE_LABEL[session.mode]}</span>
                  <Badge tone={session.status === 'completed' ? 'accent' : 'outline'}>
                    {session.status === 'completed' ? strings.statusCompleted : strings.statusInProgress}
                  </Badge>
                  <span className="num text-[11px] text-[var(--color-muted)]">
                    {Object.keys(session.answers).length > 0
                      ? sessionTexts.answersCount(
                          Object.keys(session.answers).length,
                          screenPlans.quiz.items.length + 13,
                        )
                      : strings.noSessionsYet}
                  </span>
                  {session.picks.length > 0 ? (
                    <Badge tone="outline">
                      {strings.sessionFieldPicks}: {sessionTexts.picksList(session.picks.length)}
                    </Badge>
                  ) : null}
                  <span className="num ml-auto shrink-0 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 group-hover:text-[var(--color-accent-ink)]">
                    {strings.resumeAction}
                  </span>
                  <span className="shrink-0 text-[var(--color-border-strong)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="border-t border-[var(--color-border)] px-[var(--pad-card)] py-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
            {strings.historyPreview}
          </p>
        </div>
      )}
    </ScreenShell>
  );
}
