import type { Answers, Phone, QuizOption, QuizQuestion } from '@/types';
import { GROUP_IDS, groupLabel } from './criteria';

/**
 * Pytania quizu (E2-03) — treść i wartości dokładnie z QUIZ-SPEC sekcja 4.
 * Każde pytanie ma opcję „Nie wiem / pomiń”, która nie wnosi nic do wag.
 */

const LETTERS = ['a', 'b', 'c', 'd', 'e'] as const;

type OptionInput = Omit<QuizOption, 'id'>;

function buildOptions(questionId: string, options: OptionInput[]): QuizOption[] {
  return options.map((option, index) => ({
    ...option,
    id: `${questionId}-${LETTERS[index] ?? index}`,
  }));
}

function question(
  id: string,
  block: QuizQuestion['block'],
  text: string,
  why: string,
  options: OptionInput[],
  extra: { appliesWhen?: QuizQuestion['appliesWhen']; inShortQuiz?: boolean } = {},
): QuizQuestion {
  return {
    id,
    block,
    text,
    why,
    ...extra,
    options: [
      ...buildOptions(id, options),
      { id: `${id}-skip`, label: 'Nie wiem / pomiń', skip: true },
    ],
  };
}

export const QUESTIONS: readonly QuizQuestion[] = [
  /* Blok A. Bateria i ładowanie */
  question(
    'A1',
    'battery',
    'Ile godzin dziennie patrzysz w ekran telefonu?',
    'Im więcej ekranu, tym ważniejsza bateria.',
    [
      { label: 'Do 2 godzin', sets: { battery: 1 } },
      { label: '2-4 godziny', sets: { battery: 3 } },
      { label: '4-6 godzin', sets: { battery: 4 } },
      { label: 'Ponad 6 godzin', sets: { battery: 5 } },
    ],
    { inShortQuiz: true },
  ),
  question(
    'A2',
    'battery',
    'Czy zdarzają się dni, gdy nie masz jak naładować telefonu (wyjazd, wycieczka, długi dzień poza domem)?',
    'Przy takich dniach liczy się bateria na dwa dni, a nie sama szybkość ładowania.',
    [
      { label: 'Prawie nigdy', sets: { battery: 1 } },
      { label: 'Czasem', sets: { battery: 3 } },
      { label: 'Często', sets: { battery: 5 } },
    ],
    { inShortQuiz: true },
  ),
  question(
    'A3',
    'battery',
    'Jak zwykle ładujesz telefon?',
    'Szybkie ładowanie ratuje dzień, gdy bateria padnie w drodze.',
    [
      /* FP3-03 (17.11.2026): ładowanie na noc = szybkość niemal bez znaczenia (0,25), nie 1.
         Plan 2, 18.11.2026: „często” = 5, sufit skali. */
      { label: 'Zawsze na noc', sets: { charging: 0.25 } },
      { label: 'Czasem w ciągu dnia', sets: { charging: 1.5 } },
      { label: 'Często potrzebuję szybkiego doładowania', sets: { charging: 5 } },
    ],
  ),

  /* Blok B. Aparat */
  question(
    'B1',
    'camera',
    'Jak często robisz zdjęcia w domu, wieczorem albo przy sztucznym świetle?',
    'Słabe światło to najtrudniejszy test dla aparatu.',
    [
      { label: 'Rzadko', sets: { photoIndoor: 1 } },
      { label: 'Czasem', sets: { photoIndoor: 3 } },
      { label: 'Często', sets: { photoIndoor: 5 } },
    ],
    { inShortQuiz: true },
  ),
  question(
    'B2',
    'camera',
    'Jak często fotografujesz dziecko lub rodzinę w ruchu (zabawa, bieganie)?',
    'Ruchome obiekty wymagają szybkiego, pewnego ustawiania ostrości.',
    [
      { label: 'Rzadko', sets: { photoMotion: 1 } },
      { label: 'Czasem', sets: { photoMotion: 3 } },
      { label: 'Często', sets: { photoMotion: 5 } },
    ],
    { inShortQuiz: true },
  ),
  question(
    'B3',
    'camera',
    'Jak często robisz zdjęcia na zewnątrz w dzień (spacery, plac zabaw, wyjazdy)?',
    'W dzień większość telefonów radzi sobie dobrze, ale różnią się szczegółami i kolorami.',
    [
      { label: 'Rzadko', sets: { photoDay: 1 } },
      { label: 'Czasem', sets: { photoDay: 3 } },
      { label: 'Często', sets: { photoDay: 5 } },
    ],
    { inShortQuiz: true },
  ),
  question(
    'B4',
    'camera',
    'Jak często robisz selfie?',
    'Aparat przedni to osobny aparat o osobnej jakości.',
    /* Waga 0 = bez znaczenia (plan 1): najniższa odpowiedź wyłącza kryterium z grupy. */
    [
      { label: 'Prawie nigdy', sets: { selfie: 0 } },
      { label: 'Czasem', sets: { selfie: 3 } },
      { label: 'Często', sets: { selfie: 5 } },
    ],
  ),
  question(
    'B5',
    'camera',
    'Jak często nagrywasz filmy?',
    'Wideo wymaga stabilizacji i dobrego dźwięku.',
    [
      { label: 'Prawie nigdy', sets: { video: 0 } },
      { label: 'Czasem', sets: { video: 3 } },
      { label: 'Często', sets: { video: 5 } },
    ],
  ),
  question(
    'B6',
    'camera',
    'Czy zdarza się, że fotografujesz z daleka (występ dziecka, plac zabaw, zwierzęta)?',
    'Z daleka dobre zdjęcia robi tylko telefon z osobnym aparatem do przybliżania.',
    [
      { label: 'Nie', sets: { zoom: 0 } },
      { label: 'Czasem', sets: { zoom: 3 } },
      { label: 'Często', sets: { zoom: 5 } },
    ],
  ),

  /* Blok C. Pamięć */
  question(
    'C1',
    'storage',
    'Ile zdjęć i filmów chcesz trzymać w telefonie?',
    'Zdjęcia i filmy zajmują najwięcej miejsca.',
    [
      { label: 'Niewiele, resztę usuwam albo przenoszę', sets: { storage: 1 } },
      { label: 'Sporo, część w chmurze', sets: { storage: 3 } },
      { label: 'Wszystko w telefonie, chmura sporadycznie', sets: { storage: 5 } },
    ],
    { inShortQuiz: true },
  ),
  question(
    'C2',
    'storage',
    'Czy telefon z pamięcią mniejszą niż 256 GB w ogóle wchodzi w grę?',
    'Pamięci nie da się potem zwiększyć.',
    [
      { label: 'Tak, jeśli reszta jest dobra' },
      { label: 'Nie, minimum 256 GB', minStorageGb: 256 },
    ],
  ),
  question(
    'C3',
    'storage',
    'Czy chcesz móc włożyć kartę pamięci microSD?',
    'Karta pozwala tanio zwiększyć pamięć.',
    [
      { label: 'Nie ma znaczenia' },
      /* FP3-04: zamiast podnosić wagę pamięci wszystkim (`storage: 5`) — premia +15 pkt `storage` tylko dla
         telefonów ze slotem (`preferMicroSd`); nie zawęża puli (w puli jest 1 taki telefon). */
      { label: 'Chcę, jeśli się da', preferMicroSd: true },
    ],
    /* Pytanie warunkowe: zadawane tylko, gdy jakiś telefon w puli ma slot microSD. */
    {
      appliesWhen: (phones: readonly Phone[]) =>
        phones.some((phone) => phone.specs.microSd === true),
    },
  ),

  /* Blok D. Codzienność i trwałość */
  question(
    'D1',
    'everyday',
    'Jak bardzo przeszkadzają Ci chwilowe zacięcia i wolne otwieranie aplikacji?',
    'Różnice w szybkości widać nawet przy przeglądarce i komunikatorach.',
    [
      { label: 'Prawie wcale', sets: { smoothness: 1 } },
      { label: 'Trochę', sets: { smoothness: 3 } },
      { label: 'Bardzo', sets: { smoothness: 5 } },
    ],
  ),
  question(
    'D2',
    'everyday',
    'Czy telefon bywa narażony na wodę (deszcz, zachlapania, dziecko z kubkiem)?',
    'Odporność na wodę ratuje przed głupimi wpadkami.',
    [
      { label: 'Rzadko', sets: { durability: 0 } },
      { label: 'Czasem', sets: { durability: 3 } },
      { label: 'Często, chcę mieć spokój', sets: { durability: 5 } },
    ],
  ),
  question(
    'D3',
    'everyday',
    'Jak długo chcesz używać tego telefonu?',
    'Telefon bez aktualizacji bezpieczeństwa przestaje być bezpieczny.',
    [
      { label: '2 lata', sets: { updates: 1 } },
      { label: '3-4 lata', sets: { updates: 3 } },
      { label: '5 lat lub dłużej', sets: { updates: 5 } },
    ],
  ),
  question(
    'D4',
    'everyday',
    'Czy zależy Ci na mniejszym i lżejszym telefonie?',
    'Mniejszy i lżejszy telefon wygodniej trzyma się w jednej dłoni i łatwiej mieści w kieszeni.',
    [
      { label: 'Nie, rozmiar i waga są bez znaczenia', sets: { compactness: 0 } },
      { label: 'Trochę — wolę, żeby nie był zbyt ciężki', sets: { compactness: 3 } },
      { label: 'Tak, im mniejszy i lżejszy, tym lepiej', sets: { compactness: 5 } },
    ],
  ),

  /* Blok E. Ekran */
  question(
    'E1',
    'display',
    'Jak często używasz telefonu na zewnątrz w pełnym słońcu?',
    'W słońcu liczy się jasność ekranu.',
    [
      { label: 'Rzadko', sets: { display: 0 } },
      { label: 'Czasem', sets: { display: 3 } },
      { label: 'Często', sets: { display: 5 } },
    ],
  ),
  question(
    'E2',
    'display',
    'Jak często oglądasz na telefonie filmy, zdjęcia i dłuższe materiały?',
    'Przy oglądaniu liczy się jakość i płynność ekranu.',
    [
      { label: 'Rzadko', sets: { display: 0 } },
      { label: 'Czasem', sets: { display: 3 } },
      { label: 'Często', sets: { display: 5 } },
    ],
  ),

  /* Blok F. Budżet */
  question(
    'F1',
    'budget',
    'Ile możesz wydać na telefon?',
    'Cena zawęża wybór i wpływa na ocenę opłacalności.',
    [
      { label: 'Do 1500 zł, twardo', sets: { value: 5 }, budgetMax: 1500 },
      { label: 'Do 1800 zł', sets: { value: 3 }, budgetMax: 1800 },
      { label: 'Do 2000 zł, jeśli warto', sets: { value: 1 }, budgetMax: 2000 },
      /* FP3-05: wariant z profilu (PROJECT 2) — 2 karty ≤ 1500 zł + 1 karta ≤ 1800 zł z plakietką dopłaty. */
      {
        label: 'Najlepiej do 1500 zł, dopłacę do 1800 zł, jeśli telefon będzie wyraźnie lepszy',
        sets: { value: 4 },
        budgetMax: 1500,
        budgetStretch: 1800,
      },
    ],
    { inShortQuiz: true },
  ),
] as const;

