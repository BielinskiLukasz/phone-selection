# Plan 1 — najniższe odpowiedzi dają wagę 0 („bez znaczenia”)

Najpierw przeczytaj `README.md` w tym katalogu (zasady wspólne).

## Problem

Dziś tylko `compactness` (D4) może mieć wagę 0. Pozostałe kryteria mają minimum 1, a „pomiń” daje
neutralne 2. Użytkownik nie może powiedzieć „selfie mnie w ogóle nie obchodzi” — najwyżej „prawie nie”.

## Decyzje (przyjęte)

- **Bez nowych opcji.** F1 ma już 4 opcje, a `tests/questions.test.ts` dopuszcza maks. 4 opcje poza
  „pomiń”; poza tym pytania zostają. Zamiast dodawać opcję, **najniższa odpowiedź dostaje wartość 0**.
- Zakres: `B4-a` (selfie), `B5-a` (filmy), `B6-a` (zoom), `D2-a` (odporność), `E1-a` i `E2-a` (ekran).
  Zostają bez zmian: `B1-a`, `B2-a`, `B3-a` (zdjęcia dzień/dom/ruch — rdzeń aparatu, min. 1), A1/A2
  (bateria), C1, D1, D3.
- Etykiety bez zmian (`Prawie nigdy`, `Nie`, `Rzadko`) — id opcji stabilne.
- **Zabezpieczenie reguły „grupa = 0”** (`computedGroupImportance`): dziś grupa dostaje ważność 0, gdy
  średnia *odpowiedzianych* kryteriów ≤ 0. Po zmianie użytkownik, który odpowie tylko B4/B5/B6 „zero”
  i pominie B1–B3, wyzerowałby cały aparat. Zmieniamy warunek: **0 tylko gdy wszystkie kryteria grupy
  są odpowiedziane i średnia ≤ 0**; w pozostałych przypadkach zostaje wzór `0,5 + 0,4 × średnia`.

## Pliki

- `src/data/questions.ts` — wartości `sets` w 6 opcjach (`1` → `0`); dopisz komentarz „waga 0 = bez
  znaczenia (plan 1)” przy B4.
- `src/lib/weights.ts` — `computedGroupImportance`, warunek przy `return 0` (ok. l. 154–155) i komentarz.
- `planning/QUIZ-SPEC.md` — wiersze B4, B5, B6, D2, E1, E2 w sekcji 4 (pierwsza wartość `1` → `0`) oraz
  punkt 2.2.2 (reguła zerowej grupy).

## Kroki

1. `grep -rn "weights\[" src` i obejrzyj `src/lib/anonymize.ts`, `src/screens/CardsScreen.tsx`,
   `RankingScreen.tsx`, `src/components/TopThreePicker.tsx`, `src/features/sliders/sliderModel.ts`:
   czy któryś kod dzieli przez wagę, wybiera „najważniejsze kryteria” przez `> 0` albo zakłada
   minimum 1? Waga 0 musi być bezpieczna (suwaki już ją dopuszczają: `sliderLabelId` ma stan `ignore`).
2. Zmień wartości w `questions.ts`.
3. Zmień warunek w `computedGroupImportance`:
   `answeredInGroup.length === groupCriteria.length && mean <= 0`.
4. Zaktualizuj `QUIZ-SPEC.md`.
5. Tymczasowy test `tests/tmp-plan1.test.ts` (usuń po użyciu), który wypisze dla odpowiedzi:
   a) wszystkie sześć zmian na „-a” → `weights.selfie/video/zoom/durability/display === 0`;
   b) tylko B4-a, B5-a, B6-a → `groupImportance.camera` = 0,5 (`GROUP_BASE`, nie 0);
   c) D4-a (compactness 0) → `groupImportance.size === 0` jak dotąd.
6. `npx tsc --noEmit` (musi przejść), `npx vitest run`; nowe niezgodności względem bazy zapisz w
   `TESTY-DO-NAPRAWY.md` → sekcja „Plan 1”.

## Spodziewane skutki w testach (do naprawy w sesji końcowej)

- `tests/weights.test.ts` l. 36–37 (`E1-a` + `E2-c` → `display 3`): teraz 2,5.
- `tests/personas.ts`: persona **BATTERY** używa `B4-a, B5-a, B6-a, E1-a, E2-a`, a **CAMERA** `D2-a` —
  zmienią się wagi, możliwe zmiany w `persona.test.ts` i `calibration.test.ts` (9.3, 9.4).
- Możliwe zmiany w `sliders-screen.test.ts` i `sliderModel.test.ts` (wartości „wyliczone”).

## Testy do dopisania (sesja końcowa)

- Każda z 6 opcji daje wagę 0; `criterionShares` pomija kryterium z wagą 0 w grupie (udział 0).
- Grupa z częściowo zerowymi odpowiedziami nie jest zerowana; grupa z kompletem zer — tak.
- Persona „aparat”: ranking nie zależy od zerowej odporności bardziej, niż zakłada §9.2.

## Poza zakresem

Zmiana B1–B3, A1/A2, D1, D3 na 0. Nowe opcje „Nie ma znaczenia”. Kalibracja `BLEND`.

## Gotowe, gdy

`tsc` przechodzi; wagi z kroku 5 zgadzają się; `TESTY-DO-NAPRAWY.md` ma wypełnioną sekcję „Plan 1”;
README: zaznaczony Plan 1.

Sugerowany komunikat: `feat(quiz): allow zero weight for lowest answers`
