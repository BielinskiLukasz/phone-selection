import { useEffect } from 'react';
import { Layout } from '@/app/Layout';
import { useHashRoute } from '@/app/router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTheme } from '@/features/theme/useTheme';
import { strings } from '@/data/strings';
import { StartScreen } from '@/screens/StartScreen';
import { SessionStubScreen } from '@/screens/SessionStubScreen';
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

/** Etap 1: szkielet aplikacji — router hashowy, layout, motyw, ekrany-zaślepki. */
export default function App() {
  const route = useHashRoute();
  const { theme, toggle, storageAvailable } = useTheme();

  /* Tytuł karty i powrót na górę przy zmianie ekranu. */
  useEffect(() => {
    const label = titles[route.name] ?? strings.appName;
    document.title = label === strings.home ? strings.appName : `${label} · ${strings.appName}`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  return (
    <ErrorBoundary>
      <Layout route={route} theme={theme} onToggleTheme={toggle}>
        <Screen route={route} storageAvailable={storageAvailable} />
      </Layout>
    </ErrorBoundary>
  );
}

interface ScreenProps {
  route: ReturnType<typeof useHashRoute>;
  storageAvailable: boolean;
}

function Screen({ route, storageAvailable }: ScreenProps) {
  switch (route.name) {
    case 'home':
      return <StartScreen storageAvailable={storageAvailable} />;
    case 'history':
      return <HistoryScreen />;
    case 'missing-session':
      return <MissingSessionScreen sessionId={route.sessionId} view={route.view} />;
    case 'not-found':
      return <NotFoundScreen path={route.path} />;
    default:
      return <SessionStubScreen view={route.name} sessionId={route.sessionId} />;
  }
}
