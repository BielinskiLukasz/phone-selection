import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement, useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { RankingScreen } from '../src/screens/RankingScreen';
import { CardsScreen } from '../src/screens/CardsScreen';
import { PHONES } from '../src/data/phones';
import { sessionTexts, strings } from '../src/data/strings';
import type { Session } from '../src/types/state';

const h = createElement;

/** Sesja z jednym wyborem — pełny ranking jest dostępny dopiero po wyborze (E9-02). */
function Harness({ withPick = true, recompute = false }: { withPick?: boolean; recompute?: boolean }) {
  const { dispatch, session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  useEffect(() => {
    if (!active || active.picks.length > 0 || !withPick) return;
    const first = active.ranking?.cards[0];
    if (first) dispatch({ type: 'session/pick', sessionId: active.id, phoneId: first });
  }, [active, dispatch, withPick]);

  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: () => setId(startSession('quiz')) }, 'utwórz'),
    h(
      'button',
      {
        'data-testid': 'drop-ranking',
        onClick: () => {
          if (active) dispatch({ type: 'session/filters', sessionId: active.id, filters: { budgetMax: 2000 } });
        },
      },
      'filtry',
    ),
    active ? h(RankingScreen, { session: active as Session }) : null,
    recompute && active ? h(CardsScreen, { session: active }) : null,
  );
}

