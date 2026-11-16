import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { CardsScreen } from '../src/screens/CardsScreen';
import { POOL } from './data';
import { WIFE } from './personas';
import { STORAGE_KEY } from '../src/lib/storage';
import { collectForbiddenTokens } from '../src/lib/anonymize';
import { priceFreshness } from '../src/data/pool';
import type { Session } from '../src/types/state';

const h = createElement;

/** Wszystkie zakazane tokeny z całej puli — marki, modele, chipy, sklepy. */
const FORBIDDEN = [...new Set(POOL.flatMap((phone) => collectForbiddenTokens(phone, POOL)))].sort();

function Harness({ withWifeAnswers = false }: { withWifeAnswers?: boolean }) {
  const { session, startSession, dispatch } = useAppState();
  const [id, setId] = useState<string | null>(null);
  const active = session(id);

  function create() {
    const newId = startSession('quiz');
    setId(newId);
    if (withWifeAnswers) {
      for (const [questionId, optionId] of Object.entries(WIFE.answers)) {
        dispatch({ type: 'session/answer', sessionId: newId, questionId, optionId });
      }
      dispatch({ type: 'session/top-three', sessionId: newId, picks: WIFE.topThree!.picks });
    }
  }

  return h(
    'div',
    null,
    h('button', { 'data-testid': 'create', onClick: create }, 'utwórz'),
    h(
      'button',
      {
        'data-testid': 'budget-1500',
        onClick: () => {
          if (active) {
            dispatch({ type: 'session/filters', sessionId: active.id, filters: { budgetMax: 1500 } });
          }
        },
      },
      'budżet 1500',
    ),
    h(
      'button',
      {
        'data-testid': 'budget-tight',
        onClick: () => {
          if (active) {
            dispatch({ type: 'session/filters', sessionId: active.id, filters: { budgetMax: 1380 } });
          }
        },
      },
      'budżet ciasny',
    ),
    active ? h(CardsScreen, { session: active as Session }) : null,
  );
}

function open(options: { withWifeAnswers?: boolean } = {}) {
  cleanup();
  const view = render(h(StateProvider, null, h(Harness, options)));
  fireEvent.click(view.getByTestId('create'));
  return view;
}

async function flushStorage() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
}

function storedSessions() {
  const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  return (parsed.sessions ?? []) as Session[];
}

/**
 * E6-11: przeszukanie drzewa DOM pod kątem nazw, marek, modeli i sklepów.
 * Skanujemy **osobne węzły tekstu** i atrybuty (`alt`, `title`, `aria-*`, `data-*`, `href`),
 * a nie sklejony `textContent` całego dokumentu — sklejenie sąsiednich elementów
 * („…średnia” + „57”) tworzyłoby fałszywe dopasowania, których użytkownik nie widzi.
 */
function findLeaksInDom(root: ParentNode = document.body): string[] {
  const found = new Set<string>();
  const haystacks: string[] = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const text = (node.textContent ?? '').trim();
    if (text.length > 0) haystacks.push(text);
    node = walker.nextNode();
  }

  root.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (
        name === 'alt' ||
        name === 'title' ||
        name === 'href' ||
        name === 'placeholder' ||
        name.startsWith('aria-') ||
        name.startsWith('data-')
      ) {
        haystacks.push(attribute.value);
      }
    }
  });

  const text = haystacks.join('\n').toLowerCase();
  for (const token of FORBIDDEN) {
    if (token.length >= 3 && text.includes(token)) found.add(token);
  }
  return [...found];
}

function card(place: number): HTMLElement {
  const articles = screen.getAllByRole('article');
  const article = articles[place - 1];
  if (!article) throw new Error(`Brak karty #${place} w DOM.`);
  return article;
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
  document.title = 'Wybór telefonu';
});

afterEach(cleanup);

