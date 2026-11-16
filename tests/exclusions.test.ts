import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { PHONES, phoneById } from '../src/data/phones';
import { strings } from '../src/data/strings';
import { collectForbiddenTokens } from '../src/lib/anonymize';
import {
  buildBrandCatalog,
  effectiveExcludedIds,
  formatExclusionsSummary,
  includePhoneAgain,
  remainingCount,
  validateExclusions,
} from '../src/lib/exclusions';
import { rankFromAnswers } from '../src/lib/scoring';
import { STORAGE_KEY } from '../src/lib/storage';
import type { Phone } from '../src/types';
import { WIFE } from './personas';
import { buildPhone } from './fixtures/phones';

const h = createElement;

function goto(hash: string): void {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

async function settle(ms = 60): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

async function flushStorage(): Promise<void> {
  await settle(380);
}

function readStored() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{"sessions":[]}');
}

/** Pełny skan DOM, atrybutów, tytułu i adresu pod kątem wycieku nazw marek i modeli. */
function findDomLeaks(root: HTMLElement): string[] {
  const tokens = collectForbiddenTokens(PHONES[0]!, PHONES);
  const chunks: string[] = [root.textContent ?? '', document.title, window.location.hash];

  for (const el of Array.from(root.querySelectorAll('*'))) {
    for (const attr of Array.from(el.attributes)) {
      if (['alt', 'title', 'href'].includes(attr.name) || attr.name.startsWith('aria-') || attr.name.startsWith('data-')) {
        chunks.push(attr.value);
      }
    }
  }

  const haystack = chunks.join(' ').toLowerCase();
  const leaks: string[] = [];
  for (const token of tokens) {
    if (token.length < 3) continue;
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(haystack)) {
      leaks.push(token);
    }
  }
  return leaks;
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
  document.documentElement.dataset.theme = 'light';
});

afterEach(cleanup);

describe('E11-02/E11-03 · dane i czysta logika wykluczeń', () => {
  it('każdy telefon w phones.json ma ustandaryzowane brand i modelName bez powtórzonej marki', () => {
    for (const phone of PHONES) {
      expect(phone.brand.length, phone.id).toBeGreaterThan(1);
      expect(phone.brand, phone.id).toBe(phone.reveal.brand);
      expect(phone.modelName.length, phone.id).toBeGreaterThan(1);
      expect(
        phone.modelName.toLowerCase().startsWith(`${phone.brand.toLowerCase()} `),
        `${phone.id}: ${phone.modelName}`,
      ).toBe(false);
    }

    const catalog = buildBrandCatalog(PHONES);
    expect(catalog.reduce((sum, group) => sum + group.count, 0)).toBe(PHONES.length);
  });

  it('effectiveExcludedIds łączy marki (bez wielkości liter) i modele, a validateExclusions pilnuje progów', () => {
    const set = effectiveExcludedIds(PHONES, {
      excludedBrands: ['xiaomi'],
      excludedPhoneIds: ['pixel-10a-8-128', 'xiaomi-15t-12-512'],
    });
    expect(set.has('xiaomi-15t-12-512')).toBe(true);
    expect(set.has('redmi-note-15-pro-5g-8-256')).toBe(true);
    expect(set.has('redmi-note-17-pro-5g-8-512')).toBe(true);
    expect(set.has('pixel-10a-8-128')).toBe(true);
    expect(set.size).toBe(4);

    expect(
      remainingCount(PHONES, {
        budgetMax: 2000,
        excludedBrands: ['Xiaomi'],
        excludedPhoneIds: ['pixel-10a-8-128'],
      }),
    ).toBe(PHONES.length - 4);

    /* Zostają 2 → ostrzeżenie, ale przejście dozwolone. */
    const leaveTwo = PHONES.slice(2).map((phone) => phone.id);
    const warn = validateExclusions(PHONES, { budgetMax: 2000, excludedPhoneIds: leaveTwo });
    expect(warn).toEqual({
      status: 'warn',
      remaining: 2,
      excluded: PHONES.length - 2,
      total: PHONES.length,
      canProceed: true,
    });

    /* Zostaje 0 → błąd i blokada. */
    const allBrands = [...new Set(PHONES.map((phone) => phone.brand))];
    const zero = validateExclusions(PHONES, { budgetMax: 2000, excludedBrands: allBrands });
    expect(zero.status).toBe('error');
    expect(zero.remaining).toBe(0);
    expect(zero.canProceed).toBe(false);
  });

  it('includePhoneAgain odblokowuje pojedynczy model także z wykluczonej marki', () => {
    const next = includePhoneAgain(
      PHONES,
      { excludedBrands: ['Xiaomi'], excludedPhoneIds: [] },
      'xiaomi-15t-12-512',
    );
    expect(next.excludedBrands).toEqual([]);
    expect(next.excludedPhoneIds).not.toContain('xiaomi-15t-12-512');
    expect(next.excludedPhoneIds).toContain('redmi-note-15-pro-5g-8-256');
    expect(next.excludedPhoneIds).toContain('redmi-note-17-pro-5g-8-512');

    expect(
      formatExclusionsSummary(PHONES, {
        excludedBrands: ['Xiaomi'],
        excludedPhoneIds: ['xiaomi-15t-12-512', 'pixel-9a-8-128'],
      }),
    ).toBe('Xiaomi, Google Pixel 9a 8/128 GB');
  });
});

