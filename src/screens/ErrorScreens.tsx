import type { ReactNode } from 'react';
import { strings } from '@/data/strings';
import { RouteChip } from '@/components/RouteChip';
import { AlertIcon, ArrowRightIcon, PhoneIcon } from '@/components/Icons';

interface ErrorFrameProps {
  code: string;
  title: string;
  description: string;
  chips: ReactNode;
  actions: ReactNode;
}

function ErrorFrame({ code, title, description, chips, actions }: ErrorFrameProps) {
  return (
    <section className="screen-in mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:pt-20">
      <div className="surface relative overflow-hidden p-[var(--pad-card)] sm:p-8">
        <span
          className="pointer-events-none absolute -right-6 -top-10 select-none num text-[9rem] leading-none font-bold text-[var(--color-surface-2)]"
          aria-hidden="true"
        >
          {code}
        </span>

        <span className="relative flex items-center gap-2 text-[var(--color-warn)]">
          <AlertIcon className="h-5 w-5" />
          <span className="label-mono">status {code}</span>
        </span>

        <h1
          tabIndex={-1}
          className="relative mt-4 text-[clamp(1.9rem,6vw,2.8rem)] leading-tight font-bold tracking-[-0.04em] outline-none"
        >
          {title}
        </h1>
        <p className="relative mt-3 max-w-prose text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
          {description}
        </p>

        <div className="relative mt-6 flex flex-wrap gap-2">{chips}</div>
        <div className="relative mt-8 flex flex-wrap gap-3">{actions}</div>
      </div>
    </section>
  );
}

const primaryAction =
  'inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 dark:text-[#08130c]';
const ghostAction =
  'inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-5 text-sm font-medium transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]';

/** Nieznany adres (UI-SPEC 2: wejście na nieistniejącą trasę kończy się komunikatem). */
export function NotFoundScreen({ path }: { path: string }) {
  return (
    <ErrorFrame
      code="404"
      title={strings.unknownRoute}
      description={strings.unknownRouteDescription}
      chips={
        <>
          <RouteChip hash={`#${path}`} tone="error" label={strings.requestedAddress} />
          <RouteChip hash="#/" tone="default" copyable={false} />
        </>
      }
      actions={
        <>
          <a href="#/" className={primaryAction}>
            <PhoneIcon className="h-4 w-4" />
            {strings.backHome}
          </a>
          <a href="#/history" className={ghostAction}>
            {strings.history}
          </a>
        </>
      }
    />
  );
}

/** Adres nieistniejącej sesji: komunikat i powrót do Startu. */
export function MissingSessionScreen({
  sessionId,
  view,
}: {
  sessionId: string;
  view: string;
}) {
  return (
    <ErrorFrame
      code="410"
      title={strings.missingSession}
      description={strings.missingSessionDescription}
      chips={
        <>
          <RouteChip hash={`#/s/${sessionId}/${view}`} tone="error" label={strings.requestedSession} />
          <RouteChip hash={view} tone="default" label={strings.requestedView} copyable={false} />
        </>
      }
      actions={
        <>
          <a href="#/" className={primaryAction}>
            {strings.startNew}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a href={`#/s/demo/${view}`} className={ghostAction}>
            {strings.skeletonPreview}
          </a>
        </>
      }
    />
  );
}
