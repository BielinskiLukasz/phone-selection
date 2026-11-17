import { sessionTexts, strings } from '@/data/strings';
import { pool } from '@/data/pool';
import { MODE_ENTRY_VIEW, MODE_LABEL, type Mode } from '@/types/state';
import { useAppState } from '@/features/state/StateProvider';
import { NoticeStack } from '@/components/NoticeStack';
import { quizProgress } from '@/lib/session';
import { plural } from '@/lib/anonymize';
import { AnonCardPreview } from '@/components/AnonCardPreview';
import { ModeRow } from '@/components/ModeRow';
import { ActionBar, Button, Callout, Chip, SectionHeading } from '@/components/ui';
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


const DECK_BARS = [
  [78, 62, 88, 44, 70],
  [71, 55, 80, 66, 48],
  [69, 47, 74, 58, 62],
];

/* FP2-02 (decyzja użytkownika 16.11.2026): panele deweloperskie usunięte z produktu — Start pokazuje tylko to,
   czego potrzebuje użytkowniczka. Makiety demo (`#/s/demo/*`) zostają osiągalne z adresu, ale nie są linkowane. */

export function StartScreen() {
  const { sessions, unfinished, startSession, persistent } = useAppState();

  /* FP2-04: od Startu prosto do pytań; wykluczenia tylko z dyskretnego linku (krok opcjonalny). */
  const openSession = (mode: Mode) => {
    const id = startSession(mode);
    window.location.hash = `#/s/${id}/${MODE_ENTRY_VIEW[mode]}`;
  };
  const openExclusions = () => {
    const id = startSession('quiz');
    window.location.hash = `#/s/${id}/exclude`;
  };
  /* FP2-01: „Wznów wybór” prowadzi na właściwy ekran niedokończonej sesji. */
  const resumeHref = unfinished
    ? `#/s/${unfinished.id}/${
        unfinished.exclusionsStep === 'pending'
          ? 'exclude'
          : unfinished.ranking && unfinished.status === 'awaiting_pick'
            ? 'cards'
            : MODE_ENTRY_VIEW[unfinished.mode]
      }`
    : null;

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-5 pb-28 pt-8 sm:pb-16 sm:pt-14">
        {/* ── Hero (UIP2-02, FIX-UI §5.2): jedno zdanie lead, CTA bez przewijania ── */}
        <section className="screen-in grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:items-start lg:gap-12">
          <div>
            <h1 className="text-display text-balance text-[var(--color-text)]">{strings.heroTitle}</h1>
            <p className="mt-5 max-w-[55ch] text-body text-[var(--color-muted)]">{strings.heroLead}</p>

            <NoticeStack />

            {unfinished ? (
              <Callout
                tone="accent"
                icon={<HistoryIcon />}
                title={unfinished.status === 'awaiting_pick' ? strings.resumeToCards : strings.resumeTitle}
                className="mt-6"
                action={
                  <Button href={resumeHref ?? '#/history'} variant="primary" iconRight={<ArrowRightIcon />}>
                    {unfinished.status === 'awaiting_pick' ? strings.crumbCards : strings.resumeAction}
                  </Button>
                }
              >
                <span className="num">
                  {sessionTexts.resumeNote(
                    MODE_LABEL[unfinished.mode],
                    quizProgress(unfinished).answered,
                    quizProgress(unfinished).total,
                  )}
                  {unfinished.picks.length > 0
                    ? ` · ${strings.sessionFieldPicks}: ${sessionTexts.picksList(unfinished.picks.length)}`
                    : ''}
                </span>
              </Callout>
            ) : null}

            <div id="tryby" className="mt-7 scroll-mt-24" aria-labelledby="mode-heading">
              <h2 id="mode-heading" className="sr-only">
                {strings.chooseMode}
              </h2>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => openSession('quiz')}
                data-testid="start-quiz"
                iconRight={<ArrowRightIcon />}
                className="sm:w-auto"
              >
                {strings.startPrimaryCta}
              </Button>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                <Button variant="ghost" onClick={openExclusions} className="px-2">
                  {strings.startExcludeLink}
                </Button>
                {sessions.length > 0 ? (
                  <Button variant="ghost" href="#/history" icon={<HistoryIcon />} className="px-2">
                    {strings.historyLink}
                  </Button>
                ) : null}
              </div>
              <details className="mt-4 border-t border-[var(--color-border)]">
                <summary className="label min-h-11 cursor-pointer list-none py-3 select-none">
                  {strings.startOtherWays}
                </summary>
                {MODES.filter((entry) => entry.mode !== 'quiz' && entry.mode !== 'hybrid').map((entry, index) => (
                  <ModeRow
                    key={entry.mode}
                    index={index + 2}
                    title={entry.title}
                    description={entry.description}
                    time={entry.time}
                    icon={entry.icon}
                    onStart={() => openSession(entry.mode)}
                  />
                ))}
              </details>
            </div>
          </div>

          {/* Jedna karta podglądu — bez talii trzech warstw i bez hover (FIX-UI §5.2) */}
          <div className="lg:pl-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="label">{strings.anonDeckTitle}</h2>
              <Chip tone="neutral" icon={<LockIcon />}>
                <span className="num">{pool.count}</span> {plural(pool.count, 'telefon', 'telefony', 'telefonów')} w puli
              </Chip>
            </div>
            <AnonCardPreview rank={1} bars={DECK_BARS[0] ?? [70, 60, 55, 50, 45]} />
            <p className="mt-4 flex items-start gap-2 text-small text-[var(--color-muted)]">
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {strings.anonDeckNote}
            </p>
            {!unfinished ? (
              <p className="num mt-3 text-small text-[var(--color-muted)]">
                {sessionTexts.historyStub(sessions.length)}
                {' · '}
                {persistent ? strings.storagePersistent : strings.storageMemoryMode}
              </p>
            ) : null}
          </div>
        </section>

        {/* ── Jak to działa — trzy kroki w jednej linii ── */}
        <section className="mt-14 sm:mt-16" aria-labelledby="how-heading">
          <SectionHeading id="how-heading" title={strings.howItWorks} />
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {strings.howItWorksSteps.slice(0, 3).map((step) => (
              <li key={step.n} className="surface flex gap-3 p-4">
                <span className="num flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-small font-bold text-[var(--color-accent-ink)]">
                  {step.n}
                </span>
                <p className="text-small text-[var(--color-text)]">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* UI-SPEC 7: główny przycisk w pasku przyklejonym do dołu (<640 px) — ten sam Button co w treści */}
      <ActionBar>
        {resumeHref ? (
          <Button href={resumeHref} variant="primary" size="lg" fullWidth iconRight={<ArrowRightIcon />}>
            {strings.startResumeCta}
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => openSession('quiz')} iconRight={<ArrowRightIcon />}>
            {strings.startPrimaryCta}
          </Button>
        )}
      </ActionBar>
    </>
  );
}
