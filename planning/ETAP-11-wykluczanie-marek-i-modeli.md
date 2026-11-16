# Etap 11 — Wykluczanie marek i modeli (opcjonalny filtr startowy)

> **Status: ZAMKNIĘTY (16.11.2026).** Wszystkie zadania E11-01–E11-12 oraz testy akceptacyjne 1–9
> wdrożone i zielone (`tests/exclusions.test.ts`, audyt `axe-core` w obu motywach, test wycieku
> nazw w DOM przed i po kliknięciu „Pomiń”, migracja `v1 → v2` w `tests/storage.test.ts`).

**Cel:** na początku (przed pytaniami) użytkowniczka może opcjonalnie wykluczyć marki lub pojedyncze modele. Wykluczone telefony **nie trafiają do trzech kart**, ale **są widoczne w pełnym rankingu** (z oznaczeniem).
**Zależności:** etapy 2 (silnik), 3 (stan), 4-5 (tryby), 6 (karty), 9 (pełny ranking), 10 (pula 15 modeli).
**Dokumenty:** [QUIZ-SPEC.md](./QUIZ-SPEC.md) (sekcje 2.5, 8, 9.5), [UI-SPEC.md](./UI-SPEC.md) (sekcje 3.1a, 3.3, 3.4, 3.6, 3.7), [PROJECT.md](./PROJECT.md) (sekcje 5, 7.3, 8, 9, 13).

## Zatwierdzone decyzje produktowe

| # | Decyzja | Wdrożenie |
|---|---|---|
| 1 | Krok jest **opcjonalny i domyślnie pominięty**; działa w trybach quiz, suwaki i hybryda | `StartScreen` otwiera `#/s/:id/exclude` przy `exclusionsStep = 'pending'`; przełącznik domyślnie wyłączony |
| 2 | Wykluczać można **całe marki** (chipy z liczbą modeli) i **pojedyncze modele** (lista rozwijana, pogrupowana wg marki) | `ExclusionPicker` + `ExclusionSheet` (9 marek, 15 modeli z ustandaryzowanych pól `brand` i `modelName`) |
| 3 | **Ranking i normalizacja liczone na pełnej puli.** Wykluczenie zmienia tylko dobór kart, nie wyniki pozostałych | `scoreRanges(pool)` i `fullRanking` w `src/lib/scoring.ts`; `applyExclusionsToSnapshot` w `sessionReducer.ts` |
| 4 | Numer „Propozycja #n” na karcie liczony wśród niewykluczonych (1-3), w pełnym rankingu pokazujemy **miejsce ogólne** | `selectCardsFromFullRanking` nadaje kartom `place: 1..k`, a `fullRanking` trzyma miejsca 1..N |
| 5 | Wykluczone telefony w pełnym rankingu: wyszarzone, plakietka „Wykluczony (marka)” / „Wykluczony (model)”, szczegóły i „Uwzględnij ponownie” | `src/screens/RankingScreen.tsx` + `includePhoneAgain` (działa też dla modelu z wykluczonej marki) |
| 6 | Krok **ujawnia nazwy marek i modeli z puli** (bez ich cech i cen). Pokazujemy informację i przycisk **Pomiń** | `src/data/exclusionCatalog.ts` ładowany dynamicznie dopiero po włączeniu przełącznika |
| 7 | Nie można wykluczyć wszystkiego (blokada przy 0 telefonów); gdy zostają 1-2 — ostrzeżenie | `validateExclusions` w `src/lib/exclusions.ts`, zablokowany przycisk „Dalej” / „Zapisz wykluczenia” |
| 8 | Wykluczenie marki obejmuje również telefony tej marki dodane do danych w przyszłości | `exclusionReason` porównuje `brand` bez rozróżniania wielkości liter |

## Zrealizowane zadania

