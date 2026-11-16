import { useSyncExternalStore } from 'react';

/**
 * Router hashowy (E1-07). GitHub Pages nie ma fallbacku SPA, więc wszystkie
 * adresy żyją w hashu i działają po odświeżeniu (UI-SPEC 2).
 */

export const SESSION_VIEWS = ['quiz', 'sliders', 'tune', 'cards', 'ranking'] as const;
export type SessionView = (typeof SESSION_VIEWS)[number];

/** Identyfikatory sesji rozpoznawane na etapie szkieletu (podgląd, nie zapis). */
export const DEMO_SESSION_IDS = ['demo', 'preview'] as const;

export type Route =
  | { name: 'home' }
  | { name: 'history' }
  | { name: 'resume'; code: string }
  | { name: SessionView; sessionId: string }
  | { name: 'missing-session'; sessionId: string; view: SessionView }
  | { name: 'not-found'; path: string };

const SESSION_PATTERN = /^\/s\/([^/]+)\/(quiz|sliders|tune|cards|ranking)$/;

export function isRouteHash(hash: string): boolean {
  return hash === '' || hash.startsWith('#/');
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const path = raw === '' ? '/' : raw.split('?')[0] ?? '/';

  if (path === '/' || path === '') return { name: 'home' };
  if (path === '/history') return { name: 'history' };

  /* Link do wznowienia z innego urządzenia (E7-06). */
  const resumeMatch = /^\/r\/([A-Za-z0-9_-]+)$/.exec(path);
  if (resumeMatch) return { name: 'resume', code: resumeMatch[1] ?? '' };

  const match = SESSION_PATTERN.exec(path);
  if (match) {
    /* Router jest czysty: o tym, czy sesja istnieje, decyduje stan aplikacji (etap 3). */
    return { name: match[2] as SessionView, sessionId: match[1] ?? '' };
  }

  return { name: 'not-found', path };
}

export function isSessionRoute(route: Route): route is { name: SessionView; sessionId: string } {
  return (SESSION_VIEWS as readonly string[]).includes(route.name);
}

/** Identyfikatory podglądu szkieletu — nie są zapisanymi sesjami. */
export function isPreviewSessionId(sessionId: string): boolean {
  return (DEMO_SESSION_IDS as readonly string[]).includes(sessionId);
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'history':
      return '#/history';
    case 'resume':
      return `#/r/${route.code}`;
    case 'missing-session':
      return `#/s/${route.sessionId}/${route.view}`;
    case 'not-found':
      return `#${route.path}`;
    default:
      return `#/s/${route.sessionId}/${route.name}`;
  }
}

export function navigate(hash: string): void {
  if (window.location.hash === hash) return;
  window.location.hash = hash;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  window.addEventListener('popstate', callback);
  return () => {
    window.removeEventListener('hashchange', callback);
    window.removeEventListener('popstate', callback);
  };
}

const HOME_ROUTE: Route = { name: 'home' };

let cachedHash: string | null = null;
let cachedRoute: Route = HOME_ROUTE;

/** useSyncExternalStore wymaga stabilnego snapshotu — pamiętamy ostatni wynik. */
function getSnapshot(): Route {
  const hash = window.location.hash;
  if (hash === cachedHash) return cachedRoute;
  /* Kotwice wewnątrzwidokowe (#tresc) nie są trasami — zostawiamy bieżący ekran. */
  if (!isRouteHash(hash)) return cachedRoute;
  cachedHash = hash;
  cachedRoute = parseHash(hash);
  return cachedRoute;
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, () => HOME_ROUTE);
}
