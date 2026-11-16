import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { QuizScreen } from '../src/screens/QuizScreen';
import { STORAGE_KEY } from '../src/lib/storage';
import type { Mode } from '../src/types/state';

const h = createElement;

function Harness({ mode = 'quiz' }: { mode?: Mode }) {
  const { session, startSession } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: () => setId(startSession(mode)) }, 'utwórz'),
    active ? h(QuizScreen, { session: active }) : h('span', { 'data-testid': 'empty' }, 'brak sesji'),
  );
}

function open(mode: Mode = 'quiz') {
  cleanup(); // pewność, że w dokumencie jest dokładnie jedno drzewo
  const view = render(h(StateProvider, null, h(Harness, { mode })));
  fireEvent.click(view.getByTestId('create'));
  return view;
}

/* Przyciski główne istnieją dwa razy: w treści (≥640 px) i w pasku na dole (<640 px). */
function action(pattern: RegExp): HTMLElement {
  return screen.getAllByRole('button', { name: pattern })[0]!;
}

async function settle(ms = 60) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

/** Zapis jest z opóźnieniem 300 ms — przed odczytem magazynu trzeba go przepchnąć. */
async function flushStorage() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
}

function storedState() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('E4-02/E4-04 · ekran pytania', () => {
  it('nagłówek bloku prowadzi do pierwszego pytania', () => {
    open();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Bateria i ładowanie');

    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Ile godzin dziennie patrzysz w ekran telefonu?',
    );
  });

  it('odpowiedzi są radiogroup z opcją „Nie wiem / pomiń” i rozwijanym „Dlaczego pytamy?”', () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));

    const group = screen.getByRole('radiogroup');
    const options = within(group).getAllByRole('radio');
    expect(options.length).toBe(5); // 4 odpowiedzi + „pomiń”
    expect(options.every((option) => option.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(options[4]!.textContent).toContain('Nie wiem / pomiń');
    expect(options.filter((option) => option.tabIndex === 0).length).toBe(1);

    expect(screen.getByText('Dlaczego pytamy?')).toBeTruthy();
    fireEvent.click(screen.getByText('Dlaczego pytamy?'));
    expect(screen.getByText(/Im więcej ekranu, tym ważniejsza bateria/)).toBeTruthy();
  });

  it('wybór zapisuje odpowiedź i przechodzi dalej automatycznie', async () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));

    fireEvent.click(screen.getByRole('radio', { name: /4-6 godzin/ }));
    expect(screen.getByRole('radio', { name: /4-6 godzin/ }).getAttribute('aria-checked')).toBe('true');
    await settle();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      'Czy zdarzają się dni, gdy nie masz jak naładować telefonu',
    );
    await flushStorage();
    expect(storedState().sessions.length).toBe(1);
    expect(storedState().sessions[0].answers.A1).toBe('A1-c');
  });

  it('3. „Wstecz” pokazuje wcześniejszą odpowiedź podświetloną i pozwala ją zmienić', async () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Do 2 godzin/ }));
    await settle();

    // jesteśmy na A2 — wracamy do A1
    fireEvent.click(screen.getAllByRole('button', { name: /Wstecz/ })[0]!);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Ile godzin dziennie');
    expect(screen.getByRole('radio', { name: /Do 2 godzin/ }).getAttribute('aria-checked')).toBe('true');

    fireEvent.click(screen.getByRole('radio', { name: /Ponad 6 godzin/ }));
    await settle();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Czy zdarzają się dni');
  });
});

describe('E4-09 · klawiatura', () => {
  it('7. strzałki przesuwają fokus, a spacja wybiera odpowiedź', async () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));

    const options = screen.getAllByRole('radio');
    options[0]!.focus();
    expect(document.activeElement).toBe(options[0]);

    fireEvent.keyDown(options[0]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(options[1]);

    fireEvent.keyDown(options[1]!, { key: 'End' });
    expect(document.activeElement).toBe(options[options.length - 1]);

    fireEvent.keyDown(options[options.length - 1]!, { key: 'Home' });
    expect(document.activeElement).toBe(options[0]);

    fireEvent.keyDown(options[0]!, { key: ' ', code: 'Space' });
    await settle();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Czy zdarzają się dni');
  });
});

