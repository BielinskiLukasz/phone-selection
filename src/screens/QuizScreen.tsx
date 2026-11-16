import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GROUPS } from '@/data/criteria';
import { PHONES } from '@/data/phones';
import { sessionTexts, strings, quizBlocks } from '@/data/strings';
import type { Session } from '@/types/state';
import type { GroupId, QuizOption } from '@/types';
import { useAppState } from '@/features/state/StateProvider';
import {
  answeredQuestions,
  blockAt,
  buildSteps,
  isLowPersonalization,
  nextAnswerableIndex,
  prevAnswerableIndex,
  questionNumberAt,
  questionSteps,
  resumeIndex,
  skippedQuestions,
  stepKey,
  totalQuestions,
} from '@/features/quiz/quizFlow';
import { remainingCount } from '@/lib/exclusions';
import { ProgressBar } from '@/components/ProgressBar';
import { OptionButton } from '@/components/OptionButton';
import { TopThreePicker } from '@/components/TopThreePicker';
import { Badge } from '@/components/Badge';
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@/components/Icons';

/**
 * Auto-przejście po wybraniu odpowiedzi (UI-SPEC 3.2: ok. 250 ms).
 * `VITE_QUIZ_ADVANCE_MS` pozwala skrócić je w testach; w buildzie zostaje 250 ms.
 */
const ADVANCE_DELAY_MS = Number(import.meta.env.VITE_QUIZ_ADVANCE_MS ?? 250) || 250;

interface QuizScreenProps {
  session: Session;
}

/**
 * Tryb quiz (E4-01…E4-09): bloki A-F, krok G1, podsumowanie i przejście do rankingu.
 * Każda odpowiedź jest zapisywana od razu — przerwanie i powrót odtwarza stan.
 */
