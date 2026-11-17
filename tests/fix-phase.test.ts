import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { PurchaseInfo } from '../src/components/PurchaseInfo';
import { strings } from '../src/data/strings';
import { POOL, phoneById } from './data';
import { collectForbiddenTokens } from '../src/lib/anonymize';
import { promoExpired, stalePrices } from '../scripts/stale-prices';
import { validatePhoneData } from '../scripts/validate-data';
import { createSession } from '../src/lib/session';
import phonesData from '../src/data/phones.json';

const h = createElement;
const FORBIDDEN = [...new Set(POOL.flatMap((phone) => collectForbiddenTokens(phone, POOL)))].sort();

function goto(hash: string): void {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event('hashchange'));
  });
}

function leaks(root: ParentNode = document.body): string[] {
  const text = (root.textContent ?? '').toLowerCase();
  return FORBIDDEN.filter((token) => token.length >= 3 && text.includes(token));
}

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/';
});

afterEach(() => {
  cleanup();
});

describe('FP1-04 · promocje z datą końca', () => {
  it('stale-prices traktuje wygasłą promocję jak cenę przeterminowaną', () => {
    const now = new Date('2026-11-25T12:00:00.000Z');
    expect(promoExpired('2026-11-19', now)).toBe(true);
    expect(promoExpired('2026-11-30', now)).toBe(false);
    expect(promoExpired(null, now)).toBe(false);

    const stale = stalePrices(phonesData.phones, now, 30);
    expect(stale.map((entry) => entry.id)).toContain('redmi-note-17-pro-5g-8-512');
    expect(stale.find((entry) => entry.id === 'redmi-note-17-pro-5g-8-512')?.promoExpired).toBe(true);
    /* Edge 70 Fusion: promocja do 30.11 — 25.11 jeszcze trwa. */
    expect(stale.map((entry) => entry.id)).not.toContain('motorola-edge-70-fusion-12-256');
  });

  it('dane: obie znane promocje mają cenę regularną, datę końca i warunek', () => {
    for (const id of ['redmi-note-17-pro-5g-8-512', 'motorola-edge-70-fusion-12-256']) {
      const price = phoneById(id).price;
      expect(price.promoEndsAt, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(price.promoCondition, id).toBeTruthy();
      expect(price.regularPricePln ?? 0, id).toBeGreaterThan(price.pln);
    }
  });
});

describe('FP1-02 / FP1-06 / FP1-08 · walidator i dane zakupowe', () => {
  it('walidator wymaga userNote i priceCompareUrl, odrzuca stare price.note i złą cenę regularną', () => {
    const data = structuredClone(phonesData) as unknown as { phones: Record<string, unknown>[] };
    const record = data.phones[0]! as { price: Record<string, unknown>; reveal: Record<string, unknown> };
    delete record.price.userNote;
    record.price.note = 'stara notatka';
    record.price.regularPricePln = 100;
    record.price.promoEndsAt = 'kiedyś';
    record.reveal.priceCompareUrl = 'ftp://zle';
    const { errors } = validatePhoneData(data);
    expect(errors.some((error) => error.includes('userNote'))).toBe(true);
    expect(errors.some((error) => error.includes('price.note'))).toBe(true);
    expect(errors.some((error) => error.includes('regularPricePln'))).toBe(true);
    expect(errors.some((error) => error.includes('promoEndsAt'))).toBe(true);
    expect(errors.some((error) => error.includes('priceCompareUrl'))).toBe(true);
  });

  it('realme 16 Pro+: ostrzeżenie o linku bez członu „plus” (FP1-02) i potwierdzenie wariantu w auditNote', () => {
    const { errors, warnings } = validatePhoneData(phonesData);
    expect(errors).toEqual([]);
    expect(warnings.some((warning) => warning.includes('plus') && warning.includes('16 Pro+'))).toBe(true);
    const realme = phoneById('realme-16-pro-plus-5g-8-256');
    expect(realme.price.auditNote ?? '').toContain('193078329');
    expect(realme.reveal.priceCompareUrl).toBe('https://www.ceneo.pl/193078329');
  });

  it('każdy rekord: userNote, porównywarka, metadane linków i data wsparcia (gdy znana) w formacie RRRR-MM', () => {
    for (const phone of POOL) {
      expect(phone.price.userNote, phone.id).toBeTruthy();
      expect(phone.price.note, phone.id).toBeUndefined();
      expect(phone.reveal.priceCompareUrl, phone.id).toMatch(/^https:\/\//);
      for (const link of phone.reveal.shopLinks) {
        if (typeof link === 'string') continue;
        expect(['shop', 'official', 'marketplace', 'compare', null, undefined], `${phone.id} ${link.url}`).toContain(link.kind);
      }
      if (phone.specs.securitySupportUntil) {
        expect(phone.specs.securitySupportUntil, phone.id).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      }
    }
    /* Co najmniej kandydaci z jawną datą ze źródła: A37 (03/2032), Nord 5 (07/2031). */
    expect(phoneById('galaxy-a37-5g-8-256').specs.securitySupportUntil).toBe('2032-03');
    expect(phoneById('oneplus-nord-5-5g-8-256').specs.securitySupportUntil).toBe('2031-07');
  });
});

describe('FP1-05 / FP1-07 / FP1-09 · blok zakupowy po ujawnieniu', () => {
  it('pokazuje ładowarkę, promocję, wsparcie, linki z ceną/datą/typem i przycisk porównywarki', () => {
    const phone = phoneById('redmi-note-17-pro-5g-8-512');
    render(h(PurchaseInfo, { phone }));
    expect(screen.getByText(new RegExp(strings.chargerNotIncluded))).toBeTruthy();
    expect(screen.getByText(/dolicz ok\. 80–150 zł/)).toBeTruthy();
    expect(screen.getByText(/w promocji \(kod rabatowy w koszyku Media Expert\) do 19\.11 — regularnie 2199 zł/)).toBeTruthy();
    expect(screen.getByText(/poprawki bezpieczeństwa do 08\.2032/)).toBeTruthy();
    expect(screen.getByRole('link', { name: new RegExp(strings.priceCompare) }).getAttribute('href')).toBe(
      phone.reveal.priceCompareUrl,
    );
    const shopLinks = screen.getAllByRole('link', { name: new RegExp(strings.cardsShopLink) });
    expect(shopLinks.length).toBe(phone.reveal.shopLinks.length);
    expect(shopLinks[0]!.textContent).toMatch(/\d+ zł/);
    expect(shopLinks[0]!.textContent).toMatch(/sklep|marketplace|oficjalna/);
  });

  it('sekcja „Sprawdzone przed zakupem” pojawia się tylko po ręcznej weryfikacji (verifiedForPurchaseAt)', () => {
    const base = phoneById('galaxy-a37-5g-8-256');
    render(h(PurchaseInfo, { phone: base }));
    expect(screen.queryByText(new RegExp(strings.verifiedTitle))).toBeNull();
    cleanup();
    const verified = {
      ...base,
      reveal: { ...base.reveal, verifiedForPurchaseAt: '2026-11-20', verifiedForPurchase: ['wariant 8/256 GB', 'cena 1359 zł'] },
    };
    render(h(PurchaseInfo, { phone: verified }));
    expect(screen.getByText(new RegExp(strings.verifiedTitle))).toBeTruthy();
    expect(screen.getByText(/wariant 8\/256 GB/)).toBeTruthy();
  });
});

describe('FP2-04 / FP2-05 · przepływ bez szumu', () => {
  it('nowa sesja startuje bez kroku wykluczeń, a link na Starcie nadal prowadzi do ekranu wykluczeń', () => {
    expect(createSession('quiz').exclusionsStep).toBe('done');
    render(h(App));
    fireEvent.click(screen.getByRole('button', { name: strings.startExcludeLink }));
    expect(window.location.hash).toMatch(/^#\/s\/[a-z0-9]+\/exclude$/);
  });

  it('pełny ranking przed pierwszym wyborem pokazuje przyjazną blokadę bez żadnej nazwy', () => {
    render(h(App));
    fireEvent.click(screen.getAllByRole('button', { name: strings.startPrimaryCta })[0]!);
    const id = window.location.hash.split('/')[2]!;
    goto(`#/s/${id}/ranking`);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(strings.rankingLockedTitle);
    expect(screen.getByRole('link', { name: strings.rankingLockedCta }).getAttribute('href')).toBe(`#/s/${id}/cards`);
    expect(leaks()).toEqual([]);
  });

  it('Start w trybie produkcyjnym ma jeden główny przycisk „Zacznij quiz” i zwinięte „Inne sposoby”', () => {
    render(h(App));
    expect(screen.getAllByRole('button', { name: strings.startPrimaryCta }).length).toBeGreaterThan(0);
    expect(screen.getByText(strings.startOtherWays)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Samodzielnie ustaw, co jest ważne/ })).toBeTruthy();
  });
});

describe('FP3-05 · budżet elastyczny „do 1500, dopłacę do 1800, jeśli warto”', () => {
  it('F1 ma czwartą opcję z pasmem dopłaty, a filtry z odpowiedzi niosą budgetStretch', async () => {
    const { QUESTIONS } = await import('../src/data/questions');
    const { filtersFromAnswers } = await import('../src/lib/weights');
    const f1 = QUESTIONS.find((question) => question.id === 'F1')!;
    const flexible = f1.options.find((option) => option.budgetStretch === 1800)!;
    expect(flexible.budgetMax).toBe(1500);
    expect(filtersFromAnswers({ F1: flexible.id })).toMatchObject({ budgetMax: 1500, budgetStretch: 1800 });
    expect(filtersFromAnswers({ F1: 'F1-a' })).toMatchObject({ budgetMax: 1500, budgetStretch: null });
  });

  it('karty: dwie najlepsze ≤ 1500 zł + najlepsza z pasma 1501-1800 zł z plakietką „Dopłata +X zł za +Y pkt”', async () => {
    const { rankFromAnswers } = await import('../src/lib/scoring');
    const { toAnonCards } = await import('../src/lib/anonymize');
    const { WIFE } = await import('./personas');
    const { QUESTIONS } = await import('../src/data/questions');
    const flexibleId = QUESTIONS.find((q) => q.id === 'F1')!.options.find((o) => o.budgetStretch === 1800)!.id;

    const flexible = rankFromAnswers(POOL, { ...WIFE.answers, F1: flexibleId }, WIFE.topThree);
    /* Te same odpowiedzi (ta sama waga `value`), tylko bez pasma dopłaty — ranking i S identyczne, zmienia się dobór kart. */
    const strict = rankFromAnswers(POOL, { ...WIFE.answers, F1: flexibleId }, WIFE.topThree, { budgetStretch: null });
    expect(flexible.ranked.map((e) => [e.phoneId, e.score])).toEqual(strict.ranked.map((e) => [e.phoneId, e.score]));
    expect(strict.cards.every((card) => phoneById(card.phoneId).price.pln <= 1500)).toBe(true);

    const prices = flexible.cards.map((card) => phoneById(card.phoneId).price.pln);
    expect(prices[0]).toBeLessThanOrEqual(1500);
    expect(prices[1]).toBeLessThanOrEqual(1500);
    expect(prices[2]).toBeGreaterThan(1500);
    expect(prices[2]).toBeLessThanOrEqual(1800);
    const bestInBudget = flexible.cards[0]!;
    expect(flexible.cards[2]!.score).toBeGreaterThan(bestInBudget.score);

    const cards = toAnonCards(POOL, flexible, 1500, { budgetStretch: 1800 });
    expect(cards[2]!.stretch).not.toBeNull();
    expect(cards[2]!.stretch!.extraPln).toBe(Math.round(prices[2]! - phoneById(bestInBudget.phoneId).price.pln));
    expect(cards[2]!.stretch!.extraPoints).toBeGreaterThan(0);
    /* Twardy budżet 1500: brak plakietki dopłaty (zwykłe „Powyżej budżetu” tylko, gdy w budżecie < 3 telefonów). */
    for (const card of toAnonCards(POOL, strict, 1500)) expect(card.stretch).toBeNull();
  });
});

describe('FP3-02 · plakietka „Wyraźny kompromis w Twoim priorytecie” (bez kary punktowej)', () => {
  it('Redmi Note 17 Pro u persony „żona” (aparat w trójce G1, photoDay 62 przy wadze 5) dostaje plakietkę; Edge 70 Fusion nie', async () => {
    const { rankFromAnswers } = await import('../src/lib/scoring');
    const { toAnonCards, priorityTradeoffs } = await import('../src/lib/anonymize');
    const { deriveFromAnswers } = await import('../src/lib/weights');
    const { WIFE } = await import('./personas');
    const result = rankFromAnswers(POOL, WIFE.answers, WIFE.topThree);
    const derived = deriveFromAnswers(WIFE.answers, WIFE.topThree);
    const cards = toAnonCards(POOL, result, 2000, { priorityGroups: WIFE.topThree!.picks, weights: derived.weights });

    const redmi = cards.find((card) => card.phoneId === 'redmi-note-17-pro-5g-8-512');
    const edge = cards.find((card) => card.phoneId === 'motorola-edge-70-fusion-12-256');
    expect(redmi, 'Redmi Note 17 Pro jest na kartach „żony”').toBeTruthy();
    expect(redmi!.priorityTradeoffs).toContain('Aparat');
    expect(edge?.priorityTradeoffs ?? []).toEqual([]);

    /* Ocena i S bez zmian — plakietka nie karze (decyzja użytkownika). */
    expect(result.ranked.find((e) => e.phoneId === 'redmi-note-17-pro-5g-8-512')!.score).toBeGreaterThan(60);
    expect(priorityTradeoffs(phoneById('redmi-note-17-pro-5g-8-512'), { groupScores: {} as never }, null, null)).toEqual([]);
  });
});

describe('FP1-01 · kandydaci użytkowniczki', () => {
  it('trzy rekordy mają sekcję „Sprawdzone przed zakupem”, Mi Band i datę wsparcia; 15T ostrzega o niedostępnej ofercie', () => {
    for (const id of ['motorola-edge-70-fusion-12-256', 'galaxy-a57-8-256', 'xiaomi-15t-12-512']) {
      const phone = phoneById(id);
      expect(phone.reveal.verifiedForPurchaseAt, id).toBe('2026-11-16');
      expect((phone.reveal.verifiedForPurchase ?? []).length, id).toBeGreaterThanOrEqual(4);
      expect(phone.specs.wearableNotes ?? '', id).toContain('Zepp Life');
      expect(phone.specs.securitySupportUntil, id).toMatch(/^\d{4}-\d{2}$/);
    }
    const xiaomi = phoneById('xiaomi-15t-12-512');
    expect(xiaomi.price.priceUnavailableSince).toBe('2026-11-16');
    render(h(PurchaseInfo, { phone: xiaomi }));
    expect(screen.getByText(new RegExp(strings.verifiedTitle))).toBeTruthy();
    expect(screen.getByText(/ZAKOŃCZONA/)).toBeTruthy();
    /* Wszystkie 15 rekordów ma datę końca poprawek (FP1-07 / FP4-08 domknięte). */
    expect(POOL.every((phone) => /^\d{4}-\d{2}$/.test(phone.specs.securitySupportUntil ?? ''))).toBe(true);
  });
});
