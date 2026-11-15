import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import type { Route } from '@/app/router';
import type { Theme } from '@/features/theme/useTheme';
import { strings } from '@/data/strings';
import { ROADMAP_STAGES } from '@/data/pool';

interface LayoutProps {
  children: ReactNode;
  route: Route;
  theme: Theme;
  onToggleTheme: () => void;
}

const PLANNING_DOCS = ['PROJECT.md', 'UI-SPEC.md', 'ROADMAP.md', 'ETAP-1-szkielet-i-deploy.md'];
const REPO_PLANNING = 'https://github.com/BielinskiLukasz/phone-selection/tree/main/planning';

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
            <div>
              <p className="num text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase">
                {strings.planningDocs}
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {PLANNING_DOCS.map((doc) => (
                  <li key={doc}>
                    <a
                      href={`${REPO_PLANNING}/${doc}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="num text-xs text-[var(--color-muted)] underline decoration-[var(--color-border-strong)] underline-offset-4 transition-colors duration-200 hover:text-[var(--color-accent-ink)]"
                    >
                      {doc}
                    </a>
                  </li>
                ))}
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
                etap 1 z 9 · {ROADMAP_STAGES.filter((s) => s.done).length} ukończone
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
