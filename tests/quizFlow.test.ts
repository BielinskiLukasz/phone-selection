import { describe, expect, it } from 'vitest';
import { POOL } from './data';
import { WIFE, skipAll } from './personas';
import {
  BLOCK_ORDER,
  answeredQuestions,
  blockAt,
  buildSteps,
  isLowPersonalization,
  nextAnswerableIndex,
  prevAnswerableIndex,
  questionNumberAt,
  questionSteps,
  resumeIndex,
  skippedQuestions,
  stepKey,
  totalQuestions,
} from '../src/features/quiz/quizFlow';
import { createSession } from '../src/lib/session';
import { activeQuestions } from '../src/data/questions';
import type { Answers } from '../src/types';
import type { Session } from '../src/types/state';

const NOW = new Date('2026-11-16T10:00:00.000Z');
const fresh = (mode: 'quiz' | 'hybrid' = 'quiz'): Session => createSession(mode, NOW, 'quiz-1');

const fullSteps = buildSteps(POOL, 'quiz');
const shortSteps = buildSteps(POOL, 'hybrid');

function answerAll(steps: ReturnType<typeof buildSteps>, answers: Answers): Answers {
  const result: Answers = { ...answers };
  for (const step of questionSteps(steps)) {
    if (result[step.question.id] === undefined) {
      result[step.question.id] = step.question.options[0]!.id;
    }
  }
  return result;
}

describe('E4-01 · budowa przepływu', () => {
  it('pełny quiz: nagłówki bloków, pytania, krok G1 i podsumowanie', () => {
    expect(totalQuestions(fullSteps)).toBe(activeQuestions(POOL).length);
    expect(totalQuestions(fullSteps)).toBe(18); // C3 aktywne: Edge 60 ma microSD

    const kinds = fullSteps.map((step) => step.kind);
    expect(kinds.filter((kind) => kind === 'block').length).toBe(BLOCK_ORDER.length);
    expect(kinds[kinds.length - 2]).toBe('top-three');
    expect(kinds[kinds.length - 1]).toBe('summary');

    /* Nagłówek bloku stoi przed pierwszym pytaniem tego bloku. */
    for (const block of BLOCK_ORDER) {
      const headerIndex = fullSteps.findIndex((step) => step.kind === 'block' && step.block === block);
      const firstQuestion = fullSteps.findIndex(
        (step) => step.kind === 'question' && step.question.block === block,
      );
      expect(headerIndex, block).toBeGreaterThanOrEqual(0);
      expect(headerIndex, block).toBeLessThan(firstQuestion);
    }
  });

  it('pytania są numerowane kolejno, a klucze kroków są stabilne', () => {
    const numbers = questionSteps(fullSteps).map((step) => step.number);
    expect(numbers).toEqual(numbers.map((_value, index) => index + 1));
    expect(new Set(fullSteps.map(stepKey)).size).toBe(fullSteps.length);
  });

  it('hybryda prowadzi krótki zestaw siedmiu pytań (QUIZ-SPEC 5)', () => {
    expect(totalQuestions(shortSteps)).toBe(7);
    expect(questionSteps(shortSteps).map((step) => step.question.id)).toEqual([
      'A1',
      'A2',
      'B1',
      'B2',
      'B3',
      'C1',
      'F1',
    ]);
  });

  it('4. bez telefonu z microSD pytanie C3 nie jest zadawane ani liczone', () => {
    const withoutSlot = POOL.filter((phone) => phone.specs.microSd !== true);
    const steps = buildSteps(withoutSlot, 'quiz');
    expect(totalQuestions(steps)).toBe(17);
    expect(questionSteps(steps).map((step) => step.question.id)).not.toContain('C3');
  });
});

