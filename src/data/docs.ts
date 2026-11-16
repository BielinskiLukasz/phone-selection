/** Dokumenty planistyczne w `planning/` — lista generowana, nie wpisywana na sztywno. */

export interface PlanningDoc {
  file: string;
  label: string;
  note: string;
  kind: 'spec' | 'stage';
  stage?: number;
}

export const REPO_PLANNING_URL =
  'https://github.com/BielinskiLukasz/phone-selection/tree/main/planning';

export const PLANNING_SPECS: readonly PlanningDoc[] = [
  { file: 'PROJECT.md', label: 'PROJECT.md', note: 'cel, zakres, model rankingu, dane', kind: 'spec' },
  { file: 'UI-SPEC.md', label: 'UI-SPEC.md', note: 'ekrany, komponenty, motywy, a11y', kind: 'spec' },
  { file: 'QUIZ-SPEC.md', label: 'QUIZ-SPEC.md', note: 'pytania, wagi, algorytm', kind: 'spec' },
  { file: 'ROADMAP.md', label: 'ROADMAP.md', note: 'etapy, statusy, stan danych', kind: 'spec' },
] as const;

export const PLANNING_STAGES: readonly PlanningDoc[] = [
  { file: 'ETAP-1-szkielet-i-deploy.md', label: 'Etap 1', note: 'szkielet i deploy', kind: 'stage', stage: 1 },
  { file: 'ETAP-2-silnik-rankingu.md', label: 'Etap 2', note: 'silnik rankingu', kind: 'stage', stage: 2 },
  { file: 'ETAP-3-sesje-i-zapis.md', label: 'Etap 3', note: 'sesje i zapis', kind: 'stage', stage: 3 },
  { file: 'ETAP-4-quiz.md', label: 'Etap 4', note: 'tryb quiz', kind: 'stage', stage: 4 },
  { file: 'ETAP-5-suwaki-i-hybryda.md', label: 'Etap 5', note: 'suwaki i hybryda', kind: 'stage', stage: 5 },
  { file: 'ETAP-6-ranking-karty-wybor.md', label: 'Etap 6', note: 'karty i wybór', kind: 'stage', stage: 6 },
  { file: 'ETAP-7-historia-sesji.md', label: 'Etap 7', note: 'historia sesji', kind: 'stage', stage: 7 },
  { file: 'ETAP-8-motywy-mobile-a11y.md', label: 'Etap 8', note: 'motywy, mobile, a11y', kind: 'stage', stage: 8 },
  { file: 'ETAP-9-pelny-ranking-i-wydanie.md', label: 'Etap 9', note: 'pełny ranking i wydanie', kind: 'stage', stage: 9 },
] as const;

export const PLANNING_DOCS: readonly PlanningDoc[] = [...PLANNING_SPECS, ...PLANNING_STAGES];

export function docUrl(file: string): string {
  return `${REPO_PLANNING_URL}/${file}`;
}
