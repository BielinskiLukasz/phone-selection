import type { ReactNode } from 'react';
import { AppHeader } from '@/components/AppHeader';
import type { Route } from '@/app/router';
import { strings } from '@/data/strings';
import { formatDate, pool } from '@/data/pool';
import { plural } from '@/lib/anonymize';
import type { Theme } from '@/types/state';

interface LayoutProps {
  children: ReactNode;
  route: Route;
  theme: Theme;
  onToggleTheme: () => void;
  unfinishedCount?: number;
}

/**
 * Wspólny układ (E1-08): nagłówek, kontener max-w-3xl, stopka.
 * UIP2-01 (FIX-UI §5.1, D7): stopka to jedna linia o danych + dwa zdania — bez tablicy projektu
 * (dokumenty planistyczne, kropki roadmapy), która obniżała wiarygodność produktu.
 */
export function Layout({ children, route, theme, onToggleTheme, unfinishedCount = 0 }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader theme={theme} onToggleTheme={onToggleTheme} route={route} unfinishedCount={unfinishedCount} />

      <main id="tresc" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_55%,transparent)]">
        <div className="mx-auto w-full max-w-3xl px-5 pt-8 pb-28 sm:pb-8">
          <p className="num flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-[var(--color-muted)]">
            <span>
              {strings.footerDataPrefix} {formatDate(pool.checkedAt)}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {pool.count} {plural(pool.count, 'telefon', 'telefony', 'telefonów')}
            </span>
            <span aria-hidden="true">·</span>
            <span>limit {pool.budgetLimit} zł</span>
            {pool.unconfirmed > 0 ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--color-warn)]">{pool.statusNote}</span>
              </>
            ) : null}
          </p>
          <p className="mt-2 max-w-prose text-small leading-relaxed text-[var(--color-muted)]">
            {strings.footerHowWeCount} {strings.footerLocalData}
          </p>
        </div>
      </footer>
    </div>
  );
}
