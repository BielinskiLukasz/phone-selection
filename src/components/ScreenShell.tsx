import { useEffect, useRef, type ReactNode } from 'react';
import { strings } from '@/data/strings';
import { Badge } from './Badge';
import { RouteChip } from './RouteChip';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface ScreenShellProps {
  title: string;
  hash: string;
  stage?: number;
  stageName?: string;
  note?: string;
  plan?: readonly string[];
  icon?: ReactNode;
  pager?: {
    prev?: string;
    prevLabel?: string;
    next?: string;
    nextLabel?: string;
  };
  children?: ReactNode;
}

/** Ramka ekranu-szkieletu: adres, nagłówek z fokusem, plan zawartości, pager. */
export function ScreenShell({
  title,
  hash,
  stage,
  stageName,
  note = strings.preview,
  plan,
  icon,
  pager,
  children,
}: ScreenShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  /* UI-SPEC 8: po przejściu między ekranami fokus ląduje na nagłówku. */
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [title]);

  return (
    <section key={hash} className="screen-in mx-auto w-full max-w-3xl px-5 pb-20 pt-8 sm:pt-12">
      <div className="flex flex-wrap items-center gap-2">
        <RouteChip hash={hash} tone="active" />
        {stage ? (
          <Badge tone="outline">
            {strings.plannedIn} {stage}
            {stageName ? ` · ${stageName}` : ''}
          </Badge>
        ) : null}
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 flex items-center gap-3 text-[clamp(2.1rem,7vw,3.2rem)] leading-[1.02] font-bold tracking-[-0.04em] outline-none"
      >
        {icon ? <span className="text-[var(--color-accent)]">{icon}</span> : null}
        {title}
      </h1>

      <div className="rule-draw mt-4 h-px w-full bg-[var(--color-border)]" />

      <p className="mt-5 max-w-prose border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
        {note}
      </p>

      {children ? <div className="mt-8">{children}</div> : null}

      {plan && plan.length > 0 ? (
        <div className="surface mt-8 p-[var(--pad-card)]">
          <h2 className="label-mono">{strings.willContain}</h2>
          <ol className="mt-4 grid gap-3">
            {plan.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <span className="num mt-[2px] shrink-0 text-[11px] font-semibold text-[var(--color-accent)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[var(--color-text)]">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <nav
        aria-label={strings.screenPager}
        className="mt-10 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-6"
      >
        <a
          href="#/"
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-medium transition-colors duration-200 hover:border-[var(--color-border-strong)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {strings.backHome}
        </a>

        {pager?.prev ? (
          <a
            href={pager.prev}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] px-4 text-sm text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--color-text)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {pager.prevLabel ?? strings.back}
          </a>
        ) : null}

        {pager?.next ? (
          <a
            href={pager.next}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-bg)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            {pager.nextLabel ?? strings.next}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        ) : null}
      </nav>
    </section>
  );
}
