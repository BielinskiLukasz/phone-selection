import type { Answers, Phone, QuizBlock, QuizQuestion } from '@/types';
import type { Mode, Session } from '@/types/state';
import { activeQuestions, isSkipAnswer } from '@/data/questions';
import { quizBlocks } from '@/data/strings';

/**
 * Przepływ quizu (E4-01) — czysta logika, bez Reacta.
 * Kroki: nagłówek bloku → pytania bloku → … → krok G1 → podsumowanie.
 */

export type QuizStep =
  | { kind: 'block'; block: QuizBlock; title: string; subtitle: string }
  | { kind: 'question'; question: QuizQuestion; number: number }
  | { kind: 'top-three' }
  | { kind: 'summary' };

export const BLOCK_ORDER: readonly QuizBlock[] = [
  'battery',
  'camera',
  'storage',
  'everyday',
  'display',
  'budget',
];

/** Pełny quiz albo krótki (hybryda — QUIZ-SPEC 5) dla danej puli telefonów. */
export function buildSteps(phones: readonly Phone[], mode: Mode): QuizStep[] {
  const short = mode === 'hybrid';
  const questions = activeQuestions(phones, { short });
  const steps: QuizStep[] = [];
  let block: QuizBlock | null = null;
  let number = 0;

  for (const question of questions) {
    if (question.block !== block) {
      block = question.block;
      const meta = quizBlocks[block];
      steps.push({ kind: 'block', block, title: meta.title, subtitle: meta.subtitle });
    }
    number += 1;
    steps.push({ kind: 'question', question, number });
  }

  steps.push({ kind: 'top-three' });
  steps.push({ kind: 'summary' });
  return steps;
}

export type QuestionStep = { kind: 'question'; question: QuizQuestion; number: number };

export function questionSteps(steps: readonly QuizStep[]): QuestionStep[] {
  return steps.filter((step): step is QuestionStep => step.kind === 'question');
}

export function totalQuestions(steps: readonly QuizStep[]): number {
  return questionSteps(steps).length;
}

export function answeredQuestions(steps: readonly QuizStep[], answers: Answers): number {
  return questionSteps(steps).filter((step) => answers[step.question.id] !== undefined).length;
}

/** Świadomie wybrane „Nie wiem / pomiń” (brak odpowiedzi to nie pominięcie). */
export function skippedQuestions(steps: readonly QuizStep[], answers: Answers): number {
  return questionSteps(steps).filter((step) => {
    const optionId = answers[step.question.id];
    return optionId !== undefined && isSkipAnswer(answers, step.question.id);
  }).length;
}

/** E4-08: większość odpowiedzi to „nie wiem” → wynik mało spersonalizowany (QUIZ-SPEC 8). */
export function isLowPersonalization(steps: readonly QuizStep[], answers: Answers): boolean {
  const answered = answeredQuestions(steps, answers);
  if (answered === 0) return true;
  return skippedQuestions(steps, answers) / answered > 0.5;
}

/**
 * Pierwszy krok do wznowienia: pierwsze pytanie bez odpowiedzi, potem G1 (jeśli brak trójki),
 * na końcu podsumowanie (E4-01, test akceptacyjny 2).
 */
export function resumeIndex(steps: readonly QuizStep[], session: Session): number {
  /* Świeża sesja zaczyna od nagłówka pierwszego bloku, nie od pytania. */
  if (Object.keys(session.answers).length === 0 && !session.topThree) return 0;

  const firstUnanswered = steps.findIndex(
    (step) => step.kind === 'question' && session.answers[step.question.id] === undefined,
  );
  if (firstUnanswered >= 0) return firstUnanswered;

  const topThreeIndex = steps.findIndex((step) => step.kind === 'top-three');
  if (!session.topThree && topThreeIndex >= 0) return topThreeIndex;

  return steps.length - 1;
}

/** Numer pytania „n z N” dla bieżącego kroku (dla kroków niepytaniowych: ostatnie pytanie). */
export function questionNumberAt(steps: readonly QuizStep[], index: number): number {
  for (let cursor = Math.min(index, steps.length - 1); cursor >= 0; cursor -= 1) {
    const step = steps[cursor];
    if (step?.kind === 'question') return step.number;
  }
  return 0;
}

/** Blok, w którym jesteśmy — do nagłówka i paska postępu. */
export function blockAt(steps: readonly QuizStep[], index: number): QuizBlock | null {
  for (let cursor = Math.min(index, steps.length - 1); cursor >= 0; cursor -= 1) {
    const step = steps[cursor];
    if (step?.kind === 'block') return step.block;
    if (step?.kind === 'question') return step.question.block;
  }
  return null;
}

/** Kolejny krok z pominięciem nagłówków bloków (auto-przejście po odpowiedzi). */
export function nextAnswerableIndex(steps: readonly QuizStep[], index: number): number {
  for (let cursor = index + 1; cursor < steps.length; cursor += 1) {
    if (steps[cursor]?.kind !== 'block') return cursor;
  }
  return Math.min(index + 1, steps.length - 1);
}

/** Poprzedni krok z pominięciem nagłówków bloków („Wstecz”). */
export function prevAnswerableIndex(steps: readonly QuizStep[], index: number): number {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (steps[cursor]?.kind !== 'block') return cursor;
  }
  return Math.max(index - 1, 0);
}

/** Identyfikator kroku — klucz React i stabilny punkt dla fokusa. */
export function stepKey(step: QuizStep): string {
  if (step.kind === 'question') return `q-${step.question.id}`;
  if (step.kind === 'block') return `block-${step.block}`;
  return step.kind;
}
