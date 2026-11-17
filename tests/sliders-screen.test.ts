import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement, useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { SlidersScreen } from '../src/screens/SlidersScreen';
import { QuizScreen } from '../src/screens/QuizScreen';
import { STORAGE_KEY } from '../src/lib/storage';
import { GROUPS } from '../src/data/criteria';
import { PHONES } from '../src/data/phones';
import { buildPool, inBudgetSubset } from '../src/lib/pool';
import { sessionTexts, strings } from '../src/data/strings';
import type { Mode, Session } from '../src/types/state';

const h = createElement;

function Harness({ mode = 'sliders', variant = 'sliders' }: { mode?: Mode; variant?: 'sliders' | 'tune' }) {
  const { session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: () => setId(startSession(mode)) }, 'utwórz'),
    active
      ? variant === 'tune' || mode === 'hybrid'
        ? h(SlidersScreen, { session: active as Session, variant: 'tune' })
        : h(SlidersScreen, { session: active as Session, variant: 'sliders' })
      : h('span', { 'data-testid': 'empty' }, 'brak sesji'),
  );
}

function open(mode: Mode = 'sliders', variant: 'sliders' | 'tune' = 'sliders') {
  cleanup();
  const view = render(h(StateProvider, null, h(Harness, { mode, variant })));
  fireEvent.click(view.getByTestId('create'));
  return view;
}

async function settle(ms = 60) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

async function flushStorage() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
}

function storedSession() {
  const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  return (parsed.sessions ?? [])[0];
}

function slider(label: RegExp): HTMLInputElement {
  return screen.getByRole('slider', { name: label }) as HTMLInputElement;
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
});

afterEach(cleanup);

