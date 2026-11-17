import { sessionTexts, strings } from '@/data/strings';
import type { Phone, ShopLink } from '@/types';
import { ArrowRightIcon, CheckIcon } from './Icons';
import { cn } from '@/utils/cn';

interface PurchaseInfoProps {
  phone: Phone;
  /** `card` = odsłonięta karta (pełny blok), `ranking` = zwięzły wiersz w szczegółach pełnego rankingu. */
  variant?: 'card' | 'ranking';
  className?: string;
}

const LINK_KIND_LABEL: Record<NonNullable<ShopLink['kind']>, string> = {
  shop: strings.linkKindShop,
  official: strings.linkKindOfficial,
  marketplace: strings.linkKindMarketplace,
  compare: strings.linkKindCompare,
};

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return month && year ? `${month}.${year}` : yearMonth;
}

function yearsLeft(yearMonth: string, from: Date = new Date()): number | null {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return null;
  const months = (year - from.getUTCFullYear()) * 12 + (month - (from.getUTCMonth() + 1));
  return Math.round((months / 12) * 10) / 10;
}

/**
 * Faza poprawkowa FP1 — wszystko, co użytkowniczka musi wiedzieć przed kliknięciem „kup”:
 * promocja z datą końca i ceną regularną (FP1-04), ładowarka (FP1-05), linki z ceną/datą/typem oferty
 * i osobny przycisk porównywarki (FP1-06), koniec poprawek i opaska (FP1-07), „Sprawdzone przed zakupem” (FP1-09).
 * Renderowane wyłącznie po ujawnieniu nazwy — zawiera nazwy sklepów.
 */
export function PurchaseInfo({ phone, variant = 'card', className }: PurchaseInfoProps) {
  const { price, reveal, specs } = phone;
  const compact = variant === 'ranking';
  const links = reveal.shopLinks.map((link) => (typeof link === 'string' ? { url: link } : link));
  const promo =
    price.promoEndsAt || price.regularPricePln
      ? sessionTexts.pricePromo(price.pln, price.promoEndsAt ?? null, price.regularPricePln ?? null, price.promoCondition ?? null)
      : null;
  const chargerLine =
    specs.chargerInBox === true
      ? strings.chargerIncluded
      : `${specs.chargerInBox === false ? strings.chargerNotIncluded : strings.chargerUnknown} ${sessionTexts.chargerAdvice(specs.chargingW ?? null)}`;
  const support = specs.securitySupportUntil
    ? sessionTexts.supportUntil(monthLabel(specs.securitySupportUntil), yearsLeft(specs.securitySupportUntil))
    : strings.supportUnknown;

  return (
    <div className={cn('grid gap-3', className)} data-testid="purchase-info">
      {reveal.verifiedForPurchaseAt ? (
        <section className="rounded-[var(--radius-card)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
          <h3 className="label-mono flex items-center gap-2">
            <CheckIcon className="h-3.5 w-3.5" />
            {strings.verifiedTitle} · {sessionTexts.priceWithDate(reveal.verifiedForPurchaseAt).replace('cena z ', '')}
          </h3>
          <ul className="mt-1.5 grid gap-0.5 text-[12px] leading-relaxed">
            {(reveal.verifiedForPurchase ?? []).map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <dl className={cn('grid gap-1.5 text-[12px] leading-relaxed', compact && 'text-[11px]')}>
        {promo ? (
          <div className="flex gap-2">
            <dt className="label-mono w-[26%] shrink-0">{strings.promoLabel}</dt>
            <dd className="num text-[var(--color-warn)]">{promo}</dd>
          </div>
        ) : null}
        <div className="flex gap-2">
          <dt className="label-mono w-[26%] shrink-0">{strings.chargerLabel}</dt>
          <dd>{chargerLine}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="label-mono w-[26%] shrink-0">{strings.supportLabel}</dt>
          <dd className="num">{support}</dd>
        </div>
        {specs.wearableNotes ? (
          <div className="flex gap-2">
            <dt className="label-mono w-[26%] shrink-0">{strings.wearableLabel}</dt>
            <dd>{specs.wearableNotes}</dd>
          </div>
        ) : null}
        {price.currentMarketPricePln ? (
          <div className="flex gap-2">
            <dt className="label-mono w-[26%] shrink-0">{strings.currentPriceLabel}</dt>
            <dd className="num text-[var(--color-warn)]">
              {Math.round(price.currentMarketPricePln)} zł
              {price.currentMarketPriceCheckedAt ? ` · ${sessionTexts.priceWithDate(price.currentMarketPriceCheckedAt).replace('cena z ', '')}` : ''}
              {price.currentMarketPriceSource ? ` · ${price.currentMarketPriceSource}` : ''}
            </dd>
          </div>
        ) : null}
        {price.userNote ? (
          <div className="flex gap-2">
            <dt className="label-mono w-[26%] shrink-0">{strings.offerLabel}</dt>
            <dd>{price.userNote}</dd>
          </div>
        ) : null}
      </dl>

      <div className="grid gap-2">
        {links.map((link, index) => {
          const label = link.label ?? link.shop ?? link.url.replace(/^https?:\/\//, '').split('/')[0] ?? link.url;
          const meta = [
            typeof link.pricePln === 'number' ? `${Math.round(link.pricePln)} zł` : null,
            link.checkedAt ? sessionTexts.priceWithDate(link.checkedAt).replace('cena z ', '') : null,
            link.kind ? LINK_KIND_LABEL[link.kind] : null,
          ].filter((part): part is string => Boolean(part));
          return (
            <a
              key={`${link.url}-${index}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/shop flex min-h-12 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 text-sm font-medium transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[var(--color-accent)]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">
                  {strings.cardsShopLink}{' '}
                  <span className="num text-[11px] tracking-[0.08em] text-[var(--color-muted)] uppercase">({label})</span>
                </span>
                {meta.length > 0 ? (
                  <span className="num block text-[11px] text-[var(--color-muted)]">{meta.join(' · ')}</span>
                ) : null}
              </span>
              <span className="shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-hover/shop:translate-x-1 group-hover/shop:text-[var(--color-accent)]">
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </a>
          );
        })}
        {reveal.priceCompareUrl ? (
          <a
            href={reveal.priceCompareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent-ink)] transition-colors duration-200 hover:bg-[var(--color-accent-soft)]"
          >
            {strings.priceCompare}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
