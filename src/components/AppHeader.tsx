import { strings } from '@/data/strings';
import type { Route } from '@/app/router';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '@/types/state';
import { cn } from '@/utils/cn';

interface AppHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  route: Route;
}

/** Kolejność ekranów — użyta dla paska postępu nawigacji w nagłówku. */
const PROGRESS_ORDER = ['home', 'quiz', 'sliders', 'tune', 'cards', 'ranking', 'history'] as const;

export function AppHeader({ theme, onToggleTheme, route }: AppHeaderProps) {
  const index = Math.max(0, PROGRESS_ORDER.indexOf(route.name as (typeof PROGRESS_ORDER)[number]));
  const progress = ((index + 1) / PROGRESS_ORDER.length) * 100;

  const links = [
    { href: '#/', label: strings.home, active: route.name === 'home' },
    { href: '#/history', label: strings.historyNav, active: route.name === 'history' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_86%,transparent)] backdrop-blur-md">
      {/* Przycisk zamiast kotwicy: hash jest zajęty przez router tras (E8-07). */}
      <button
        type="button"
        onClick={() => {
          const target = document.getElementById('tresc');
          target?.setAttribute('tabindex', '-1');
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ block: 'start' });
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[var(--radius-pill)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--color-on-accent)]"
      >
        Przejdź do treści
      </button>

      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-4 px-5 sm:h-[72px]">
        <a
          href="#/"
          className="group flex min-w-0 items-center gap-3"
          aria-label={strings.appName}
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-transform duration-200 group-hover:-rotate-6">
            <span className="absolute inset-[5px] rounded-[6px] border border-[var(--color-accent)] opacity-70" />
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] leading-tight font-semibold tracking-tight">
              {strings.appName}
            </span>
            <span className="label-mono hidden truncate sm:block">{strings.appTagline}</span>
          </span>
        </a>

        <nav aria-label="Nawigacja główna" className="flex items-center gap-1 sm:gap-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.active ? 'page' : undefined}
              className={cn(
                'num relative inline-flex min-h-11 items-center rounded-[var(--radius-pill)] px-3 text-[11px] uppercase tracking-[0.14em] transition-colors duration-200',
                link.active
                  ? 'text-[var(--color-accent-ink)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
              )}
            >
              {link.label}
              <span
                className={cn(
                  'absolute bottom-2 left-3 h-px bg-[var(--color-accent)] transition-all duration-200',
                  link.active ? 'w-[calc(100%-24px)]' : 'w-0',
                )}
              />
            </a>
          ))}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </nav>
      </div>

      <div
        className="h-[2px] bg-[var(--color-accent)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </header>
  );
}
