import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { STORAGE_KEY, THEME_KEY } from '../src/lib/storage';
import { strings } from '../src/data/strings';

/**
 * Test akceptacyjny 3 (E8-07): automatyczny audyt axe na każdym ekranie w obu motywach.
 * Liczą się błędy poważne i krytyczne — zgodnie z zakresem etapu.
 */

const h = createElement;

async function audit(label: string): Promise<void> {
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
  });
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
  const report = serious.map(
    (violation) =>
      `${label} → ${violation.id}: ${violation.nodes
        .map((node) => `${node.failureSummary} :: ${node.html.slice(0, 200)}`)
        .join(' || ')}`,
  );
  expect(report).toEqual([]);
}

function goto(hash: string): void {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

async function settle(ms = 40): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

async function auditEveryScreen(theme: 'light' | 'dark'): Promise<void> {
  window.localStorage.setItem(THEME_KEY, theme);
  window.localStorage.removeItem(STORAGE_KEY);
  window.location.hash = '#/';
  render(h(App));

  expect(document.documentElement.dataset.theme).toBe(theme);
  await audit(`${theme}: start`);

  /* FP2-04: wykluczenia to opcja — wejście z linku na Starcie (tworzy sesję quizu), potem quiz. */
  fireEvent.click(screen.getByRole('button', { name: strings.startExcludeLink }));
  goto(window.location.hash);
  await audit(`${theme}: wykluczenia — zwinięte`);

  fireEvent.click(screen.getByRole('switch'));
  await settle(80);
  await audit(`${theme}: wykluczenia — chipy marek`);

  fireEvent.click(
    screen.getByRole('button', { name: new RegExp(strings.excludeModelsToggleShow) }),
  );
  await audit(`${theme}: wykluczenia — pojedyncze modele`);

  fireEvent.click(screen.getAllByRole('button', { name: strings.excludeSkip })[0]!);
  goto(window.location.hash);
  await audit(`${theme}: quiz — nagłówek bloku`);

  fireEvent.click(screen.getByRole('button', { name: new RegExp(strings.next) }));
  await audit(`${theme}: quiz — pytanie`);
  expect(screen.getByRole('radiogroup')).toBeTruthy();

  /* Suwaki: grupy, rozwinięte kryteria, filtry. */
  goto('#/');
  fireEvent.click(screen.getByRole('button', { name: /Samodzielnie ustaw, co jest ważne/ }));
  goto(window.location.hash);
  await audit(`${theme}: suwaki`);

  fireEvent.click(screen.getAllByRole('button', { name: new RegExp(strings.slidersDetails) })[0]!);
  await audit(`${theme}: suwaki — kryteria`);

  /* Karty + szczegóły + okno potwierdzenia. */
  fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki|Pokaż 3 propozycje|Dalej: podsumowanie/ })[0]!);
  goto(window.location.hash);
  await audit(`${theme}: karty`);

  /* W ciemnym motywie szczegóły są otwarte od razu (UI-SPEC 3.5) — nie ma przycisku. */
  const detailsToggle = screen.queryAllByText(strings.cardsMoreDetails)[0];
  if (theme === 'light') expect(detailsToggle).toBeTruthy();
  else expect(detailsToggle).toBeUndefined();
  if (detailsToggle) fireEvent.click(detailsToggle);
  await audit(`${theme}: karty — szczegóły`);

  fireEvent.click(screen.getAllByRole('button', { name: /Wybieram tę propozycję/ })[0]!);
  await audit(`${theme}: karty — okno potwierdzenia`);

  /* Ujawnienie i pełny ranking (E9-01) — nazwy są już jawne. */
  fireEvent.click(screen.getByRole('button', { name: strings.cardsConfirmReveal }));
  await settle();
  fireEvent.click(screen.getByRole('link', { name: new RegExp(strings.cardsFullRanking) }));
  goto(window.location.hash);
  await audit(`${theme}: pełny ranking`);

  fireEvent.click(screen.getAllByRole('button', { name: /pkt/ })[0]!);
  await audit(`${theme}: pełny ranking — rozwinięty wiersz`);

  fireEvent.click(screen.getByRole('link', { name: new RegExp(strings.rankingBack) }));
  goto(window.location.hash);

  /* Historia, stany błędów, link do wznowienia. */
  goto('#/history');
  await audit(`${theme}: historia`);

  goto('#/ustawienia');
  await audit(`${theme}: nieznana trasa`);

  goto('#/s/999999/quiz');
  await audit(`${theme}: brak sesji`);

  goto('#/r/niepoprawnykod');
  await audit(`${theme}: uszkodzony link do wznowienia`);

  cleanup();
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
  document.documentElement.dataset.theme = 'light';
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('test akceptacyjny 3 · audyt axe w obu motywach', () => {
  it('motyw jasny: wszystkie ekrany bez błędów poważnych i krytycznych', async () => {
    await auditEveryScreen('light');
  }, 90_000);

  it('motyw ciemny: wszystkie ekrany bez błędów poważnych i krytycznych', async () => {
    await auditEveryScreen('dark');
  }, 90_000);
});

describe('test akceptacyjny 1 · przełącznik motywu', () => {
  it('zmienia cały interfejs i jest zapamiętany bez mignięcia', async () => {
    window.localStorage.clear();
    window.location.hash = '#/';
    render(h(App));
    expect(document.documentElement.dataset.theme).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: strings.themeToDark }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');
    await settle(400);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}').theme).toBe('dark');

    /* „Odświeżenie”: atrybut jest ustawiony przed renderem aplikacji. */
    cleanup();
    window.location.hash = '#/';
    render(h(App));
    expect(document.documentElement.dataset.theme).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: strings.themeToLight }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('test akceptacyjny 4 · przejście samą klawiaturą', () => {
  it('każdy element interaktywny ma osiągalny fokus, a odpowiedzi wybiera się spacją', async () => {
    window.location.hash = '#/';
    render(h(App));

    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>('button, a[href], input, summary, [tabindex]'),
    );
    /* UIP2-02: Start bez paneli deweloperskich ma mniej elementów (CTA, link wykluczeń, „Inne sposoby”, historia, motyw…). */
    expect(interactive.length).toBeGreaterThan(6);
    for (const element of interactive) {
      const tabIndex = Number(element.getAttribute('tabindex') ?? 0);
      expect(tabIndex, element.outerHTML.slice(0, 80)).toBeLessThanOrEqual(0);
      if (tabIndex === 0) {
        element.focus();
        expect(document.activeElement, element.outerHTML.slice(0, 80)).toBe(element);
      }
    }

    /* FP2-04: Start → quiz bez kroku pośredniego → odpowiedź spacją → krok dalej. */
    const startButton = screen.getAllByRole('button', { name: strings.startPrimaryCta })[0]!;
    startButton.focus();
    expect(document.activeElement).toBe(startButton);
    fireEvent.click(startButton); // przeglądarka odpala click dla Enter/Space na button
    goto(window.location.hash);
    expect(window.location.hash).toMatch(/\/quiz$/);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(strings.next) }));
    const options = screen.getAllByRole('radio');
    options[1]!.focus();
    expect(document.activeElement).toBe(options[1]);

    fireEvent.keyDown(options[1]!, { key: ' ' });
    await settle();
    expect(options[1]!.getAttribute('aria-checked')).toBe('true');
  }, 30_000);
});
