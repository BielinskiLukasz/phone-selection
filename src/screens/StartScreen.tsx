import { sessionTexts, strings } from '@/data/strings';
import { pool } from '@/data/pool';
import { MODE_ENTRY_VIEW, MODE_LABEL, type Mode } from '@/types/state';
import { useAppState } from '@/features/state/StateProvider';
import { NoticeStack } from '@/components/NoticeStack';
import { quizProgress } from '@/lib/session';
import { AnonCardPreview } from '@/components/AnonCardPreview';
import { ModeRow } from '@/components/ModeRow';
import { Reveal } from '@/components/Reveal';
import { SkeletonPanel } from '@/components/SkeletonPanel';
import { RouterConsole } from '@/components/RouterConsole';
import { Badge } from '@/components/Badge';
import {
  ArrowRightIcon,
  HistoryIcon,
  ListIcon,
  LockIcon,
  PhoneIcon,
  SlidersIcon,
} from '@/components/Icons';

interface ModeEntry {
  mode: Mode;
  /** Ekran podglądu szkieletu (bez zapisu sesji). */
  preview: 'quiz' | 'sliders' | 'tune';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const MODES: ModeEntry[] = [
  {
    mode: 'quiz',
    preview: 'quiz',
    title: strings.quiz,
    description: strings.quizDescription,
    time: strings.quizTime,
    icon: <ListIcon className="h-5 w-5" />,
  },
  {
    mode: 'sliders',
    preview: 'sliders',
    title: strings.sliders,
    description: strings.slidersDescription,
    time: strings.slidersTime,
    icon: <SlidersIcon className="h-5 w-5" />,
  },
  {
    mode: 'hybrid',
    preview: 'tune',
    title: strings.quizAndSliders,
    description: strings.hybridDescription,
    time: strings.hybridTime,
    icon: <PhoneIcon className="h-5 w-5" />,
  },
];

const ROUTE_MAP = [
  { hash: '#/', label: strings.home, kind: 'ok' },
  { hash: '#/s/demo/quiz', label: strings.quiz, kind: 'stub' },
  { hash: '#/s/demo/sliders', label: strings.sliders, kind: 'stub' },
  { hash: '#/s/demo/tune', label: strings.tune, kind: 'stub' },
  { hash: '#/s/demo/cards', label: strings.cards, kind: 'stub' },
  { hash: '#/s/demo/ranking', label: strings.ranking, kind: 'stub' },
  { hash: '#/history', label: strings.history, kind: 'ready' },
  { hash: '#/r/kod-z-drugiego-urządzenia', label: strings.resumeLinkTitle, kind: 'ready' },
  { hash: '#/s/2f9c1a/quiz', label: strings.missingSession, kind: 'error' },
  { hash: '#/ustawienia', label: strings.unknownRoute, kind: 'error' },
] as const;

const DECK_BARS = [
  [78, 62, 88, 44, 70],
  [71, 55, 80, 66, 48],
  [69, 47, 74, 58, 62],
];

export function StartScreen() {
  const { sessions, unfinished, startSession, persistent } = useAppState();
  const words = strings.heroTitle.split(' ');
  const lastWord = words.pop() ?? '';

  /* Wybór trybu tworzy prawdziwą sesję i otwiera jej pierwszy ekran (etap 3). */
  const openSession = (mode: Mode) => {
    const id = startSession(mode);
    window.location.hash = `#/s/${id}/${MODE_ENTRY_VIEW[mode]}`;
  };

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-8 sm:pb-16 sm:pt-14">
        {/* ── Hero: obietnica anonimowych kart, nie wyśrodkowany baner ── */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.88fr)] lg:items-center lg:gap-12">
          <div className="screen-in">
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
              <span className="breathe h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              <span className="label-mono">{strings.heroEyebrow}</span>
            </span>