describe('E4-05/E4-06 · krok G1, podsumowanie i zakończenie', () => {
  it('5. pominięcie G1 liczy ranking bez trójki i pokazuje podsumowanie', async () => {
    open();
    // odpowiedz na wszystkie pytania, klikając pierwszą opcję i wracając „Wstecz”
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    for (let step = 0; step < 40; step += 1) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length === 0) break;
      fireEvent.click(radios[0]!);
      await settle();
    }

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Wybierz trzy najważniejsze rzeczy',
    );
    expect(action(/Pokaż wyniki/).hasAttribute('disabled')).toBe(true);

    fireEvent.click(action(/Pomiń ten krok/));
    await settle();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Podsumowanie odpowiedzi');
    expect(screen.getByText('krok G1 pominięty')).toBeTruthy();
    expect(screen.getByText(/Pasuje 15 z 15 telefonów/)).toBeTruthy();

    await flushStorage();
    const stored = storedState();
    const sessions = stored.sessions ?? [];
    expect(sessions.length).toBe(1);
    expect(sessions[0].topThree).toBeNull();
    expect(Object.keys(sessions[0].weights).length).toBe(14);
    expect(sessions[0].ranking.cards.length).toBe(3);
  });

  it('trójka G1 ustawia ważności 5/4/3 i odblokowuje „Pokaż wyniki”', async () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    for (let step = 0; step < 40; step += 1) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length === 0) break;
      fireEvent.click(radios[0]!);
      await settle();
    }

    fireEvent.click(screen.getByRole('button', { name: /Bateria i ładowanie/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Aparat/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Pamięć/ }));

    expect(screen.getByText(/wybrane 3 z 3/)).toBeTruthy();
    fireEvent.click(action(/Pokaż wyniki/));
    await settle();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Podsumowanie odpowiedzi');
    await flushStorage();
    const stored = storedState();
    expect(stored.sessions[0].topThree.picks).toEqual(['battery', 'camera', 'storage']);
    /* Pierwsze opcje odpowiedzi obniżają ważności wewnątrz pasm (bateria 0,9 → 5 − 0,12). */
    const gi = stored.sessions[0].groupImportance;
    expect(gi.battery).toBeCloseTo(4.88, 2);
    expect(gi.battery).toBeGreaterThan(gi.camera);
    expect(gi.camera).toBeGreaterThan(gi.storage);
  });

  it('1./6. zakończenie domyka sesję i prowadzi do kart, a same „pomiń” dają ostrzeżenie', async () => {
    open();
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    for (let step = 0; step < 40; step += 1) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length === 0) break;
      fireEvent.click(radios[radios.length - 1]!); // „Nie wiem / pomiń”
      await settle();
    }

    fireEvent.click(action(/Pomiń ten krok/));
    await settle();
    expect(
      screen.getByText('Większość odpowiedzi to „nie wiem”, więc wynik jest ogólny.'),
    ).toBeTruthy();

    fireEvent.click(action(/Pokaż wyniki/));
    await settle();
    expect(window.location.hash).toMatch(/^#\/s\/[a-z0-9-]+\/cards$/);

    await flushStorage();
    const stored = storedState();
    expect(stored.sessions[0].status).toBe('completed');
    expect(stored.sessions[0].ranking.entries.length).toBe(15);
  });

  it('hybryda prowadzi krótki quiz i kończy na dostrojeniu', async () => {
    open('hybrid');
    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    for (let step = 0; step < 20; step += 1) {
      const radios = screen.queryAllByRole('radio');
      if (radios.length === 0) break;
      fireEvent.click(radios[0]!);
      await settle();
    }

    fireEvent.click(action(/Pomiń ten krok/));
    await settle();
    expect(screen.getByText(/krótki quiz \(hybryda\) · 7 pytań/)).toBeTruthy();

    fireEvent.click(action(/Pokaż wyniki/));
    await settle();
    expect(window.location.hash).toMatch(/\/tune$/);
  });
});
