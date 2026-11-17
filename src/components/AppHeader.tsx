import { strings } from '@/data/strings';
import type { Route } from '@/app/router';
import { ThemeToggle } from './ThemeToggle';
import { HistoryIcon } from './Icons';
import type { Theme } from '@/types/state';
import { cn } from '@/utils/cn';

interface AppHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  route: Route;
  /** Liczba nieukończonych sesji — kropka przy ikonie Historii (FIX-UI §5.1). */
  unfinishedCount?: number;
}

/**
 * UIP2-01 · okruszek kroku zamiast paska postępu tras (FIX-UI §5.1, D6).
 * Pasek liczony z kolejności tras mówił „100 %” na Historii — tu trzy etapy sesji: Pytania → Propozycje → Wybór.
 */
const STEPS = [
  { id: 'answers', label: strings.crumbAnswers, routes: ['exclude', 'quiz', 'sliders', 'tune'] },
  { id: 'cards', label: strings.crumbCards, routes: ['cards'] },
  { id: 'pick', label: strings.crumbPick, routes: ['ranking'] },
] as const;

export function AppHeader({ theme, onToggleTheme, route, unfinishedCount = 0 }: AppHeaderProps) {
  const activeStep = STEPS.findIndex((step) => (step.routes as readonly string[]).includes(route.name));
  const inSession = activeStep >= 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_90%,transparent)] backdrop-blur-md">
      {/* Przycisk zamiast kotwicy: hash jest zajęty przez router tras (E8-07). */}
      <button
        type="button"
        onClick={() => {
          const target = document.getElementById('tresc');
          target?.setAttribute('tabindex', '-1');
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ block: 'start' });
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[var(--radius-control)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-small focus:font-semibold focus:text-[var(--color-on-accent)]"
      >
        Przejdź do treści
      </button>

      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-4 px-5">
        <a href="#/" className="flex min-w-0 items-center gap-3" aria-label={strings.appName}>
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)]">
            <span className="absolute inset-[5px] rounded-[var(--radius-control)] border border-[var(--color-accent)] opacity-70" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-h3 text-[var(--color-text)]">{strings.appName}</span>
            <span className="label hidden truncate sm:block">{strings.appTagline}</span>
          </span>
        </a>

        {inSession ? (
          <ol className="hidden items-center gap-2 sm:flex" aria-label={strings.crumbLabel}>
            {STEPS.map((step, index) => {
              const state = index < activeStep ? 'done' : index === activeStep ? 'current' : 'todo';
              return (
                <li key={step.id} className="flex items-center gap-2">
                  {index > 0 ? <span className="h-px w-5 bg-[var(--color-border-strong)]" aria-hidden="true" /> : null}
                  <span
                    aria-current={state === 'current' ? 'step' : undefined}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-small',
                      state === 'current' ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-muted)]',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        state === 'todo' ? 'bg-[var(--color-border-strong)]' : 'bg-[var(--color-accent)]',
                        state === 'done' && 'opacity-60',
                      )}
                      aria-hidden="true"
                    />
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : null}

        <nav aria-label="Nawigacja główna" className="flex items-center gap-1">
          <a
            href="#/history"
            aria-current={route.name === 'history' ? 'page' : undefined}
            aria-label={unfinishedCount > 0 ? `${strings.history} — ${unfinishedCount} nieukończone` : strings.history}
            className={cn(
              'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--radius-control)] px-3 text-small font-semibold transition-colors duration-[var(--motion-fast)]',
              route.name === 'history'
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
            )}
          >
            <HistoryIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{strings.historyNav}</span>
            {unfinishedCount > 0 ? (
              <span
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-accent)] sm:static sm:ml-0.5"
                aria-hidden="true"
              />
            ) : null}
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </nav>
      </div>
    </header>
  );
}