            <h1 className="mt-5 text-[clamp(2.6rem,9vw,4.3rem)] leading-[0.98] font-bold tracking-[-0.045em] text-balance">
              {words.join(' ')}{' '}
              <span className="relative whitespace-nowrap text-[var(--color-accent-ink)]">
                {lastWord}
                <span
                  className="rule-draw absolute -bottom-1 left-0 h-[4px] w-full rounded-full bg-[var(--color-accent)]"
                  aria-hidden="true"
                />
              </span>
            </h1>

            <p className="mt-7 max-w-prose text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
              {strings.heroLead}
            </p>

            <p className="num mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase">
              {strings.heroNote.split(' · ').map((part, index) => (
                <span key={part} className="flex items-center gap-3">
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  {part}
                </span>
              ))}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('tryby')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_var(--color-accent)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] dark:text-[#08130c]"
              >
                {strings.chooseMode}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <a
                href="#/history"
                className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-5 text-sm font-medium transition-colors duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
              >
                <HistoryIcon className="h-4 w-4" />
                {strings.historyLink}
              </a>
            </div>
          </div>

          {/* Trzy anonimowe karty — sedno produktu */}
          <Reveal delay={80} className="lg:pl-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="label-mono">{strings.anonDeckTitle}</h2>
              <Badge tone="outline">
                <LockIcon className="h-3 w-3" />
                {pool.count} rekordów w puli
              </Badge>
            </div>

            <div className="group relative">
              <div className="absolute inset-0" aria-hidden="true">
                <div className="absolute inset-x-3 top-6 -bottom-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] opacity-45 transition-transform duration-300 group-hover:translate-y-1.5 group-hover:rotate-[1.4deg]" />
                <div className="absolute inset-x-1.5 top-3 -bottom-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] opacity-75 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:-rotate-[1deg]" />
              </div>
              <div className="relative transition-transform duration-300 group-hover:-translate-y-1">
                <AnonCardPreview rank={1} bars={DECK_BARS[0] ?? [70, 60, 55, 50, 45]} />
              </div>
            </div>

            <p className="relative mt-7 text-xs leading-relaxed text-[var(--color-muted)]">
              {strings.anonDeckNote}
            </p>
          </Reveal>
        </section>

        {/* ── Tryby: jedna główna czynność ekranu ── */}
        <section id="tryby" className="mt-16 scroll-mt-24 sm:mt-24" aria-labelledby="mode-heading">
          <Reveal className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="mode-heading"
              className="text-[clamp(1.7rem,5vw,2.3rem)] leading-tight font-bold tracking-[-0.035em]"
            >
              {strings.chooseMode}
            </h2>
            <span className="num text-[11px] tracking-[0.14em] text-[var(--color-muted)] uppercase">
              3 tryby · ten sam wynik
            </span>
          </Reveal>

          <Reveal delay={50} className="mt-5 border-t border-[var(--color-border)]">
            {MODES.map((entry, index) => (
              <ModeRow
                key={entry.mode}
                index={index + 1}
                title={entry.title}
                description={entry.description}
                time={entry.time}
                icon={entry.icon}
                onStart={() => openSession(entry.mode)}
                previewHref={`#/s/demo/${entry.preview}`}
              />
            ))}
          </Reveal>
        </section>

        {/* ── Stan zapisu: komunikaty magazynu i wznowienie sesji (etap 3) ── */}
        <div className="mt-8 grid gap-3">
          <NoticeStack />

          {unfinished ? (
            <Reveal className="surface flex flex-col gap-3 border-l-4 border-l-[var(--color-accent)] p-4 sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]">
                <HistoryIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{strings.resumeTitle}</p>
                <p className="num mt-0.5 text-xs text-[var(--color-muted)]">
                  {sessionTexts.resumeNote(
                    MODE_LABEL[unfinished.mode],
                    quizProgress(unfinished).answered,
                    quizProgress(unfinished).total,
                  )}
                  {unfinished.picks.length > 0
                    ? ` · ${strings.sessionFieldPicks}: ${sessionTexts.picksList(unfinished.picks.length)}`
                    : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <a
                  href={`#/s/${unfinished.id}/${MODE_ENTRY_VIEW[unfinished.mode]}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 dark:text-[#08130c]"
                >
                  {strings.resumeAction}
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
                <a
                  href="#/history"
                  className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 text-sm transition-colors duration-200 hover:border-[var(--color-border-strong)]"
                >
                  {strings.historyLink}
                </a>
              </div>
            </Reveal>
          ) : (
            <Reveal className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-surface-2)] text-[var(--color-muted)]">
                <HistoryIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{strings.noSessionsYet}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">
                  {sessionTexts.historyStub(sessions.length)}
                </p>
              </div>
              <span className="num ml-auto hidden shrink-0 text-[11px] tracking-[0.12em] text-[var(--color-muted)] uppercase sm:block">
                {persistent ? strings.storagePersistent : strings.storageMemoryMode}
              </span>
            </Reveal>
          )}
        </div>

        {/* ── Jak to działa ── */}
        <section className="mt-16 sm:mt-20" aria-labelledby="how-heading">
          <Reveal>
            <h2
              id="how-heading"
              className="text-[clamp(1.5rem,4.5vw,1.9rem)] font-bold tracking-[-0.03em]"
            >
              {strings.howItWorks}
            </h2>
          </Reveal>
          <ol className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
            {strings.howItWorksSteps.map((step, index) => (
              <Reveal
                as="li"
                key={step.n}
                delay={index * 60}
                className="group bg-[var(--color-surface)] p-5 transition-colors duration-200 hover:bg-[var(--color-surface-2)]"
              >
                <span className="num flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-xs font-bold transition-colors duration-200 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent-ink)]">
                  {step.n}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text)]">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ── Mapa ekranów: routing hashowy działa po odświeżeniu ── */}
        <section className="mt-16 sm:mt-20" aria-labelledby="routes-heading">
          <Reveal>
            <h2
              id="routes-heading"
              className="text-[clamp(1.5rem,4.5vw,1.9rem)] font-bold tracking-[-0.03em]"
            >
              {strings.routesTitle}
            </h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
              {strings.routesNote}
            </p>
          </Reveal>

          <ul className="mt-6 grid gap-2">
            {ROUTE_MAP.map((entry, index) => (
              <Reveal as="li" key={entry.hash} delay={Math.min(index * 35, 240)}>
                <a
                  href={entry.hash}
                  className="group flex min-h-12 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-[var(--color-accent)]"
                >
                  <code className="num shrink-0 text-xs font-semibold text-[var(--color-accent-ink)]">
                    {entry.hash}
                  </code>
                  <span className="ml-auto truncate text-right text-xs text-[var(--color-muted)]">
                    {entry.label}
                  </span>
                  <span
                    className={`num shrink-0 rounded-[var(--radius-pill)] px-2 py-1 text-[10px] tracking-[0.12em] uppercase ${
                      entry.kind === 'error'
                        ? 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]'
                        : entry.kind === 'stub'
                          ? 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'
                          : 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]'
                    }`}
                  >
                    {entry.kind === 'error'
                      ? 'błąd'
                      : entry.kind === 'stub'
                        ? strings.routeWorks
                        : entry.kind === 'ready'
                          ? 'gotowy'
                          : 'start'}
                  </span>
                  <span className="shrink-0 text-[var(--color-border-strong)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={40} className="mt-8">
            <p className="max-w-prose text-sm leading-relaxed text-[var(--color-muted)]">
              {strings.routerConsoleNote}
            </p>
            <RouterConsole knownSessions={sessions.map((item) => item.id)} />
          </Reveal>
        </section>

        <SkeletonPanel />
      </div>

      {/* UI-SPEC 7: główny przycisk w pasku przyklejonym do dołu (<640 px) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <a
          href="#/s/demo/quiz"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent)] text-sm font-semibold text-white dark:text-[#08130c]"
        >
          {strings.quiz} — {strings.quizTime}
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </>
  );
}
