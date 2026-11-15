import type { ReactNode } from 'react';
import { screenPlans, strings, type PlanScreenKey } from '@/data/strings';
import { SESSION_VIEWS, type SessionView } from '@/app/router';
import { ScreenShell } from '@/components/ScreenShell';
import {
  ListIcon,
  PhoneIcon,
  ScreenIcon,
  SlidersIcon,
  UpdateIcon,
} from '@/components/Icons';
import { CardsMock, QuizMock, RankingMock, SlidersMock } from './mocks';

const titles: Record<SessionView, string> = {
  quiz: strings.quiz,
  sliders: strings.sliders,
  tune: strings.tune,
  cards: strings.cards,
  ranking: strings.ranking,
};

const icons: Record<SessionView, ReactNode> = {
  quiz: <ListIcon className="h-7 w-7" />,
  sliders: <SlidersIcon className="h-7 w-7" />,
  tune: <UpdateIcon className="h-7 w-7" />,
  cards: <PhoneIcon className="h-7 w-7" />,
  ranking: <ScreenIcon className="h-7 w-7" />,
};

interface SessionStubScreenProps {
  view: SessionView;
  sessionId: string;
}

/** Ekrany-zaślepki sesji (E1-07): adres, plan zawartości, makieta, pager. */
export function SessionStubScreen({ view, sessionId }: SessionStubScreenProps) {
  const plan = screenPlans[view as PlanScreenKey];
  const index = SESSION_VIEWS.indexOf(view);
  const prev = index > 0 ? SESSION_VIEWS[index - 1] : undefined;
  const next = index < SESSION_VIEWS.length - 1 ? SESSION_VIEWS[index + 1] : undefined;

  const mock =
    view === 'quiz' ? (
      <QuizMock />
    ) : view === 'sliders' ? (
      <SlidersMock />
    ) : view === 'tune' ? (
      <SlidersMock hybrid />
    ) : view === 'cards' ? (
      <CardsMock />
    ) : (
      <RankingMock />
    );

  return (
    <ScreenShell
      title={titles[view]}
      hash={`#/s/${sessionId}/${view}`}
      stage={plan.stage}
      stageName={plan.stageName}
      plan={plan.items}
      icon={icons[view]}
      pager={{
        prev: prev ? `#/s/${sessionId}/${prev}` : undefined,
        prevLabel: prev ? titles[prev] : undefined,
        next: next ? `#/s/${sessionId}/${next}` : undefined,
        nextLabel: next ? titles[next] : undefined,
      }}
    >
      <p className="num mb-6 rounded-[var(--radius-card)] bg-[var(--color-surface-2)] px-4 py-3 text-[11px] leading-relaxed tracking-[0.06em] text-[var(--color-muted)]">
        {strings.demoSessionNote}
      </p>
      {mock}
    </ScreenShell>
  );
}