describe('E6-01/E6-02 · ekran kart', () => {
  it('pokazuje trzy propozycje z dopasowaniem, ceną z datą i sześcioma cechami', () => {
    open();

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Trzy propozycje');
    expect(screen.getByText('Trzy propozycje dla Ciebie. Nazwy odkryjemy po wyborze.')).toBeTruthy();

    for (const place of [1, 2, 3]) {
      const article = card(place);
      expect(within(article).getByRole('heading', { level: 2 }).textContent).toContain(`#${place}`);
      expect(within(article).getAllByText(/zł/).length).toBeGreaterThan(0);
      expect(within(article).getByText(/cena z \d{2}\.\d{2}\.\d{4}/)).toBeTruthy();
      expect(within(article).getAllByText(/Dopasowanie|%/).length).toBeGreaterThan(0);
      /* Jasny motyw: 4 cechy od razu, dwie pozostałe po rozwinięciu (UI-SPEC 6). */
      for (const label of ['Bateria', 'Aparat', 'Pamięć', 'Aktualizacje']) {
        expect(within(article).getAllByText(label).length, `#${place}: ${label}`).toBeGreaterThan(0);
      }
      const collapsed = ['Odporność', 'Ekran i wydajność'].map(
        (label) => within(article).queryAllByText(label).length,
      );
      fireEvent.click(within(article).getByRole('button', { name: /Wszystkie cechy \(6\)/ }));
      const expanded = ['Odporność', 'Ekran i wydajność'].map(
        (label) => within(article).queryAllByText(label).length,
      );
      expect(expanded[0]).toBe((collapsed[0] ?? 0) + 1);
      expect(expanded[1]).toBe((collapsed[1] ?? 0) + 1);

      fireEvent.click(within(article).getByRole('button', { name: /Ukryj cechy/ }));
      expect(within(article).queryAllByText('Ekran i wydajność').length).toBe(collapsed[1]);
      expect(within(article).getByRole('button', { name: /Wybieram tę propozycję/ })).toBeTruthy();
    }
  });

  it('E8-05: w ciemnym motywie wszystkie cechy i oceny są widoczne od razu', () => {
    window.localStorage.setItem('wybor-telefonu:theme', 'dark');
    cleanup();
    render(h(StateProvider, null, h(Harness)));
    fireEvent.click(screen.getByTestId('create'));

    expect(document.documentElement.dataset.theme).toBe('dark');
    const article = card(1);
    for (const label of ['Bateria', 'Aparat', 'Pamięć', 'Aktualizacje', 'Odporność', 'Ekran i wydajność']) {
      expect(within(article).getAllByText(label).length, label).toBeGreaterThan(0);
    }
    expect(within(article).queryByRole('button', { name: /Wszystkie cechy/ })).toBeNull();
    expect(within(article).getByText('Oceny kryteriów')).toBeTruthy();
    expect(within(article).getByText('Pełne dane')).toBeTruthy();
  });

  it('E6-03: „Więcej szczegółów” rozwija oceny z pewnością i pełne dane', () => {
    open();
    const article = card(1);

    const details = article.querySelector('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    fireEvent.click(within(article).getByText('Więcej szczegółów'));
    expect(details.open).toBe(true);

    expect(within(article).getByText('Oceny kryteriów')).toBeTruthy();
    expect(within(article).getByText('Pełne dane')).toBeTruthy();
    expect(within(article).getAllByText('Czas pracy na baterii').length).toBeGreaterThan(0);
    expect(within(article).getAllByRole('img', { name: /pewność oceny/ }).length).toBe(14);
    /* Procesor tylko jako klasa wydajności, nigdy jako nazwa chipa. */
    expect(within(article).getByText(/klasa (wysoka|średnia|podstawowa)/)).toBeTruthy();
  });
});

describe('E6-11 · test wycieku nazw w DOM (akceptacja 1)', () => {
  it('przed wyborem w drzewie, atrybutach i tytule nie ma nazw, marek ani sklepów', () => {
    open();

    const leaks = findLeaksInDom(document.body);
    expect(leaks, `Wyciek: ${leaks.join(', ')}`).toEqual([]);
    expect(document.title.toLowerCase()).not.toMatch(/samsung|galaxy|pixel|xiaomi|motorola|realme|nothing/);
    expect(screen.getAllByText(/nazwa ukryta/).length).toBeGreaterThan(0);
  });

  it('wyciek nie pojawia się też przy odpowiedziach persony „żona”', () => {
    open({ withWifeAnswers: true });
    expect(findLeaksInDom(document.body)).toEqual([]);
  });

  it('linki do sklepów nie istnieją w DOM przed wyborem', () => {
    open();
    const hrefs = Array.from(document.querySelectorAll('a[href]')).map((link) =>
      link.getAttribute('href') ?? '',
    );
    expect(hrefs.filter((href) => href.startsWith('http')).length).toBe(0);
  });
});

describe('E6-05/E6-06/E6-07 · wybór i ujawnienie', () => {
  it('2. wybór karty #2 odsłania ją z plakietką „Wybór 1/1”, reszta zostaje anonimowa', () => {
    open();
    const second = card(2);
    fireEvent.click(within(second).getByRole('button', { name: /Wybieram tę propozycję/ }));

    /* Okno potwierdzenia u dołu. */
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Wybierasz propozycję #2?')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Odkryj' })).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Odkryj' }));

    const revealed = card(2);
    expect(within(revealed).getByText('Wybór 1/1')).toBeTruthy();
    expect(within(revealed).getAllByRole('link', { name: /Zobacz w sklepie/ }).length).toBeGreaterThan(0);
    expect(within(revealed).getByText(/Cena orientacyjna, sprawdź w sklepie/)).toBeTruthy();

    /* Linki otwierają się w nowej karcie z bezpiecznym rel. */
    const shopLink = within(revealed).getAllByRole('link', { name: /Zobacz w sklepie/ })[0]!;
    expect(shopLink.getAttribute('target')).toBe('_blank');
    expect(shopLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(shopLink.getAttribute('href')?.startsWith('https://')).toBe(true);

    /* Pozostałe karty są anonimowe. */
    for (const place of [1, 3]) {
      const article = card(place);
      expect(within(article).getByRole('button', { name: /Wybieram tę propozycję/ })).toBeTruthy();
      expect(within(article).queryByText(/Wybór \d\/\d/)).toBeNull();
      expect(findLeaksInDom(article)).toEqual([]);
    }
  });

  it('3. drugi wybór daje plakietki „Wybór 1/2” i „Wybór 2/2” w kolejności dodania', () => {
    open();

    fireEvent.click(within(card(2)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Odkryj' }));

    fireEvent.click(within(card(1)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Odkryj' }));

    expect(within(card(2)).getByText('Wybór 1/2')).toBeTruthy();
    expect(within(card(1)).getByText('Wybór 2/2')).toBeTruthy();
    expect(within(card(3)).queryByText(/Wybór \d\/\d/)).toBeNull();
  });

  it('5. „Wróć” w oknie potwierdzenia nic nie odsłania', () => {
    open();
    fireEvent.click(within(card(1)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Wróć' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText(/Wybór \d\/\d/)).toBeNull();
    expect(findLeaksInDom(document.body)).toEqual([]);
  });

  it('Esc zamyka okno potwierdzenia, a fokus wpada do okna i wraca po zamknięciu', () => {
    open();
    const chooseButton = within(card(1)).getByRole('button', { name: /Wybieram tę propozycję/ });
    chooseButton.focus();
    fireEvent.click(chooseButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(chooseButton);
  });

  it('4. po odświeżeniu odsłonięte karty zostają odsłonięte z tymi samymi numerami', async () => {
    open();
    fireEvent.click(within(card(3)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Odkryj' }));
    fireEvent.click(within(card(1)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Odkryj' }));

    await flushStorage();
    const persisted = storedSessions()[0]!;
    expect(persisted.picks.length).toBe(2);
    expect(persisted.status).toBe('completed');

    /* „Odświeżenie”: nowy mount czyta sesję z magazynu. */
    cleanup();
    const view = render(h(StateProvider, null, h(ReloadHarness, { session: persisted })));
    expect(view.getByText('Wybór 1/2')).toBeTruthy();
    expect(view.getByText('Wybór 2/2')).toBeTruthy();
    expect(within(card(2)).queryByText(/Wybór \d\/\d/)).toBeNull();
  });
});

describe('E6-04/E6-08/E6-09 · etykiety, nawigacja i świeżość cen', () => {
  it('6. budżet 1500 zł daje komplet kart w budżecie (D6), a przy 2 telefonach w budżecie — etykietę „Powyżej budżetu o X zł”', () => {
    const view = open();
    expect(screen.queryByText(/Powyżej budżetu o/)).toBeNull();

    fireEvent.click(view.getByTestId('budget-1500'));
    expect(screen.queryByText(/Powyżej budżetu o/)).toBeNull();

    fireEvent.click(view.getByTestId('budget-tight'));
    expect(screen.getByText(/Powyżej budżetu o \d+ zł/)).toBeTruthy();
    expect(
      screen.getByText('Mało telefonów mieści się w budżecie — jedna propozycja jest droższa.'),
    ).toBeTruthy();
  });

  it('„Pokaż pełny ranking” pojawia się dopiero po pierwszym wyborze', () => {
    open();
    expect(screen.queryByRole('link', { name: /Pokaż pełny ranking/ })).toBeNull();

    fireEvent.click(within(card(1)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Odkryj' }));

    const link = screen.getByRole('link', { name: /Pokaż pełny ranking/ });
    expect(link.getAttribute('href')).toMatch(/\/ranking$/);
  });

  it('8. „Zacznij od nowa” tworzy nową sesję i zostawia poprzednią', async () => {
    open();
    fireEvent.click(within(card(1)).getByRole('button', { name: /Wybieram tę propozycję/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Odkryj' }));
    await flushStorage();
    const firstId = storedSessions()[0]!.id;

    fireEvent.click(screen.getByRole('button', { name: /Zacznij od nowa/ }));
    expect(window.location.hash).toMatch(/^#\/s\/[a-z0-9]+\/exclude$/);

    await flushStorage();
    const sessions = storedSessions();
    expect(sessions.length).toBe(2);
    expect(sessions.some((session) => session.id === firstId)).toBe(true);
    expect(sessions.some((session) => session.picks.length === 1)).toBe(true);
  });

  it('„Zmień odpowiedzi” wraca do ekranu trybu w tej samej sesji', () => {
    open();
    const link = screen.getByRole('link', { name: /Zmień odpowiedzi/ });
    expect(link.getAttribute('href')).toMatch(/^#\/s\/[a-z0-9]+\/quiz$/);
  });

  it('7. baner o nieaktualnych cenach pojawia się po 30 dniach (logika)', () => {
    /* Teraz ceny są świeże, więc baneru nie ma. */
    open();
    expect(screen.queryByText(/Ceny mogą być nieaktualne/)).toBeNull();

    const dates = POOL.map((phone) => phone.price.checkedAt);
    const fresh = priceFreshness(dates, new Date('2026-11-20T00:00:00.000Z'));
    expect(fresh.stale).toBe(false);
    expect(fresh.days).toBeLessThanOrEqual(30);

    const stale = priceFreshness(dates, new Date('2027-01-15T00:00:00.000Z'));
    expect(stale.stale).toBe(true);
    expect(stale.days).toBeGreaterThan(30);
    expect(stale.oldest).toBe('2026-11-14');
  });
});

/** Montaż ekranu kart na sesji wczytanej z magazynu (symulacja odświeżenia). */
function ReloadHarness({ session }: { session: Session }) {
  return h(CardsScreen, { session });
}
