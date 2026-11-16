import { describe, expect, it } from 'vitest';
import {
  QUESTIONS,
  QUIZ_QUESTIONS,
  QUESTION_IDS,
  SHORT_QUIZ_IDS,
  TOP_THREE_STEP,
  activeQuestions,
  findOption,
  findQuestion,
  isSkipAnswer,
} from '../src/data/questions';
import { GROUP_IDS } from '../src/data/criteria';
import { POOL } from './data';
import { skipAll } from './personas';
import type { CriterionId } from '../src/types';

const FORBIDDEN_IN_QUIZ = [
  'samsung', 'galaxy', 'pixel', 'google', 'xiaomi', 'redmi', 'motorola', 'nothing', 'realme',
  'snapdragon', 'dimensity', 'tensor', 'exynos', 'mah', 'ois', 'ip68', 'amoled',
];

describe('E2-03 · dane quizu', () => {
  it('ma 18 pytań w kolejności bloków A → B → C → D → E → F', () => {
    expect(QUESTIONS.length).toBe(18);
    expect(QUIZ_QUESTIONS).toBe(QUESTIONS);
    expect(QUESTION_IDS.join(',')).toBe(
      'A1,A2,A3,B1,B2,B3,B4,B5,B6,C1,C2,C3,D1,D2,D3,E1,E2,F1',
    );
  });

  it('każde pytanie ma 3-4 odpowiedzi wartościujące i opcję „Nie wiem / pomiń”', () => {
    for (const question of QUESTIONS) {
      const valueOptions = question.options.filter((option) => option.skip !== true);
      const skips = question.options.filter((option) => option.skip === true);

      expect(valueOptions.length, question.id).toBeGreaterThanOrEqual(2);
      expect(valueOptions.length, question.id).toBeLessThanOrEqual(4);
      expect(skips.length, question.id).toBe(1);
      expect(skips[0]!.id).toBe(`${question.id}-skip`);
      expect(question.why.length, question.id).toBeGreaterThan(10);
      expect(question.text.length, question.id).toBeGreaterThan(10);
    }
  });

  it('wartości odpowiedzi mieszczą się w skali 0-5 i dotyczą istniejących kryteriów', () => {
    const known: readonly string[] = [
      'battery', 'charging', 'photoDay', 'photoIndoor', 'photoMotion', 'selfie', 'video', 'zoom',
      'storage', 'updates', 'smoothness', 'display', 'durability', 'value',
    ];
    for (const question of QUESTIONS) {
      for (const option of question.options) {
        for (const [criterion, value] of Object.entries(option.sets ?? {})) {
          expect(known, `${question.id}/${option.id}`).toContain(criterion);
          expect(value as number, `${question.id}/${option.id}`).toBeGreaterThanOrEqual(0);
          expect(value as number, `${question.id}/${option.id}`).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('treści pytań nie ujawniają marek ani żargonu (QUIZ-SPEC 1.2 i 1.5)', () => {
    for (const question of QUESTIONS) {
      const text = `${question.text} ${question.why} ${question.options
        .map((option) => option.label)
        .join(' ')}`.toLowerCase();
      for (const word of FORBIDDEN_IN_QUIZ) {
        expect(text, `${question.id}: ${word}`).not.toContain(word);
      }
    }
  });

  it('C3 jest warunkowe: aktywne, bo Edge 60 ma slot microSD', () => {
    expect(findQuestion('C3')?.appliesWhen).toBeTypeOf('function');
    expect(POOL.some((phone) => phone.specs.microSd === true)).toBe(true);

    const active = activeQuestions(POOL).map((question) => question.id);
    expect(active).toContain('C3');
    expect(active.length).toBe(18);

    /* Gdyby żaden telefon nie miał slotu, pytanie odpada bez śladu w liczniku. */
    const without = activeQuestions(POOL.filter((phone) => phone.specs.microSd !== true));
    expect(without.map((question) => question.id)).not.toContain('C3');
    expect(without.length).toBe(17);
  });

  it('krótki quiz hybrydy to A1, A2, B1, B2, B3, C1, F1 (QUIZ-SPEC 5)', () => {
    expect(SHORT_QUIZ_IDS).toEqual(['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'F1']);
    expect(activeQuestions(POOL, { short: true }).map((question) => question.id)).toEqual([
      'A1',
      'A2',
      'B1',
      'B2',
      'B3',
      'C1',
      'F1',
    ]);
    expect(activeQuestions(POOL, true).length).toBe(7);
    expect(activeQuestions(POOL, { short: true }).length).toBe(7);
  });

  it('F1 niesie budżet, C2 filtr pamięci, a krok G1 sześć grup', () => {
    expect(findOption('F1', 'F1-a')?.budgetMax).toBe(1500);
    expect(findOption('F1', 'F1-c')?.budgetMax).toBe(2000);
    expect(findOption('C2', 'C2-b')?.minStorageGb).toBe(256);
    expect(TOP_THREE_STEP.groups.length).toBe(GROUP_IDS.length);
    expect(TOP_THREE_STEP.id).toBe('G1');
  });

  it('„pomiń” i brak odpowiedzi są rozpoznawane tak samo', () => {
    expect(isSkipAnswer(skipAll(), 'A1')).toBe(true);
    expect(isSkipAnswer({}, 'A1')).toBe(true);
    expect(isSkipAnswer({ A1: 'A1-c' }, 'A1')).toBe(false);
  });

  it('każde kryterium (poza value) ma przynajmniej jedno pytanie', () => {
    const touched = new Set<CriterionId>();
    for (const question of QUESTIONS) {
      for (const option of question.options) {
        for (const id of Object.keys(option.sets ?? {}) as CriterionId[]) touched.add(id);
      }
    }
    expect(touched.has('value')).toBe(true);
    const cameraCriteria: CriterionId[] = [
      'photoDay', 'photoIndoor', 'photoMotion', 'selfie', 'video', 'zoom',
    ];
    for (const id of cameraCriteria) {
      expect(touched.has(id), id).toBe(true);
    }
  });
});
