import type { CriterionId, GroupId } from '@/types';

/**
 * Kryteria i grupy (E2-02) — jedno źródło nazw dla logiki i przyszłego UI.
 * QUIZ-SPEC 2.1, PROJECT 7.1.
 */

export interface CriterionDef {
  id: CriterionId;
  group: GroupId;
  label: string;
  description: string;
}

export interface GroupDef {
  id: GroupId;
  label: string;
  description: string;
  criteria: CriterionId[];
}

export const CRITERIA: readonly CriterionDef[] = [
  { id: 'battery', group: 'battery', label: 'Czas pracy na baterii', description: 'Pojemność i wyniki testów wytrzymałości.' },
  { id: 'charging', group: 'battery', label: 'Ładowanie', description: 'Moc, czas do 50% i 100%, ładowanie bezprzewodowe.' },
  { id: 'photoDay', group: 'camera', label: 'Zdjęcia w dzień', description: 'Jakość głównego aparatu na zewnątrz.' },
  { id: 'photoIndoor', group: 'camera', label: 'Zdjęcia w domu', description: 'Słabe światło, szum, stabilizacja.' },
  { id: 'photoMotion', group: 'camera', label: 'Zdjęcia w ruchu', description: 'Autofokus i ostrość przy ruchomych obiektach.' },
  { id: 'selfie', group: 'camera', label: 'Selfie', description: 'Aparat przedni.' },
  { id: 'video', group: 'camera', label: 'Filmy rodzinne', description: 'Rozdzielczość, stabilizacja, dźwięk.' },
  { id: 'zoom', group: 'camera', label: 'Zoom', description: 'Teleobiektyw i jakość przybliżenia.' },
  { id: 'storage', group: 'storage', label: 'Pamięć', description: 'Pojemność, microSD jako bonus.' },
  { id: 'updates', group: 'longevity', label: 'Wsparcie aktualizacjami', description: 'Lata aktualizacji systemu i poprawek.' },
  { id: 'durability', group: 'longevity', label: 'Odporność', description: 'Klasa IP, szkło, konstrukcja.' },
  { id: 'display', group: 'smooth', label: 'Ekran', description: 'Jasność w słońcu, płynność, jakość.' },
  { id: 'smoothness', group: 'smooth', label: 'Płynność na co dzień', description: 'Przeglądarka, komunikatory, aplikacje.' },
  { id: 'value', group: 'price', label: 'Stosunek jakości do ceny', description: 'Liczony z ceny i budżetu sesji.' },
] as const;

export const GROUPS: readonly GroupDef[] = [
  {
    id: 'battery',
    label: 'Bateria i ładowanie',
    description: 'Jak długo telefon działa i jak szybko wraca do pełni.',
    criteria: ['battery', 'charging'],
  },
  {
    id: 'camera',
    label: 'Aparat',
    description: 'Zdjęcia w dzień, w domu, w ruchu, selfie, filmy i przybliżanie.',
    criteria: ['photoDay', 'photoIndoor', 'photoMotion', 'selfie', 'video', 'zoom'],
  },
  {
    id: 'storage',
    label: 'Pamięć',
    description: 'Ile zdjęć i filmów zmieści się w telefonie.',
    criteria: ['storage'],
  },
  {
    id: 'longevity',
    label: 'Aktualizacje i trwałość',
    description: 'Lata wsparcia oraz odporność na wodę i upadki.',
    criteria: ['updates', 'durability'],
  },
  {
    id: 'smooth',
    label: 'Ekran i płynność',
    description: 'Jasność w słońcu, płynność obrazu i szybkość działania.',
    criteria: ['display', 'smoothness'],
  },
  {
    id: 'price',
    label: 'Cena',
    description: 'Opłacalność względem budżetu sesji.',
    criteria: ['value'],
  },
] as const;

export const CRITERION_IDS: readonly CriterionId[] = CRITERIA.map((criterion) => criterion.id);
export const GROUP_IDS: readonly GroupId[] = GROUPS.map((group) => group.id);

const criterionById = new Map<CriterionId, CriterionDef>(
  CRITERIA.map((criterion) => [criterion.id, criterion]),
);
const groupById = new Map<GroupId, GroupDef>(GROUPS.map((group) => [group.id, group]));

export function criterion(id: CriterionId): CriterionDef {
  const found = criterionById.get(id);
  if (!found) throw new Error(`Nieznane kryterium: ${String(id)}`);
  return found;
}

export function group(id: GroupId): GroupDef {
  const found = groupById.get(id);
  if (!found) throw new Error(`Nieznana grupa: ${String(id)}`);
  return found;
}

export function groupOf(id: CriterionId): GroupId {
  return criterion(id).group;
}

export function labelOf(id: CriterionId): string {
  return criterion(id).label;
}

export function groupLabel(id: GroupId): string {
  return group(id).label;
}
