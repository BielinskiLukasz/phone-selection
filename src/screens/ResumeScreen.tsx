import { useEffect, useRef, useState } from 'react';
import { DATA_VERSION } from '@/data/phones';
import { sessionTexts, strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import { decodeResume } from '@/lib/resumeLink';
import { newSessionId } from '@/lib/session';
import { MODE_LABEL } from '@/types/state';
import type { GroupId } from '@/types';
import type { Mode } from '@/types/state';
import { GROUPS } from '@/data/criteria';
import { AlertIcon, ArrowRightIcon, CheckIcon } from '@/components/Icons';
import { Button } from '@/components/ui';

interface ResumeScreenProps {
  code: string;
}

interface ResumeState {
  sessionId: string | null;
  reason: string | null;
  mode: Mode | null;
  answers: number;
  topThree: GroupId[] | null;
}

/**
 * Wejście z linku `#/r/<kod>` (E7-06): odtwarza odpowiedzi z drugiego urządzenia
 * jako **nową** sesję i liczy ranking aktualnymi danymi.
 */
export function ResumeScreen({ code }: ResumeScreenProps) {
  const { dispatch } = useAppState();
  const [state, setState] = useState<ResumeState | null>(null);
  const processedRef = useRef<string | null>(null);

  useEffect(() => {
    if (processedRef.current === code) return;
    processedRef.current = code;

    const { payload, reason } = decodeResume(code);
    if (!payload) {
      setState({ sessionId: null, reason, mode: null, answers: 0, topThree: null });
      return;
    }

    const id = newSessionId();
    dispatch({
      type: 'session/create',
      mode: payload.mode,
      id,
      answers: payload.answers,
      topThree: payload.topThree,
    });
    setState({
      sessionId: id,
      reason: null,
      mode: payload.mode,
      answers: Object.keys(payload.answers).length,
      topThree: payload.topThree ? [...payload.topThree] : null,
    });
  }, [code, dispatch]);

  if (!state) {
    return (
      <section className="screen-in mx-auto w-full max-w-3xl px-5 py-20">
        <div className="surface flex items-center gap-3 p-[var(--pad-card)]">
          <span className="breathe h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
          <p className="num text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
            {strings.resumeLinkTitle}
          </p>
        </div>
      </section>
    );
  }

  if (!state.sessionId) {
    return (
      <section className="screen-in mx-auto w-full max-w-3xl px-5 py-16">
        <div className="surface flex flex-col gap-3 border-l-4 border-l-[var(--color-warn)] p-[var(--pad-card)]">
          <span className="flex items-center gap-2 text-[var(--color-warn)]">
            <AlertIcon className="h-5 w-5" />
            <span className="label-mono">link do wznowienia</span>
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{strings.resumeLinkErrorTitle}</h1>
          <p className="max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
            {state.reason ?? strings.resumeLinkErrorNote}
          </p>
          <Button
            variant="primary"
            iconRight={<ArrowRightIcon className="h-4 w-4" />}
            className="mt-2"
            href="#/"
          >
            {strings.backHome}
          </Button>
        </div>
      </section>
    );
  }

  const view = state.mode === 'sliders' ? 'sliders' : state.mode === 'hybrid' ? 'tune' : 'quiz';

  return (
    <section className="screen-in mx-auto w-full max-w-3xl px-5 py-14">
      <div className="surface flex flex-col gap-4 border-l-4 border-l-[var(--color-accent)] p-[var(--pad-card)]">
        <span className="flex items-center gap-2 text-[var(--color-accent-ink)]">
          <CheckIcon className="h-5 w-5" />
          <span className="label-mono">{strings.resumeLinkCreated}</span>
        </span>

        <h1 className="text-[clamp(1.8rem,6vw,2.6rem)] leading-tight font-bold tracking-[-0.04em]">
          {strings.resumeLinkTitle}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
          {strings.resumeLinkNote}
        </p>

        <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-border)] sm:grid-cols-3">
          {[
            { label: strings.sessionFieldMode, value: state.mode ? MODE_LABEL[state.mode] : '—' },
            {
              label: strings.resumeLinkAnswers,
              value: sessionTexts.answersCount(state.answers, state.mode === 'hybrid' ? 7 : 18),
            },
            { label: strings.historyDataFrom, value: DATA_VERSION ?? '—' },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--color-surface)] p-3">
              <dt className="label-mono">{item.label}</dt>
              <dd className="num mt-1 text-base font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>

        {state.topThree ? (
          <p className="num text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
            trójka najważniejszych:{' '}
            {state.topThree.map((id) => GROUPS.find((group) => group.id === id)?.label ?? id).join(' › ')}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            size="lg"
            iconRight={<ArrowRightIcon className="h-4 w-4" />}
            href={`#/s/${state.sessionId}/${view}`}
          >
            {strings.resumeLinkOpen}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            href="#/history"
          >
            {strings.history}
          </Button>
        </div>
      </div>
    </section>
  );
}
