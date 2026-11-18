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

Po zmianie: 14 z 415 testów pada (13 z bazy + 1 nowy; tymczasowy test planu 2 przeszedł i został usunięty).

| Plik | Test | Przyczyna |
|---|---|---|
| `fix-phase.test.ts` | FP3-03 / FP3-04 / FP3-06 › FP3-03: A3 ustawia charging 0,25 / 1,5 / 4… | oczekuje `A3-c` → `charging` 4 (l. 252); teraz 5 — zamierzona zmiana, poprawić oczekiwanie i tytuł testu |

## Plan 3 — agregacja max

(uzupełnia sesja planu 3)

## Plan 4 — opis odporności

Brak nowych niezgodności. Po zmianie: 16 z 414 testów pada = 13 z bazy + 1 z planu 2 (`fix-phase` FP3-03)
+ 2 z planu 5 (`weights`, `sliders-screen`). Żaden test nie porównywał starych opisów.

## Plan 5 — cena niższa waga

Po zmianie (pełny bieg): 17 z 414 testów pada. Z tego 13 z bazy + 1 z planu 2 + 2 z planu 5 oraz 1 test
z bazy, który tym razem przeszedł (`a11y-audit`, motyw jasny) — patrz uwaga niżej.

| Plik | Test | Przyczyna |
|---|---|---|
| `weights.test.ts` | E2-05 · ważności grup › trójka najważniejszych: pasma 5/4/3 skorygowane siłą odpowiedzi | oczekuje opisu „1,3 z 5, mało ważne” dla ceny (l. 104, komentarz „value 2 → 1,3”); teraz 0,9 — zamierzona zmiana |
| `sliders-screen.test.ts` | E5-06/E5-07 · hybryda i dostrojenie › 3. po krótkim quizie suwaki mają wartości wyliczone przez silnik | oczekuje ważności ceny 1,3 (z `F1-c` → `value` 2); teraz 0,9 — zamierzona zmiana |

Uwagi:

- `ranking-screen.test.ts` (2 testy) padły w pełnym biegu, ale przechodzą po uruchomieniu osobno — wygląda
  na niestabilność przy obciążeniu (limity czasu), nie na skutek planu 5. Do potwierdzenia w sesji końcowej.
- Komentarz `F1: 'F1-c', // do 2000 zł → value 2` w `tests/personas.ts` (l. 39) → zmienić na 1 (nie ruszano
  w trakcie planu, zasada 1 README).
- Persony: top 3 bez zmian (pula referencyjna: żona Note 17 Pro 69,4 · POCO F7 68,6 · Edge 70 Fusion 68,0;
  aparat 15T 73,3 · POCO F7 68,2 · Edge 60 Neo 68,1; bateria POCO F7 68,1 · Note 17 Pro 67,1 · Note 15 Pro
  65,8). Pełna pula: u „aparatu” 15T (75,1) i Edge 60 Pro (74,9) zamieniły się miejscami #1/#2.
- Ważność ceny: poza trójką 1,3 → 0,9; przy trójce `['battery','price','longevity']` 4 → 3,88.
