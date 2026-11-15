import { describe, expect, it } from 'vitest';
import { CRITERION_IDS } from '../src/data/criteria';
import { activeQuestions, QUIZ_QUESTIONS, TOP_THREE_STEP } from '../src/data/questions';
import { SYNTHETIC_PHONES } from './fixtures/phones';

describe('quiz data', () => {
  it('defines 18 questions, seven short questions and the group-choice step', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(18);
    expect(QUIZ_QUESTIONS.filter((question) => question.inShortQuiz)).toHaveLength(7);
    expect(TOP_THREE_STEP.id).toBe('G1');
    expect(TOP_THREE_STEP.groups).toHaveLength(6);
  });

  it('has distinct IDs, a skip answer and weights in range for each question', () => {
    expect(new Set(QUIZ_QUESTIONS.map((question) => question.id)).size).toBe(18);
    for (const question of QUIZ_QUESTIONS) {
      expect(question.options.filter((option) => option.skip)).toHaveLength(1);
      expect(new Set(question.options.map((option) => option.id)).size).toBe(question.options.length);
      for (const option of question.options) {
        for (const [criterion, weight] of Object.entries(option.sets ?? {})) {
          expect(CRITERION_IDS).toContain(criterion);
          expect(weight).toBeGreaterThanOrEqual(0);
          expect(weight).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('asks about microSD only if a candidate actually has a slot', () => {
    expect(activeQuestions(SYNTHETIC_PHONES).map((question) => question.id)).not.toContain('C3');
    const withSlot = [
      { ...SYNTHETIC_PHONES[0]!, specs: { ...SYNTHETIC_PHONES[0]!.specs, microSd: true } },
    ];
    expect(activeQuestions(withSlot).map((question) => question.id)).toContain('C3');
    expect(activeQuestions(withSlot, true)).toHaveLength(7);
  });
});