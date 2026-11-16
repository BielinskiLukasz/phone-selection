import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement, useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { CardsScreen } from '../src/screens/CardsScreen';
import { PHONES } from '../src/data/phones';
import { buildPool } from '../src/lib/pool';
import { sessionTexts, strings } from '../src/data/strings';
import type { Filters } from '../src/types';

const h = createElement;

/** E8-08: stany krańcowe z UI-SPEC 10 — pusta i mała pula na ekranie kart. */
function Harness({ filters }: { filters: Partial<Filters> }) {
  const { dispatch, session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  useEffect(() => {
    if (!active) return;
    dispatch({ type: 'session/filters', sessionId: active.id, filters });
  }, [active?.id, dispatch, filters]);

  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: () => setId(startSession('sliders')) }, 'utwórz'),
    active ? h(CardsScreen, { session: active }) : null,
  );
}

function open(filters: Partial<Filters>) {
  cleanup();
  const view = render(h(StateProvider, null, h(Harness, { filters })));
  fireEvent.click(view.getByTestId('create'));
  return view;
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
});

afterEach(cleanup);

describe('UI-SPEC 10 · pula telefonów na ekranie kart', () => {
  it('pula 0: komunikat i przycisk zmiany filtrów', () => {
    expect(buildPool(PHONES, { budgetMax: 2000, minStorageGb: 1024 }).length).toBe(0);
    open({ minStorageGb: 1024 });

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(strings.cards);
    expect(screen.getByText(strings.noPhonesMatch)).toBeTruthy();
    expect(screen.getByRole('link', { name: strings.changeFilters }).getAttribute('href')).toMatch(/sliders$/);
    expect(screen.queryAllByRole('article').length).toBe(0);
  });

  it('pula 1: jedna karta z komunikatem, bez pustych miejsc', () => {
    expect(buildPool(PHONES, { budgetMax: 2000, requireMicroSd: true }).length).toBe(1);
    open({ requireMicroSd: true });

    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(1);
    expect(screen.getAllByText(sessionTexts.poolSmall(1)).length).toBeGreaterThan(0);
    expect(within(articles[0]!).getByRole('heading', { level: 2 }).textContent).toContain('#1');
  });

  it('pula pełna: trzy karty i licznik w nagłówku', () => {
    open({});
    expect(screen.getAllByRole('article').length).toBe(3);
    expect(screen.getAllByText(new RegExp(`pula ${PHONES.length}`)).length).toBeGreaterThan(0);
  });
});
