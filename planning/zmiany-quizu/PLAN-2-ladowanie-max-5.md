# Plan 2 — ładowanie: najwyższa odpowiedź A3 daje 5

Najpierw przeczytaj `README.md` w tym katalogu (zasady wspólne).

## Problem

A3 („Jak zwykle ładujesz telefon?”) mapuje na `charging`: 0,25 / 1,5 / **4**. Kryterium `charging` nigdy
nie dochodzi do 5, więc nawet „często potrzebuję szybkiego doładowania” nie daje maksymalnej wagi.
Dolne 0,25 było świadome (FP3-03, `ETAP-13`); strop 4 nie ma uzasadnienia w dokumentach.

## Decyzje (przyjęte)

- `A3-c` (`Często potrzebuję szybkiego doładowania`): `charging` **4 → 5**.
- `A3-a` (0,25) i `A3-b` (1,5) **bez zmian**. Rozstęp 1,5 → 5 jest nierówny; ewentualne podniesienie
  `A3-b` do 2,5 to osobna decyzja — jeśli chcesz ją podjąć, zrób to na początku sesji i dopisz do planu.

## Pliki

- `src/data/questions.ts` — opcja `A3-c` (ok. l. 78): `sets: { charging: 5 }`; zaktualizuj komentarz
  FP3-03 (dopisz: „plan 2, 18.11.2026: ‘często’ = 5, sufit skali”).
- `planning/QUIZ-SPEC.md` — wiersz A3 w sekcji 4: obecnie `1 · 3 · 5` (nieaktualne) → `0,25 · 1,5 · 5`.
- `planning/ETAP-13-uwagi-z-review.md` — wiersz FP3-03: `„często” → 4` → `→ 5` (dopisek o planie 2).

## Kroki

1. Zmień `A3-c` w `questions.ts` i komentarz.
2. `grep -rn "A3-c\|charging: 4" src tests` — sprawdź, czy coś zakłada wartość 4.
3. Zaktualizuj `QUIZ-SPEC.md` i `ETAP-13`.
4. Tymczasowy test `tests/tmp-plan2.test.ts` (usuń po użyciu): `answersToCriterionWeights({A3:'A3-c'}).charging`
   = 5; grupa `battery` przy `A1-b, A2-b, A3-c` → `groupImportance.battery` = 0,5 + 0,4 × (3 + 5) / 2 = 2,1
   (wcześniej 1,9 przy 4).
5. `npx tsc --noEmit`, `npx vitest run`; różnice względem bazy do `TESTY-DO-NAPRAWY.md` → „Plan 2”.

## Spodziewane skutki w testach

Persony używają `A3-a`, więc rankingi person nie powinny się zmienić. Sprawdź `sliders-screen`,
`quiz-screen`, `app.test.ts` pod kątem scenariuszy klikających „często potrzebuję szybkiego doładowania”.
Niezmiennik FP3-03 (persona „żona”: `charging` ≤ waga `photoMotion`) zostaje prawdziwy.

## Testy do dopisania (sesja końcowa)

`A3-c` → `charging` 5 (granica skali); `A3-a` → 0,25.

## Poza zakresem

Zmiana `A3-a`/`A3-b`, formuły ładowania w `scoringRules.ts`, ocen w `phones.json`.

Sugerowany komunikat: `feat(quiz): let fast charging answer reach weight 5`
