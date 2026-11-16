import { useEffect, useRef } from 'react';
import { ArrowRightIcon } from './Icons';

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Okno potwierdzenia wyboru u dołu ekranu (E6-05, UI-SPEC 3.4 i 8):
 * pułapka fokusu, zamknięcie klawiszem Esc, przywrócenie fokusu po zamknięciu.
 */
export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const node = sheetRef.current;
    const focusables = node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    focusables[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== 'Tab' || !node) return;

      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || !node.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Zamknij okno potwierdzenia"
        tabIndex={-1}
        onClick={onCancel}
        className="fade-in absolute inset-0 h-full w-full cursor-default bg-[color-mix(in_srgb,var(--color-bg)_72%,transparent)] backdrop-blur-sm"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-sheet-title"
        aria-describedby="confirm-sheet-body"
        className="sheet-in relative w-full max-w-lg rounded-t-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_-18px_50px_-24px_rgba(0,0,0,0.55)] sm:rounded-[var(--radius-card)] sm:p-6"
        style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
      >
        <span
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-[var(--color-border-strong)] sm:hidden"
          aria-hidden="true"
        />
        <h2
          id="confirm-sheet-title"
          className="text-xl leading-tight font-bold tracking-[-0.03em] text-balance sm:text-2xl"
        >
          {title}
        </h2>
        <p
          id="confirm-sheet-body"
          className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]"
        >
          {body}
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] dark:text-[#08130c]"
          >
            {confirmLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-6 text-sm font-medium transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)]"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
