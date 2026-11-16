import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createElement, useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StateProvider, useAppState } from '../src/features/state/StateProvider';
import { HistoryScreen } from '../src/screens/HistoryScreen';
import App from '../src/App';
import { PHONES } from '../src/data/phones';
import { rank } from '../src/lib/scoring';
import { answersToCriterionWeights, groupImportance } from '../src/lib/weights';
import { encodeResume } from '../src/lib/resumeLink';
import { serializeHistory } from '../src/lib/historyTransfer';
import { STORAGE_KEY } from '../src/lib/storage';
import { createSession } from '../src/lib/session';
import { strings } from '../src/data/strings';
import type { Session } from '../src/types/state';

const h = createElement;

const neutral = rank({
  phones: PHONES,
  weights: answersToCriterionWeights({}),
  groupImportance: groupImportance(answersToCriterionWeights({}), null),
  filters: { budgetMax: 2000 },
});
const FIRST_CARD = neutral.cards[0]!.phoneId;
const SECOND_CARD = neutral.cards[1]!.phoneId;

const at = (hour: number) => new Date(Date.UTC(2026, 10, 16, hour, 0, 0));

/** Trzy sesje: quiz w trakcie, suwaki ukończone, hybryda z dwoma wyborami. */
function Harness() {
  const { dispatch } = useAppState();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    setReady(true);

    dispatch({ type: 'session/create', mode: 'quiz', id: '111111', now: at(9) });
    dispatch({ type: 'session/answer', sessionId: '111111', questionId: 'A1', optionId: 'A1-c', now: at(9) });
    dispatch({ type: 'session/answer', sessionId: '111111', questionId: 'B1', optionId: 'B1-c', now: at(9) });

    dispatch({ type: 'session/create', mode: 'sliders', id: '222222', now: at(10) });
    dispatch({ type: 'session/pick', sessionId: '222222', phoneId: FIRST_CARD, now: at(10) });

    dispatch({ type: 'session/create', mode: 'hybrid', id: '333333', now: at(11) });
    dispatch({ type: 'session/pick', sessionId: '333333', phoneId: FIRST_CARD, now: at(11) });
    dispatch({ type: 'session/pick', sessionId: '333333', phoneId: SECOND_CARD, now: at(11) });
  }, [dispatch, ready]);

  return h(HistoryScreen);
}

function item(id: string): HTMLElement {
  const matches = screen.getAllByText(new RegExp(id));
  const article = matches.map((node) => node.closest('article')).find((node) => node !== null);
  if (!article) throw new Error(`Brak wpisu ${id} na liście.`);
  return article as HTMLElement;
}

function openHistory() {
  cleanup();
  return render(h(StateProvider, null, h(Harness)));
}

