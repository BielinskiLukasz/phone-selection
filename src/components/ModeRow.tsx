import type { ReactNode } from 'react';
import { ArrowRightIcon } from './Icons';

interface ModeRowProps {
  index: number;
  href: string;
  title: string;
  description: string;
  time: string;
  icon: ReactNode;
}

/** Kafelek trybu jako wiersz listy (UI-SPEC 3.1): jeden główny wybór na ekranie. */
export function ModeRow({ index, href, title, description, time, icon }: ModeRowProps) {
  return (
    <a
      href={href}
      className="group relative flex min-h-[92px] items-center gap-4 border-b border-[var(--color-border)] py-5 transition-colors duration-200 hover:bg-[var(--color-surface)] sm:gap-6"
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-[var(--color-accent)] transition-transform duration-200 group-hover:scale-y-100"
        aria-hidden="true"
      />
      <span className="num w-8 shrink-0 text-xs font-semibold text-[var(--color-muted)] transition-colors duration-200 group-hover:text-[var(--color-accent)]">
        {String(index).padStart(2, '0')}
      </span>
      <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)] transition-colors duration-200 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] sm:flex">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-semibold tracking-tight sm:text-[26px]">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-[var(--color-muted)]">
          {description}
        </span>
      </span>
      <span className="num hidden shrink-0 text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)] md:block">
        {time}
      </span>
      <span className="shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-[var(--color-accent)]">
        <ArrowRightIcon className="h-5 w-5" />
      </span>
    </a>
  );
}
