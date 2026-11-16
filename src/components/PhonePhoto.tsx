import { useEffect, useRef, useState } from 'react';
import { strings } from '@/data/strings';
import { parseDimensionsMm } from '@/data/scoringRules';
import { formatBodySummary } from '@/lib/anonymize';
import type { Phone } from '@/types';
import { ExpandIcon, RulerIcon } from './Icons';
import { cn } from '@/utils/cn';

interface PhonePhotoProps {
  /** Komponent używany wyłącznie po ujawnieniu telefonu (karta wybrana lub pełny ranking). */
  phone: Phone;
  variant: 'thumb' | 'card' | 'detail';
  className?: string;
}

/** Proporcjonalna sylwetka w skali wymiarów (gdy przeglądarka jest offline albo zablokuje obraz). */
function ScaleSilhouette({ phone, compact = false }: { phone: Phone; compact?: boolean }) {
  const parsed = parseDimensionsMm(phone.specs.dimensionsMm);
  const h = phone.specs.heightMm ?? parsed?.heightMm ?? 161;
  const w = phone.specs.widthMm ?? parsed?.widthMm ?? 76;
  /* Referencja: 170 × 82 mm = pełny kadr, więc mniejszy telefon faktycznie jest mniejszy. */
  const boxW = Math.round((w / 82) * 56);
  const boxH = Math.round((h / 170) * 116);
  const x = Math.round((80 - boxW) / 2);
  const y = Math.round((132 - boxH) / 2);

  return (
    <svg
      viewBox="0 0 80 132"
      className={cn(
        'text-[var(--color-muted)]',
        compact ? 'h-11 w-8' : 'h-32 w-20',
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x={x}
        y={y}
        width={boxW}
        height={boxH}
        rx={compact ? 5 : 7}
        fill="var(--color-surface-2)"
        stroke="var(--color-border-strong)"
      />
      <circle cx={40} cy={y + 6} r={1.5} fill="currentColor" stroke="none" />
      <line
        x1={32}
        y1={y + boxH - 5}
        x2={48}
        y2={y + boxH - 5}
        stroke="var(--color-accent)"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PhonePhoto({ phone, variant, className }: PhonePhotoProps) {
  const studioUrl = phone.reveal.imageUrl ?? null;
  const pressUrl = phone.reveal.photoUrl ?? null;
  const hasBoth = Boolean(studioUrl && pressUrl && studioUrl !== pressUrl);

  const [mode, setMode] = useState<'press' | 'studio'>(() =>
    variant === 'detail' && pressUrl ? 'press' : 'studio',
  );
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});
  const [zoomOpen, setZoomOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const preferred = mode === 'press' ? (pressUrl ?? studioUrl) : (studioUrl ?? pressUrl);
  const fallback = mode === 'press' ? studioUrl : pressUrl;
  const activeUrl =
    preferred && !failedUrls[preferred]
      ? preferred
      : fallback && !failedUrls[fallback]
        ? fallback
        : null;

  const zoomUrl =
    pressUrl && !failedUrls[pressUrl]
      ? pressUrl
      : studioUrl && !failedUrls[studioUrl]
        ? studioUrl
        : null;

  function markFailed(url: string) {
    setFailedUrls((current) => (current[url] ? current : { ...current, [url]: true }));
  }

  useEffect(() => {
    if (!zoomOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setZoomOpen(false);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeBtnRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [zoomOpen]);

  /* Miniatura w wierszu pełnego rankingu — dekoracyjna wewnątrz przycisku wiersza. */
  if (variant === 'thumb') {
    const thumbUrl =
      studioUrl && !failedUrls[studioUrl]
        ? studioUrl
        : pressUrl && !failedUrls[pressUrl]
          ? pressUrl
          : null;

    return (
      <span
        className={cn(
          'flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--color-border)] bg-[var(--color-photo-bg)] p-1',
          className,
        )}
        aria-hidden="true"
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => markFailed(thumbUrl)}
            className="h-full w-full object-contain"
          />
        ) : (
          <ScaleSilhouette phone={phone} compact />
        )}
      </span>
    );
  }

  const bodySummary = formatBodySummary(phone.specs);
  const compactness = phone.scores.compactness;

  return (
    <>
      <figure
        className={cn(
          'm-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]',
          className,
        )}
      >
        <div
          className={cn(
            'relative flex items-center justify-center bg-[var(--color-photo-bg)] p-4',
            variant === 'card' ? 'h-44' : 'h-52 sm:h-56',
          )}
        >
          {activeUrl ? (
            <img
              src={activeUrl}
              alt={`${strings.photoLabel}: ${phone.reveal.name}`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => markFailed(activeUrl)}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <ScaleSilhouette phone={phone} />
              <span className="num text-[10px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                {strings.photoUnavailable}
              </span>
            </div>
          )}

          {zoomUrl ? (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              aria-label={`${strings.photoZoomOpen}: ${phone.reveal.name}`}
              title={strings.photoZoomOpen}
              className="absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
            >
              <ExpandIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <figcaption className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2">
          {bodySummary ? (
            <span className="num flex min-w-0 items-center gap-1.5 text-[11px] text-[var(--color-text)]">
              <RulerIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
              <span className="truncate">{bodySummary}</span>
            </span>
          ) : null}

          {typeof compactness === 'number' ? (
            <span className="num rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[var(--color-accent-ink)] uppercase">
              {strings.rankingCompactnessBadge} {compactness}/100
            </span>
          ) : null}

          {hasBoth && activeUrl ? (
            <button
              type="button"
              onClick={() => setMode((current) => (current === 'press' ? 'studio' : 'press'))}
              className="num ml-auto inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[10px] font-semibold tracking-[0.1em] text-[var(--color-muted)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
            >
              {mode === 'press' ? strings.photoViewStudio : strings.photoViewPress}
            </button>
          ) : null}
        </figcaption>
      </figure>

      {zoomOpen && zoomUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            onClick={() => setZoomOpen(false)}
            className="fade-in absolute inset-0 h-full w-full cursor-pointer bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${strings.photoLabel}: ${phone.reveal.name}`}
            className="sheet-in relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{phone.reveal.name}</p>
                {bodySummary ? (
                  <p className="num text-[11px] text-[var(--color-muted)]">{bodySummary}</p>
                ) : null}
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setZoomOpen(false)}
                className="inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 text-xs font-semibold transition-colors duration-200 hover:border-[var(--color-accent)]"
              >
                {strings.photoZoomClose}
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[var(--color-photo-bg)] p-6">
              <img
                src={zoomUrl}
                alt={phone.reveal.name}
                referrerPolicy="no-referrer"
                onError={() => markFailed(zoomUrl)}
                className="max-h-[68vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