/** Krok G1 — trzy najważniejsze rzeczy (QUIZ-SPEC 4, „Podsumowanie”). */
export const TOP_THREE_STEP = {
  id: 'G1',
  title: 'Wybierz trzy najważniejsze rzeczy',
  description:
    'Kolejność ma znaczenie: pierwszy wybór liczy się najmocniej. Możesz pominąć ten krok — wtedy ważności grup wyliczymy z odpowiedzi.',
  groups: GROUP_IDS.map((id) => ({ id, label: groupLabel(id) })),
} as const;

export const QUESTION_IDS: readonly string[] = QUESTIONS.map((item) => item.id);

/** Pytania krótkiego quizu w trybie hybrydowym (QUIZ-SPEC 5). */
export const SHORT_QUIZ_IDS: readonly string[] = QUESTIONS.filter(
  (item) => item.inShortQuiz === true,
).map((item) => item.id);

export function findQuestion(id: string): QuizQuestion | undefined {
  return QUESTIONS.find((item) => item.id === id);
}

export function findOption(questionId: string, optionId: string): QuizOption | undefined {
  return findQuestion(questionId)?.options.find((option) => option.id === optionId);
}

/**
 * Pytania zadawane dla danej puli (warunkowe odpadają bez śladu w liczniku).
 * Drugi argument zawęża listę do krótkiego quizu w trybie hybrydowym (QUIZ-SPEC 5).
 */
export function activeQuestions(
  phones: readonly Phone[],
  options: boolean | { short?: boolean } = {},
): QuizQuestion[] {
  const short = typeof options === 'boolean' ? options : options.short === true;
  return QUESTIONS.filter((item) => {
    if (short && item.inShortQuiz !== true) return false;
    return item.appliesWhen ? item.appliesWhen(phones) : true;
  });
}

/** Alias używany w testach i w przyszłych ekranach quizu. */
export const QUIZ_QUESTIONS = QUESTIONS;

export function isSkipAnswer(answers: Answers, questionId: string): boolean {
  const optionId = answers[questionId];
  if (!optionId) return true;
  return findOption(questionId, optionId)?.skip === true;
}
