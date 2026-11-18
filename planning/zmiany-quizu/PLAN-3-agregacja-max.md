# Plan 3 — wiele pytań o to samo kryterium: max zamiast średniej

Najpierw przeczytaj `README.md` w tym katalogu (zasady wspólne).

## Problem

`answersToCriterionWeights` uśrednia odpowiedzi dotyczące jednego kryterium. Dotyczy to dwóch kryteriów:

- `battery`: A1 (godziny przed ekranem) i A2 (dni bez ładowarki). „Ponad 6 h” (5) + „prawie nigdy bez
  ładowarki” (1) daje 3, choć ktoś siedzi w telefonie cały dzień.
- `display`: E1 (słońce) i E2 (oglądanie). Jasność = 5, oglądanie = 1 daje 3 — rozróżnienie znika.

Każda z tych odpowiedzi jest niezależnym powodem, żeby cenić kryterium, więc właściwa jest wartość
najwyższa.

## Decyzje (przyjęte)

- **Agregacja `max`** zamiast średniej, dla wszystkich kryteriów z wieloma odpowiedziami (obecnie
  dokładnie `battery` i `display` — zweryfikuj w kroku 1). „Pomiń” nadal nic nie wnosi: liczą się tylko
  odpowiedzi nie-pominięte.
- Przełącznik w `scoringConfig.ts` (`MULTI_ANSWER_AGGREGATION: 'max' | 'mean' = 'max'`), żeby kalibrację
  można było cofnąć jednym znakiem — tak jak `TOP_THREE_MODE`.
- **Odrzucone:** rozdzielenie `display` na dwa kryteria (jasność, jakość). Wymaga nowego `CriterionId`,
  nowych ocen dla 24 telefonów w `phones.json`, reguł w `scoringRules.ts` i migracji sesji; wykracza
  poza „zostaw pytania”.

## Pliki

- `src/lib/scoringConfig.ts` — nowa stała `MULTI_ANSWER_AGGREGATION` z komentarzem (data, powód).
- `src/lib/weights.ts` — w `answersToCriterionWeights` zamiast `average(values)` wywołaj funkcję
  `aggregate(values)` (max lub średnia wg stałej). `average` zostaje, bo używa jej
  `computedGroupImportance`.
- `planning/QUIZ-SPEC.md` — 2.2 pkt 1 („średnia wartości z odpowiedzi”), 2.6 (tabela parametrów: nowy
  wiersz), sekcja 4 blok E („Dla `display` liczymy średnią z E1 i E2”).
- `planning/PROJECT.md` — ok. l. 209 („waga to średnia z ich wartości”) — dopisek o zmianie.

## Kroki

1. Zweryfikuj, które kryteria mają >1 pytanie: w `questions.ts` zbierz klucze `sets` per kryterium
   (oczekiwane: `battery` ← A1, A2; `display` ← E1, E2; reszta po jednym; C3 i F1 nie ustawiają
   dwóch pytań na jedno kryterium).
2. Dodaj stałą i funkcję `aggregate`; podmień wywołanie.
3. Zaktualizuj `QUIZ-SPEC.md` i `PROJECT.md`.
4. Tymczasowy test `tests/tmp-plan3.test.ts` (usuń po użyciu): `A1-d + A2-a` → `battery` 5;
   `E1-c + E2-a` → `display` 5; samo `A1-b` → 3; `A1-b + A2-skip` → 3; persona WIFE
   (`A1-b, A2-b`, `E1-b, E2-b`) → te same wartości co przed zmianą (3 i 3).
5. `npx tsc --noEmit`, `npx vitest run`; różnice względem bazy → `TESTY-DO-NAPRAWY.md`, „Plan 3”.

## Spodziewane skutki w testach

- `tests/weights.test.ts` l. 36–37: „E1=1, E2=5 → display 3” → teraz 5 (zmienić oczekiwanie i opis).
- Persony WIFE, CAMERA i BATTERY mają identyczne odpowiedzi w parach A1/A2 i E1/E2, więc ich wagi
  się nie zmieniają — rankingi person powinny zostać (jeśli się zmienią, to znaczy, że Plan 1 jest już
  wdrożony albo coś jest nie tak).

## Testy do dopisania (sesja końcowa)

Pary rozbieżne (5 i 1 → 5), para z pominięciem, przełącznik `'mean'` przywraca dawne wartości.

## Poza zakresem

Rozdzielenie kryterium `display`, zmiana ważności grup (`computedGroupImportance` dalej liczy średnią
wag kryteriów w grupie), zmiany w pytaniach.

Sugerowany komunikat: `feat(weights): take max of multi-question answers`
