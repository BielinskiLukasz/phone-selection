import type { GroupId } from '../src/types/criteria';
import type { Answers } from '../src/types/ranking';

interface Persona {
  answers: Answers;
  topThree: readonly [GroupId, GroupId, GroupId];
}

export const personas: Record<'wife' | 'camera' | 'battery', Persona> = {
  wife: {
    answers: {
      A1: 'A1-b', A2: 'A2-b', A3: 'A3-a',
      B1: 'B1-c', B2: 'B2-c', B3: 'B3-c',
      B4: 'B4-b', B5: 'B5-b', B6: 'B6-b',
      C1: 'C1-c', C2: 'C2-a',
      D1: 'D1-b', D2: 'D2-b', D3: 'D3-b',
      E1: 'E1-b', E2: 'E2-b', F1: 'F1-c',
    },
    topThree: ['battery', 'camera', 'storage'],
  },
  camera: {
    answers: {
      A1: 'A1-a', A2: 'A2-a', A3: 'A3-a',
      B1: 'B1-c', B2: 'B2-c', B3: 'B3-c',
      B4: 'B4-c', B5: 'B5-c', B6: 'B6-c',
      C1: 'C1-b', C2: 'C2-a',
      D1: 'D1-b', D2: 'D2-a', D3: 'D3-b',
      E1: 'E1-b', E2: 'E2-b', F1: 'F1-c',
    },
    topThree: ['camera', 'storage', 'smooth'],
  },
  battery: {
    answers: {
      A1: 'A1-d', A2: 'A2-c', A3: 'A3-a',
      B1: 'B1-a', B2: 'B2-a', B3: 'B3-a',
      B4: 'B4-a', B5: 'B5-a', B6: 'B6-a',
      C1: 'C1-b', C2: 'C2-a',
      D1: 'D1-b', D2: 'D2-b', D3: 'D3-b',
      E1: 'E1-a', E2: 'E2-a', F1: 'F1-c',
    },
    topThree: ['battery', 'price', 'longevity'],
  },
};