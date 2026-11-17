import { useEffect, useRef, useState } from 'react';
import { strings } from '@/data/strings';
import {
  normalizeExclusions,
  validateExclusions,
  type ExclusionSelection,
} from '@/lib/exclusions';
import type { Filters, Phone } from '@/types';
import { ExclusionPicker } from './ExclusionPicker';
import { ArrowRightIcon } from './Icons';
import { Button } from './ui';

interface ExclusionSheetProps {
  open: boolean;
  phones: readonly Phone[];
  filters: Filters;
  onSave: (selection: ExclusionSelection) => void;
  onCancel: () => void;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Okno modalne do zmiany wykluczeń z poziomu suwaków (E11-07) i kart (E11-08):
 * pułapka fokusu, zamknięcie Esc, przywrócenie fokusu po zamknięciu.
 */
export function ExclusionSheet({
  open,
  phones,
  filters,
  onSave,
  onCancel,
}: ExclusionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState<ExclusionSelection>(() => normalizeExclusions(filters));

  useEffect(() => {
    if (open) setDraft(normalizeExclusions(filters));
  }, [open, filters]);

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

  const validation = validateExclusions(phones, {
    ...filters,
    excludedBrands: draft.excludedBrands,
    excludedPhoneIds: draft.excludedPhoneIds,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={strings.excludeCancel}
        tabIndex={-1}
        onClick={onCancel}
        className="fade-in absolute inset-0 h-full w-full cursor-default bg-[color-mix(in_srgb,var(--color-bg)_76%,transparent)] backdrop-blur-sm"
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exclusion-sheet-title"
        aria-describedby="exclusion-sheet-note"
        className="sheet-in relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-sheet)] sm:rounded-[var(--radius-sheet)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)] sm:rounded-[var(--radius-card)]"
      >
        <div className="border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <h2
            id="exclusion-sheet-title"
            className="text-xl leading-tight font-bold tracking-[-0.03em] sm:text-2xl"
          >
            {strings.excludeSheetTitle}
          </h2>
          <p
            id="exclusion-sheet-note"
            className="mt-1 text-xs leading-relaxed text-[var(--color-muted)] sm:text-sm"
          >
            {strings.excludeSheetNote}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <ExclusionPicker
            phones={phones}
            baseFilters={filters}
            selection={draft}
            onChange={setDraft}
            initialExpanded
          />
        </div>

        <div
          className="flex flex-col gap-2 border-t border-[var(--color-border)] px-5 pt-3 sm:flex-row-reverse sm:px-6"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <Button
            variant="primary"
            size="lg"
            disabled={!validation.canProceed}
            onClick={() => {
              if (!validation.canProceed) return;
              onSave(draft);
            }}
            iconRight={<ArrowRightIcon />}
            className="flex-1"
          >
            {strings.excludeSave}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onCancel}
          >
            {strings.excludeCancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