async function settle(ms = 60) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function storedSessions(): Session[] {
  const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  return (parsed.sessions ?? []) as Session[];
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '#/';
  window.scrollTo = () => {};
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('E7-01 · lista historii', () => {
  it('1. trzy sesje w kolejności od najnowszej z właściwymi statusami', () => {
    openHistory();

    const headings = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(headings).toEqual([strings.quizAndSliders, strings.sliders, strings.quiz]);

    expect(screen.getAllByText(strings.statusCompleted).length).toBe(2);
    expect(screen.getAllByText(strings.statusInProgress).length).toBe(1);
    expect(screen.getByText(/3 sesje · 1 w trakcie · 2 ukończone · 3 wybory/)).toBeTruthy();
  });

  it('pokazuje postęp przerwanej sesji i nazwy wybranych telefonów w ukończonych', () => {
    openHistory();

    expect(within(item('111111')).getAllByText(/pytanie 2 z 19/).length).toBeGreaterThan(0);
    expect(within(item('111111')).queryByText(strings.historySelectedLabel)).toBeNull();

    const firstName = PHONES.find((phone) => phone.id === FIRST_CARD)!.reveal.name;
    expect(item('222222').textContent).toContain(firstName);
    expect(item('111111').textContent).not.toContain(firstName);
    expect(within(item('333333')).getAllByText(/^Wybór [12]\/2$/).length).toBe(2);
    expect(within(item('333333')).getByText(/dopasowanie pierwszego wyboru \d+%/)).toBeTruthy();
  });

  it('2. Wznów prowadzi na pierwsze pytanie bez odpowiedzi, 3. Podgląd na karty ze snapshotu', () => {
    openHistory();

    const resume = within(item('111111')).getByRole('link', { name: new RegExp(strings.historyResume) });
    expect(resume.getAttribute('href')).toBe('#/s/111111/quiz');

    const preview = within(item('222222')).getByRole('link', { name: new RegExp(strings.historyPreviewAction) });
    expect(preview.getAttribute('href')).toBe('#/s/222222/cards');

    /* Podgląd jest stały w czasie: dane z dnia zapisu, nie nowy ranking. */
    expect(within(item('222222')).getAllByText(/dane z 2026-11-16/).length).toBeGreaterThan(0);
  });

  it('4. usunięcie z potwierdzeniem znika z listy i z localStorage', async () => {
    openHistory();
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(3);

    fireEvent.click(within(item('111111')).getByRole('button', { name: strings.historyDelete }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getAllByText(strings.historyDeleteTitle).length).toBeGreaterThan(0);

    fireEvent.click(within(dialog).getByRole('button', { name: strings.historyDeleteConfirm }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(2);
    expect(screen.queryByText(/111111/)).toBeNull();

    await settle(400);
    expect(storedSessions().map((session) => session.id)).toEqual(['333333', '222222']);
  });

  it('stan pusty: komunikat i przycisk Start, eksport wyłączony', () => {
    cleanup();
    render(h(StateProvider, null, h(HistoryScreen)));

    expect(screen.getAllByText(strings.historyEmpty).length).toBeGreaterThan(0);
    expect(screen.getAllByText(strings.historyEmptyLead).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: new RegExp(strings.startNew) }).getAttribute('href')).toBe('#/');
    expect(screen.getByRole('button', { name: new RegExp(strings.historyExport) }).hasAttribute('disabled')).toBe(
      true,
    );
  });
});

describe('E7-06/E7-07 · przenoszenie między urządzeniami', () => {
  it('link do wznowienia kopiuje adres z odpowiedziami, bez wyborów', async () => {
    openHistory();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    fireEvent.click(
      within(item('111111')).getByRole('button', { name: new RegExp(strings.historyCopyLink) }),
    );

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const url = String(writeText.mock.calls[0]![0]);
    expect(url).toContain('#/r/');
    expect(url).not.toContain(FIRST_CARD);

    const { decodeResume } = await import('../src/lib/resumeLink');
    const payload = decodeResume(url.split('#/r/')[1]!).payload!;
    expect(payload.answers).toEqual({ A1: 'A1-c', B1: 'B1-c' });
    expect(payload.mode).toBe('quiz');
  });

  it('6. import tej samej sesji nie tworzy duplikatu, a nowej — dodaje', async () => {
    openHistory();
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(3);

    await settle(400); // zapis z opóźnieniem — dopiero potem czytamy magazyn
    const existing = storedSessions().find((session) => session.id === '111111')!;
    expect(existing).toBeTruthy();
    const incoming = createSession('quiz', at(12), '444444');
    const file = new File([serializeHistory([existing, incoming])], 'historia.json', {
      type: 'application/json',
    });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(4));
    expect(screen.getAllByText(/1 nowych, 1 bez zmian \(duplikaty\)/).length).toBeGreaterThan(0);

    await settle(400); // zapis importu z opóźnieniem
    expect(storedSessions().map((session) => session.id)).toContain('444444');
    expect(storedSessions().filter((session) => session.id === '111111').length).toBe(1);
  });

  it('eksport zapisuje plik i zgłasza to w komunikacie', async () => {
    openHistory();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(strings.historyExport) }));

    await waitFor(() =>
      expect(
        screen.getAllByText(new RegExp('wybor-telefonu-historia-\\d{4}-\\d{2}-\\d{2}\\.json')).length,
      ).toBeGreaterThan(0),
    );
  });
});

describe('E7-06 · wejście z linku #/r/<kod>', () => {
  it('5. kod z innego urządzenia tworzy nową sesję z tymi samymi odpowiedziami', async () => {
    const source: Session = {
      ...createSession('quiz', at(8), 'zrodlo'),
      answers: { A1: 'A1-c', B1: 'B1-c', F1: 'F1-a' },
      topThree: { picks: ['battery', 'camera', 'storage'] },
    };
    window.location.hash = `#/r/${encodeResume(source)}`;

    cleanup();
    render(h(App));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(strings.resumeLinkTitle);
    expect(screen.getAllByText(/3 z 18/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/bateria i ładowanie › aparat › pamięć/i).length).toBeGreaterThan(0);

    await settle(400);
    const created = storedSessions();
    expect(created.length).toBe(1);
    expect(created[0]!.answers).toEqual(source.answers);
    expect(created[0]!.topThree?.picks).toEqual(['battery', 'camera', 'storage']);
    expect(created[0]!.ranking?.cards.length).toBe(3);
    expect(created[0]!.filters.budgetMax).toBe(1500); // z odpowiedzi F1

    const link = screen.getByRole('link', { name: new RegExp(strings.resumeLinkOpen) });
    expect(link.getAttribute('href')).toBe(`#/s/${created[0]!.id}/quiz`);
  });

  it('uszkodzony kod daje komunikat i powrót na start', () => {
    window.location.hash = '#/r/ToNieJestKod';
    cleanup();
    render(h(App));

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(strings.resumeLinkErrorTitle);
    expect(screen.getByRole('link', { name: new RegExp(strings.backHome) }).getAttribute('href')).toBe('#/');
    expect(storedSessions().length).toBe(0);
  });
});
