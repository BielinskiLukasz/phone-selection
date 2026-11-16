import { useEffect } from 'react';
import { CheckIcon } from './Icons';

interface ToastProps {
  message: string | null;
  durationMs?: number;
  onClose: () => void;
}

/** Krótki komunikat po ujawnieniu karty (UI-SPEC 5, `aria-live="polite"`). */
export function Toast({ message, durationMs = 4000, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onClose]);

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6"
    >
      {message ? (
        <p className="sheet-in pointer-events-auto flex max-w-md items-start gap-2 rounded-[var(--radius-pill)] border border-[var(--color-accent)] bg-[var(--color-surface)] px-4 py-3 text-xs leading-relaxed shadow-[0_16px_40px_-24px_rgba(0,0,0,0.6)]">
          <span className="mt-px shrink-0 text-[var(--color-accent)]">
            <CheckIcon className="h-4 w-4" />
          </span>
          {message}
        </p>
      ) : null}
    </div>
  );
}
