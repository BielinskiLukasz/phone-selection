import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import App from '../src/App';
import { strings } from '../src/data/strings';

/**
 * Test dymny (E1-06) uruchamiany na publicznym punkcie wejścia aplikacji.
 * Bez esbuilda i bez czytania index.html — kod testujemy tak, jak go bundluje Vite.
 */

/** Nazwy marek i serii, których nie wolno pokazać przed wyborem (PROJECT 8). */
const FORBIDDEN = ['Samsung', 'Galaxy', 'Pixel', 'Xiaomi', 'Redmi', 'Motorola', 'Nothing', 'Realme'];

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

function heading(name: string) {
  return screen.getByRole('heading', { level: 1, name });
}

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = () => {};
  document.documentElement.dataset.theme = 'light';
  window.location.hash = '#/';
});

afterEach(cleanup);

describe('Etap 1 — szkielet aplikacji', () => {
  test('renderuje ekran startowy z wyborem trybu', () => {
    render(createElement(App));

    expect(heading(strings.heroTitle)).toBeTruthy();
    expect(screen.getByRole('heading', { name: strings.chooseMode })).toBeTruthy();

    const links = screen.getAllByRole('link').map((link) => link.textContent ?? '');
    expect(links.some((text) => text.includes('#/s/demo/quiz'))).toBe(true);
    expect(links.some((text) => text.includes('#/s/demo/sliders'))).toBe(true);
    expect(links.some((text) => text.includes('#/s/demo/tune'))).toBe(true);
  });

  test('E4-07: wybór trybu na starcie tworzy sesję i otwiera działający quiz', async () => {
    render(createElement(App));

    fireEvent.click(
      screen.getByRole('button', { name: /Pytania o to, jak korzystasz z telefonu/ }),
    );
    expect(window.location.hash).toMatch(/^#\/s\/[a-z0-9]+\/quiz$/);

    // nagłówek pierwszego bloku, nie zaślepka
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Bateria i ładowanie');
    expect(screen.getByRole('progressbar')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Dalej/ }));
    expect(screen.getByRole('radiogroup')).toBeTruthy();

    // zapis jest z opóźnieniem 300 ms
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    const stored = JSON.parse(window.localStorage.getItem('wybor-telefonu:v1') ?? '{}');
    expect((stored.sessions ?? []).length).toBe(1);
    expect(stored.sessions[0].mode).toBe('quiz');
    expect(stored.sessions[0].status).toBe('in_progress');
  });

  test('routing hashowy pokazuje właściwe ekrany, także po odświeżeniu', () => {
    // Odświeżenie strony: adres istnieje zanim aplikacja wystartuje.
    window.location.hash = '#/history';
    render(createElement(App));
    expect(heading(strings.history)).toBeTruthy();

    goTo('#/s/demo/quiz');
    expect(heading(strings.quiz)).toBeTruthy();

    goTo('#/s/demo/cards');
    expect(heading(strings.cards)).toBeTruthy();

    goTo('#/');
    expect(screen.getByRole('heading', { name: strings.chooseMode })).toBeTruthy();
  });

  test('nieznana trasa i nieznana sesja kończą się komunikatem', () => {
    render(createElement(App));

    goTo('#/ustawienia');
    expect(heading(strings.unknownRoute)).toBeTruthy();

    goTo('#/s/2f9c1a/quiz');
    expect(heading(strings.missingSession)).toBeTruthy();
    expect(screen.getByRole('link', { name: strings.startNew })).toBeTruthy();
  });

  test('przełącznik motywu ustawia data-theme i zapamiętuje wybór', () => {
    render(createElement(App));

    fireEvent.click(screen.getByRole('button', { name: strings.themeToDark }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('wybor-telefonu:theme')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: strings.themeToLight }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  test('na ekranie kart nie ma nazwy ani marki telefonu', () => {
    render(createElement(App));

    goTo('#/s/demo/cards');
    const text = document.body.textContent ?? '';
    for (const word of FORBIDDEN) {
      expect(text).not.toContain(word);
    }
    expect(screen.getAllByText(`${strings.redacted}%`).length).toBe(3);
  });
});