describe('E5-05 · ekran suwaków', () => {
  it('startuje neutralnie: siedem suwaków grup po 2 (w tym wymiary i waga) i kryteria po 2', () => {
    open();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(strings.sliders);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(7);

    for (const element of sliders) {
      const input = element as HTMLInputElement;
      expect(input.getAttribute('aria-valuetext')).toBe('2 z 5, neutralnie');
      expect(input.min).toBe('0');
      expect(input.max).toBe('5');
      expect(input.step).toBe('0.1');
    }
  });

  it('E5-01: suwak grupy ma etykietę tekstową i aria-valuetext', () => {
    open();
    const battery = slider(/Bateria i ładowanie/);
    expect(battery.getAttribute('aria-valuetext')).toBe('2 z 5, neutralnie');

    fireEvent.change(battery, { target: { value: '5' } });
    expect(battery.getAttribute('aria-valuetext')).toBe('5 z 5, kluczowe');
    expect(screen.getByText('kluczowe')).toBeTruthy();
  });

  it('E5-02: „Szczegóły” rozwijają suwaki kryteriów z udziałami w grupie', () => {
    open();
    expect(screen.queryAllByRole('slider').length).toBe(7);

    const details = screen.getAllByRole('button', { name: /Szczegóły/ });
    fireEvent.click(details[1]!); // grupa „Aparat”

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(13); // 7 grup + 6 kryteriów aparatu
    expect(screen.getByRole('slider', { name: 'Zdjęcia w dzień' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Zdjęcia w ruchu' })).toBeTruthy();
    expect(screen.getAllByText(/udział w grupie/).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByRole('slider', { name: 'Zdjęcia w dzień' }), {
      target: { value: '5' },
    });
    expect(screen.getByRole('slider', { name: 'Zdjęcia w dzień' }).getAttribute('aria-valuetext')).toBe(
      '5 z 5, kluczowe',
    );
  });

  it('1. ustawienie „bateria 5, reszta 0” trafia do sesji i do snapshotu rankingu', async () => {
    open();

    fireEvent.change(slider(/Bateria i ładowanie/), { target: { value: '5' } });
    for (const label of [
      /Aparat/,
      /Pamięć/,
      /Aktualizacje i trwałość/,
      /Ekran i płynność/,
      /Wymiary i waga/,
      /Cena/,
    ]) {
      fireEvent.change(slider(label), { target: { value: '0' } });
    }

    await flushStorage();
    const session = storedSession();
    expect(session.groupImportance.battery).toBe(5);
    expect(session.groupImportance.camera).toBe(0);
    expect(session.manualOverride).toBe(true);
    expect(session.ranking.cards[0]).toBe('vivo-v70-fe-5g-8-256');
    expect(session.ranking.entries.length).toBe(PHONES.length);
  });

  it('suwak „Wymiary i waga” = 5 (reszta 0) stawia na najmniejsze i najlżejsze telefony', async () => {
    open();
    for (const group of GROUPS) {
      const target = group.id === 'size' ? 5 : 0;
      fireEvent.click(screen.getByRole('button', { name: `${group.label}: ${target} z 5` }));
    }

    await flushStorage();
    const session = storedSession();
    expect(session.groupImportance.size).toBe(5);
    expect(session.ranking.cards).toEqual([
      'pixel-10a-8-128',
      'pixel-9a-8-128',
      'honor-400-8-256',
    ]);
    /* Przy filtrze min. 256 GB wygrywają najporęczniejsze modele 256 GB: Honor 400, Edge 60, A57. */
    fireEvent.click(screen.getByRole('radio', { name: /minimum 256 GB/ }));
    await flushStorage();
    expect(storedSession().ranking.cards).toEqual([
      'honor-400-8-256',
      'motorola-edge-60-12-256',
      'galaxy-a57-8-256',
    ]);
  });

  it('szybki wybór 0-5 ustawia wartość dokładnie (duże pola dotyku)', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Cena: 5 z 5' }));
    expect(slider(/Cena/).getAttribute('aria-valuetext')).toBe('5 z 5, kluczowe');

    fireEvent.click(screen.getByRole('button', { name: 'Cena: 0 z 5' }));
    expect(slider(/Cena/).getAttribute('aria-valuetext')).toBe('0 z 5, ignoruj');
  });
});

describe('E5-03/E5-04 · filtry i licznik na żywo', () => {
  it('budżet 1500 zł zmienia licznik (3 w budżecie bez ostrzeżenia, D6), a z microSD ostrzega o uzupełnieniu', () => {
    open();
    expect(screen.getByText(sessionTexts.poolMatches(PHONES.length, PHONES.length))).toBeTruthy();

    fireEvent.click(screen.getByRole('radio', { name: /^do 1500 zł$/ }));

    const expected = buildPool(PHONES, { budgetMax: 1500 }).length;
    expect(inBudgetSubset(PHONES, 1500).length).toBe(3);
    expect(screen.getByText(sessionTexts.poolMatches(expected, PHONES.length))).toBeTruthy();
    expect(screen.queryByText(/W tym budżecie mieszcz/)).toBeNull();

    /* Po zawężeniu do microSD zostaje 1 telefon w budżecie → pojawia się komunikat o dopłacie. */
    fireEvent.click(screen.getByRole('radio', { name: /musi mieć/ }));
    expect(screen.getByText(sessionTexts.poolMatches(1, PHONES.length))).toBeTruthy();
    expect(
      screen.getByText(
        'W tym budżecie mieści się tylko jeden telefon. Pozostałe propozycje są droższe.',
      ),
    ).toBeTruthy();
  });

  it('pamięć „minimum 256 GB” odrzuca telefony 128 GB', () => {
    open();
    fireEvent.click(screen.getByRole('radio', { name: /minimum 256 GB/ }));

    const expected = buildPool(PHONES, { budgetMax: 2000, minStorageGb: 256 }).length;
    expect(expected).toBe(PHONES.length - 2);
    expect(screen.getByText(sessionTexts.poolMatches(expected, PHONES.length))).toBeTruthy();
  });

  it('„musi mieć microSD” zostawia jedyny telefon ze slotem', () => {
    open();
    fireEvent.click(screen.getByRole('radio', { name: /musi mieć/ }));
    expect(screen.getByText(sessionTexts.poolMatches(1, PHONES.length))).toBeTruthy();
  });
});

describe('E5-06/E5-07 · hybryda i dostrojenie', () => {
  it('3. po krótkim quizie suwaki mają wartości wyliczone przez silnik', async () => {
    cleanup();
    const view = render(
      h(StateProvider, null, h(HybridHarness)),
    );
    fireEvent.click(view.getByTestId('create'));

    /* Krótki quiz: 7 pytań z inShortQuiz, odpowiedzi persony „żona”. */
    const shortAnswers = [
      /2-4 godziny/,
      /Czasem/,
      /Często/,
      /Często/,
      /Często/,
      /Wszystko w telefonie/,
      /Do 2000 zł/,
    ];
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    for (const answer of shortAnswers) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length === 0) break;
      fireEvent.click(screen.getByRole('radio', { name: answer }));
      await settle();
    }

    /* Krok G1: bateria, aparat, pamięć. */
    fireEvent.click(screen.getByRole('button', { name: /Bateria i ładowanie/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Aparat/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Pamięć/ }));
    fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki|Pokaż 3 propozycje|Dalej: podsumowanie/ })[0]!);
    await settle();

    /* Podsumowanie → „Pokaż wyniki” prowadzi do dostrojenia. */
    fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki|Pokaż 3 propozycje|Dalej: podsumowanie/ })[0]!);
    await settle();
    expect(window.location.hash).toMatch(/\/tune$/);

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(7);
    expect(screen.getByText(strings.computedBadge)).toBeTruthy();

    /* Ważności z kroku G1: pasma 5/4/3 skorygowane siłą odpowiedzi z krótkiego quizu. */
    /* Pierwsze miejsce nasyca się na 5 (sufit skali) — korekta z odpowiedzi działa w dół. */
    expect(screen.getByRole('slider', { name: /Bateria i ładowanie/ }).getAttribute('aria-valuetext')).toBe(
      '5 z 5, kluczowe',
    );
    expect(screen.getByRole('slider', { name: /^Aparat/ }).getAttribute('aria-valuetext')).toBe(
      '4,4 z 5, bardzo ważne',
    );
    expect(screen.getByRole('slider', { name: /^Pamięć/ }).getAttribute('aria-valuetext')).toBe(
      '3,4 z 5, ważne',
    );
    expect(screen.getByRole('slider', { name: /Cena/ }).getAttribute('aria-valuetext')).toBe(
      '1,3 z 5, mało ważne',
    );
  });

  it('4. ręczna zmiana + „Przywróć wyliczone” cofa wartości i zdejmuje manualOverride', async () => {
    open('hybrid', 'tune');
    expect(screen.getByText(strings.computedBadge)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Przywróć wyliczone/ }).hasAttribute('disabled')).toBe(true);

    fireEvent.change(slider(/Bateria i ładowanie/), { target: { value: '0' } });
    expect(slider(/Bateria i ładowanie/).getAttribute('aria-valuetext')).toBe('0 z 5, ignoruj');
    expect(screen.getByText(strings.manualOverrideNote)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Przywróć wyliczone/ }).hasAttribute('disabled')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /Przywróć wyliczone/ }));
    /* Bez odpowiedzi ważność grupy wraca do wartości z wzoru: 0,5 + 0,4 × 2 = 1,3. */
    expect(slider(/Bateria i ładowanie/).getAttribute('aria-valuetext')).toBe('1,3 z 5, mało ważne');

    await flushStorage();
    expect(storedSession().manualOverride).toBe(false);
  });
});

