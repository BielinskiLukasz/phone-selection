import { useEffect, useState } from 'react';
import { sessionTexts, strings } from '@/data/strings';
import {
  hasExclusions,
  isBrandExcluded,
  toggleBrandExclusion,
  toggleModelExclusion,
  validateExclusions,
  type BrandCatalogGroup,
  type ExclusionSelection,
} from '@/lib/exclusions';
import type { Filters, Phone } from '@/types';
import { AlertIcon, CheckIcon, LockIcon } from './Icons';
import { cn } from '@/utils/cn';

interface ExclusionPickerProps {
  phones: readonly Phone[];
  baseFilters: Filters;
  selection: ExclusionSelection;
  onChange: (next: ExclusionSelection) => void;
  /** Domyślnie `false`: katalog nazw ładuje się dopiero po włączeniu przełącznika (E11-11). */
  initialExpanded?: boolean;
}

/**
 * Wybór wykluczanych marek i modeli (E11-05, E11-11):
 * przełącznik „Chcę coś wykluczyć”, chipy marek z liczbą modeli, rozwijana lista modeli
 * pogrupowana wg marki oraz licznik „Zostanie X z N telefonów” z blokadą przy zerze.
 */
export function ExclusionPicker({
  phones,
  baseFilters,
  selection,
  onChange,
  initialExpanded = false,
}: ExclusionPickerProps) {
  const active = hasExclusions(selection);
  const [expanded, setExpanded] = useState<boolean>(() => initialExpanded || active);
  const [modelsOpen, setModelsOpen] = useState<boolean>(
    () => selection.excludedPhoneIds.length > 0,
  );
  const [catalog, setCatalog] = useState<BrandCatalogGroup[] | null>(null);

  /* E11-11: nazwy marek i modeli ładujemy dynamicznie dopiero po otwarciu listy. */
  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;

    void import('@/data/exclusionCatalog').then((mod) => {
      if (!cancelled) setCatalog(mod.getExclusionCatalog(phones));
    });

    return () => {
      cancelled = true;
    };
  }, [expanded, phones]);

  const combinedFilters: Filters = {
    ...baseFilters,
    excludedBrands: selection.excludedBrands,
    excludedPhoneIds: selection.excludedPhoneIds,
  };
  const validation = validateExclusions(phones, combinedFilters);

  function toggleExpanded() {
    if (expanded) {
      setExpanded(false);
      setModelsOpen(false);
      if (active) onChange({ excludedBrands: [], excludedPhoneIds: [] });
      return;
    }
    setExpanded(true);
  }

  function handleBrand(brand: string) {
    onChange(toggleBrandExclusion(selection, brand));
  }

  function handleModel(phoneId: string) {
    onChange(toggleModelExclusion(phones, selection, phoneId));
  }

  function clearAll() {
    onChange({ excludedBrands: [], excludedPhoneIds: [] });
  }

  return (
    <div className="grid gap-4">
      {/* Informacja o kompromisie z anonimowością (decyzja 6) */}
      <p className="flex items-start gap-2.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-xs leading-relaxed text-[var(--color-muted)]">
        <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
        <span>{strings.excludeAnonymityNote}</span>
      </p>

      {/* Przełącznik „Chcę coś wykluczyć” */}
      <div className="surface p-[var(--pad-card)]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p id="exclude-switch-label" className="text-base font-semibold tracking-tight">
              {strings.excludeToggleLabel}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">
              {strings.excludeToggleHint}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={expanded}
            aria-labelledby="exclude-switch-label"
            onClick={toggleExpanded}
            className={cn(
              'relative inline-flex min-h-11 min-w-[64px] shrink-0 items-center rounded-[var(--radius-pill)] border px-1.5 transition-colors duration-200',
              expanded
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                : 'border-[var(--color-border-strong)] bg-[var(--color-surface-2)]',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'block h-6 w-6 rounded-full bg-[var(--color-surface)] transition-transform duration-200',
                expanded ? 'translate-x-6' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        {/* Lista marek i modeli — montowana wyłącznie po włączeniu przełącznika */}
        {expanded ? (
          <div className="step-in mt-5 grid gap-5 border-t border-[var(--color-border)] pt-5">
            {!catalog ? (
              <p className="num text-xs text-[var(--color-muted)]">{strings.excludeLoading}</p>
            ) : (
              <>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="label-mono">{strings.excludeBrandsLabel}</h2>
                    {active ? (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="num inline-flex min-h-11 items-center rounded-[var(--radius-pill)] px-3 text-[11px] tracking-[0.1em] text-[var(--color-accent-ink)] uppercase transition-colors duration-200 hover:bg-[var(--color-accent-soft)]"
                      >
                        {strings.excludeClear}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {strings.excludeBrandsHint}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={strings.excludeBrandsLabel}>
                    {catalog.map((group) => {
                      const excluded = isBrandExcluded(group.brand, selection);
                      return (
                        <button
                          key={group.brand}
                          type="button"
                          aria-pressed={excluded}
                          onClick={() => handleBrand(group.brand)}
                          className={cn(
                            'inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border px-4 text-sm font-medium transition-colors duration-200',
                            excluded
                              ? 'border-[var(--color-warn)] bg-[var(--color-warn-soft)] text-[var(--color-warn)] line-through'
                              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)]',
                          )}
                        >
                          <span>{group.brand}</span>
                          <span className="num rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
                            {group.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rozwijana lista pojedynczych modeli pogrupowana wg marki */}
                <div className="border-t border-[var(--color-border)] pt-4">
                  <button
                    type="button"
                    aria-expanded={modelsOpen}
                    onClick={() => setModelsOpen((current) => !current)}
                    className="num inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-text)] uppercase transition-colors duration-200 hover:border-[var(--color-accent)]"
                  >
                    <span>
                      {modelsOpen
                        ? strings.excludeModelsToggleHide
                        : strings.excludeModelsToggleShow}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'transition-transform duration-200',
                        modelsOpen && 'rotate-180',
                      )}
                    >
                      ▾
                    </span>
                  </button>

                  {modelsOpen ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {catalog.map((group) => {
                        const wholeBrand = isBrandExcluded(group.brand, selection);
                        return (
                          <fieldset
                            key={group.brand}
                            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3"
                          >
                            <legend className="label-mono px-1.5">
                              {group.brand} ({group.count})
                            </legend>
                            <div className="grid gap-1">
                              {group.models.map((model) => {
                                const checked =
                                  wholeBrand || selection.excludedPhoneIds.includes(model.id);
                                return (
                                  <label
                                    key={model.id}
                                    className={cn(
                                      'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[var(--radius-card)] px-2.5 py-1.5 text-sm transition-colors duration-150 hover:bg-[var(--color-surface)]',
                                      checked && 'text-[var(--color-warn)]',
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleModel(model.id)}
                                      className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                                    />
                                    <span className={cn('min-w-0 flex-1', checked && 'line-through')}>
                                      {model.modelName}
                                    </span>
                                    {wholeBrand ? (
                                      <span className="num shrink-0 text-[10px] tracking-[0.08em] text-[var(--color-muted)] uppercase">
                                        {strings.excludeModelsWholeBrand}
                                      </span>
                                    ) : checked ? (
                                      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[var(--color-warn)]" />
                                    ) : null}
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Podsumowanie na żywo i komunikaty graniczne (decyzja 7) */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'rounded-[var(--radius-card)] border px-4 py-3',
          validation.status === 'ok'
            ? 'border-[var(--color-border)] bg-[var(--color-surface)]'
            : 'border-[var(--color-warn)] bg-[var(--color-warn-soft)]',
        )}
      >
        <p className="num text-sm font-semibold text-[var(--color-text)]">
          {sessionTexts.excludeRemaining(validation.remaining, validation.total)}
        </p>
        {validation.status === 'error' ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[var(--color-warn)]">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {strings.excludeZeroError}
          </p>
        ) : validation.status === 'warn' ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-warn)]">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {sessionTexts.excludeFewWarning(validation.remaining)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
