import { useMemo, useState } from 'react';
import { isPreviewSessionId, parseHash, type Route } from '@/app/router';
import { strings } from '@/data/strings';
import { ArrowRightIcon } from './Icons';

const PRESETS = [
  '#/',
  '#/s/demo/quiz',
  '#/s/demo/cards',
  '#/history',
  '#/s/2f9c1a/quiz',
  '#/ustawienia',
];

interface Readout {
  screen: string;
  status: 'ready' | 'stub' | 'error';
  session: string;
}

function describe(route: Route, knownSessions: readonly string[] = []): Readout {
  if (route.name === 'resume') {
    return { screen: strings.resumeLinkTitle, status: 'ready', session: '—' };
  }

  if (route.name !== 'home' && route.name !== 'history' && route.name !== 'not-found') {
    const exists =
      knownSessions.includes(route.sessionId) || isPreviewSessionId(route.sessionId);
    if (!exists) {
      return { screen: strings.missingSession, status: 'error', session: route.sessionId };
    }
  }

  switch (route.name) {
    case 'home':
      return { screen: strings.home, status: 'ready', session: '—' };
    case 'history':
      return { screen: strings.history, status: 'stub', session: '—' };
    case 'not-found':
      return { screen: strings.unknownRoute, status: 'error', session: '—' };
    default:
      return {
        screen:
          route.name === 'quiz'
            ? strings.quiz
            : route.name === 'sliders'
              ? strings.sliders
              : route.name === 'tune'
                ? strings.tune
                : route.name === 'cards'
                  ? strings.cards
                  : strings.ranking,
        status: 'stub',
        session: route.sessionId,
      };
  }
}

const statusStyles: Record<Readout['status'], string> = {
  ready: 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]',
  stub: 'bg-[var(--color-surface-2)] text-[var(--color-muted)]',
  error: 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]',
};

/** Interaktywny podgląd działania routera hashowego (E1-07) + stan sesji (etap 3). */
export function RouterConsole({ knownSessions = [] }: { knownSessions?: readonly string[] }) {
  const [value, setValue] = useState('#/s/demo/quiz');

  const hash = useMemo(() => {
    const trimmed = value.trim();
    if (trimmed === '') return '#/';
    return trimmed.startsWith('#') ? trimmed : `#${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }, [value]);

  const route = useMemo(() => parseHash(hash), [hash]);
  const readout = describe(route, knownSessions);
  const statusLabel =
    readout.status === 'ready'
      ? strings.routerStatusReady
      : readout.status === 'stub'
        ? strings.routerStatusStub
        : strings.routerStatusError;

  return (
    <div className="surface mt-6 overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="label-mono">{strings.routerConsoleTitle}</span>
        <span className="num ml-auto text-[11px] text-[var(--color-muted)]">src/app/router.ts</span>
      </div>

      <div className="grid gap-4 p-[var(--pad-card)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label className="label-mono" htmlFor="router-input">
            {strings.routerInputLabel}
          </label>
          <input
            id="router-input"
            type="text"
            value={value}
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => setValue(event.target.value)}
            className="num mt-2 min-h-11 w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] transition-colors duration-200 focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)]"
          />

          <p className="label-mono mt-4">{strings.routerPresets}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue(preset)}
                className={`num rounded-[var(--radius-pill)] border px-2.5 py-1.5 text-[11px] transition-colors duration-200 ${
                  preset === hash
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite">
          <p className="label-mono">{strings.routerHint}</p>
          <dl className="mt-2 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-border)]">
            {[
              { label: strings.routerScreen, value: readout.screen },
              { label: strings.routerSession, value: readout.session },
              { label: 'name', value: route.name },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline gap-3 bg-[var(--color-surface)] px-3 py-2">
                <dt className="num w-20 shrink-0 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                  {row.label}
                </dt>
                <dd className="num truncate text-sm font-semibold">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-center gap-3 bg-[var(--color-surface)] px-3 py-2">
              <dt className="num w-20 shrink-0 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                {strings.routerStatus}
              </dt>
              <dd
                className={`num m-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] tracking-[0.1em] uppercase ${statusStyles[readout.status]}`}
              >
                {statusLabel}
              </dd>
            </div>
          </dl>

          <a
            href={hash}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-bg)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {strings.routerOpen} {hash}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
