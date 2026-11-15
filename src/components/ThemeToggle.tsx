import { strings } from '@/data/strings';
import type { Theme } from '@/features/theme/useTheme';
import { MoonIcon, SunIcon } from './Icons';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/** Szkielet przełącznika motywu (E1-08, UI-SPEC 6). */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const label = theme === 'light' ? strings.themeToDark : strings.themeToLight;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={`${strings.themeLabel}: ${theme === 'light' ? strings.themeLight : strings.themeDark}`}
      className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-[border-color,transform,background-color] duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] active:scale-95"
    >
      <span
        key={theme}
        className="screen-in flex items-center justify-center text-[var(--color-accent-ink)] group-hover:text-[var(--color-accent)]"
      >
        {theme === 'light' ? <SunIcon className="h-[19px] w-[19px]" /> : <MoonIcon className="h-[19px] w-[19px]" />}
      </span>
    </button>
  );
}
