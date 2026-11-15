import { CRITERION_IDS, GROUP_IDS } from '../types/criteria';
import type { CriterionId, GroupId } from '../types/criteria';

export { CRITERION_IDS, GROUP_IDS };

export const CRITERIA: Record<CriterionId, { label: string; description: string }> = {
  battery: { label: 'Czas pracy', description: 'Bateria w codziennym użytkowaniu.' },
  charging: { label: 'Ładowanie', description: 'Szybkość i wygoda ładowania.' },
  photoDay: { label: 'Zdjęcia w dzień', description: 'Zdjęcia na zewnątrz.' },
  photoIndoor: { label: 'Zdjęcia w domu', description: 'Zdjęcia przy słabym świetle.' },
  photoMotion: { label: 'Zdjęcia w ruchu', description: 'Ostrość ruchomych obiektów.' },
  selfie: { label: 'Selfie', description: 'Jakość przedniego aparatu.' },
  video: { label: 'Filmy', description: 'Obraz, stabilizacja i dźwięk.' },
  zoom: { label: 'Przybliżenie', description: 'Zdjęcia z większej odległości.' },
  storage: { label: 'Pamięć', description: 'Miejsce na zdjęcia i filmy.' },
  updates: { label: 'Aktualizacje', description: 'Długość wsparcia systemu.' },
  smoothness: { label: 'Płynność', description: 'Szybkość codziennych aplikacji.' },
  display: { label: 'Ekran', description: 'Czytelność i jakość wyświetlania.' },
  durability: { label: 'Odporność', description: 'Ochrona przed wodą i zużyciem.' },
  value: { label: 'Opłacalność', description: 'Cena względem budżetu.' },
};

export const GROUPS: Record<GroupId, { label: string; description: string; criteria: readonly CriterionId[] }> = {
  battery: { label: 'Bateria i ładowanie', description: 'Dłuższe działanie bez ładowarki.', criteria: ['battery', 'charging'] },
  camera: { label: 'Aparat', description: 'Zdjęcia i filmy w różnych sytuacjach.', criteria: ['photoDay', 'photoIndoor', 'photoMotion', 'selfie', 'video', 'zoom'] },
  storage: { label: 'Pamięć', description: 'Miejsce na Twoje pliki.', criteria: ['storage'] },
  longevity: { label: 'Aktualizacje i trwałość', description: 'Telefon na dłużej.', criteria: ['updates', 'durability'] },
  smooth: { label: 'Ekran i płynność', description: 'Wygoda codziennego używania.', criteria: ['display', 'smoothness'] },
  price: { label: 'Cena', description: 'Dopasowanie do budżetu.', criteria: ['value'] },
};