| ID | Zadanie | Pliki | Status |
|---|---|---|---|
| E11-01 | `Filters`: `excludedBrands`, `excludedPhoneIds`; `Session`: `exclusionsStep: 'pending' \| 'done'`; migracja `SCHEMA_VERSION` `1 → 2` z testem | `src/types/ranking.ts`, `src/types/state.ts`, `src/lib/session.ts`, `src/lib/storage.ts`, `tests/storage.test.ts` | `[x]` |
| E11-02 | Ustandaryzowane `brand` i `modelName` (bez marki) we wszystkich 15 rekordach `phones.json` + kontrola w `validate-data` | `src/data/phones.json`, `src/types/phone.ts`, `scripts/validate-data.ts`, `tests/validate-data.test.ts` | `[x]` |
| E11-03 | Moduł `src/lib/exclusions.ts`: `effectiveExcludedIds`, `remainingCount`, `validateExclusions`, `includePhoneAgain`, `selectCardsFromFullRanking`, `formatExclusionsSummary` | `src/lib/exclusions.ts` | `[x]` |
| E11-04 | `rank()` zwraca `fullRanking` (z `excluded: null \| 'brand' \| 'model'`, miejscem ogólnym i `S`), `excludedCount` oraz `cards` (3 najlepsze niewykluczone, w tym uzupełnienie powyżej budżetu tylko z niewykluczonych) | `src/lib/scoring.ts`, `src/lib/anonymize.ts` | `[x]` |
| E11-05 | Ekran `#/s/:id/exclude` i `ExclusionPicker`: przełącznik „Chcę coś wykluczyć”, chipy marek z liczbą modeli, rozwijana lista modeli, „Zostanie X z 15 telefonów”, informacja o anonimowości, **Pomiń** i **Dalej** | `src/screens/ExcludeScreen.tsx`, `src/components/ExclusionPicker.tsx`, `src/app/router.ts`, `src/App.tsx` | `[x]` |
| E11-06 | Przepływ: Start → `#/s/:id/exclude` → quiz / suwaki / hybryda; po „Pomiń”/„Dalej” `exclusionsStep = 'done'`, wznawianie nie wraca do kroku | `src/screens/StartScreen.tsx`, `src/lib/sessionReducer.ts`, `src/features/history/historyModel.ts` | `[x]` |
| E11-07 | Tryb suwaków: wiersz „Wykluczenia” w `FilterPanel` otwierający `ExclusionSheet`; licznik „Pasuje X z 15 telefonów” uwzględnia wykluczenia | `src/components/FilterPanel.tsx`, `src/components/ExclusionSheet.tsx`, `src/screens/SlidersScreen.tsx`, `src/screens/QuizScreen.tsx` | `[x]` |
| E11-08 | Ekran kart: „Pominęliśmy N wykluczonych telefonów (zobaczysz je w pełnym rankingu)” + **Zmień wykluczenia**; `session/exclusions` dobiera karty z `entries` bez przeliczania `S` | `src/screens/CardsScreen.tsx`, `src/lib/sessionReducer.ts` | `[x]` |
| E11-09 | Pełny ranking: wyszarzone wiersze wykluczonych, plakietki „Wykluczony (marka)” / „Wykluczony (model)”, miejsce ogólne, szczegóły i przycisk **Uwzględnij ponownie** | `src/screens/RankingScreen.tsx` | `[x]` |
| E11-10 | Historia: wiersz „Wykluczono: …” ze snapshotu oraz plakietka „Wybór n/m” + „Teraz wykluczony” dla wybranego, a później wykluczonego telefonu | `src/features/history/historyModel.ts`, `src/components/SessionListItem.tsx` | `[x]` |
| E11-11 | Leniwe ładowanie katalogu nazw (`import('@/data/exclusionCatalog')`) dopiero po włączeniu przełącznika; kliknięcie „Pomiń” nie ładuje i nie renderuje nazw | `src/data/exclusionCatalog.ts`, `src/components/ExclusionPicker.tsx` | `[x]` |
| E11-12 | Testy akceptacyjne 1–9, jednostkowe, komponentowe, personowe, test wycieku DOM i audyt dostępności `axe-core` w obu motywach | `tests/exclusions.test.ts`, `tests/a11y-audit.test.ts`, `tests/storage.test.ts` | `[x]` |

## Definicja ukończenia

Wszystkie testy akceptacyjne 1–9 zielone; wykluczanie działa w trybach quiz, suwaki i hybryda; osoba pomijająca krok ma pełną anonimowość (0 wycieków marek i modeli w DOM, atrybutach, tytule i adresie).
