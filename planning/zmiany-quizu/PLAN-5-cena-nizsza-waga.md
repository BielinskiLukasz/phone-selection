# Plan 5 — cena może ważyć mniej niż neutralnie

Najpierw przeczytaj `README.md` w tym katalogu (zasady wspólne).

## Problem

F1 ustawia `value` na: `F1-a` (do 1500 zł, twardo) 5, `F1-b` (do 1800) 3, `F1-c` (do 2000, jeśli warto) 2,
`F1-d` (najlepiej 1500, dopłacę do 1800) 4. Najniższa wartość (2) równa się wadze neutralnej
(`DEFAULT_WEIGHT`), więc żadna odpowiedź nie obniża ważności grupy Cena poniżej startu neutralnego
(1,3). Ktoś, kto wyraźnie mówi „cena nie gra roli, jeśli telefon jest wart”, nie może tego wyrazić.

## Decyzje (przyjęte)

- **Bez nowej opcji:** `tests/questions.test.ts` dopuszcza maks. 4 opcje poza „pomiń”, a F1 już je ma.
  Zmieniamy wartość istniejącej opcji.
- `F1-c`: `value` **2 → 1**. Ważność grupy Cena poza trójką spada z 1,3 do 0,5 + 0,4 × 1 = **0,9**.
  Alternatywa 0,5 (→ 0,7) jest mocniejsza; zacznij od 1 i zmień tylko, jeśli kalibracja każe.
- **Nie** używamy 0: waga 0 przy odpowiedzianej grupie jednokryterialnej = „ignoruj cenę” (patrz Plan 1,
  reguła zerowej grupy), a „jeśli warto” nie znaczy „cena zupełnie bez znaczenia”. Budżet 2000 zł i
  tak zostaje twardym limitem.
- Kolejność wartości po zmianie: a 5 › d 4 › b 3 › c 1 (monotoniczna względem „jak twardy budżet”).

## Pliki

- `src/data/questions.ts` — opcja `F1-c` (ok. l. 272): `sets: { value: 1 }`.
- `planning/QUIZ-SPEC.md` — sekcja 4, wiersz F1: spec ma 3 opcje (1500/1800/2000 → 5/3/2); zaktualizuj do
  stanu kodu: 4 opcje (z `F1-d`) i `F1-c` → `value` 1.
- `planning/ETAP-12-zmiany-rankingu.md` — jeśli opisuje wartości F1, dopisek o planie 5.

## Kroki

1. Zmień `F1-c`.
2. `grep -rn "F1-c\|value: 2" src tests` — znajdź założenia o wartości 2.
3. Zaktualizuj dokumenty.
4. Tymczasowy test `tests/tmp-plan5.test.ts` (usuń po użyciu): `answersToCriterionWeights({F1:'F1-c'}).value`
   = 1; `groupImportance(...).price` (bez trójki) = 0,9; przy trójce `['battery','price','longevity']`
   (persona BATTERY) cena = 4 + 0,3 × (0,9 − 1,3) = 3,88. Wypisz też top 3 dla WIFE, CAMERA, BATTERY
   przed i po (`git stash` lub porównanie z wynikami z README/QUIZ-SPEC §9) i zapisz różnice.
5. `npx tsc --noEmit`, `npx vitest run`; różnice względem bazy → `TESTY-DO-NAPRAWY.md`, „Plan 5”.

## Spodziewane skutki w testach

- `tests/weights.test.ts` l. 104 (komentarz „price: value 2 z odpowiedzi F1 → 1,3”) i powiązane
  oczekiwania ważności grup: 1,3 → 0,9.
- Persony używają `F1-c` — **wszystkie trzy** zmienią ważność ceny; sprawdź niezmienniki §9
  (`persona.test.ts`, `calibration.test.ts`). Jeśli top 3 persony „żona” się zmieni, wróć tu i rozważ 1,5
  zamiast 1 (zamiast poprawiać test).
- Komentarz `F1: 'F1-c', // do 2000 zł → value 2` w `tests/personas.ts` → 1.

## Testy do dopisania (sesja końcowa)

`F1-c` → `value` 1 i cena poza trójką < 1,3; kolejność wartości F1 (a › d › b › c).

## Poza zakresem

Dodanie opcji F1, zmiana `VALUE_FLOOR`, wzoru `valueScore`, budżetów, `budgetStretch`.

Sugerowany komunikat: `feat(quiz): lower price weight for flexible budget`
