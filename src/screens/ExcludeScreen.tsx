import { useEffect, useRef, useState } from 'react';
import { PHONES } from '@/data/phones';
import { strings } from '@/data/strings';
import { useAppState } from '@/features/state/StateProvider';
import {
  normalizeExclusions,
  validateExclusions,
  type ExclusionSelection,
} from '@/lib/exclusions';
import { MODE_ENTRY_VIEW, MODE_LABEL, type Session } from '@/types/state';
import { ExclusionPicker } from '@/components/ExclusionPicker';
import { Badge } from '@/components/Badge';
import { RouteChip } from '@/components/RouteChip';
import { ArrowRightIcon } from '@/components/Icons';
import { Button } from '@/components/ui';

interface ExcludeScreenProps {
  session: Session;
}

/**
 * Ekran `#/s/:id/exclude` (E11-05, E11-06): opcjonalny krok startowy przed pytaniami
 * lub suwakami. Domyślnie lista nazw jest ukryta — kliknięcie „Pomiń” zachowuje
 * pełną anonimowość i oznacza krok jako `done` (wznawianie do niego nie wraca).
 */
export function ExcludeScreen({ session }: ExcludeScreenProps) {
  const { dispatch } = useAppState();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [selection, setSelection] = useState<ExclusionSelection>(() =>
    normalizeExclusions(session.filters),
  );

  useEffect(() => {
    setSelection(normalizeExclusions(session.filters));
  }, [session.id, session.filters]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [session.id]);

  const nextHash = `#/s/${session.id}/${MODE_ENTRY_VIEW[session.mode]}`;
  const validation = validateExclusions(PHONES, {
    ...session.filters,
    excludedBrands: selection.excludedBrands,
    excludedPhoneIds: selection.excludedPhoneIds,
  });

  function skip() {
    dispatch({
      type: 'session/exclusions',
      sessionId: session.id,
      excludedBrands: [],
      excludedPhoneIds: [],
      step: 'done',
    });
    window.location.hash = nextHash;
  }

  function proceed() {
    if (!validation.canProceed) return;
    dispatch({
      type: 'session/exclusions',
      sessionId: session.id,
      excludedBrands: selection.excludedBrands,
      excludedPhoneIds: selection.excludedPhoneIds,
      step: 'done',
    });
    window.location.hash = nextHash;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 sm:pb-16 sm:pt-10">
      <div className="flex flex-wrap items-center gap-2">
        <RouteChip hash={`#/s/${session.id}/exclude`} tone="active" />
        <Badge tone="outline">{MODE_LABEL[session.mode]}</Badge>
        <span className="num ml-auto text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {strings.excludeEyebrow}
        </span>
      </div>

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-[clamp(2rem,6.8vw,3rem)] leading-[1.04] font-bold tracking-[-0.04em] outline-none"
      >
        {strings.excludeTitle}
      </h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
        {strings.excludeLead}
      </p>

      <div className="mt-6">
        <ExclusionPicker
          phones={PHONES}
          baseFilters={session.filters}
          selection={selection}
          onChange={setSelection}
        />
      </div>

      {/* Działania główne: Pomiń (pełna anonimowość) i Dalej */}
      <div className="mt-8 hidden flex-wrap items-center gap-3 sm:flex">
        <Button
          variant="secondary"
          size="lg"
          onClick={skip}
        >
          {strings.excludeSkip}
        </Button>
        <Button
          variant="primary"
          size="lg"
          iconRight={<ArrowRightIcon className="h-4 w-4" />}
          onClick={proceed}
          disabled={!validation.canProceed}
        >
          {strings.excludeContinue}
        </Button>
        <a
          href="#/"
          className="num ml-auto inline-flex min-h-11 items-center text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:text-[var(--color-text)]"
        >
          {strings.backHome}
        </a>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <Button
          variant="secondary"
          size="lg"
          onClick={skip}
        >
          {strings.excludeSkip}
        </Button>
        <Button
          variant="primary"
          size="lg"
          iconRight={<ArrowRightIcon className="h-4 w-4" />}
          className="flex-1"
          onClick={proceed}
          disabled={!validation.canProceed}
        >
          {strings.excludeContinue}
        </Button>
      </div>
    </div>
  );
}
