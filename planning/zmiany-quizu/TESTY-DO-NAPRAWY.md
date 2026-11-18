# Testy do naprawy

Rejestr prowadzony w trakcie planów 1–5; naprawa w sesji końcowej (patrz `README.md`).

## Baza — padało PRZED planami (18.11.2026, 13 testów z 414)

Przyczyny nie zdiagnozowane (hipoteza w `README.md`).

| Plik | Test |
|---|---|
| `a11y-audit.test.ts` | test akceptacyjny 3 · audyt axe w obu motywach › motyw jasny: wszystkie ekrany bez błędów poważnych i krytycznych |
| `calibration.test.ts` | E9-03 / E10 › przy BLEND 0,5 rozstęp wyników jest wyraźny, ale nie przerysowany |
| `calibration.test.ts` | E9-03 / E10 › 9.3 (persona „bateria” stawia na największą baterię 8340 mAh)… |
| `calibration.test.ts` | E9-03 / E10 › odpowiedzi „pomiń” dają wynik ogólny, a skrajne suwaki — maksymalny rozstęp |
| `calibration.test.ts` | E9-03 / E10 › skonfigurowana wartość to 0,5, a próg remisu poprawnie odróżnia… |
| `exclusions.test.ts` | Etap 11 · testy akceptacyjne › 4. wykluczenie wszystkich marek blokuje „Dalej”… |
| `fix-phase.test.ts` | FP1-02 / FP1-06 / FP1-08 › realme 16 Pro+: ostrzeżenie o linku bez członu „plus”… |
| `persona.test.ts` | 9.2 i 9.3 › persona „bateria” stawia na telefon z największą baterią (8340 mAh) |
| `phones-schema.test.ts` | schemat danych phones.json przechodzi walidację bez błędów |
| `phones-schema.test.ts` | schemat danych › każdy rekord ma kształt typu Phone |
| `phones-schema.test.ts` | po potwierdzeniu oferty (A1) nie ma rekordów `needs_confirmation` |
| `release-guard.test.ts` | strażnik wydania › żaden rekord nie czeka na potwierdzenie |
| `sliderModel.test.ts` | E5-05/E5-08 › suwaki „bateria 5, reszta 0” dają ranking identyczny z wyliczeniem silnika |

## Plan 1 — waga 0

(uzupełnia sesja planu 1: nowe niezgodności względem bazy)

## Plan 2 — ładowanie max 5

(uzupełnia sesja planu 2)

## Plan 3 — agregacja max

(uzupełnia sesja planu 3)

## Plan 4 — opis odporności

(uzupełnia sesja planu 4)

## Plan 5 — cena niższa waga

(uzupełnia sesja planu 5)
