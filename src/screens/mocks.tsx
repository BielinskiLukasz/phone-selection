import { strings } from '@/data/strings';
import { pool } from '@/data/pool';
import { AnonCardPreview } from '@/components/AnonCardPreview';
import { Badge } from '@/components/Badge';
import { LockIcon } from '@/components/Icons';

function SkeletonBar({ width, delay = 0 }: { width: string; delay?: number }) {
  return (
    <span
      className="shimmer block h-2.5 rounded-full bg-[var(--color-surface-2)]"
      style={{ width, animationDelay: `${delay}ms` }}
    />
  );
}

function MockNote({ children }: { children: string }) {
  return (
    <p className="num mt-4 text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
      makieta · {children}
    </p>
  );
}

/* ── Quiz (etap 4) ── */
export function QuizMock() {
  const options = ['Często', 'Czasami', 'Rzadko', 'Nigdy'];

  return (
    <div className="surface overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="label-mono">Bateria · 1 z 17</span>
        <span className="ml-auto num text-[11px] text-[var(--color-muted)]">pasek postępu</span>
      </div>
      <div className="h-1 w-full bg-[var(--color-surface-2)]">
        <div className="bar-grow h-full w-[6%] bg-[var(--color-accent)]" />
      </div>

      <div className="space-y-5 p-[var(--pad-card)]">
        <div>
          <SkeletonBar width="72%" />
          <SkeletonBar width="44%" delay={120} />
        </div>

        <div role="presentation" className="grid gap-2">
          {options.map((option, index) => (
            <span
              key={option}
              className="flex min-h-14 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 opacity-70"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-[var(--color-border-strong)]" />
              <span className="text-sm font-medium text-[var(--color-muted)]">{option}</span>
            </span>
          ))}
          <span className="mt-1 text-center text-xs text-[var(--color-muted)] opacity-60">
            Nie wiem / pomiń
          </span>
        </div>

        <p className="num border-t border-dashed border-[var(--color-border)] pt-3 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
          dlaczego pytamy? ▸
        </p>
      </div>
      <div className="px-[var(--pad-card)] pb-[var(--pad-card)]">
        <MockNote>radiogroup, zapis po każdej odpowiedzi, krok G1 na końcu</MockNote>
      </div>
    </div>
  );
}

