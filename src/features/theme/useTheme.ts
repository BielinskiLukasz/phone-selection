import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'wybor-telefonu:theme';

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

function storageWorks(): boolean {
  try {
    window.localStorage.setItem(`${THEME_KEY}:probe`, '1');
    window.localStorage.removeItem(`${THEME_KEY}:probe`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Szkielet motywu (E1-08, UI-SPEC 6): atrybut `data-theme` na <html>,
 * wybór zapamiętany lokalnie, domyślnie motyw jasny.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? 'light');
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      setStorageAvailable(false);
    }
  }, [theme]);

  useEffect(() => {
    if (!storageWorks()) setStorageAvailable(false);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggle, storageAvailable };
}