describe('E4-01 · nawigacja i licznik', () => {
  it('auto-przejście i „Wstecz” pomijają nagłówki bloków', () => {
    const headerIndex = fullSteps.findIndex((step) => step.kind === 'block');
    const firstQuestion = nextAnswerableIndex(fullSteps, headerIndex);
    expect(fullSteps[firstQuestion]?.kind).toBe('question');

    const back = prevAnswerableIndex(fullSteps, firstQuestion + 1);
    expect(fullSteps[back]?.kind).toBe('question');
    expect(prevAnswerableIndex(fullSteps, 0)).toBe(0);
  });

  it('licznik i blok dla bieżącego kroku', () => {
    const firstQuestion = fullSteps.findIndex((step) => step.kind === 'question');
    expect(questionNumberAt(fullSteps, firstQuestion)).toBe(1);
    expect(blockAt(fullSteps, firstQuestion)).toBe('battery');

    const cameraIndex = fullSteps.findIndex(
      (step) => step.kind === 'question' && step.question.block === 'camera',
    );
    expect(blockAt(fullSteps, cameraIndex)).toBe('camera');
    expect(questionNumberAt(fullSteps, cameraIndex)).toBe(4); // A1, A2, A3, potem B1
  });

  it('krok G1 i podsumowanie mają blok z ostatniego pytania', () => {
    expect(blockAt(fullSteps, fullSteps.length - 1)).toBe('budget');
  });
});

describe('E4-01 · wznawianie', () => {
  it('2. powrót trafia na pierwsze pytanie bez odpowiedzi', () => {
    const partial: Answers = { A1: 'A1-b', A2: 'A2-c', A3: 'A3-a' };
    const session = { ...fresh(), answers: partial };
    const index = resumeIndex(fullSteps, session);
    const step = fullSteps[index];
    expect(step?.kind).toBe('question');
    if (step?.kind === 'question') expect(step.question.id).toBe('B1');
  });

  it('przy wszystkich odpowiedziach wraca na krok G1, a z trójką na podsumowanie', () => {
    const answers = answerAll(fullSteps, {});
    expect(fullSteps[resumeIndex(fullSteps, { ...fresh(), answers })]?.kind).toBe('top-three');

    const withTopThree: Session = {
      ...fresh(),
      answers,
      topThree: { picks: ['battery', 'camera', 'storage'] },
    };
    expect(fullSteps[resumeIndex(fullSteps, withTopThree)]?.kind).toBe('summary');
  });

  it('świeża sesja zaczyna od nagłówka pierwszego bloku', () => {
    expect(resumeIndex(fullSteps, fresh())).toBe(0);
    expect(fullSteps[0]?.kind).toBe('block');
  });

  it('1. odpowiedzi persony „żona” wypełniają quiz oprócz warunkowego C3', () => {
    const session: Session = { ...fresh(), answers: WIFE.answers, topThree: WIFE.topThree };

    expect(answeredQuestions(fullSteps, session.answers)).toBe(totalQuestions(fullSteps) - 1);
    expect(session.topThree?.picks).toEqual(['battery', 'camera', 'storage']);

    /* Wznowienie trafia na jedyne pytanie bez odpowiedzi — warunkowe C3. */
    const step = fullSteps[resumeIndex(fullSteps, session)];
    expect(step?.kind).toBe('question');
    if (step?.kind === 'question') expect(step.question.id).toBe('C3');

    const withC3: Session = { ...session, answers: { ...session.answers, C3: 'C3-a' } };
    expect(answeredQuestions(fullSteps, withC3.answers)).toBe(totalQuestions(fullSteps));
    expect(fullSteps[resumeIndex(fullSteps, withC3)]?.kind).toBe('summary');
  });
});

describe('E4-08 · mało spersonalizowany wynik', () => {
  it('6. same „pomiń” dają ostrzeżenie, a konkretne odpowiedzi nie', () => {
    expect(isLowPersonalization(fullSteps, skipAll())).toBe(true);
    expect(isLowPersonalization(fullSteps, {})).toBe(true);
    expect(isLowPersonalization(fullSteps, WIFE.answers)).toBe(false);

    const halfSkipped: Answers = { A1: 'A1-skip', A2: 'A2-skip', A3: 'A3-c', B1: 'B1-c' };
    expect(isLowPersonalization(fullSteps, halfSkipped)).toBe(false);
    expect(skippedQuestions(fullSteps, skipAll())).toBe(totalQuestions(fullSteps));
  });
});
