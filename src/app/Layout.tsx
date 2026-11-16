import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import type { Route } from '@/app/router';
import { strings } from '@/data/strings';
import { ROADMAP_STAGES, roadmapStatus } from '@/data/pool';
import { PLANNING_SPECS, PLANNING_STAGES, docUrl } from '@/data/docs';
import type { Theme } from '@/types/state';

interface LayoutProps {
  children: ReactNode;
  route: Route;
  theme: Theme;
  onToggleTheme: () => void;
}

/** Wspólny układ (E1-08): nagłówek, kontener max-w-3xl, stopka ze stanem etapów. */
export function Layout({ children, route, theme, onToggleTheme }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Przycisk zamiast kotwicy: hash jest zajęty przez router tras. */}
      <button
        type="button"
        onClick={() => {
          const target = document.getElementById('tresc');
          target?.setAttribute('tabindex', '-1');
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ block: 'start' });
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[var(--radius-pill)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Przejdź do treści
      </button>

      <AppHeader theme={theme} onToggleTheme={onToggleTheme} route={route} />

      <main id="tresc" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)]">
        <div className="mx-auto w-full max-w-3xl px-5 pt-10 pb-28 sm:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="num text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase">
                {strings.planningDocs} · {strings.docsSpecs}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {PLANNING_SPECS.map((doc) => (
                  <li key={doc.file}>
                    <a
                      href={docUrl(doc.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={doc.note}
                      className="num text-xs text-[var(--color-muted)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition-colors duration-200 hover:text-[var(--color-accent-ink)]"
                    >
                      {doc.label}
                    </a>
                  </li>
                ))}
              </ul>

              <p className="num mt-4 text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase">
                {strings.docsStages}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {PLANNING_STAGES.map((doc) => {
                  const done = ROADMAP_STAGES.some(
                    (stage) => stage.id === doc.stage && stage.done,
                  );
                  return (
                    <li key={doc.file}>
                      <a
                        href={docUrl(doc.file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${doc.note}${done ? ' — zrobione' : ''}`}
                        className={`num inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1 text-[11px] transition-colors duration-200 ${
                          done
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                            : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {doc.label}
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            done ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border-strong)]'
                          }`}
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="num text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase">
                roadmap
              </p>
              <ol className="mt-2.5 flex items-center gap-1" aria-label="Postęp etapów">
                {ROADMAP_STAGES.map((stage) => (
                  <li key={stage.id} title={`Etap ${stage.id} — ${stage.name}`}>
                    <span
                      className={`block h-2.5 rounded-full transition-all duration-200 hover:scale-y-150 ${
                        stage.done
                          ? 'w-7 bg-[var(--color-accent)]'
                          : stage.active
                            ? 'w-4 bg-[var(--color-accent)] opacity-45'
                            : 'w-2.5 bg-[var(--color-border-strong)]'
                      }`}
                    />
                  </li>
                ))}
              </ol>
              <p className="num mt-2 text-[11px] text-[var(--color-muted)]">
                {strings.roadmapNext} {roadmapStatus().next} · {roadmapStatus().done}{' '}
                {strings.roadmapDone} z {roadmapStatus().total}
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-prose border-t border-[var(--color-border)] pt-5 text-xs leading-relaxed text-[var(--color-muted)]">
            {strings.footerNote} <span className="num">{strings.dataWarning}</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
