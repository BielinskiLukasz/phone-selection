# Etap 2 — Silnik rankingu (czysta logika + testy)

**Cel:** w pełni przetestowana logika wyliczania wag, wyników, rankingu i danych anonimowej karty, bez interfejsu.
**Zależności:** etap 1 (szkielet, Vitest); dane z etapu 0.
**Dokumenty:** [QUIZ-SPEC.md](../specs/QUIZ-SPEC.md) (cały), [UI-SPEC.md](../specs/UI-SPEC.md) (sekcja 4), [PROJECT.md](../../PROJECT.md) (sekcje 7, 8, 13).

## Zakres

- **W zakresie:** typy, definicje kryteriów i grup, dane pytań (`questions.ts`), obliczanie wag, normalizacja, ranking, pula i wypełnianie, remisy, generowanie faktów karty, testy person i testy wycieku nazw.
- **Poza zakresem:** jakikolwiek komponent React, zapis w przeglądarce.

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E2-01 | Typy: `Phone`, `PhoneScores`, `Price`, `CriterionId`, `GroupId`, `QuizQuestion`, `QuizOption`, `Filters`, `Weights`, `RankedPhone` (QUIZ-SPEC, sekcja 3) | `src/types/*` |
| E2-02 | `data/criteria.ts`: kryteria, grupy, etykiety, opisy | jedno źródło nazw |
| E2-03 | `data/questions.ts`: 18 pytań z sekcji 4 QUIZ-SPEC (treść, opcje, wartości, `why`, `appliesWhen`, `inShortQuiz`) plus krok G1 | dane quizu |
| E2-04 | `lib/scoringConfig.ts`: `BLEND`, ważności grup w trójce (5/4/3), wzór grup poza trójką, domyślna waga, próg remisu | stałe w jednym miejscu |
| E2-05 | `lib/weights.ts`: `answersToCriterionWeights(answers)`, `groupImportance(weights, topThree)`; obsługa „pomiń” i braku odpowiedzi | wagi z odpowiedzi |
| E2-06 | `lib/pool.ts`: pula (cena ≤ 2000, filtr pamięci), `countPool(filters)` | pula kandydatów |
| E2-07 | `lib/scoring.ts`: `value` z budżetu, normalizacja min-max z mieszaniem, `GroupScore`, `S`, ranking, remisy, karty z wypełnieniem powyżej budżetu | `rank(session)` |
| E2-08 | `lib/anonymize.ts`: `toAnonCard(phone, ranked)` zwraca tylko dozwolone pola; fakty cechy wg UI-SPEC sekcja 4; klasa wydajności z `smoothness` | dane karty bez nazw |
| E2-09 | `lib/matchDisplay.ts`: wybrany sposób pokazywania „% dopasowania” (decyzja z QUIZ-SPEC sekcja 10) | funkcja formatująca |
| E2-10 | Walidator danych w teście: `phones.json` zgodny z typami (współdzielony z `validate-data`) | test schematu |
| E2-11 | Persony testowe: `tests/personas.ts` (żona, aparat, bateria) i testy z QUIZ-SPEC, sekcja 9 | niezmienniki zielone |
| E2-12 | Test wycieku: przeszukanie rekurencyjne obiektu karty pod kątem nazwy, marki, nazwy modelu i tokenów chipów (lista budowana z `reveal` i `specs.chip`) | brak wycieków |

## Testy akceptacyjne

1. **Gdy** wszystkie odpowiedzi to „pomiń”, **to** wagi kryteriów = 2, a ważności grup = 1,3 (jednakowe).
2. **Gdy** dwa kryteria w tej samej grupie mają wagi 5 i 1, **to** udziały wynoszą 5/6 i 1/6.
3. **Gdy** dwa telefony mają identyczne oceny, **to** wyższy jest tańszy.
4. **Gdy** budżet to 1500 zł, **to** wynik zawiera dwa telefony w budżecie i jeden z flagą `overBudgetBy`.
5. **Gdy** filtr „min. 256 GB” jest włączony, **to** żaden telefon 128 GB nie występuje w puli ani w rankingu.
6. **Gdy** uruchomię persony z QUIZ-SPEC 9, **to** wszystkie niezmienniki (9.1-9.4) przechodzą.
7. **Gdy** wygeneruję kartę anonimową dla każdego telefonu, **to** test wycieku nie znajduje żadnej nazwy, marki ani modelu.
8. **Gdy** oceny mają `null` w `value`, **to** silnik nie zawiesza się i oblicza `value` z ceny.

## Ryzyka i otwarte pytania

- **Kalibracja** `BLEND` i sposobu pokazywania procentu: decyzja tutaj, po testach na personach (QUIZ-SPEC 10.1).
- **Tokeny chipów w teście wycieku** trzeba utrzymywać razem z danymi (nowy telefon = nowe tokeny).
- Zmiana ocen w `phones.json` może zmienić referencyjne wyniki person; testy sprawdzają niezmienniki, nie liczby.

## Definicja ukończenia

Moduły w `src/lib` pokryte testami kluczowych ścieżek (pokrycie linii ≥ 90% w `lib/`), persony zielone, test wycieku zielony, brak zależności od Reacta w `src/lib`.
