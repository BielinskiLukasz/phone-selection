# Zmiany quizu — 5 planów wdrożenia

Pochodzą z analizy pytań quizu (pokrycie obszarów, osiągalność wag 0 i 5). **Decyzja: pytania zostają**
(nie dodajemy ani nie usuwamy żadnego pytania, nie dodajemy opcji odpowiedzi). Zmieniamy tylko wartości
odpowiedzi, sposób agregacji wag i opisy.

Każdy plan jest samodzielny i wykonywany w osobnej, czystej sesji. Zacznij sesję od przeczytania
`CLAUDE.md` (repo) i tego pliku, potem właściwego planu.

| # | Plik | Zmiana | Ryzyko dla rankingu |
|---|---|---|---|
| 1 | `PLAN-1-waga-zero.md` | Najniższe odpowiedzi B4, B5, B6, D2, E1, E2 dają wagę 0 („bez znaczenia”) | wysokie (persony „bateria”, „aparat”) |
| 2 | `PLAN-2-ladowanie-max-5.md` | A3 „Często potrzebuję szybkiego doładowania” → 5 (było 4) | niskie |
| 3 | `PLAN-3-agregacja-max.md` | Kilka pytań o to samo kryterium (A1/A2, E1/E2): max zamiast średniej | niskie |
| 4 | `PLAN-4-opis-odpornosci.md` | Opisy `durability` zgodne z tym, co naprawdę liczymy (woda/pył) | brak (tylko teksty) |
| 5 | `PLAN-5-cena-nizsza-waga.md` | F1 „Do 2000 zł, jeśli warto” → `value` 1 (było 2) | średnie (grupa Cena poza trójką) |

**Kolejność zalecana:** 2 → 5 → 4 → 3 → 1 (od najmniej do najbardziej ryzykownej). Plany nie mają twardych
zależności, więc kolejność można zmienić; edytują różne linie `questions.ts` i różne wiersze `QUIZ-SPEC.md`.

## Zasady wspólne dla wszystkich planów

1. **Testów w trakcie planów nie naprawiamy** — to zadanie sesji końcowej (niżej). Po zmianie uruchom
   `npx tsc --noEmit` (musi przejść) oraz `npx vitest run`, a nowe niezgodności względem bazy zapisz w
   `TESTY-DO-NAPRAWY.md` w sekcji danego planu (nazwa pliku + nazwa testu + jednozdaniowa przyczyna).
2. **Nie commituj bez prośby.** Plan podaje sugerowany komunikat (format z `~/.claude/CLAUDE.md`).
3. **Identyfikatory opcji (`A3-c`, `B4-a`…) są stabilne** — nie zmieniamy kolejności ani liczby opcji.
   Opcje są zapisane w `localStorage` użytkowników jako `questionId → optionId`.
4. **Snapshoty sesji się nie zmieniają.** Karty i historia czytają zapisany ranking. Zmienia się tylko
   „wyliczone z odpowiedzi” (suwaki, przycisk „Przywróć wyliczone”) i nowe sesje. Fixture
   `tests/fixtures/user-session.json` ma `answers: {}`, więc go nie ruszamy.
5. **Dokumentacja:** aktualizujemy `planning/QUIZ-SPEC.md` w wierszach, których plan dotyczy. Spec jest
   częściowo nieaktualny (np. 6 grup zamiast 7, A3 = 1/3/5 zamiast 0,25/1,5/4, F1 bez opcji d) — przy okazji
   poprawiamy tylko dotykane wiersze; pełna synchronizacja spec ↔ kod to osobne zadanie.
6. Pliki UTF-8 z polskimi znakami: czytaj narzędziem Read (albo `Get-Content -Encoding UTF8`).
7. Wartości wag po zmianach sprawdzaj tymczasowym testem Vitest (`tests/tmp-*.test.ts`, usuń po użyciu) —
   alias `@/` działa w Vitest, a `npx tsx -e` może go nie rozwiązać.

## Stan bazowy testów (przed zmianami, 18.11.2026)

`npx tsc --noEmit`: OK. `npx vitest run`: **13 z 414 testów pada** w 8 plikach (lista w
`TESTY-DO-NAPRAWY.md`, sekcja „Baza”). Przyczyn nie diagnozowałem. Hipoteza: rekordy-kandydaci w
`phones.json` (status `needs_confirmation`/`unverified`, nowe modele ponad budżet) i powiększona pula
(24 modele) zmieniają kalibrację i persony. Błędy tej grupy nie pochodzą od planów 1–5.

## Sesja końcowa: naprawa testów

Wykonujemy dopiero po planach 1–5, w tej kolejności:

1. **Grupa B — wywołane planami.** Przejdź po sekcjach 1–5 w `TESTY-DO-NAPRAWY.md`. Dla każdego testu
   rozstrzygnij, czy to nowa, zamierzona wartość (popraw oczekiwanie i komentarz), czy sygnał, że zmiana
   zepsuła niezmiennik (wtedy wróć do planu i popraw kod, a nie test). Niezmienniki person z
   `QUIZ-SPEC.md` §9 mają zostać prawdziwe.
2. **Nowe testy** dla nowego zachowania (scenariusze są w sekcji „Testy do dopisania” każdego planu).
3. **Grupa A — baza (13 testów).** Najpierw zdiagnozuj przyczyny (osobno dane, osobno kalibracja/persony,
   osobno a11y w motywie jasnym). Dopiero potem naprawiaj. Zalecany osobny commit na grupę.
4. Pełny bieg: `npx tsc --noEmit`, `npx vitest run`, `npx vitest run --coverage --coverage.include='src/lib/**'`
   (≥ 90% linii), `npx tsx scripts/validate-data.ts`.

## Status

- [x] Plan 2   - [x] Plan 5   - [x] Plan 4   - [ ] Plan 3   - [ ] Plan 1   - [ ] Sesja końcowa (testy)
