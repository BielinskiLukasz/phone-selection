import { sessionTexts, strings } from '@/data/strings';
import type { SpecRow } from '@/lib/cardSpecs';
import type { AnonCard, Phone } from '@/types';
import { DetailsAccordion } from './DetailsAccordion';
import { PhonePhoto } from './PhonePhoto';
import { ArrowRightIcon, CheckIcon } from './Icons';

interface PhoneCardRevealedProps {
  card: AnonCard;
  /** Dane `reveal` renderujemy dopiero, gdy telefon jest na liście wyborów sesji (PROJECT 8). */
  phone: Phone;
  pickLabel: string;
  specs: SpecRow[];
  alwaysOpenDetails: boolean;
}

/** Karta po ujawnieniu: nazwa, marka, linki do sklepów i plakietka wyboru (E6-06). */
export function PhoneCardRevealed({
  card,
  phone,
  pickLabel,
  specs,
  alwaysOpenDetails,
}: PhoneCardRevealedProps) {
  return (
    <article className="surface screen-in relative flex flex-col overflow-hidden border-[var(--color-accent)] shadow-[0_18px_50px_-30px_var(--color-accent)]">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-[var(--color-accent)]" aria-hidden="true" />

      <header className="flex flex-wrap items-center gap-2 p-[var(--pad-card)] pb-3">
        <span className="num flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-[var(--color-on-accent)] uppercase">
          <CheckIcon className="h-3.5 w-3.5" />
          {pickLabel}
        </span>
        <span className="num ml-auto text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          {strings.proposal} #{card.place} · {card.matchPercent}%
        </span>
      </header>

      <div className="px-[var(--pad-card)]">
        <p className="label-mono">{phone.reveal.brand}</p>
        <h2 className="mt-1 text-[clamp(1.4rem,4.5vw,1.9rem)] leading-[1.08] font-bold tracking-[-0.035em] text-balance">
          {phone.reveal.name}
        </h2>
        <p className="num mt-2 text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
          {phone.variant.ramGb}/{phone.variant.storageGb} GB
          {phone.status === 'needs_confirmation' ? ' · oferta do potwierdzenia' : ''}
        </p>

        <PhonePhoto phone={phone} variant="card" className="mt-3" />
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-dashed border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="num text-2xl font-bold tracking-tight tabular-nums">
          {Math.round(card.pricePln)} <span className="text-sm font-semibold">zł</span>
        </span>
        <span className="text-[11px] text-[var(--color-muted)]">
          {sessionTexts.priceWithDate(card.priceCheckedAt)}
        </span>
        {card.overBudgetBy ? (
          <span className="num ml-auto rounded-[var(--radius-pill)] bg-[var(--color-warn-soft)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--color-warn)] uppercase">
            {sessionTexts.overBudgetBy(card.overBudgetBy)}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 px-[var(--pad-card)] py-4">
        {phone.reveal.shopLinks.map((link, index) => {
          const url = typeof link === 'string' ? link : link.url;
          const label = typeof link === 'string' ? url.replace(/^https?:\/\//, '') : (link.label ?? link.shop ?? url);
          return (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/shop flex min-h-12 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 text-sm font-medium transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[var(--color-accent)]"
            >
              <span className="min-w-0 flex-1 truncate">
                {strings.cardsShopLink}
                <span className="num text-[11px] tracking-[0.08em] text-[var(--color-muted)] uppercase">
                  {' '}
                  ({label})
                </span>
              </span>
              <span className="shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-hover/shop:translate-x-1 group-hover/shop:text-[var(--color-accent)]">
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </a>
          );
        })}
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-muted)]">
          {strings.cardsRevealedNote} {strings.dataWarning}
        </p>
      </div>

      <ul className="grid gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
        {card.facts.map((fact) => (
          <li key={fact.key} className="flex items-baseline gap-3 bg-[var(--color-surface)] px-[var(--pad-card)] py-2">
            <span className="label-mono w-[26%] shrink-0">{fact.label}</span>
            <span className="num text-[12px] leading-relaxed break-words">{fact.value}</span>
          </li>
        ))}
      </ul>

      <DetailsAccordion card={card} specs={specs} alwaysOpen={alwaysOpenDetails} />
    </article>
  );
}