function open(options: { withPick?: boolean } = {}) {
  cleanup();
  const view = render(h(StateProvider, null, h(Harness, options)));
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

describe('E9-01 · pełny ranking', () => {
  it('1. pokazuje wszystkie telefony z puli z nazwami, dopasowaniem i ceną', () => {
    open();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(strings.ranking);
    const rows = screen.getAllByRole('button', { name: /pkt/ });
    expect(rows.length).toBe(PHONES.length);

    for (const phone of PHONES) {
      expect(screen.getByText(phone.reveal.name), phone.id).toBeTruthy();
    }
    expect(screen.getAllByText(/zł/).length).toBeGreaterThanOrEqual(PHONES.length);
    expect(screen.getAllByText(/^\d+$/).length).toBeGreaterThanOrEqual(PHONES.length);
  });

  it('mieści komunikat o stanie danych i podsumowanie puli', () => {
    open();
    expect(
      screen.getByText('Ranking dotyczy stanu danych z 16.11.2026. Ceny sprawdź w sklepie.'),
    ).toBeTruthy();
    expect(screen.getAllByText(sessionTexts.poolSummary(PHONES.length, PHONES.length)).length).toBeGreaterThan(0);
  });

  it('odznacza własne wybory numeracją „Twój wybór 1/1”', () => {
    open();
    expect(screen.getAllByText(new RegExp(`${strings.rankingYourPick} 1/1`)).length).toBe(1);

    const picked = screen
      .getAllByRole('button', { name: /pkt/ })
      .find((row) => row.textContent?.includes(strings.rankingYourPick));
    expect(picked).toBeTruthy();
    expect(picked!.closest('li')!.className).toContain('border');
  });

  it('bez wyboru nie ma odznak, a pierwszy wiersz jest wyróżniony', () => {
    open({ withPick: false });
    expect(screen.queryByText(new RegExp(strings.rankingYourPick))).toBeNull();
    expect(screen.getAllByRole('button', { name: /pkt/ }).length).toBe(PHONES.length);
  });

  it('każdy wiersz ma mini-paski sześciu grup', () => {
    open();
    const firstRow = screen.getAllByRole('button', { name: /pkt/ })[0]!;
    /* Sześć grup × ( pasek + etykieta ) — etykiety widoczne od 1024 px, paski zawsze. */
    expect(firstRow.querySelectorAll('span[title]').length).toBe(6);
    for (const group of ['Bateria', 'Aparat', 'Pamięć', 'Aktualizacje', 'Ekran', 'Cena']) {
      expect(firstRow.querySelector(`span[title^="${group}"]`), group).toBeTruthy();
    }
  });

  it('rozwinięcie wiersza pokazuje oceny, pełne dane, linki do sklepów i źródła', () => {
    open();
    const row = screen.getAllByRole('button', { name: /pkt/ })[0]!;
    const name = row.textContent ?? '';
    expect(screen.queryByRole('link', { name: /Zobacz w sklepie|sferis|morele|mediaexpert/i })).toBeNull();

    fireEvent.click(row);
    expect(row.getAttribute('aria-expanded')).toBe('true');

    expect(screen.getByText(strings.cardsDetailsScores)).toBeTruthy();
    expect(screen.getByText(strings.cardsDetailsSpecs)).toBeTruthy();
    expect(screen.getByText(strings.rankingSources)).toBeTruthy();
    expect(screen.getAllByText('Czas pracy na baterii').length).toBeGreaterThan(0);

    const shopLinks = screen.getAllByRole('link').filter((link) =>
      (link.getAttribute('href') ?? '').startsWith('https://'),
    );
    expect(shopLinks.length).toBeGreaterThan(0);
    for (const link of shopLinks) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
    expect(name.length).toBeGreaterThan(5);
  });

  it('telefon poza pulą trafia do osobnej sekcji z powodem', () => {
    open();
    // filtr 256 GB wyrzuca Pixele 128 GB z puli sesji
    cleanup();
    const view = render(
      h(StateProvider, null, h(FilteredHarness, { filters: { minStorageGb: 256 } })),
    );
    fireEvent.click(view.getByTestId('create'));

    expect(screen.getAllByRole('button', { name: /pkt/ }).length).toBe(PHONES.length - 2);
    const toggle = screen.getByRole('button', { name: new RegExp(strings.rankingShowOutside) });
    fireEvent.click(toggle);

    expect(screen.getByText('Google Pixel 10a 8/128 GB')).toBeTruthy();
    expect(screen.getAllByText(strings.rankingReasonStorage).length).toBeGreaterThan(0);
  });

  it('sesja bez snapshotu dostaje przycisk przeliczenia i powrót do propozycji', () => {
    cleanup();
    render(h(StateProvider, null, h(EmptyRankingHarness)));
    fireEvent.click(screen.getByTestId('create'));

    expect(screen.getByText(strings.rankingNoSnapshot)).toBeTruthy();
    expect(screen.getByRole('button', { name: strings.rankingRecompute })).toBeTruthy();
    expect(screen.getByRole('link', { name: new RegExp(strings.rankingBack) }).getAttribute('href')).toMatch(
      /\/cards$/,
    );
  });
});

describe('E9-02 · wejście na ranking dopiero po wyborze', () => {
  it('przycisk „Pokaż pełny ranking” jest na kartach tylko po pierwszym wyborze', () => {
    cleanup();
    const view = render(h(StateProvider, null, h(Harness, { withPick: false, recompute: true })));
    fireEvent.click(view.getByTestId('create'));

    expect(screen.queryByRole('link', { name: new RegExp(strings.cardsFullRanking) })).toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: /Wybieram tę propozycję/ })[0]!);
    fireEvent.click(screen.getByRole('button', { name: strings.cardsConfirmReveal }));

    const link = screen.getByRole('link', { name: new RegExp(strings.cardsFullRanking) });
    expect(link.getAttribute('href')).toMatch(/\/ranking$/);
  });
});

function FilteredHarness({ filters }: { filters: { minStorageGb?: number } }) {
  const { dispatch, session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  useEffect(() => {
    if (!active || active.filters.minStorageGb === filters.minStorageGb) return;
    dispatch({ type: 'session/filters', sessionId: active.id, filters });
  }, [active, dispatch, filters]);

  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: () => setId(startSession('sliders')) }, 'utwórz'),
    active ? h(RankingScreen, { session: active }) : null,
  );
}

function EmptyRankingHarness() {
  const { session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  /* Sesja bez snapshotu rankingu — stan, który ekran musi obsłużyć. */
  const withoutRanking = active ? { ...active, ranking: null } : null;
  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: () => setId(startSession('quiz')) }, 'utwórz'),
    withoutRanking ? h(RankingScreen, { session: withoutRanking }) : null,
  );
}
