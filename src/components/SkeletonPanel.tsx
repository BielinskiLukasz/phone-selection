import { strings } from '@/data/strings';
import {
  ACCEPTANCE_TESTS,
  CI_PIPELINE,
  CONSOLE_COMMANDS,
  daysSincePriceCheck,
  formatDate,
  pool,
} from '@/data/pool';
import { Reveal } from './Reveal';
import { CheckIcon, TerminalIcon, AlertIcon } from './Icons';

/** Stan szkieletu: potok CI, dane, komendy i testy akceptacyjne etapu 1. */
export function SkeletonPanel() {
  const days = daysSincePriceCheck();
  const stale = days > 30;

  const facts = [
    { label: 'Pula telefonów', value: `${pool.count} / ${pool.expected}`, note: 'etap 0 w toku' },
    { label: 'Limit budżetu', value: `${pool.budgetLimit} zł`, note: 'twardy filtr' },
    { label: 'Ceny sprawdzone', value: formatDate(pool.checkedAt), note: `${days} dni temu` },
    { label: 'Kryteria rankingu', value: '14', note: 'oceny 0–100' },
  ];

  return (
    <section
      aria-labelledby="skeleton-heading"
      className="mt-16 border-t border-dashed border-[var(--color-border-strong)] pt-10 sm:mt-24"
    >
      <Reveal className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="skeleton-heading"
            className="text-2xl font-bold tracking-tight sm:text-[28px]"
          >
            {strings.skeletonTitle}
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
            {strings.skeletonNote}
          </p>
        </div>
        <span className="num rounded-[var(--radius-pill)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1.5 text-[11px] tracking-[0.14em] text-[var(--color-accent-ink)] uppercase">
          deploy: github pages
        </span>
      </Reveal>

      {/* Potok wdrożenia */}
      <Reveal delay={60} className="surface mt-6 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
          <span className="label-mono">{strings.pipelineTitle}</span>
          <span className="ml-auto num text-[11px] text-[var(--color-muted)]">.github/workflows/deploy.yml</span>
        </div>
        <div className="overflow-x-auto px-[var(--pad-card)] py-5">
          <ol className="flex min-w-max items-stretch gap-2">
            {CI_PIPELINE.map((step, index) => {
              const last = index === CI_PIPELINE.length - 1;
              return (
                <li key={step.id} className="flex items-center gap-2">
                  <span
                    className={`group flex min-w-[104px] flex-col gap-1 rounded-[var(--radius-card)] border px-3 py-2.5 transition-transform duration-200 hover:-translate-y-0.5 ${
                      last
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'
                    }`}
                  >
                    <span className="num flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em]">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          last ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-ok)] breathe'
                        }`}
                        style={{ animationDelay: `${index * 180}ms` }}
                      />
                      {step.label}
                    </span>
                    <span className="text-[11px] text-[var(--color-muted)]">{step.detail}</span>
                  </span>
                  {!last ? (
                    <span className="num text-xs text-[var(--color-border-strong)]" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
        <p className="border-t border-[var(--color-border)] px-[var(--pad-card)] py-3 text-xs text-[var(--color-muted)]">
          {strings.pipelineNote}
        </p>
      </Reveal>

      {/* Dane i walidacja */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal delay={40} className="surface p-[var(--pad-card)]">
          <h3 className="label-mono">{strings.dataTitle}</h3>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-[calc(var(--radius-card)-4px)] bg-[var(--color-border)] sm:grid-cols-2">
            {facts.map((fact) => (
              <div key={fact.label} className="bg-[var(--color-surface)] p-3">
                <dt className="label-mono">{fact.label}</dt>
                <dd className="num mt-1.5 text-xl font-bold tracking-tight">{fact.value}</dd>
                <dd className="mt-0.5 text-[11px] text-[var(--color-muted)]">{fact.note}</dd>
              </div>
            ))}
          </dl>
          <p
            className={`mt-4 flex items-start gap-2 rounded-[var(--radius-card)] px-3 py-2.5 text-xs leading-relaxed ${
              stale
                ? 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]'
                : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'
            }`}
          >
            {stale ? <AlertIcon className="mt-px h-4 w-4" /> : <CheckIcon className="mt-px h-4 w-4" />}
            <span>{strings.dataWarning}</span>
          </p>
        </Reveal>

        <Reveal delay={90} className="surface p-[var(--pad-card)]">
          <h3 className="label-mono flex items-center gap-2">
            <TerminalIcon className="h-4 w-4" />
            {strings.commandsTitle}
          </h3>
          <ul className="mt-4 grid gap-1.5">
            {CONSOLE_COMMANDS.map((entry) => (
              <li
                key={entry.cmd}
                className="group flex items-baseline gap-3 rounded-[6px] px-2 py-1.5 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
              >
                <code className="num shrink-0 text-xs font-semibold text-[var(--color-accent-ink)]">
                  <span className="text-[var(--color-muted)]">$</span> {entry.cmd}
                </code>
                <span className="ml-auto text-right text-[11px] text-[var(--color-muted)]">
                  {entry.what}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Testy akceptacyjne */}
      <Reveal delay={60} className="surface mt-6 p-0">
        <details className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-[var(--pad-card)] py-4 text-sm font-semibold transition-colors duration-200 hover:bg-[var(--color-surface-2)] [&::-webkit-details-marker]:hidden">
            <span className="num flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-accent)] text-[11px] text-[var(--color-accent-ink)]">
              {ACCEPTANCE_TESTS.length}
            </span>
            {strings.acceptanceTitle}
            <span className="num ml-auto text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase transition-transform duration-200 group-open:rotate-90">
              ▸
            </span>
          </summary>
          <ul className="grid gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
            {ACCEPTANCE_TESTS.map((test) => (
              <li key={test.id} className="flex items-start gap-3 bg-[var(--color-surface)] px-[var(--pad-card)] py-3">
                <span className="num shrink-0 text-[11px] font-semibold text-[var(--color-muted)]">
                  {test.id}
                </span>
                <span className="text-sm leading-relaxed text-[var(--color-text)]">{test.text}</span>
                <span className="ml-auto shrink-0 text-[var(--color-ok)]">
                  <CheckIcon className="h-4 w-4" />
                </span>
              </li>
            ))}
          </ul>
        </details>
      </Reveal>
    </section>
  );
}
