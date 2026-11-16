import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { BACKUP_KEY, STORAGE_KEY, THEME_KEY, emptyState } from '../src/lib/storage';
import { createSession } from '../src/lib/session';

/** Testy dostawcy stanu (E3-07, E3-08) na prawdziwym `localStorage` z jsdom. */

const h = createElement;
const originalStorage = window.localStorage;

function Probe() {
  const { sessions, notices, persistent, startSession, dispatch, state } = useAppState();
  const first = sessions[0];

  return h(
    'div',
    null,
    h('span', { 'data-testid': 'count' }, String(sessions.length)),
    h('span', { 'data-testid': 'persistent' }, String(persistent)),
    h('span', { 'data-testid': 'notices' }, notices.join(',')),
    h('span', { 'data-testid': 'answers' }, JSON.stringify(first?.answers ?? {})),
    h('span', { 'data-testid': 'theme' }, state.theme),
    h('span', { 'data-testid': 'battery' }, String(first?.weights.battery ?? 0)),
    h(
      'button',
      { 'data-testid': 'start', onClick: () => startSession('quiz') },
      'start',
    ),
    h(
      'button',
      {
        'data-testid': 'answer',
        onClick: () => {
          if (first) {
            dispatch({
              type: 'session/answer',
              sessionId: first.id,
              questionId: 'A1',
              optionId: 'A1-c',
            });
          }
        },
      },
      'answer',
    ),
    h(
      'button',
      { 'data-testid': 'theme-toggle', onClick: () => dispatch({ type: 'theme/toggle' }) },
      'theme',
    ),
  );
}

function renderApp() {
  return render(h(StateProvider, null, h(Probe)));
}

async function settle(ms = 400) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function breakStorage() {
  const blocked = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {
      throw new Error('SecurityError');
    },
    clear: () => undefined,
    key: () => null,
    length: 0,
  };
  Object.defineProperty(window, 'localStorage', { value: blocked, configurable: true });
}

beforeEach(() => {
  /* Twardy reset: cleanup() RTL plus wyczyszczenie drzewa z poprzednich testów. */
  cleanup();
  document.body.innerHTML = '';
  Object.defineProperty(window, 'localStorage', { value: originalStorage, configurable: true });
  window.localStorage.clear();
  document.documentElement.dataset.theme = 'light';
});

afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'localStorage', { value: originalStorage, configurable: true });
});

describe('E3-07 · dostawca stanu', () => {
  it('1. sesja i odpowiedź przeżywają odświeżenie strony', async () => {
    renderApp();
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('persistent').textContent).toBe('true');

    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('answer'));
    expect(screen.getByTestId('answers').textContent).toContain('A1-c');
    expect(screen.getByTestId('battery').textContent).toBe('4');

    await settle();
    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).toContain('A1-c');

    /* „Odświeżenie”: nowy mount czyta stan z magazynu. */
    cleanup();
    renderApp();
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('answers').textContent).toContain('A1-c');
    expect(screen.getByTestId('battery').textContent).toBe('4');
  });

  it('motyw zapisuje się w stanie, w atrybucie <html> i pod kluczem motywu', async () => {
    const first = renderApp();
    fireEvent.click(first.getByTestId('theme-toggle'));

    expect(first.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');

    await settle();
    first.unmount();

    const second = renderApp();
    expect(second.getByTestId('theme').textContent).toBe('dark');
    second.unmount();
  });
});

describe('E3-08 · synchronizacja kart', () => {
  it('4. zapis z drugiej karty po zdarzeniu storage trafia do stanu', async () => {
    renderApp();
    expect(screen.getByTestId('count').textContent).toBe('0');

    const remote = {
      ...emptyState(),
      sessions: [createSession('hybrid', new Date(), 'z-drugiej-karty')],
      activeSessionId: 'z-drugiej-karty',
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('answers').textContent).toBe('{}');

    /* Ostatni zapis wygrywa: lokalna odpowiedź nie wraca po synchronizacji. */
    await settle();
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.sessions.length).toBe(1);
  });
});

describe('E3-04 · stany awaryjne w interfejsie', () => {
  it('2. uszkodzony JSON: pusty stan, kopia zapasowa i komunikat', () => {
    window.localStorage.setItem(STORAGE_KEY, '{niekompletny zapis');
    renderApp();

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('notices').textContent).toContain('corrupted-data');
    expect(window.localStorage.getItem(BACKUP_KEY)).toBe('{niekompletny zapis');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('3. brak dostępu do localStorage: tryb w pamięci i baner', () => {
    breakStorage();
    renderApp();

    expect(screen.getByTestId('persistent').textContent).toBe('false');
    expect(screen.getByTestId('notices').textContent).toContain('storage-unavailable');

    /* Aplikacja działa dalej w pamięci. */
    fireEvent.click(screen.getByTestId('start'));
    fireEvent.click(screen.getByTestId('answer'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('answers').textContent).toContain('A1-c');
  });
});
