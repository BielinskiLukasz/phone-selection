# E12 — dziennik zmian rankingu i „bramka kandydata” (FIX-PHASE §1.2)

> Nazwa pliku zgodna z `FIX-PHASE.md` (w ROADMAP faza poprawkowa to **etap 13**, bo numer 12 zajęła poręczność).
> Każda zmiana w `scoringConfig.ts`, `scoringRules.ts`, `questions.ts`, `weights.ts` albo w ocenach `phones.json`
> ma tu wpis: co, dlaczego, wynik person, wynik na sesji użytkowniczki, i czy zmieniła jej top 3.

## Procedura (bramka kandydata)

1. `npm test` — testy person (`tests/persona.test.ts`), kalibracji (`tests/calibration.test.ts`) i reguł (`tests/score-rules.test.ts`) zielone.
2. `tests/user-session.test.ts` — porównuje karty ze snapshotu sesji użytkowniczki (`tests/fixtures/user-session.json`, FP0-02) z aktualnym algorytmem. **Dopóki fixture jest placeholderem, testy bramki są pomijane** — to jawne ryzyko, nie zielone światło.
3. Jeśli top 3 się zmienia → wpis poniżej (przed / po, powód) i **rozmowa z użytkowniczką**; snapshot jej sesji zostaje nietknięty (PROJECT 9).

## Wpisy

| Data | Zmiana | Pliki | Persony (żona / aparat / bateria) | Sesja użytkowniczki | Top 3 zmienione? |
|---|---|---|---|---|---|
| 16.11.2026 (tura 2) | **FP3-05 budżet elastyczny** — nowa, czwarta opcja F1 (`budgetMax: 1500`, `budgetStretch: 1800`, `value: 4`) i dobór kart w paśmie dopłaty (`selectCardsFromFullRanking`); **FP3-02** plakietka kompromisu (bez wpływu na S). Oceny, wagi istniejących opcji i normalizacja bez zmian. | `questions.ts` (+1 opcja), `weights.ts` (`budgetStretchFromAnswers`), `exclusions.ts`, `scoring.ts`, `anonymize.ts` | persony (F1-c) bez zmian: żona vivo 66,8 / Edge 70 Fusion 66,6 / Note 17 Pro 65,0 (stan po etapie 12 w repo); „żona” z F1 elastycznym: Edge 60 59,7 · Redmi Note 15 Pro 54,9 · vivo 61,9 (+400 zł, +2,2 pkt) | fixture niedostępny (FP0-02) | nie (nowa opcja; istniejące odpowiedzi dają te same karty) |
| 16.11.2026 | **Faza FP1-FP2: brak zmian w ocenach, wagach i pytaniach.** Dodane tylko pola danych (`promoEndsAt`, `regularPricePln`, `userNote/auditNote`, metadane linków, `securitySupportUntil`) i zmiany UI/przepływu (wykluczenia jako opcja, blokada rankingu przed wyborem, etykiety). | `phones.json` (pola nieoceniane), ekrany | bez zmian: żona #1 Redmi Note 17 Pro / #2 Edge 70 Fusion (remis), aparat 15T, bateria Note 17 Pro (stan z etapu 12) | fixture niedostępny (FP0-02) | nie |

## Zmiany w kolejce (każda wymaga pomiaru na sesji użytkowniczki przed scaleniem)

| ID | Zmiana | Oczekiwany wpływ | Status |
|---|---|---|---|
| FP3-02 | plakietka „Wyraźny kompromis w Twoim priorytecie” | Redmi Note 17 Pro (aparat 62 przy wadze 5) u „żony” | **zrobione — tylko plakietka, bez kary (decyzja użytkownika)** |
| FP3-03 | `charging` z A3: „na noc” 0,25 / „czasem” 1,5 / „często” 4; domyślna waga 1 | vivo V70 FE vs Edge 70 Fusion | czeka |
| FP3-04 | C3 microSD jako bonus (+15 pkt `storage` tylko dla `microSd: true`) zamiast wagi 5 | Edge 60 | czeka |
| FP3-05 | budżet elastyczny „do 1500, dopłacę jeśli warto” | skład kart u „żony” | **zrobione** jako czwarta opcja F1 i segment filtrów; „domyślny” = zalecany w pytaniu (kolejność opcji do przeglądu w FP3-11) |
| FP3-07 | `storage` 128/256/512 = 40/82/100 | Pixele vs 256 GB | czeka |
| FP4-01 | `batteryEndurance` jedną miarą (EPREL → Active Use → PCMark) | Nord 5 31 vs Honor 400 44; Redmi Note 15 Pro ręczne 50 | po zakupie, chyba że kandydat zależy |
| FP4-02 | aparaty z recenzji zamiast „z wersji Pro −10” | 15T, Edge 70 Fusion, Redmi, Nothing, realme | po zakupie |
| FP4-03 | `updates` = pozostałe wsparcie od daty zakupu (`securitySupportUntil`, dane już w 12/15 rekordach) | Edge 60 (do 04.2029) w dół | po zakupie |
| FP4-05 | IP66/IP68 → 92 | Redmi Note 15 Pro, Redmi Note 17 Pro +4 pkt `durability` | po zakupie |
| D7 (etap 10) | `BLEND` 0,5 vs 0,25 | ścisłość niezmiennika 9.1.3 | zamknięte: po etapie 12 ścisłe 9.1.3 trzyma przy 0,5 |