export function QuizScreen({ session }: QuizScreenProps) {
  const { dispatch } = useAppState();
  const steps = useMemo(() => buildSteps(PHONES, session.mode), [session.mode]);
  const total = useMemo(() => totalQuestions(steps), [steps]);

  const [index, setIndex] = useState(() => resumeIndex(steps, session));
  const [resumed, setResumed] = useState(() => resumeIndex(steps, session) > 0);
  const [picks, setPicks] = useState<GroupId[]>(() => [...(session.topThree?.picks ?? [])]);
  const [roving, setRoving] = useState(0);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);

  const step = steps[index];
  const questions = useMemo(() => questionSteps(steps), [steps]);
  const answered = answeredQuestions(steps, session.answers);
  const skipped = skippedQuestions(steps, session.answers);
  const block = blockAt(steps, index);
  const lowPersonalization = isLowPersonalization(steps, session.answers);

  /* E4-09: po zmianie kroku fokus ląduje na nagłówku. */
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    setRoving(0);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [index]);

  const goNext = useCallback(() => {
    setResumed(false);
    setIndex((current) => nextAnswerableIndex(steps, current));
  }, [steps]);

  const goPrev = useCallback(() => {
    setResumed(false);
    setIndex((current) => prevAnswerableIndex(steps, current));
  }, [steps]);

  function choose(option: QuizOption) {
    if (!step || step.kind !== 'question') return;
    dispatch({
      type: 'session/answer',
      sessionId: session.id,
      questionId: step.question.id,
      optionId: option.id,
    });
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(goNext, ADVANCE_DELAY_MS);
  }

  /* Obsługa klawiatury w radiogroup: strzałki przesuwają fokus (UI-SPEC 8). */
  function onOptionKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, position: number) {
    const options = step?.kind === 'question' ? step.question.options : [];

    /* Spacja i Enter wybierają odpowiedź tak samo jak kliknięcie (UI-SPEC 8). */
    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
      const option = options[position];
      if (option) {
        event.preventDefault();
        choose(option);
      }
      return;
    }

    let target: number | null = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') target = (position + 1) % options.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      target = (position - 1 + options.length) % options.length;
    } else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = options.length - 1;

    if (target === null) return;
    event.preventDefault();
    setRoving(target);
    optionRefs.current[target]?.focus();
  }

  function togglePick(id: GroupId) {
    setPicks((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
  }

  function commitTopThree(skip: boolean) {
    dispatch({
      type: 'session/top-three',
      sessionId: session.id,
      picks: skip || picks.length !== 3 ? null : (picks as [GroupId, GroupId, GroupId]),
    });
    goNext();
  }

  /* E4-06: zakończenie liczy ranking, domyka sesję i prowadzi do kart (albo dostrojenia w hybrydzie). */
  function finish() {
    dispatch({ type: 'session/compute-ranking', sessionId: session.id });
    dispatch({ type: 'session/status', sessionId: session.id, status: 'completed' });
    const view = session.mode === 'hybrid' ? 'tune' : 'cards';
    window.location.hash = `#/s/${session.id}/${view}`;
  }

  if (!step) return null;

  const stage = step.kind === 'summary' ? 'summary' : step.kind === 'top-three' ? 'top-three' : 'questions';
  const selectedOptionId =
    step.kind === 'question' ? session.answers[step.question.id] : undefined;
  const selectedPosition =
    step.kind === 'question'
      ? step.question.options.findIndex((option) => option.id === selectedOptionId)
      : -1;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:pb-16 sm:pt-10">
      {/* Nagłówek quizu: blok, licznik, postęp, wyjście */}
      <header className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-sm transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {strings.back}
        </button>

        <span className="num flex min-w-0 items-center gap-2 text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
          <span className="truncate">
            {block ? quizBlocks[block].title : step.kind === 'summary' ? strings.quizSummaryTitle : 'trzy najważniejsze'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">
            {stage === 'questions'
              ? `${questionNumberAt(steps, index)} z ${total}`
              : stage === 'top-three'
                ? 'krok G1'
                : `${answered} z ${total}`}
          </span>
        </span>

        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/';
          }}
          className="num ml-auto inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] px-3 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:text-[var(--color-text)]"
        >
          {strings.quizSaveExit}
        </button>
      </header>

      <div className="mt-4">
        <ProgressBar answered={answered} total={total} block={block} stage={stage} />
      </div>

      {resumed ? (
        <p className="num mt-4 flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-accent-soft)] px-3 py-2 text-[11px] tracking-[0.08em] text-[var(--color-accent-ink)] uppercase">
          <CheckIcon className="h-3.5 w-3.5" />
          {strings.quizResumeNote}
        </p>
      ) : null}

      {/* ── Nagłówek bloku ── */}
      {step.kind === 'block' ? (
        <section key={stepKey(step)} className="step-in mt-10">
          <span className="label-mono">{strings.quizStepOfBlock}</span>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-[clamp(2rem,7vw,3rem)] leading-[1.05] font-bold tracking-[-0.04em] outline-none"
          >
            {step.title}
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-[var(--color-muted)]">
            {step.subtitle}
          </p>
          <button
            type="button"
            onClick={goNext}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-on-accent)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {strings.next}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </section>
      ) : null}

      {/* ── Pytanie ── */}
      {step.kind === 'question' ? (
        <section key={stepKey(step)} className="step-in mt-8">
          <h1
            id={`pytanie-${step.question.id}`}
            ref={headingRef}
            tabIndex={-1}
            className="max-w-[36ch] text-[clamp(1.5rem,5.2vw,2.15rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-balance outline-none"
          >
            {step.question.text}
          </h1>

          <div
            role="radiogroup"
            aria-labelledby={`pytanie-${step.question.id}`}
            aria-required="false"
            className="mt-6 grid gap-2.5"
          >
            {step.question.options.map((option, position) => (
              <OptionButton
                key={option.id}
                option={option}
                index={position}
                selected={option.id === selectedOptionId}
                onSelect={() => choose(option)}
                tabIndex={
                  (selectedPosition >= 0 ? selectedPosition : roving) === position ? 0 : -1
                }
                buttonRef={(element) => {
                  /* Callback ref sam zeruje wpis przy odmontowaniu przycisku. */
                  optionRefs.current[position] = element;
                }}
                onKeyDown={(event) => onOptionKeyDown(event, position)}
              />
            ))}
          </div>

          <details className="group mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <summary className="num flex min-h-8 cursor-pointer list-none items-center gap-2 text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase transition-colors duration-200 group-open:text-[var(--color-accent-ink)] [&::-webkit-details-marker]:hidden">
              {strings.quizWhy}
              <span className="ml-auto transition-transform duration-200 group-open:rotate-90">▸</span>
            </summary>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
              {step.question.why}
            </p>
          </details>

          <p className="num mt-4 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
            {strings.quizSavedNote} · {strings.quizKeyboardHint}
          </p>
        </section>
      ) : null}

      {/* ── Krok G1 ── */}
      {step.kind === 'top-three' ? (
        <section key={stepKey(step)} className="step-in mt-8">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-[clamp(1.6rem,5.5vw,2.3rem)] leading-tight font-bold tracking-[-0.035em] outline-none"
          >
            Wybierz trzy najważniejsze rzeczy
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            {strings.quizTopThreeHint}
          </p>

          <div className="mt-6">
            <TopThreePicker picks={picks} weights={session.weights} onToggle={togglePick} />
          </div>

          <p aria-live="polite" className="num mt-2 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
            wybrane {picks.length} z 3
          </p>
        </section>
      ) : null}

      {/* ── Podsumowanie przed liczeniem rankingu ── */}
      {step.kind === 'summary' ? (
        <section key={stepKey(step)} className="step-in mt-8">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-[clamp(1.6rem,5.5vw,2.3rem)] leading-tight font-bold tracking-[-0.035em] outline-none"
          >
            {strings.quizSummaryTitle}
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            {strings.quizSummaryNote}
          </p>

          <p className="num mt-3 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
            {sessionTexts.answeredSummary(answered, total, skipped)}
          </p>

          {lowPersonalization ? (
            <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-card)] bg-[var(--color-warn-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--color-warn)]">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {strings.quizLowPersonalization}
            </p>
          ) : null}

          <div className="surface mt-6 overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
              <span className="label-mono">ważności grup</span>
              {session.topThree ? (
                <Badge tone="accent">trójka: {session.topThree.picks.map((id) => GROUPS.find((g) => g.id === id)?.label ?? id).join(' · ')}</Badge>
              ) : (
                <Badge tone="outline">krok G1 pominięty</Badge>
              )}
            </div>
            <ul className="grid gap-px bg-[var(--color-border)]">
              {GROUPS.map((group) => {
                const value = session.groupImportance[group.id] ?? 0;
                return (
                  <li key={group.id} className="flex items-center gap-3 bg-[var(--color-surface)] px-[var(--pad-card)] py-3">
                    <span className="w-[38%] shrink-0 truncate text-sm">{group.label}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                      <span
                        className="bar-grow block h-full rounded-full bg-[var(--color-accent)]"
                        style={{ width: `${Math.min(100, (value / 5) * 100)}%` }}
                      />
                    </span>
                    <span className="num w-10 shrink-0 text-right text-xs font-semibold">
                      {sessionTexts.weightValue(value)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-[var(--pad-card)] py-3">
              <span className="num text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
                filtry: {session.filters.budgetMax} zł
                {session.filters.minStorageGb ? ` · min ${session.filters.minStorageGb} GB` : ' · pamięć dowolna'}
              </span>
              <span aria-live="polite" className="num ml-auto text-xs font-semibold text-[var(--color-accent-ink)]">
                {sessionTexts.poolMatches(remainingCount(PHONES, session.filters), PHONES.length)}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      {/* Główna czynność: pasek przyklejony do dołu na telefonie, w treści od 640 px (UI-SPEC 7) */}
      {step.kind === 'top-three' || step.kind === 'summary' ? (
        <>
          <div className="mt-8 hidden gap-3 sm:flex">
            {step.kind === 'summary' ? (
              <>
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-on-accent)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {strings.quizShowResults}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex(0)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-5 text-sm transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
                >
                  {strings.quizChangeAnswers}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => commitTopThree(false)}
                  disabled={picks.length !== 3}
                  className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-on-accent)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                >
                  {strings.quizShowResults}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => commitTopThree(true)}
                  className="inline-flex min-h-12 items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-5 text-sm transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
                >
                  {strings.quizSkipStep}
                </button>
              </>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
            {step.kind === 'summary' ? (
              <button
                type="button"
                onClick={finish}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-on-accent)]"
              >
                {strings.quizShowResults}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => commitTopThree(false)}
                  disabled={picks.length !== 3}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-on-accent)] disabled:opacity-40"
                >
                  {strings.quizShowResults}
                </button>
                <button
                  type="button"
                  onClick={() => commitTopThree(true)}
                  className="flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-sm text-[var(--color-muted)]"
                >
                  {strings.quizSkipStep}
                </button>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Stopka nawigacyjna quizu: podgląd postępu i skrót do kart po zakończeniu */}
      <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-5">
        <span className="num text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {session.mode === 'hybrid' ? 'krótki quiz (hybryda)' : 'pełny quiz'} ·{' '}
          {questions.length} pytań
        </span>
        {session.status === 'completed' ? (
          <a
            href={`#/s/${session.id}/${session.mode === 'hybrid' ? 'tune' : 'cards'}`}
            className="num ml-auto inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 text-[11px] tracking-[0.12em] text-[var(--color-accent-ink)] uppercase transition-transform duration-200 hover:-translate-y-0.5"
          >
            {strings.quizGoToCards}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        ) : (
          <span className="num ml-auto truncate text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
            sesja {session.id}
          </span>
        )}
      </footer>
    </div>
  );
}
