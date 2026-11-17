import { useMemo, useState, type ChangeEvent } from 'react';
import { sessionTexts, strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import { historyStats, summarizeSession } from '@/features/history/historyModel';
import { sortSessions } from '@/lib/session';
import { resumeHash } from '@/lib/resumeLink';
import { downloadHistory, parseHistory, readHistoryFile } from '@/lib/historyTransfer';
import type { Session } from '@/types/state';
import { SessionListItem } from '@/components/SessionListItem';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmSheet } from '@/components/ConfirmSheet';
import { Toast } from '@/components/Toast';
import { ArrowRightIcon, HistoryIcon, TerminalIcon } from '@/components/Icons';
import { Button } from '@/components/ui';

/**
 * Historia sesji (E7-01…E7-05, E7-07; UI-SPEC 3.7): lista od najnowszej,
 * wznawianie przerwanych, podgląd ukończonych ze snapshotu, usuwanie z potwierdzeniem,
 * eksport i import pliku JSON oraz link do wznowienia na drugim urządzeniu.
 */
export function HistoryScreen() {
  const { sessions, dispatch, state } = useAppState();
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const summaries = useMemo(() => {
    const labels = {
      inProgress: strings.statusInProgress,
      completed: strings.statusCompleted,
    };
    return sortSessions(sessions).map((session) => summarizeSession(session, labels));
  }, [sessions]);

  const stats = useMemo(() => historyStats(sessions), [sessions]);
  const imported = state.lastImport ?? null;

  function exportHistory() {
    const name = downloadHistory(sessions);
    setToast(`${strings.historyExport}: ${name}`);
  }

  async function onImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = parseHistory(await readHistoryFile(file));
      if (parsed.sessions.length === 0) {
        setToast(`${strings.historyImportFailed} ${parsed.errors.join(' ')}`.trim());
        return;
      }
      dispatch({ type: 'history/import', sessions: parsed.sessions });
      setToast(`${strings.historyImportDone} ${parsed.errors.join(' ')}`.trim());
    } catch {
      setToast(strings.historyImportFailed);
    }
  }

  async function copyResumeLink(session: Session) {
    const url = `${window.location.origin}${window.location.pathname}${resumeHash(session)}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast(strings.historyLinkCopied);
    } catch {
      setToast(strings.historyLinkCopyFailed);
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    dispatch({ type: 'session/delete', sessionId: pendingDelete.id });
    setPendingDelete(null);
    setToast(strings.historyDeleted);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-16 pt-8 sm:pt-12">
      <header>
        <span className="label-mono flex items-center gap-2">
          <HistoryIcon className="h-4 w-4" />
          {strings.storageKey}
        </span>
        <h1 className="mt-4 text-[clamp(2.2rem,7.5vw,3.4rem)] leading-[1.02] font-bold tracking-[-0.045em]">
          {strings.history}
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-[var(--color-muted)]">
          {strings.historyLead}
        </p>

        <p aria-live="polite" className="num mt-5 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {stats.total > 0 ? sessionTexts.historyStats(stats) : strings.historyEmpty}
        </p>
      </header>

      <div className="rule-draw mt-6 h-px w-full bg-[var(--color-border)]" />

      {/* Pasek narzędzi: nowa sesja, eksport, import */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          iconRight={<ArrowRightIcon className="h-4 w-4" />}
          href="#/"
        >
          {strings.historyNew}
        </Button>

        <Button
          variant="secondary"
          icon={<TerminalIcon className="h-3.5 w-3.5" />}
          onClick={exportHistory}
          disabled={sessions.length === 0}
        >
          {strings.historyExport}
        </Button>

        <label className="num inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]">
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              void onImportFile(event);
            }}
          />
          {strings.historyImport}
        </label>

        <span className="num hidden text-[11px] tracking-[0.08em] text-[var(--color-muted)] uppercase lg:block">
          {strings.historyTransferNote}
        </span>
      </div>

      {imported ? (
        <p className="num mt-4 rounded-[var(--radius-card)] bg-[var(--color-accent-soft)] px-4 py-2.5 text-[11px] tracking-[0.08em] text-[var(--color-accent-ink)] uppercase">
          {strings.historyImportDone} {sessionTexts.importResult(imported.added, imported.updated, imported.duplicates)}
        </p>
      ) : null}

      {/* Lista albo stan pusty */}
      {summaries.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<HistoryIcon className="h-5 w-5" />}
            title={strings.historyEmpty}
            note={strings.historyEmptyLead}
            action={
              <Button
                variant="primary"
                iconRight={<ArrowRightIcon className="h-4 w-4" />}
                href="#/"
              >
                {strings.startNew}
              </Button>
            }
          />
        </div>
      ) : (
        <>
        <h2 className="label-mono mt-8">{strings.sessionsStored}</h2>
        <ul className="mt-3">
          {summaries.map((summary, index) => (
            <SessionListItem
              key={summary.id}
              summary={summary}
              index={index}
              isLast={index === summaries.length - 1}
              onDelete={() => setPendingDelete(sessions.find((item) => item.id === summary.id) ?? null)}
              onCopyLink={() => {
                const session = sessions.find((item) => item.id === summary.id);
                if (session) void copyResumeLink(session);
              }}
            />
          ))}
        </ul>
        </>
      )}

      <ConfirmSheet
        open={pendingDelete !== null}
        title={strings.historyDeleteTitle}
        body={strings.historyDeleteBody}
        confirmLabel={strings.historyDeleteConfirm}
        cancelLabel={strings.historyDeleteCancel}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
