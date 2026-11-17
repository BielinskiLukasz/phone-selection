import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * UIP1-02 / FIX-UI §7 · dolny pasek akcji na telefonie (jeden komponent zamiast czterech kopii):
 * zawsze `safe-area-inset-bottom`, półprzezroczyste tło z tokenów, ukryty od 640 px (`sm:hidden`)
 * chyba że `alwaysVisible`. Treść pod paskiem potrzebuje `pb-28` (ACTION_BAR_SPACER).
 */
export const ACTION_BAR_SPACER = 'pb-28 sm:pb-16';

interface ActionBarProps {
  children: ReactNode;
  alwaysVisible?: boolean;
  className?: string;
}

export function ActionBar({ children, alwaysVisible = false, className }: ActionBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md',
        !alwaysVisible && 'sm:hidden',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2">{children}</div>
    </div>
  );
}
