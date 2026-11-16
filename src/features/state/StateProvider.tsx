import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Dispatch } from 'react';
import type { Filters, GroupId, GroupImportance, Weights } from '@/types';
import type { Mode, NoticeCode, Session } from '@/types/state';
import {
  BACKUP_KEY,
  SAVE_DEBOUNCE_MS,
  STORAGE_KEY,
  THEME_KEY,
  browserStorage,
  loadState,
  memoryStorage,
  saveState,
  type StorageAdapter,
} from '@/lib/storage';
import {
  reducer,
  selectActiveSession,
  selectSession,
  selectUnfinished,
  type Action,
} from '@/lib/sessionReducer';
import { newSessionId } from '@/lib/session';

/**
 * Kontekst stanu (E3-07) i synchronizacja między kartami (E3-08).
 * Zapis z opóźnieniem ~300 ms, natychmiastowy przy `visibilitychange` i `pagehide`.
 */

interface StateContextValue {
  state: ReturnType<typeof loadState>['state'];
  dispatch: Dispatch<Action>;
  storage: StorageAdapter;
  /** false = tryb awaryjny w pamięci (brak albo błąd `localStorage`). */
  persistent: boolean;
  backupKey: string | null;
  notices: NoticeCode[];
  sessions: Session[];
  activeSession: Session | null;
  unfinished: Session | null;
  session(id: string | null | undefined): Session | null;
  startSession(mode: Mode): string;
  dismissNotice(code: NoticeCode): void;
  flush(): void;
}

const StateContext = createContext<StateContextValue | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(() => {
    const real = browserStorage();
    const result = loadState(real);
    return {
      storage: real ?? memoryStorage(),
      result,
      persistent: result.persistent,
    };
  });

  const [state, dispatch] = useReducer(reducer, boot.result.state);
  const [persistent, setPersistent] = useState(boot.persistent);
  const [storageNotices, setStorageNotices] = useState<NoticeCode[]>([]);
  const storageRef = useRef<StorageAdapter>(boot.storage);

  /* Zapis z opóźnieniem; natychmiast przy chowaniu karty (E3-02). */
  const flush = useCallback(() => {
    const result = saveState(state, storageRef.current);
    setPersistent(result.persistent);
    setStorageNotices(result.notices);
  }, [state]);

  useEffect(() => {
    const timer = window.setTimeout(flush, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [flush]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
    };
  }, [flush]);

  /* Ostatni zapis wygrywa: inna karta nadpisała stan → czytamy go ponownie. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== THEME_KEY) return;
      const remote = loadState(storageRef.current);
      dispatch({ type: 'state/replace', state: remote.state });
      setPersistent(remote.persistent);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* Motyw: atrybut na <html> i klucz czytany przed pierwszym renderem. */
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    try {
      storageRef.current.setItem(THEME_KEY, state.theme);
    } catch {
      setPersistent(false);
      setStorageNotices(['storage-unavailable']);
    }
  }, [state.theme]);

  const startSession = useCallback(
    (mode: Mode) => {
      const id = newSessionId();
      dispatch({ type: 'session/create', mode, id });
      return id;
    },
    [],
  );

  const dismissNotice = useCallback((code: NoticeCode) => {
    dispatch({ type: 'notice/dismiss', code });
    setStorageNotices((current) => current.filter((item) => item !== code));
  }, []);

  const value = useMemo<StateContextValue>(
    () => ({
      state,
      dispatch,
      storage: storageRef.current,
      persistent,
      backupKey: boot.result.backupKey ?? BACKUP_KEY,
      notices: [...new Set([...state.notices, ...storageNotices])],
      sessions: state.sessions,
      activeSession: selectActiveSession(state),
      unfinished: selectUnfinished(state),
      session: (id) => selectSession(state, id),
      startSession,
      dismissNotice,
      flush,
    }),
    [state, persistent, boot.result.backupKey, storageNotices, startSession, dismissNotice, flush],
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

function useCtx(): StateContextValue {
  const context = useContext(StateContext);
  if (!context) throw new Error('Hook użyty poza StateProvider.');
  return context;
}

/** Pełny dostęp do stanu i magazynu. */
export function useAppState(): StateContextValue {
  return useCtx();
}

/** E3-07: sesje i akcje na nich. */
export function useSessions() {
  const { sessions, activeSession, unfinished, session, startSession, dispatch, persistent, notices } =
    useCtx();

  return {
    sessions,
    activeSession,
    unfinished,
    session,
    persistent,
    notices,
    startSession,
    answer: (sessionId: string, questionId: string, optionId: string) =>
      dispatch({ type: 'session/answer', sessionId, questionId, optionId }),
    setTopThree: (sessionId: string, picks: [GroupId, GroupId, GroupId] | null) =>
      dispatch({ type: 'session/top-three', sessionId, picks }),
    setFilters: (sessionId: string, filters: Partial<Filters>) =>
      dispatch({ type: 'session/filters', sessionId, filters }),
    overrideWeights: (
      sessionId: string,
      weights?: Partial<Weights>,
      groupImportance?: Partial<GroupImportance>,
    ) => dispatch({ type: 'session/override-weights', sessionId, weights, groupImportance }),
    remove: (sessionId: string) => dispatch({ type: 'session/delete', sessionId }),
    activate: (sessionId: string | null) => dispatch({ type: 'session/activate', sessionId }),
    pick: (sessionId: string, phoneId: string) => dispatch({ type: 'session/pick', sessionId, phoneId }),
    setStatus: (sessionId: string, status: 'in_progress' | 'completed') =>
      dispatch({ type: 'session/status', sessionId, status }),
    resetProgress: (sessionId: string) => dispatch({ type: 'session/reset-progress', sessionId }),
    recompute: (sessionId: string) => dispatch({ type: 'session/compute-ranking', sessionId }),
  };
}

/** E3-07: aktywna sesja. */
export function useActiveSession(): Session | null {
  return useCtx().activeSession;
}
