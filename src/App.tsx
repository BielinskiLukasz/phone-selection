import { useEffect } from 'react';
import { Layout } from '@/app/Layout';
import { isPreviewSessionId, useHashRoute } from '@/app/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StateProvider, useAppState } from '@/features/state/StateProvider';
import { strings } from '@/data/strings';
import { StartScreen } from '@/screens/StartScreen';
import { SessionStubScreen } from '@/screens/SessionStubScreen';
import { QuizScreen } from '@/screens/QuizScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { MissingSessionScreen, NotFoundScreen } from '@/screens/ErrorScreens';

const titles: Record<string, string> = {
  home: strings.home,
  history: strings.history,
  quiz: strings.quiz,
  sliders: strings.sliders,
  tune: strings.tune,
  cards: strings.cards,
  ranking: strings.ranking,
  'missing-session': strings.missingSession,
  'not-found': strings.unknownRoute,
};

/** Etap 3: stan sesji w kontekście, routing hashowy i layout z etapu 1. */
export default function App() {
  return (
    <ErrorBoundary>
      <StateProvider>
        <Shell />
      </StateProvider>
    </ErrorBoundary>
  );
}

function Shell() {
  const route = useHashRoute();
  const { state, dispatch } = useAppState();

  useEffect(() => {
    const label = titles[route.name] ?? strings.appName;
    document.title = label === strings.home ? strings.appName : `${label} · ${strings.appName}`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  return (
    <Layout
      route={route}
      theme={state.theme}
      onToggleTheme={() => dispatch({ type: 'theme/toggle' })}
    >
      <Screen route={route} />
    </Layout>
  );
}

interface ScreenProps {
  route: ReturnType<typeof useHashRoute>;
}

function Screen({ route }: ScreenProps) {
  const { session } = useAppState();

  switch (route.name) {
    case 'home':
      return <StartScreen />;
    case 'history':
      return <HistoryScreen />;
    case 'not-found':
      return <NotFoundScreen path={route.path} />;
    case 'missing-session':
      return <MissingSessionScreen sessionId={route.sessionId} view={route.view} />;
    default: {
      const found = session(route.sessionId);
      if (!found && !isPreviewSessionId(route.sessionId)) {
        return <MissingSessionScreen sessionId={route.sessionId} view={route.name} />;
      }
      /* Etap 4: prawdziwa sesja w trybie quiz/hybryda otwiera działający quiz. */
      if (found && route.name === 'quiz' && (found.mode === 'quiz' || found.mode === 'hybrid')) {
        return <QuizScreen session={found} />;
      }
      return (
        <SessionStubScreen view={route.name} sessionId={route.sessionId} session={found} />
      );
    }
  }
}