/* ── Suwaki i dostrojenie (etap 5) ── */
export function SlidersMock({ hybrid = false }: { hybrid?: boolean }) {
  const groups = [
    { name: 'Bateria i ładowanie', value: '—', fill: 74 },
    { name: 'Aparat', value: '—', fill: 62 },
    { name: 'Pamięć', value: '—', fill: 48 },
    { name: 'Aktualizacje i trwałość', value: '—', fill: 55 },
    { name: 'Ekran i płynność', value: '—', fill: 40 },
    { name: 'Cena', value: '—', fill: 68 },
  ];

  return (
    <div className="surface overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="label-mono">ważność 0–5</span>
        {hybrid ? (
          <Badge tone="accent">wyliczone z Twoich odpowiedzi</Badge>
        ) : (
          <span className="num ml-auto text-[11px] text-[var(--color-muted)]">filtry: budżet · pamięć</span>
        )}
      </div>

      <ul className="grid gap-px bg-[var(--color-border)]">
        {groups.map((group, index) => (
          <li key={group.name} className="bg-[var(--color-surface)] px-[var(--pad-card)] py-3.5">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-medium">{group.name}</span>
              <span className="num ml-auto text-xs text-[var(--color-muted)]">{group.value} z 5</span>
              <span className="num hidden text-[10px] tracking-[0.12em] text-[var(--color-muted)] uppercase sm:block">
                szczegóły
              </span>
            </div>
            <span className="relative mt-2.5 block h-1.5 w-full rounded-full bg-[var(--color-surface-2)]">
              <span
                className="bar-grow absolute inset-y-0 left-0 rounded-full bg-[var(--color-accent)] opacity-45"
                style={{ width: `${group.fill}%`, animationDelay: `${index * 70}ms` }}
              />
              <span
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-surface)]"
                style={{ left: `${group.fill}%` }}
              />
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-[var(--pad-card)] py-4">
        <p aria-live="polite" className="num text-xs text-[var(--color-muted)]">
          Pasuje {pool.count} z {pool.expected} telefonów
        </p>
        {hybrid ? (
          <span className="num ml-auto rounded-[var(--radius-pill)] border border-[var(--color-border)] px-3 py-1.5 text-[11px] text-[var(--color-muted)] opacity-70">
            przywróć wyliczone
          </span>
        ) : (
          <span className="num ml-auto rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] px-4 py-2 text-[11px] text-[var(--color-muted)] opacity-70">
            pokaż wyniki
          </span>
        )}
      </div>
      <div className="px-[var(--pad-card)] pb-[var(--pad-card)]">
        <MockNote>natywne input[type=range] z aria-valuetext, licznik na żywo</MockNote>
      </div>
    </div>
  );
}

/* ── Trzy karty (etap 6) ── */
export function CardsMock() {
  const bars = [
    [78, 62, 88, 44, 70],
    [71, 55, 80, 66, 48],
    [69, 47, 74, 58, 62],
  ];

  return (
    <div>
      <p className="max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
        Trzy propozycje dla Ciebie. Nazwy odkryjemy po wyborze.
      </p>

      <div className="mt-5 grid gap-4">
        {bars.map((row, index) => (
          <div key={index} className="space-y-3">
            <AnonCardPreview rank={index + 1} bars={row} />
            {index === 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="num inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] px-5 text-sm font-semibold text-[var(--color-muted)] opacity-70">
                  <LockIcon className="h-4 w-4" />
                  wybieram tę propozycję
                </span>
                <span className="num text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
                  więcej szczegółów ▸
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <MockNote>przed wyborem w DOM nie ma nazwy ani marki żadnego telefonu</MockNote>
    </div>
  );
}

/* ── Pełny ranking (etap 9) ── */
export function RankingMock() {
  const rows = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="surface overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-[var(--pad-card)] py-3">
        <span className="label-mono">miejsce · nazwa · cena · dopasowanie</span>
        <span className="ml-auto num text-[11px] text-[var(--color-muted)]">
          {pool.count}/{pool.expected}
        </span>
      </div>
      <ul className="grid gap-px bg-[var(--color-border)]">
        {rows.map((place) => (
          <li
            key={place}
            className="flex items-center gap-3 bg-[var(--color-surface)] px-[var(--pad-card)] py-3.5"
          >
            <span className="num w-6 shrink-0 text-xs font-bold text-[var(--color-muted)]">
              {place}
            </span>
            <span className="min-w-0 flex-1 space-y-2">
              <SkeletonBar width={`${72 - place * 7}%`} delay={place * 90} />
              <SkeletonBar width={`${44 - place * 4}%`} delay={place * 90 + 60} />
            </span>
            <span className="num shrink-0 text-xs text-[var(--color-muted)]">
              {strings.redacted}% · {strings.redacted} zł
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--color-border)] px-[var(--pad-card)] py-3 text-xs text-[var(--color-muted)]">
        Ranking dotyczy stanu danych z {strings.priceNote.replace('cena z ', '')}. Ceny sprawdź w
        sklepie.
      </p>
      <div className="px-[var(--pad-card)] pb-[var(--pad-card)]">
        <MockNote>pula jest pusta, dopóki etap 0 nie domknie danych</MockNote>
      </div>
    </div>
  );
}

/* ── Historia sesji (etap 7) ── */
export function HistoryMock() {
  const rows = [
    { date: '—', mode: 'Quiz', status: 'W trakcie', progress: 'pytanie 7 z 17' },
    { date: '—', mode: 'Quiz + suwaki', status: 'Ukończona', progress: 'wybrano: propozycja #2' },
  ];

  return (
    <ul className="grid gap-3">
      {rows.map((row) => (
        <li key={row.mode} className="surface flex flex-wrap items-center gap-3 p-4 opacity-70">
          <span className="num text-xs text-[var(--color-muted)]">{row.date}</span>
          <span className="text-sm font-semibold">{row.mode}</span>
          <Badge tone="outline">{row.status}</Badge>
          <span className="num ml-auto text-[11px] text-[var(--color-muted)]">{row.progress}</span>
        </li>
      ))}
    </ul>
  );
}
