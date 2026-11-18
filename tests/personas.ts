import type { Answers, TopThreeAnswer } from '../src/types';
import { QUESTIONS } from '../src/data/questions';

/**
 * Persony testowe (E2-11) — odpowiedzi z QUIZ-SPEC sekcja 9.
 * Testy sprawdzają niezmienniki, nie liczby referencyjne, żeby aktualizacja
 * danych (etap 0) nie psuła testów.
 */

export interface Persona {
  id: string;
  label: string;
  answers: Answers;
  topThree: TopThreeAnswer | null;
}

/** 9.1 Persona „żona”: profil z PROJECT.md sekcja 2. */
export const WIFE: Persona = {
  id: 'wife',
  label: 'żona (bateria, aparat, pamięć)',
  answers: {
    A1: 'A1-b', // 2-4 godziny → battery 3
    A2: 'A2-b', // czasem → battery 3
    A3: 'A3-a', // zawsze na noc → charging 1
    B1: 'B1-c', // często → photoIndoor 5
    B2: 'B2-c', // często → photoMotion 5
    B3: 'B3-c', // często → photoDay 5
    B4: 'B4-b', // czasem → selfie 3
    B5: 'B5-b', // czasem → video 3
    B6: 'B6-b', // czasem → zoom 3
    C1: 'C1-c', // wszystko w telefonie → storage 5
    C2: 'C2-a', // tak, jeśli reszta jest dobra → bez filtra
    D1: 'D1-b', // trochę → smoothness 3
    D2: 'D2-b', // czasem → durability 3
    D3: 'D3-b', // 3-4 lata → updates 3
    D4: 'D4-a', // rozmiar i waga bez znaczenia → compactness 0 (PROJECT 2)
    E1: 'E1-b', // czasem → display 3
    E2: 'E2-b', // czasem → display 3
    F1: 'F1-c', // do 2000 zł → value 1, budżet 2000
  },
  topThree: { picks: ['battery', 'camera', 'storage'] },
};

/** 9.2 Persona „aparat” (kontrolna). */
export const CAMERA: Persona = {
  id: 'camera',
  label: 'aparat (kontrolna)',
  answers: {
    A1: 'A1-a',
    A2: 'A2-a',
    A3: 'A3-a',
    B1: 'B1-c',
    B2: 'B2-c',
    B3: 'B3-c',
    B4: 'B4-c',
    B5: 'B5-c',
    B6: 'B6-c',
    C1: 'C1-b',
    C2: 'C2-a',
    D1: 'D1-b',
    D2: 'D2-a',
    D3: 'D3-b',
    D4: 'D4-a',
    E1: 'E1-b',
    E2: 'E2-b',
    F1: 'F1-c',
  },
  topThree: { picks: ['camera', 'storage', 'smooth'] },
};

/** 9.3 Persona „bateria” (kontrolna). */
export const BATTERY: Persona = {
  id: 'battery',
  label: 'bateria (kontrolna)',
  answers: {
    A1: 'A1-d', // ponad 6 godzin → battery 5
    A2: 'A2-c', // często → battery 5
    A3: 'A3-a', // zawsze na noc → charging 1
    B1: 'B1-a',
    B2: 'B2-a',
    B3: 'B3-a',
    B4: 'B4-a',
    B5: 'B5-a',
    B6: 'B6-a',
    C1: 'C1-b',
    C2: 'C2-a',
    D1: 'D1-b',
    D2: 'D2-b',
    D3: 'D3-b',
    D4: 'D4-a',
    E1: 'E1-a',
    E2: 'E2-a',
    F1: 'F1-c',
  },
  topThree: { picks: ['battery', 'price', 'longevity'] },
};

/** Wszystkie odpowiedzi „Nie wiem / pomiń” (test akceptacyjny 1). */
export function skipAll(): Answers {
  const answers: Answers = {};
  for (const question of QUESTIONS) {
    const skip = question.options.find((option) => option.skip === true);
    if (skip) answers[question.id] = skip.id;
  }
  return answers;
}

/** Brak jakiejkolwiek odpowiedzi (użytkowniczka przerwała quiz). */
export function noAnswers(): Answers {
  return {};
}

export const PERSONAS: readonly Persona[] = [WIFE, CAMERA, BATTERY];

/** Alias dla czytelniejszego zapisu w testach: `personas.wife`. */
export const personas = {
  list: PERSONAS,
  wife: WIFE,
  camera: CAMERA,
  battery: BATTERY,
} as const;
