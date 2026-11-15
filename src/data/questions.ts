import { GROUP_IDS } from './criteria';
import type { Phone } from '../types/phone';
import type { QuizOption, QuizQuestion } from '../types/ranking';

type QuestionSeed = Omit<QuizQuestion, 'options'> & { options: Omit<QuizOption, 'id'>[] };

function question(seed: QuestionSeed): QuizQuestion {
  return {
    ...seed,
    options: [
      ...seed.options.map((option, index) => ({ ...option, id: `${seed.id}-${String.fromCharCode(97 + index)}` })),
      { id: `${seed.id}-skip`, label: 'Nie wiem / pomiń', skip: true as const },
    ],
  };
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  question({
    id: 'A1', block: 'battery', inShortQuiz: true,
    text: 'Ile godzin dziennie patrzysz w ekran telefonu?',
    why: 'Im więcej ekranu, tym ważniejsza bateria.',
    options: [
      { label: 'Do 2 godzin', sets: { battery: 1 } },
      { label: '2-4 godziny', sets: { battery: 3 } },
      { label: '4-6 godzin', sets: { battery: 4 } },
      { label: 'Ponad 6 godzin', sets: { battery: 5 } },
    ],
  }),
  question({
    id: 'A2', block: 'battery', inShortQuiz: true,
    text: 'Czy zdarzają się dni, gdy nie masz jak naładować telefonu (wyjazd, wycieczka, długi dzień poza domem)?',
    why: 'Przy takich dniach liczy się bateria na dwa dni, a nie sama szybkość ładowania.',
    options: [
      { label: 'Prawie nigdy', sets: { battery: 1 } },
      { label: 'Czasem', sets: { battery: 3 } },
      { label: 'Często', sets: { battery: 5 } },
    ],
  }),
  question({
    id: 'A3', block: 'battery',
    text: 'Jak zwykle ładujesz telefon?',
    why: 'Szybkie ładowanie ratuje dzień, gdy bateria padnie w drodze.',
    options: [
      { label: 'Zawsze na noc', sets: { charging: 1 } },
      { label: 'Czasem w ciągu dnia', sets: { charging: 3 } },
      { label: 'Często potrzebuję szybkiego doładowania', sets: { charging: 5 } },
    ],
  }),
  question({
    id: 'B1', block: 'camera', inShortQuiz: true,
    text: 'Jak często robisz zdjęcia w domu, wieczorem albo przy sztucznym świetle?',
    why: 'Słabe światło to najtrudniejszy test dla aparatu.',
    options: [
      { label: 'Rzadko', sets: { photoIndoor: 1 } },
      { label: 'Czasem', sets: { photoIndoor: 3 } },
      { label: 'Często', sets: { photoIndoor: 5 } },
    ],
  }),
  question({
    id: 'B2', block: 'camera', inShortQuiz: true,
    text: 'Jak często fotografujesz dziecko lub rodzinę w ruchu (zabawa, bieganie)?',
    why: 'Ruchome obiekty wymagają szybkiego, pewnego ustawiania ostrości.',
    options: [
      { label: 'Rzadko', sets: { photoMotion: 1 } },
      { label: 'Czasem', sets: { photoMotion: 3 } },
      { label: 'Często', sets: { photoMotion: 5 } },
    ],
  }),
  question({
    id: 'B3', block: 'camera', inShortQuiz: true,
    text: 'Jak często robisz zdjęcia na zewnątrz w dzień (spacery, plac zabaw, wyjazdy)?',
    why: 'W dzień większość telefonów radzi sobie dobrze, ale różnią się szczegółami i kolorami.',
    options: [
      { label: 'Rzadko', sets: { photoDay: 1 } },
      { label: 'Czasem', sets: { photoDay: 3 } },
      { label: 'Często', sets: { photoDay: 5 } },
    ],
  }),
  question({
    id: 'B4', block: 'camera',
    text: 'Jak często robisz selfie?',
    why: 'Aparat przedni to osobny aparat o osobnej jakości.',
    options: [
      { label: 'Prawie nigdy', sets: { selfie: 1 } },
      { label: 'Czasem', sets: { selfie: 3 } },
      { label: 'Często', sets: { selfie: 5 } },
    ],
  }),
  question({
    id: 'B5', block: 'camera',
    text: 'Jak często nagrywasz filmy?',
    why: 'Wideo wymaga stabilizacji i dobrego dźwięku.',
    options: [
      { label: 'Prawie nigdy', sets: { video: 1 } },
      { label: 'Czasem', sets: { video: 3 } },
      { label: 'Często', sets: { video: 5 } },
    ],
  }),
  question({
    id: 'B6', block: 'camera',
    text: 'Czy zdarza się, że fotografujesz z daleka (występ dziecka, plac zabaw, zwierzęta)?',
    why: 'Z daleka dobre zdjęcia robi tylko telefon z osobnym aparatem do przybliżania.',
    options: [
      { label: 'Nie', sets: { zoom: 1 } },
      { label: 'Czasem', sets: { zoom: 3 } },
      { label: 'Często', sets: { zoom: 5 } },
    ],
  }),
  question({
    id: 'C1', block: 'storage', inShortQuiz: true,
    text: 'Ile zdjęć i filmów chcesz trzymać w telefonie?',
    why: 'Zdjęcia i filmy zajmują najwięcej miejsca.',
    options: [
      { label: 'Niewiele, resztę usuwam albo przenoszę', sets: { storage: 1 } },
      { label: 'Sporo, część w chmurze', sets: { storage: 3 } },
      { label: 'Wszystko w telefonie, chmura sporadycznie', sets: { storage: 5 } },
    ],
  }),
  question({
    id: 'C2', block: 'storage',
    text: 'Czy telefon z pamięcią mniejszą niż 256 GB w ogóle wchodzi w grę?',
    why: 'Pamięci nie da się potem zwiększyć.',
    options: [
      { label: 'Tak, jeśli reszta jest dobra' },
      { label: 'Nie, minimum 256 GB', minStorageGb: 256 },
    ],
  }),
  question({
    id: 'C3', block: 'storage',
    text: 'Czy chcesz móc włożyć kartę pamięci microSD?',
    why: 'Karta pozwala tanio zwiększyć pamięć.',
    appliesWhen: (phones) => phones.some((phone) => phone.specs.microSd === true),
    options: [
      { label: 'Nie ma znaczenia' },
      { label: 'Chcę, jeśli się da', sets: { storage: 5 } },
    ],
  }),
  question({
    id: 'D1', block: 'everyday',
    text: 'Jak bardzo przeszkadzają Ci chwilowe zacięcia i wolne otwieranie aplikacji?',
    why: 'Różnice w szybkości widać nawet przy przeglądarce i komunikatorach.',
    options: [
      { label: 'Prawie wcale', sets: { smoothness: 1 } },
      { label: 'Trochę', sets: { smoothness: 3 } },
      { label: 'Bardzo', sets: { smoothness: 5 } },
    ],
  }),
  question({
    id: 'D2', block: 'everyday',
    text: 'Czy telefon bywa narażony na wodę (deszcz, zachlapania, dziecko z kubkiem)?',
    why: 'Odporność na wodę ratuje przed głupimi wpadkami.',
    options: [
      { label: 'Rzadko', sets: { durability: 1 } },
      { label: 'Czasem', sets: { durability: 3 } },
      { label: 'Często, chcę mieć spokój', sets: { durability: 5 } },
    ],
  }),
  question({
    id: 'D3', block: 'everyday',
    text: 'Jak długo chcesz używać tego telefonu?',
    why: 'Telefon bez aktualizacji bezpieczeństwa przestaje być bezpieczny.',
    options: [
      { label: '2 lata', sets: { updates: 1 } },
      { label: '3-4 lata', sets: { updates: 3 } },
      { label: '5 lat lub dłużej', sets: { updates: 5 } },
    ],
  }),
  question({
    id: 'E1', block: 'display',
    text: 'Jak często używasz telefonu na zewnątrz w pełnym słońcu?',
    why: 'W słońcu liczy się jasność ekranu.',
    options: [
      { label: 'Rzadko', sets: { display: 1 } },
      { label: 'Czasem', sets: { display: 3 } },
      { label: 'Często', sets: { display: 5 } },
    ],
  }),
  question({
    id: 'E2', block: 'display',
    text: 'Jak często oglądasz na telefonie filmy, zdjęcia i dłuższe materiały?',
    why: 'Przy oglądaniu liczy się jakość i płynność ekranu.',
    options: [
      { label: 'Rzadko', sets: { display: 1 } },
      { label: 'Czasem', sets: { display: 3 } },
      { label: 'Często', sets: { display: 5 } },
    ],
  }),
  question({
    id: 'F1', block: 'budget', inShortQuiz: true,
    text: 'Ile możesz wydać na telefon?',
    why: 'Cena zawęża wybór i wpływa na ocenę opłacalności.',
    options: [
      { label: 'Do 1500 zł, twardo', budgetMax: 1500, sets: { value: 5 } },
      { label: 'Do 1800 zł', budgetMax: 1800, sets: { value: 3 } },
      { label: 'Do 2000 zł, jeśli warto', budgetMax: 2000, sets: { value: 2 } },
    ],
  }),
];

export const TOP_THREE_STEP = {
  id: 'G1',
  text: 'Wybierz trzy najważniejsze rzeczy',
  groups: GROUP_IDS,
} as const;

export function activeQuestions(phones: readonly Phone[], short = false): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter((item) => (!short || item.inShortQuiz) && (!item.appliesWhen || item.appliesWhen(phones)));
}