describe('Etap 11 · testy akceptacyjne 1–5 (silnik i persony, QUIZ-SPEC 9.5)', () => {
  it('1. i 2. wykluczenie modelu #1 persony „żona” usuwa go z kart, ale zostawia #1 i ten sam S w fullRanking', () => {
    const baseline = rankFromAnswers(PHONES, WIFE.answers, WIFE.topThree);
    const leaderId = baseline.cards[0]!.phoneId;
    expect(leaderId).toBe('vivo-v70-fe-5g-8-256');

    const withExclusion = rankFromAnswers(PHONES, WIFE.answers, WIFE.topThree, {
      excludedPhoneIds: [leaderId],
    });

    /* Karty: brak lidera, trzy kolejne niewykluczone, numeracja #1-#3. */
    expect(withExclusion.cards.map((card) => card.phoneId)).not.toContain(leaderId);
    expect(withExclusion.cards.map((card) => card.phoneId)).toEqual(
      baseline.fullRanking.slice(1, 4).map((entry) => entry.phoneId),
    );
    expect(withExclusion.cards.map((card) => card.place)).toEqual([1, 2, 3]);
    expect(withExclusion.excludedCount).toBe(1);

    /* Pełny ranking i normalizacja bez zmian: miejsce #1, ten sam S i matchPercent, excluded = 'model'. */
    expect(withExclusion.fullRanking.map((entry) => entry.score)).toEqual(
      baseline.fullRanking.map((entry) => entry.score),
    );
    const leaderInFull = withExclusion.fullRanking[0]!;
    expect(leaderInFull.phoneId).toBe(leaderId);
    expect(leaderInFull.place).toBe(1);
    expect(leaderInFull.score).toBe(baseline.fullRanking[0]!.score);
    expect(leaderInFull.matchPercent).toBe(baseline.fullRanking[0]!.matchPercent);
    expect(leaderInFull.excluded).toBe('model');
  });

  it('3. wykluczenie marki usuwa wszystkie jej modele (także dodane w przyszłości) i oznacza jako „brand”', () => {
    const futureXiaomi: Phone = buildPhone({
      id: 'xiaomi-16t-12-512',
      name: 'Xiaomi 16T 12/512 GB',
      brand: 'Xiaomi',
      price: 1899,
      storageGb: 512,
      score: 95,
    });
    const extendedPool = [...PHONES, futureXiaomi];

    const result = rankFromAnswers(extendedPool, WIFE.answers, WIFE.topThree, {
      excludedBrands: ['Xiaomi'],
    });

    const xiaomiIds = extendedPool
      .filter((phone) => phone.brand === 'Xiaomi')
      .map((phone) => phone.id);
    expect(xiaomiIds.length).toBe(4);

    for (const card of result.cards) {
      expect(xiaomiIds).not.toContain(card.phoneId);
    }
    for (const id of xiaomiIds) {
      const entry = result.fullRanking.find((item) => item.phoneId === id)!;
      expect(entry.excluded, id).toBe('brand');
    }
    /* Nowy telefon marki Xiaomi jest #1 w pełnym rankingu, ale nie trafił do kart. */
    expect(result.fullRanking[0]!.phoneId).toBe('xiaomi-16t-12-512');
    expect(result.cards.map((card) => card.phoneId)).not.toContain('xiaomi-16t-12-512');
  });

  it('5. przy budżecie 1500 zł i wykluczeniach karta „Powyżej budżetu” pochodzi wyłącznie z niewykluczonych', () => {
    /* W budżecie 1500 zł są 3 modele (Edge 60, Redmi Note 15 Pro, Galaxy A37).
       Wykluczamy Xiaomi (wypada Note 15 Pro w budżecie oraz Note 17 Pro i 15T ponad budżetem)
       oraz vivo V70 FE (najlepszy ponad budżetem) → 2 w budżecie + 1 niewykluczony ponad budżetem. */
    const result = rankFromAnswers(
      PHONES,
      { ...WIFE.answers, F1: 'F1-a' },
      WIFE.topThree,
      {
        excludedBrands: ['Xiaomi'],
        excludedPhoneIds: ['vivo-v70-fe-5g-8-256'],
      },
    );

    expect(result.inBudgetCount).toBe(2);
    expect(result.cards.length).toBe(3);

    const overCard = result.cards[2]!;
    expect(overCard.inBudget).toBe(false);
    expect(overCard.overBudgetBy).toBeGreaterThan(0);
    expect(overCard.excluded).toBeNull();
    expect(overCard.phoneId).not.toBe('vivo-v70-fe-5g-8-256');
    expect(phoneById(overCard.phoneId)?.brand).not.toBe('Xiaomi');
    /* Przy budżecie 1500 zł wszystkie telefony >1500 zł mają value = 0 — wygrywa Realme 16 Pro+. */
    expect(overCard.phoneId).toBe('realme-16-pro-plus-5g-8-256');
  });
});