describe('E5-06 · zakończenie i dostępność', () => {
  it('„Pokaż wyniki” liczy ranking, domyka sesję i prowadzi do kart', async () => {
    open();
    fireEvent.change(slider(/Bateria i ładowanie/), { target: { value: '4' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki|Pokaż 3 propozycje|Dalej: podsumowanie/ })[0]!);
    await settle();

    expect(window.location.hash).toMatch(/^#\/s\/[a-z0-9]+\/cards$/);
    await flushStorage();
    const session = storedSession();
    expect(session.status).toBe('completed');
    expect(session.ranking.cards.length).toBe(3);
  });

  it('6. suwaki są natywne: fokus, zakres i aria-valuetext działają z klawiatury', () => {
    open();
    const battery = slider(/Bateria i ładowanie/);

    battery.focus();
    expect(document.activeElement).toBe(battery);
    expect(battery.type).toBe('range');
    expect(battery.getAttribute('aria-valuetext')).toContain('z 5');

    /* Natywny range obsługuje strzałki w przeglądarce; tu sprawdzamy kontrakt wartości. */
    fireEvent.keyDown(battery, { key: 'ArrowRight' });
    fireEvent.change(battery, { target: { value: '2.1' } });
    expect(battery.getAttribute('aria-valuetext')).toBe('2,1 z 5, neutralnie');
  });

  it('podgląd na żywo pokazuje trzy anonimowe propozycje z ceną i procentem', () => {
    open();
    const preview = screen.getByTestId('podglad');
    expect(within(preview).getAllByText(/zł/).length).toBe(3);
    expect(within(preview).getAllByText(/%$/).length).toBe(3);
    expect(within(preview).getAllByText(strings.hiddenName).length).toBe(3);
    expect(preview.textContent).not.toMatch(/Samsung|Xiaomi|Motorola|Google|Realme|Nothing/);
  });
});

/** Hybryda: krótki quiz (etap 4) płynnie przechodzi w ekran dostrojenia (etap 5). */
function HybridHarness() {
  const { session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const [hash, setHash] = useState(window.location.hash);
  const active = session(id);

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (!active) {
    return h(
      'button',
      { 'data-testid': 'create', onClick: () => setId(startSession('hybrid')) },
      'utwórz',
    );
  }

  const onTune = hash.endsWith('/tune');
  return onTune
    ? h(SlidersScreen, { session: active, variant: 'tune' })
    : h(QuizScreen, { session: active });
}
