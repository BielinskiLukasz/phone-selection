# Etap 3 — Sesje i zapis w przeglądarce

**Cel:** trwały, wersjonowany stan aplikacji (sesje, odpowiedzi, wybory, motyw) oparty o `localStorage`, odporny na błędy.
**Zależności:** etap 2 (typy i funkcje rankingu).
**Dokumenty:** [PROJECT.md](../../PROJECT.md) (sekcja 9), [QUIZ-SPEC.md](../specs/QUIZ-SPEC.md) (sekcja 7), [UI-SPEC.md](../specs/UI-SPEC.md) (sekcja 10).

## Zakres

- **W zakresie:** model `AppState`/`Session`, magazyn z wersjami i migracjami, reducer i kontekst React, akcje na sesjach, snapshoty rankingu, tryb awaryjny (pamięć), synchronizacja kart przeglądarki.
- **Poza zakresem:** ekrany historii (etap 7), link do wznowienia (etap 7).

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E3-01 | Typy `AppState`, `Session`, `Pick`, `SessionStatus`, `Mode` (PROJECT.md 9, QUIZ-SPEC 7) | `src/types/state.ts` |
| E3-02 | `lib/storage.ts`: klucz `wybor-telefonu:v1`, odczyt i walidacja kształtu, zapis z opóźnieniem (debounce ok. 300 ms) i natychmiastowy przy `visibilitychange` | trwały zapis |
| E3-03 | Migracje: tablica `migrations[version]`, test migracji z przykładowego starego kształtu | gotowe na zmiany |
| E3-04 | Obsługa błędów: brak `localStorage` (tryb pamięci + flaga `persistent=false`), uszkodzony JSON (kopia pod `wybor-telefonu:backup`, stan pusty), przekroczony limit (komunikat) | brak awarii |
| E3-05 | Reducer: `createSession(mode)`, `answerQuestion`, `setTopThree`, `setFilters`, `overrideWeights`, `computeRanking`, `addPick`, `setStatus`, `deleteSession`, `setTheme` | czyste przejścia stanu |
| E3-06 | `computeRanking` zapisuje snapshot: ranking z wynikami `S`, `dataVersion` (z `_meta.generatedOn`), wagi i ważności grup | stabilne wyniki w historii |
| E3-07 | `StateProvider` + hooki `useSessions`, `useActiveSession` | dostęp w komponentach |
| E3-08 | Synchronizacja kart: zdarzenie `storage`, strategia „ostatni zapis wygrywa”, odświeżenie stanu | brak rozjazdów |
| E3-09 | Limit sesji (np. 50 najnowszych), komunikat przy przycięciu | kontrola rozmiaru |
| E3-10 | `useReveal(session)`: zbiór odsłoniętych telefonów i numer wyboru (`n/m`) | logika plakietek |

## Testy akceptacyjne

1. **Gdy** utworzę sesję, odpowiem na dwa pytania i odświeżę stronę, **to** odpowiedzi są zachowane.
2. **Gdy** w `localStorage` wpiszę niepoprawny JSON, **to** aplikacja startuje z pustym stanem, kopia surowych danych istnieje pod kluczem zapasowym i widać komunikat.
3. **Gdy** `localStorage` zgłasza błąd przy zapisie, **to** aplikacja działa w pamięci i pokazuje baner z UI-SPEC sekcja 9.
4. **Gdy** otworzę stronę w dwóch kartach i zmienię odpowiedź w jednej, **to** druga karta po zdarzeniu `storage` pokazuje nowy stan.
5. **Gdy** dodam dwa wybory w sesji, **to** `useReveal` zwraca `1/2` i `2/2` w kolejności dodania.
6. **Gdy** zmienię `phones.json` po zapisaniu rankingu, **to** snapshot w starej sesji pozostaje bez zmian.
7. **Gdy** wczytam stan o starszej wersji schematu, **to** migracja przekształca go bez utraty sesji.

## Ryzyka i otwarte pytania

- Pojemność `localStorage` (ok. 5 MB) jest wystarczająca; snapshot rankingu zawiera tylko identyfikatory i liczby.
- Identyfikatory sesji: `crypto.randomUUID()` z awaryjnym generatorem dla starszych przeglądarek.
- Prywatność: stan zawiera tylko odpowiedzi, bez danych osobowych.

## Definicja ukończenia

Testy jednostkowe magazynu i reducera zielone; odświeżenie strony nie gubi postępu; uszkodzony zapis nie wywraca aplikacji.
