import { screenPlans, strings } from '@/data/strings';
import { ScreenShell } from '@/components/ScreenShell';
import { EmptyState } from '@/components/EmptyState';
import { RouteChip } from '@/components/RouteChip';
import { ArrowRightIcon, HistoryIcon } from '@/components/Icons';
import { HistoryMock } from './mocks';

/** Historia sesji (UI-SPEC 3.7) — na etapie 1 jako zaślepka z pustym stanem. */
export function HistoryScreen() {
  const plan = screenPlans.history;

  return (
    <ScreenShell
      title={strings.history}
      hash="#/history"
      stage={plan.stage}
      stageName={plan.stageName}
      note={strings.historyPreview}
      plan={plan.items}
      icon={<HistoryIcon className="h-7 w-7" />}
      pager={{ next: '#/s/demo/quiz', nextLabel: strings.quiz }}
    >
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

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="label-mono">{strings.historyListPreview}</span>
          <RouteChip hash="#/history" tone="default" copyable={false} />
        </div>
        <HistoryMock />
      </div>
    </ScreenShell>
  );
}
