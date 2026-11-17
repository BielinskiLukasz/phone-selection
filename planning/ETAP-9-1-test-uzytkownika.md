# Etap 9 — test z użytkowniczką i lista kontrolna wydania

Dokument roboczy dla **E9-06 / E9-07 / E9-10**. Część techniczna etapu 9 jest gotowa
(pełny ranking, kalibracja, `npm run stale-prices`, meta i ikona, instrukcje w README);
to, co zostało, wymaga człowieka: test użyteczności, poprawki po nim i samo wydanie.

---

## 1. Test użyteczności (E9-06)

**Uczestniczka:** osoba, dla której powstała ta strona (profil: PROJECT.md sekcja 2).
**Czas:** do 10 minut na trzy zadania, bez pomocy prowadzącego.
**Sprzęt:** jej własny telefon (strona z adresu Pages) — to jednocześnie test akceptacyjny 4.
**Prowadzący:** czyta zadania, milczy, notuje. Podpowiedzi tylko, gdy uczestniczka utknie na dłużej
niż 30 sekund — wtedy zapisuje, co było niejasne.

### Przygotowanie

1. Wyczyść dane strony w przeglądarce telefonu (ustawienia witryny → `wybor-telefonu:v1`), żeby zacząć od pustej historii.
2. Otwórz adres Pages i sprawdź, że pierwszy ekran ładuje się poprawnie (test akceptacyjny 4).
3. Włącz nagrywanie ekranu albo notuj czas każdego zadania.

### Zadania

| # | Zadanie (czytaj dosłownie) | Co obserwować | Limit |
|---|---|---|---|
| 1 | „Wybierz sposób, który najbardziej Ci pasuje, i odpowiedz na pytania. Niczego nie tłumaczę — jeśli pytanie będzie niejasne, powiedz to na głos.” | czas, zatrzymania, pytania czytane dwa razy, które odpowiedzi są niejednoznaczne, czy krok „trzy najważniejsze rzeczy” jest zrozumiały | 6 min |
| 2 | „Zobacz propozycje i wybierz jedną. Sprawdź, co się stanie.” | czy rozumie, że karty są anonimowe, czy czyta cechy, czy otwiera „Więcej szczegółów”, czy okno potwierdzenia jest jasne, reakcja po ujawnieniu nazwy | 2 min |
| 3 | „Wróć i wybierz drugi telefon. Potem znajdź swoje wcześniejsze wybory.” | czy znajduje „Pokaż pełny ranking”, czy rozumie plakietki „Wybór 1/2”, czy trafia do historii i umie wznowić/odtworzyć sesję | 2 min |

### Pytania po zadaniach (5 minut)

1. Które pytanie było najbardziej niejasne i dlaczego?
2. Czy trzy propozycje różniły się dla Ciebie wystarczająco? Co byś jeszcze chciała widzieć na karcie?
3. Czy procent dopasowania coś Ci mówił, czy wolałabyś opis („bardzo dobre / dobre / przeciętne”)?
4. Czy brak nazw do momentu wyboru był pomocny, czy raczej przeszkadzał?
5. Czy coś na telefonie było za małe, za ciasne albo wymagało przewijania w bok?
6. Gdybyś miała wybrać telefon dziś — który by to był i dlaczego?

### Arkusz obserwacji (kopiuj i wypełnij)

```
Data: ............  Urządzenie: ............  Motyw: jasny / ciemny
Zadanie 1: start ..... s   uwagi: ............................................
Zadanie 2: start ..... s   uwagi: ............................................
Zadanie 3: start ..... s   uwagi: ............................................
Zatrzymania (>10 s): ile ..... gdzie .........................................
Niejasne treści: ..............................................................
Błędy techniczne: .............................................................
Ocena uczestniczki 1-5: ....   Czy wybrałaby telefon z tej listy: tak / nie
```

### Poprawki po teście (E9-07)

Każda uwaga trafia do jednej z trzech kup: **treść** (`src/data/questions.ts`, `src/data/strings.ts`),
**układ** (komponent ekranu), **algorytm** (`src/lib/scoringConfig.ts` — tylko z pomiarem na personach,
jak przy kalibracji `BLEND`). Po poprawkach: `npm run release`, ponowny krótki test zadania, które
sprawiło problem, i aktualizacja `planning/ROADMAP.md`.

---

## 2. Lista kontrolna wydania (E9-09, E9-10, test akceptacyjny 5)

### Dane

- [ ] `npm run stale-prices` — wszystkie ceny ≤ 7 dni (w dniu wydania; dziś: świeże)
- [ ] Edge 70 Fusion: promocja Allegro do 30.11.2026 z limitem 1 szt. — potwierdź, że oferta trwa, albo wpisz cenę regularną do `price.otherObservations`
- [ ] Realme 16 Pro+: nazwa na stronie oferty Empik zgodna z rekordem (status `ok` od etapu 0)
- [ ] `npm run validate-data` — 0 błędów; każde ostrzeżenie ma uzasadnienie w ROADMAP („Stan danych”)
- [ ] `npm run data-gaps -- --strict` — kod 0
- [ ] `_meta.generatedOn` i `PRICES_CHECKED_AT` w `src/data/pool.ts` zgodne z datą odświeżenia cen

### Kod i testy

- [ ] `npm run typecheck` — czysto
- [ ] `npm test` — wszystkie testy zielone (w tym audyt axe i test wycieku nazw)
- [ ] `npm run build` — `dist/index.html` bez błędów
- [ ] `npm run release` — cała ścieżka jednym poleceniem

### Wdrożenie

- [ ] W ustawieniach repo: **Pages → Source: GitHub Actions** (krok jednorazowy)
- [ ] `base: '/phone-selection/'` w `vite.config.ts` zgodne z nazwą repo
- [ ] Push do `main` → workflow `Check and deploy` zielony
- [ ] Adres Pages otwiera się na telefonie: pierwszy ekran, motyw, odpowiedzi, odświeżenie strony
- [ ] Hash routing działa po odświeżeniu na każdym ekranie (`#/`, `#/s/:id/quiz`, `#/history`, `#/r/:kod`, 404)
- [ ] Tag `v1.0` i release notes z datą danych

### Po wydaniu

- [ ] Zapisz wynik testu użyteczności w tym pliku (sekcja 3)
- [ ] Ustal rytm odświeżania cen (proponowane: co 7 dni przed realnym zakupem, `npm run stale-prices`)
- [ ] Sprawdź, że historia sesji przeżyła aktualizację strony (klucz `wybor-telefonu:v1` bez zmian)

---

## 3. Wynik testu (wypełnij po E9-06)

```
Przeprowadzony: ....................
Zadania ukończone bez pomocy: 1 / 2 / 3
Łączny czas: ............
Lista poprawek:
  1. .................................................................... (treść / układ / algorytm)
  2. ....................................................................
  3. ....................................................................
Decyzja o wydaniu 1.0: tak / nie, bo ............................................
```