describe('Etap 11 · testy akceptacyjne 2, 4, 6, 7, 8, 9 (ekrany i przepływ)', () => {
  it('6. przed włączeniem listy i po kliknięciu „Pomiń” w DOM, tytule i adresie nie ma nazw marek ani modeli', () => {
    render(h(App));

    fireEvent.click(screen.getByRole('button', { name: /Samodzielnie ustaw, co jest ważne/ }));
    goto(window.location.hash);
    expect(window.location.hash).toMatch(/^#\/s\/\d+\/exclude$/);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(strings.excludeTitle);

    /* Przed włączeniem przełącznika żadna marka ani model nie istnieje w DOM. */
    expect(findDomLeaks(document.body)).toEqual([]);

    fireEvent.click(screen.getAllByRole('button', { name: strings.excludeSkip })[0]!);
    goto(window.location.hash);
    expect(window.location.hash).toMatch(/^#\/s\/\d+\/sliders$/);
    expect(findDomLeaks(document.body)).toEqual([]);

    /* Przejście na karty — również zero wycieków. */
    fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki/ })[0]!);
    goto(window.location.hash);
    expect(window.location.hash).toMatch(/^#\/s\/\d+\/cards$/);
    expect(findDomLeaks(document.body)).toEqual([]);
  });

  it('4. wykluczenie wszystkich marek blokuje „Dalej”, a zostawienie 1–2 telefonów pokazuje ostrzeżenie i tyle kart', async () => {
    render(h(App));
    fireEvent.click(screen.getByRole('button', { name: /Samodzielnie ustaw, co jest ważne/ }));
    goto(window.location.hash);

    fireEvent.click(screen.getByRole('switch'));
    await settle();

    const brandsGroup = screen.getByRole('group', { name: strings.excludeBrandsLabel });
    const brandButtons = within(brandsGroup).getAllByRole('button');
    expect(brandButtons.length).toBe(9);

    /* Wykluczamy wszystkie 9 marek → 0 telefonów, błąd i blokada Dalej. */
    for (const btn of brandButtons) fireEvent.click(btn);
    expect(screen.getByText(/Zostanie 0 z 15 telefonów/)).toBeTruthy();
    expect(screen.getByText(strings.excludeZeroError)).toBeTruthy();
    for (const nextBtn of screen.getAllByRole('button', { name: strings.excludeContinue })) {
      expect((nextBtn as HTMLButtonElement).disabled).toBe(true);
    }

    /* Odblokowujemy markę z 2 modelami (Motorola) → ostrzeżenie, Dalej aktywne, 2 karty. */
    fireEvent.click(within(brandsGroup).getByRole('button', { name: /Motorola/ }));
    expect(screen.getByText(/Zostaną 2 z 15 telefonów/)).toBeTruthy();
    expect(screen.getByText(/Zostają tylko 2 telefony/)).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: strings.excludeContinue })[0]!);
    goto(window.location.hash);
    /* E11-07: licznik w FilterPanel uwzględnia wykluczenia. */
    expect(screen.getByText('Pasuje 2 z 15 telefonów')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki/ })[0]!);
    goto(window.location.hash);
    expect(screen.getAllByRole('article').length).toBe(2);
    expect(screen.getByText(/Pominęliśmy 13 wykluczonych telefonów/)).toBeTruthy();
    expect(screen.getByText(/Tylko 2 telefony spełniają te warunki/)).toBeTruthy();
  });

  it('2., 7. i 8. zmiana wykluczeń na kartach nie przelicza S, pełny ranking pokazuje plakietki, a historia — „Wykluczono” i „Teraz wykluczony”', async () => {
    render(h(App));
    fireEvent.click(screen.getByRole('button', { name: /Samodzielnie ustaw, co jest ważne/ }));
    goto(window.location.hash);
    fireEvent.click(screen.getAllByRole('button', { name: strings.excludeSkip })[0]!);
    goto(window.location.hash);

    /* Przechodzimy na karty i wybieramy propozycję #1. */
    fireEvent.click(screen.getAllByRole('button', { name: /Pokaż wyniki/ })[0]!);
    goto(window.location.hash);

    fireEvent.click(screen.getAllByRole('button', { name: /Wybieram tę propozycję/ })[0]!);
    fireEvent.click(screen.getByRole('button', { name: strings.cardsConfirmReveal }));
    await flushStorage();

    const before = readStored().sessions[0]!.ranking;
    const pickedId: string = readStored().sessions[0]!.picks[0]!.phoneId;
    const pickedPhone = phoneById(pickedId)!;

    /* 7. Zmieniamy wykluczenia na ekranie kart: wykluczamy wybrany model i markę Xiaomi. */
    fireEvent.click(screen.getByRole('button', { name: strings.excludeChange }));
    await settle();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Xiaomi/ }));
    fireEvent.click(
      within(dialog).getByRole('button', { name: new RegExp(strings.excludeModelsToggleShow) }),
    );
    fireEvent.click(
      within(dialog).getByRole('checkbox', {
        name: new RegExp(pickedPhone.modelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      }),
    );
    fireEvent.click(within(dialog).getByRole('button', { name: strings.excludeSave }));
    await flushStorage();

    const after = readStored().sessions[0]!.ranking;
    /* Oceny, S, matchPercent, miejsca ogólne i computedAt identyczne — zmieniły się tylko karty i flaga excluded. */
    expect(after.computedAt).toBe(before.computedAt);
    expect(
      after.entries.map((e: { phoneId: string; place: number; score: number; matchPercent: number }) => ({
        phoneId: e.phoneId,
        place: e.place,
        score: e.score,
        matchPercent: e.matchPercent,
      })),
    ).toEqual(
      before.entries.map((e: { phoneId: string; place: number; score: number; matchPercent: number }) => ({
        phoneId: e.phoneId,
        place: e.place,
        score: e.score,
        matchPercent: e.matchPercent,
      })),
    );
    expect(after.cards).not.toContain(pickedId);
    expect(screen.getByText(/Pominęliśmy 4 wykluczone telefony/)).toBeTruthy();

    /* 2. Pełny ranking: wykluczony #1 ma miejsce 1, plakietkę „Wykluczony (model)” i „Uwzględnij ponownie”,
       a telefony Xiaomi — plakietkę „Wykluczony (marka)”. */
    const rankingLink = screen.getByRole('link', { name: new RegExp(strings.cardsFullRanking) });
    goto(rankingLink.getAttribute('href')!);

    expect(screen.getAllByText(strings.rankingExcludedModel).length).toBe(1);
    expect(screen.getAllByText(strings.rankingExcludedBrand).length).toBe(3);

    const firstRow = screen.getAllByRole('button', { name: /pkt/ })[0]!;
    expect(firstRow.textContent).toContain(pickedPhone.reveal.name);
    expect(firstRow.textContent).toContain(strings.rankingExcludedModel);

    /* 8. Historia: „Wykluczono: …”, wybrany telefon z plakietką „Wybór 1/1” i „Teraz wykluczony”. */
    goto('#/history');
    expect(screen.getByText(strings.historyExcludedLabel)).toBeTruthy();
    expect(screen.getByText(new RegExp(`Xiaomi.*${pickedPhone.modelName.split(' ')[0]}`))).toBeTruthy();
    expect(
      screen.getAllByText(
        new RegExp(pickedPhone.reveal.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Wybór 1/1')).toBeTruthy();
    expect(screen.getByText(strings.historyNowExcluded)).toBeTruthy();

    /* Powrót do pełnego rankingu i kliknięcie „Uwzględnij ponownie” na #1 zdejmuje wykluczenie modelu. */
    const sessionId: string = readStored().sessions[0]!.id;
    goto(`#/s/${sessionId}/ranking`);
    fireEvent.click(screen.getAllByRole('button', { name: /pkt/ })[0]!);
    fireEvent.click(screen.getByRole('button', { name: strings.rankingIncludeAgain }));
    expect(screen.queryByText(strings.rankingExcludedModel)).toBeNull();
    expect(screen.getAllByText(strings.rankingExcludedBrand).length).toBe(3);
  });

  it('9. po odświeżeniu w trakcie quizu (oraz w hybrydzie) wykluczenia są zachowane, a krok nie wraca', async () => {
    render(h(App));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(strings.hybridDescription) }));
    goto(window.location.hash);
    expect(window.location.hash).toMatch(/^#\/s\/\d+\/exclude$/);

    fireEvent.click(screen.getByRole('switch'));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: /Samsung/ }));
    fireEvent.click(screen.getAllByRole('button', { name: strings.excludeContinue })[0]!);
    goto(window.location.hash);
    expect(window.location.hash).toMatch(/^#\/s\/\d+\/quiz$/);

    /* Odpowiadamy na jedno pytanie i symulujemy pełne odświeżenie strony. */
    fireEvent.click(screen.getByRole('button', { name: new RegExp(strings.next) }));
    fireEvent.click(screen.getAllByRole('radio')[0]!);
    await flushStorage();

    const quizHash = window.location.hash;
    cleanup();
    window.location.hash = quizHash;
    render(h(App));

    /* Nadal jesteśmy w quizie, nie na ekranie wykluczeń; Samsung nadal wykluczony. */
    expect(window.location.hash).toBe(quizHash);
    expect(screen.queryByText(strings.excludeTitle)).toBeNull();

    const persisted = readStored().sessions[0]!;
    expect(persisted.exclusionsStep).toBe('done');
    expect(persisted.filters.excludedBrands).toEqual(['Samsung']);

    /* Wznowienie z historii również prowadzi do /quiz, nie do /exclude. */
    goto('#/history');
    const resumeLink = screen.getByRole('link', { name: new RegExp(strings.historyResume) });
    expect(resumeLink.getAttribute('href')).toBe(quizHash);
  });

  it('E11-07: w trybie suwaków FilterPanel otwiera okno wykluczeń i aktualizuje licznik puli na żywo', async () => {
    render(h(App));
    fireEvent.click(screen.getByRole('button', { name: /Samodzielnie ustaw, co jest ważne/ }));
    goto(window.location.hash);
    fireEvent.click(screen.getAllByRole('button', { name: strings.excludeSkip })[0]!);
    goto(window.location.hash);

    expect(screen.getByText('Pasuje 15 z 15 telefonów')).toBeTruthy();
    expect(screen.getByText(strings.excludeFilterNone)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: strings.excludeFilterOpen }));
    await settle();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Samsung/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: strings.excludeSave }));

    /* Samsung ma 3 modele (A57, A56, A37) → zostaje 12 z 15. */
    /* Samsung ma 3 modele (A57, A56, A37) → zostaje 12 z 15. */
    expect(screen.getByText('Pasuje 12 z 15 telefonów')).toBeTruthy();
    expect(screen.getByText('Pominięto 3 telefony')).toBeTruthy();
    expect(screen.getByRole('button', { name: strings.excludeChange })).toBeTruthy();
  });
});
