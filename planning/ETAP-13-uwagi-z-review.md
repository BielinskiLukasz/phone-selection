# FIX-PHASE.md — plan fazy poprawkowej projektu `phone-selection`

> **Status realizacji (16.11.2026, etap 13 w ROADMAP):** FP0 — szablony i bramka kandydata gotowe, wynik testu i data
> zakupu **do wpisania przez użytkownika** (`E9-wynik-testu.md`, `tests/fixtures/user-session.json`); **FP1 — w kodzie
> i danych wykonane** poza FP1-01 (ręczna weryfikacja kandydata — nieznany) i FP1-03 (odświeżenie cen — w dniu zakupu);
> **FP2 — wykonane** poza FP2-06 (`value` w pełnym rankingu) i FP2-08 (pełna fleksja); FP3/FP4 czekają na bramkę
> kandydata (FP0-02), FP5/FP6 po zakupie. Szczegółowa lista z odhaczeniem: `ROADMAP.md`, sekcja „Etap 13”.
> Numeracja: plan nazywa fazę „etapem 12” (powstał na stanie `baf7f06`); w repo numer 12 zajęła poręczność,
> więc w ROADMAP faza poprawkowa to **etap 13**. Nazwy plików z planu (`E12-zmiany-rankingu.md`, `E12-retro.md`) zostają.

**Podstawa:** `REVIEW-OUTCOME.md` (review 1) oraz drugie review biznesowe (review 2, 22 zmiany P0–P3), stan repo: commit `baf7f06`.
**Nowe fakty od czasu review:** test z użytkowniczką (E9-06) **odbył się**, a wynik jest na tyle dobry, że **jest już kandydat / kandydaci do zakupu**. To zmienia priorytety: nie „czy produkt działa”, tylko **„czy zakup na podstawie tego wyniku będzie trafny i bezpieczny”**.
**Zasada rozstrzygania sprzeczności:** gdy review 1 i review 2 się różnią, wybieramy wariant **bardziej przyjazny użytkowniczce** (mniej kroków, mniej do zrozumienia, bez zaskoczeń przy zakupie).

---

## 0. Zaktualizowany stan realizacji projektu

### 0.1. Co się zmieniło względem obu review

| Założenie w review | Stan faktyczny po teście | Konsekwencja dla planu |
|---|---|---|
| „Produkt nie został ani raz użyty przez użytkowniczkę” (R1 §1, R2 #22) | **Nieaktualne.** Test E9-06 wykonany; użytkowniczka przeszła proces i ma kandydata. | Hipoteza biznesowa („wybór po cechach, zaufanie do wyniku”) **wstępnie potwierdzona**. Feature freeze z R1 §3.3 zostaje, ale celem fazy jest **bezpieczny zakup**, nie „pierwszy test”. |
| „Najpierw sprzątanie UI, potem test” (R1 §4, krok 1–6) | Test odbył się mimo artefaktów deweloperskich. | Sprzątanie UI spada z „bloker testu” do „bloker drugiego podejścia / wydania v1.0”. |
| Rozległe zmiany algorytmu przed wydaniem (R2 #9–#14) | Użytkowniczka ma już wynik i snapshot sesji. | Zmiany algorytmu **nie mogą po cichu zmienić jej rekomendacji**. Każda przechodzi przez „bramkę kandydata” (§1.2). |

### 0.2. Status etapów (ROADMAP) — wpisane w `planning/ROADMAP.md`

| Etap | Było | Jest | Uwaga |
|---|---|---|---|
| 0–8, 10, 11 (i 12 — poręczność) | `[x]` | `[x]` | bez zmian |
| 9 — E9-06 test z użytkowniczką | `[~]` | **`[x]` wykonany** | wynik testu nie jest jeszcze w repo → zadanie FP0-01 |
| 9 — E9-07 poprawki po teście | `[ ]` | **`[~]` = ta faza** | ten dokument |
| 9 — E9-05 odświeżenie cen w dniu wydania | `[~]` | `[~]` | przesunięte na **dzień zakupu** (FP1) |
| 9 — tag `v1.0`, adres Pages | `[ ]` | `[ ]` | po FP1–FP3 |
| **Nowy etap 13 — Faza poprawkowa i zakup** (w pierwotnym planie „12”) | — | `[~]` | FP0–FP6 poniżej |

### 0.3. Stopień realizacji (szacunek)

| Wymiar | Przed review | Po teście (teraz) | Po tej fazie (cel) |
|---|---|---|---|
| Zakres techniczny (etapy 1–11) | ~95 % | ~95 % | 100 % |
| Weryfikacja hipotezy biznesowej | 0 % | **~70 %** (jedna sesja, kandydat wskazany, brak zakupu) | 100 % = zakup dokonany i po 2 tygodniach użytkowniczka potwierdza trafność |
| Bezpieczeństwo zakupu (ceny, linki, warianty, ukryte koszty) | niskie | **niskie** (link Realme do innego wariantu, promocje wygasające, brak info o ładowarce) | wysokie |
| Gotowość do pokazania osobie trzeciej / wydania v1.0 | niska (panel deweloperski) | niska | wysoka |

**Miara sukcesu projektu (brakowała w obu review — przyjmujemy):**
> Użytkowniczka kupuje telefon wskazany (lub świadomie odrzucony na rzecz innej karty) przez aplikację, po zakupie nie odkrywa cechy, której aplikacja nie pokazała (cena, wariant, brak 4K, brak ładowarki, krótsze wsparcie), a po 2 tygodniach ocenia trafność wyboru ≥ 4/5.

---

## 1. Zasady fazy poprawkowej

### 1.1. Zakres zamrożony
Nowe funkcje tylko z listy poniżej. Wszystko, co nie wynika z testu, z ryzyka zakupowego albo z błędu, trafia do „Po zakupie” (FP6) lub jest odrzucone.

### 1.2. „Bramka kandydata” dla zmian algorytmu i danych
Każda zmiana w `scoringConfig.ts`, `scoringRules.ts`, `questions.ts`, `weights.ts` lub w ocenach `phones.json`:
1. przechodzi testy person i kalibracji (istniejąca infrastruktura),
2. jest **przeliczona na rzeczywistej sesji użytkowniczki** (eksport historii → `tests/fixtures/user-session.json`, bez danych osobowych),
3. jeśli zmienia jej top 3 — zmiana jest opisana w `planning/E12-zmiany-rankingu.md` (co, dlaczego, przed/po) i **komunikowana użytkowniczce wprost**, a nie przez „cichą” podmianę kart. Snapshot jej sesji zostaje nietknięty (zasada PROJECT 9).

### 1.3. Kolejność = ryzyko zakupowe, nie elegancja
Najpierw to, co może spowodować zły zakup (wariant, cena, promocja, koszt ukryty). Potem to, co podważa zaufanie (UI deweloperskie, błędne liczby). Potem jakość rekomendacji. Na końcu proces i dokumentacja.

### 1.4. Każde zadanie ma DoD i (jeśli dotyczy kodu) test
Projekt ma 361 testów — poprawki nie mogą obniżyć tej poprzeczki. Zadanie bez DoD nie wchodzi do fazy.

---

## 2. Rozstrzygnięcia sprzeczności między review

| Temat | Review 1 | Review 2 | Decyzja (user-friendly) |
|---|---|---|---|
| Feature freeze vs zmiany algorytmu | twardy freeze do testu | 6 zmian P1 w algorytmie i danych | Test już był → **freeze funkcji UI, ale zmiany algorytmu dopuszczone przez bramkę kandydata (§1.2)**. Zmiana, która poprawia trafność zakupu (np. ostrzeżenie o braku 4K), jest ważniejsza niż czystość zakresu. |
| Tryby wejścia | zostawić tylko quiz, suwaki schować do „dostrój” | naprawić błędy suwaków i hybrydy | **Jeden główny przycisk „Zacznij quiz”**; suwaki dostępne jako „Dostrój wynik” po kartach oraz pod zwijanym „Inne sposoby”. Błędy suwaków naprawiamy tylko te widoczne w „Dostrój” (licznik budżetu, punkt odniesienia, grupy 1-kryterialne). Hybryda znika z UI, kod zostaje. |
| Krok wykluczeń | ukryć, dać po ujawnieniu | opcjonalny link pod trybami + w filtrach | **Oba naraz:** brak ekranu pośredniego; dyskretny link „Chcę z góry wykluczyć markę” na Starcie i w podsumowaniu, oraz „Nie chcę tej marki — pokaż inną” po ujawnieniu. |
| Budżet domyślny | 1500 zł twardo z dopytaniem | opcja „najlepiej do 1500, dopłacę jeśli warto” + 4. karta „warto dopłacić” | **Wariant R2 jako domyślny** (odpowiada profilowi dosłownie) + licznik „w budżecie: X z 15”. Twarde 1500 i 2000 zostają jako opcje. |
| Pełny ranking przed wyborem | nie poruszone | twarda blokada | **Blokada z przyjaznym komunikatem** („Najpierw wybierz jedną z trzech propozycji — potem pokażemy wszystko”), bez błędu 404. |
| Procent dopasowania | nie poruszone | ukryć „100 % najlepszego” z karty, dodać wyjaśnienie | Na karcie: **„Dopasowanie 67 % · bardzo dobre”** + jedno zdanie tooltipu; przeskalowanie w szczegółach (zgodnie z QUIZ-SPEC 10.1). |
| Oceny `low` aparatu | zdanie w prostym języku + ewentualna kara | plakietka + dociągnięcie testów z już podlinkowanych recenzji | **Najpierw dane** (recenzje już są w `sources`), **potem plakietka** tam, gdzie `low` zostaje. Kara punktowa tylko, jeśli bramka kandydata pokaże, że bez niej top 3 zawiera telefon ze „szacowanym” aparatem przy aparacie w G1. |
| Ceny w runtime (osobny JSON) | rozważyć | nie poruszone | **Odrzucone w tej fazie** — do zakupu wystarczy odświeżenie cen w dniu zakupu + link „sprawdź aktualną cenę”. Zmiana architektury przed zakupem to ryzyko bez zysku. |

---

## 3. Fazy

Legenda nakładu: **S** ≤ 2 h · **M** pół dnia · **L** 1–2 dni. Identyfikatory `FPx-nn` do użycia w commitach i ROADMAP. **Status wykonania każdego zadania: `ROADMAP.md`, sekcja „Etap 13”.**

### FP0 — Utrwalenie wyniku testu i kandydata (dzień 0, nakład S–M)

| ID | Zadanie | Nakład | DoD |
|---|---|---|---|
| FP0-01 | Wypełnić arkusz obserwacji z `planning/E9-test-uzytkownika.md` i zapisać jako `planning/E9-wynik-testu.md`: tryb, czas zadań, zatrzymania, niejasne pytania, odpowiedzi na 6 pytań po teście, **wskazany kandydat (karta #?, model po ujawnieniu), drugi wybór, powód**. | S | plik w repo; sekcja „Co poprawić” z listą uwag użytkowniczki przypisanych do FP1–FP5 |
| FP0-02 | Wyeksportować jej sesję (funkcja eksportu historii) do `tests/fixtures/user-session.json` (usunąć `id`/daty, jeśli wrażliwe) i dodać test `tests/user-session.test.ts`: „aktualny algorytm odtwarza top 3 ze snapshotu”. | S | test zielony; to jest baza bramki kandydata (§1.2) |
| FP0-03 | Zaktualizować `ROADMAP.md` (tabela §0.2), dopisać etap z odnośnikiem do tego pliku. | S | ROADMAP spójny ze stanem |
| FP0-04 | Decyzja użytkownika: **data planowanego zakupu** (determinuje, czy FP4 wchodzi przed zakupem, czy po). | — | data wpisana w `E9-wynik-testu.md` |

### FP1 — Bezpieczny zakup (dni 1–2, przed jakimkolwiek kliknięciem „kup”) — **P0**

| ID | Zadanie | Źródło | Nakład | DoD |
|---|---|---|---|---|
| FP1-01 | **Ręczna weryfikacja kandydata i drugiego wyboru**: wariant RAM/ROM na stronie sklepu = wariant w `phones.json`; cena; dostępność; gwarancja PL; czy oferta to sklep czy marketplace; data końca promocji. | R2 #5, #6, #7 | S | notatka w `E9-wynik-testu.md`; ewentualne poprawki rekordu |
| FP1-02 | **Realme 16 Pro+**: link `empik.com/...realme-16-pro-5g...` wskazuje wariant bez „+”. Znaleźć ofertę Pro+ ≤ 2000 zł z 2 niezależnych sklepów **albo** ustawić `status: 'unverified'` i wyłączyć z puli do czasu potwierdzenia. | R2 #5 | S | rekord ma link do właściwego wariantu lub jest poza pulą; test w `validate-data`: ostrzeżenie, gdy slug URL nie zawiera członu `pro+`/`plus` dla `modelName` z „+” |
| FP1-03 | Odświeżyć **wszystkie 15 cen** i `checkedAt`; ustawić `PRICES_CHECKED_AT` na faktyczną datę. Usunąć/oznaczyć wygasłe promocje (Redmi Note 17 Pro — kod do 19.11; Edge 70 Fusion — Allegro, limit 1 szt., do 30.11). | R1 §3.9, R2 #7, #8 | M | `stale-prices` zielony; żadna cena nie opiera się na wygasłej promocji |
| FP1-04 | Dodać do `price` pola `regularPricePln?`, `promoEndsAt?`, `promoCondition?`. Pokazywać na karcie anonimowej i odsłoniętej. `stale-prices.ts`: `now > promoEndsAt` ⇒ cena przeterminowana. | R2 #7 | M | pola w schemacie + walidacja; test `stale-prices`; tekst widoczny na karcie |
| FP1-05 | **Brak ładowarki w pudełku** — jedno zdanie przy cenie na odsłoniętej karcie i w pełnym rankingu. | R2 #8 | S | zdanie na `PhoneCardRevealed`; w pełnym rankingu w wierszu ceny |
| FP1-06 | Przy każdym linku sklepowym pokazać **cenę, datę i typ**; porównywarkę wydzielić jako osobny stały przycisk **„Sprawdź aktualną cenę”** (`reveal.priceCompareUrl`). | R1 §3.9, R2 #6 | M | brak „szoku cenowego” po kliknięciu; link porównywarki przy każdym z 15 |
| FP1-07 | Dla kandydata i drugiego wyboru: potwierdzić **datę końca poprawek bezpieczeństwa** i **zgodność z Mi Band 6**. Wpisać do `specs.securitySupportUntil` i `specs.wearableNotes`; pokazać przy ujawnieniu. Dla pozostałych modeli — w FP4. | R1 §3.13, R2 #14, #20 | S | dwa pola wypełnione dla ≥ 2 modeli; widoczne na odsłoniętej karcie |
| FP1-08 | Rozdzielić `price.note` na `price.userNote` i `price.auditNote`. W UI tylko `userNote`. | R2 #2 | S | `RankingScreen` nie pokazuje `auditNote`; walidacja schematu |
| FP1-09 | Sekcja „Sprawdzone przed zakupem: ✓ …” z datą na odsłoniętej karcie. | nowe | S | sekcja widoczna dla modeli z `verifiedForPurchaseAt` |

**Bramka wyjścia FP1:** użytkowniczka może kupić telefon. Jeśli data zakupu (FP0-04) jest bliska — **FP1 jest jedyną fazą obowiązkową przed zakupem.**

### FP2 — Produkt bez szumu (dni 2–3) — **P0/P1 UI**

| ID | Zadanie | Źródło | Nakład | DoD |
|---|---|---|---|---|
| FP2-01 | Mobilny CTA w dolnym pasku `StartScreen` → `openSession('quiz')`; gdy istnieje `unfinished` → „Wznów wybór”. | R1 §3.2, R2 #1, #18 | S | CTA tworzy sesję; CTA wznawia na właściwy ekran |
| FP2-02 | Usunąć z produkcyjnego UI artefakty deweloperskie; całość pod `#/dev` / `?dev=1` lub `import.meta.env.DEV`. | R1 §3.1, R2 #2, #3 | M | w DOM `#/` brak słów „Etap”, „npm”, „#/s/demo”, „CI”; axe nadal 0 błędów |
| FP2-03 | **Start = jeden główny przycisk „Zacznij quiz (ok. 5 min)”**; pod spodem zwijane „Inne sposoby”; hybryda znika z UI. | R1 §3.6 | M | Start mieści się na jednym ekranie telefonu bez przewijania do CTA |
| FP2-04 | **Wykluczenia jako opcja, nie krok**; link na Starcie i w podsumowaniu; po ujawnieniu „Nie chcę tej marki — pokaż inną propozycję”. | R1 §3.5, R2 #21 | M | nowa sesja: 0 ekranów między Startem a pytaniem A1; test wycieku nazw po „pomiń” nadal zielony |
| FP2-05 | Blokada `#/s/:id/ranking` przy `picks.length === 0` z przyjaznym ekranem. | R2 #3 | S | wejście pod adres bez wyboru nie renderuje żadnej nazwy/marki |
| FP2-06 | Błąd `value` 0/100 w pełnym rankingu — `rawScore(phone, id, snapshot.filters.budgetMax)`; docelowo cena i `value` ze snapshotu. | R2 #4, #8 | M | ten sam pasek na kartach i w rankingu; test na fixture z podmienioną ceną |
| FP2-07 | Etykiety przycisków wg celu: G1 → „Dalej: podsumowanie”, podsumowanie i dostrojenie → „Pokaż 3 propozycje”. | R2 #21 | S | w żadnym przepływie przycisk „Pokaż wyniki” nie pojawia się 2× z rzędu |
| FP2-08 | Fleksja: `plural()` wszędzie. | R2 #21 | S | grep po wzorcach „\d+ telefony|wybory|ukończone|zaktualizowane” pusty |
| FP2-09 | Procent dopasowania: na karcie „67 % · bardzo dobre” + tooltip; „% najlepszego” tylko w szczegółach. | R2 #20 | S | zgodność z QUIZ-SPEC 10.1 |

**Bramka wyjścia FP2:** można pokazać aplikację drugiej osobie bez tłumaczenia „to nie dla Ciebie, przewiń”. Użytkowniczka dostaje **drugie, krótkie podejście** — 10 min.

### FP3 — Zaufanie do wyniku (dni 3–6) — **P1 rekomendacja**

| ID | Zadanie | Źródło | Nakład | DoD |
|---|---|---|---|---|
| FP3-01 | **„Pasuje, bo…” / „Na co uważać”** na każdej anonimowej karcie. | R1 §3.10, R2 #20 | L | test wycieku zielony; dla sesji użytkowniczki tekst na #1–#3 brzmi sensownie |
| FP3-02 | **Ochrona przed krytyczną wadą**: plakietka „Wyraźny kompromis w Twoim priorytecie”, kara punktowa tylko po pomiarze. | R2 #9 | M | testy person; `tests/calibration.test.ts` rozszerzony |
| FP3-03 | **`charging`**: A3 „na noc” → 0.25, „czasem” → 1.5, „często” → 5 (było 4; plan 2, 18.11.2026: sufit skali); waga domyślna 1. | R2 #10 | S | persona „żona”: `charging` ≤ waga `photoMotion` |
| FP3-04 | **C3 microSD**: bonus tylko dla `specs.microSd === true`; „wolę z microSD”. | R2 #12 | S | odpowiedź „Chcę, jeśli się da” podnosi wynik Edge 60 |
| FP3-05 | **Budżet jak w profilu**: „Najlepiej do 1500 zł, dopłacę jeśli wyraźnie lepszy” = 2 karty ≤ 1500 + 1 ≤ 1800 z plakietką dopłaty. | R1 §3.8, R2 #11 | L | przy 1500 elastycznym trzecia karta to najlepszy 1501–1800 zł |
| FP3-06 | Licznik filtrów liczy **faktycznie w budżecie**. | R2 #19 | S | test licznika dla 1500/1800/2000 |
| FP3-07 | `storage`: 128/256/512 GB = 40/82/100. | R2 #9 | S | przeliczone 15 rekordów; bramka kandydata |
| FP3-08 | **Karty — brakujące cechy użytkowe** (aparaty i wideo, waga i rozmiar, wsparcie do MM.RRRR). | R2 #20 | M | UI-SPEC 3.5 spełniony |
| FP3-09 | **Plakietka niskiej pewności** na karcie głównej przy ≥ 3 ocenach `low` w grupie z top 3 G1. | R1 §3.7, R2 #16 | S | karta Redmi Note 17 Pro u „żony” ma plakietkę |
| FP3-10 | Suwaki „Dostrój”: punkt odniesienia 2,0, ukryć `CriterionSliders` dla grup 1-kryterialnych, podgląd G1 od 1. kliknięcia. | R2 #19 | S | brak „6 × ręcznie” na świeżym ekranie |
| FP3-11 | Quiz 19 → ≤ 16 pytań po analizie wrażliwości. | R1 §3.11, R2 #21 | M | `E12-zmiany-rankingu.md` z tabelą wrażliwości; QUIZ-SPEC zaktualizowany |

**Bramka wyjścia FP3:** sesja użytkowniczki przeliczona nowym algorytmem; różnice opisane; jeśli top 3 się zmieniło — rozmowa z użytkowniczką **przed** zakupem albo adnotacja po zakupie.

### FP4 — Dane i metodyka (dni 6–10; przed zakupem tylko, jeśli kandydat zależy od spornych danych)

| ID | Zadanie | Źródło | Nakład | DoD |
|---|---|---|---|---|
| FP4-01 | **`batteryEndurance` jedną miarą** (EPREL główny, Active Use drugi, PCMark/recenzje `medium`/`low`). | R2 #13 | L | `score-rules.test.ts`; bramka kandydata |
| FP4-02 | **Aparaty z podlinkowanych recenzji** zamiast „z wersji Pro −10”. | R1 §3.7, R2 #16 | L | modele z 6× `low` w aparacie: z 6 do ≤ 2 |
| FP4-03 | **`updates` = pozostałe wsparcie od daty zakupu** (`securitySupportUntil`). | R2 #14 | M | 15 rekordów z datą; Edge 60 pokazuje ostrzeżenie przy D3 „5+ lat” |
| FP4-04 | **Struktura aparatów** (`mainMp`, `mainOis`, …, `videoMax`); `hasStabilization()` czyta pole. | R2 #15 | M | każda karta z OIS pokazuje „ze stabilizacją” |
| FP4-05 | `IP66/IP68` → 92 pkt. | R2 #15 | S | tabela + test |
| FP4-06 | `basis` aparatów bez odwołań do innych modeli; `KNOWN_FORBIDDEN` + nakładki. | R2 #15 | M | test wycieku rozszerzony |
| FP4-07 | Przegląd puli symulacją Monte Carlo (5000 profili). | R2 #16 | M | `E12-zmiany-rankingu.md` sekcja „pula” |
| FP4-08 | Mi Band 6 i `securitySupportUntil` dla pozostałych modeli. | R1 §3.13 | S | 15/15 wypełnione |

### FP5 — Ciągłość, proces i domknięcie v1.0 (dni 8–11)

| ID | Zadanie | Źródło | Nakład | DoD |
|---|---|---|---|---|
| FP5-01 | `package.json`: nazwa, wersja 1.0.0, skrypty, ESLint/Prettier; CI woła `npm run release`. | R1 §3.4, R2 #22 | M | `npm run release` zielony |
| FP5-02 | `validate-data.ts`: `promoEndsAt`, slug wariantu, `utm_*`, `userNote`/`auditNote`, `securitySupportUntil`. | R2 #5, #22 | S | testy walidatora |
| FP5-03 | `storage.ts`: nowszy `schemaVersion` ⇒ `persistent: false` + kopia. | R2 #22 | S | test |
| FP5-04 | Statusy sesji `in_progress` → `awaiting_pick` → `completed`; baner „Wróć do swoich 3 propozycji”; `quizProgress()` wg `buildSteps(mode)`. | R2 #18 | L | migracja v3 z testem |
| FP5-05 | Link wznowienia v2 (filtry, wykluczenia, ręczne wagi). | R2 #17 | M | round-trip dla 3 trybów |
| FP5-06 | Dokumentacja: README dla użytkowniczki / dla autora; usunąć sprzeczności; PROJECT 14 zamknąć; QUIZ-SPEC/UI-SPEC zaktualizować. | R1 §3.12, R2 #22 | M | brak nieaktualnych zdań |
| FP5-07 | `vite.config.ts`: komentarz o `viteSingleFile` / `base`; `engines` zgodne z `.nvmrc`. | R1 §3.15 | S | — |
| FP5-08 | Wydanie: `npm run release`, Pages na telefonie, tag `v1.0.0`. | R1 §3.3 | S | tag istnieje |

### FP6 — Po zakupie (tydzień +2)

| ID | Zadanie | Nakład | DoD |
|---|---|---|---|
| FP6-01 | Zakup: `npm run stale-prices` + ręczne sprawdzenie ceny i wariantu kandydata. | S | wpis w `E9-wynik-testu.md` |
| FP6-02 | Po 2 tygodniach: ocena trafności 1–5, zaskoczenia, bateria/aparat. | S | `planning/E12-retro.md`; miara sukcesu rozliczona |
| FP6-03 | Decyzja: zamknięcie projektu albo kontynuacja dla kolejnych osób. | — | decyzja w ROADMAP |
| FP6-04 | Retro procesu; zasada „funkcja tylko po zaobserwowanym problemie” do PROJECT. | S | sekcja „Lekcje” w PROJECT.md |

---

## 4. Harmonogram i zależności

```
Dzień 0      FP0  utrwalenie testu, fixture sesji, data zakupu
Dni 1–2      FP1  BEZPIECZNY ZAKUP  ──────────────────────────► [zakup możliwy]
Dni 2–3      FP2  produkt bez szumu ─► drugie krótkie podejście użytkowniczki (10 min)
Dni 3–6      FP3  zaufanie do wyniku (bramka kandydata po każdej zmianie)
Dni 6–10     FP4  dane i metodyka   ─┐ równolegle; FP4 przed zakupem tylko,
Dni 8–11     FP5  proces, v1.0      ─┘ gdy kandydat zależy od spornych danych (FP0-04)
Tydzień +2   FP6  zakup → retro → decyzja o zamknięciu
```

**Ścieżka krytyczna do zakupu:** FP0-01 → FP0-02 → FP1-01 → FP1-02/03 → FP1-05/07 → FP6-01.

**Dwa scenariusze wg daty zakupu (FP0-04):**
- **Zakup w ciągu ≤ 5 dni** → FP1 w całości, z FP3 tylko FP3-01 i FP3-09, reszta po zakupie.
- **Zakup za > 1 tydzień** → FP1 → FP2 → FP3 → (FP4-01, FP4-02, FP4-03 dla top 5 jej rankingu) → ponowne przejrzenie kart → zakup.

Szacowany nakład łączny: **9–11 dni roboczych**, z czego do bezpiecznego zakupu **1–2 dni**.

---

## 5. Co świadomie odkładamy lub odrzucamy

| Pomysł | Źródło | Decyzja | Powód |
|---|---|---|---|
| Ceny w osobnym JSON ładowanym w runtime | R1 §3.9 | po zakupie, tylko jeśli FP6-03 = kontynuacja | zmiana architektury bez zysku dla jednego zakupu |
| Zdjęcia telefonów po ujawnieniu | R1 §3.13 | zrobione w etapie 12 (`PhonePhoto`) — poza zakresem tej fazy | — |
| Wymiana zdominowanych modeli w puli | R2 #16 | decyzja dopiero po FP4-07 | najpierw ujednolicić dane |
| Kara punktowa za oceny `low` | R1 §3.7 | tylko po pomiarze (FP3-02 / FP4-02) | lepiej naprawić dane niż karać za ich brak |
| Hybryda jako osobny tryb | R2 #18 | usunięta z UI (widoczna tylko w `?dev=1`), kod zostaje | jeden tryb = mniej do tłumaczenia |
| Eksport/import, sync kart, audyt axe | R1 §3.14 | zostają bez zmian | działają, nie przeszkadzają |

---

## 6. Ryzyka fazy

| Ryzyko | Skutek | Mitygacja |
|---|---|---|
| Zmiany algorytmu (FP3/FP4) odwracają top 3 użytkowniczki po tym, jak już podjęła decyzję | utrata zaufania | bramka kandydata §1.2; snapshot nietykalny; komunikat wprost |
| Promocja kandydata wygasa w trakcie fazy | cena > 2000 zł, zakup odłożony | FP1-03/04 od razu; „Sprawdź aktualną cenę”; drugi wybór zweryfikowany równolegle |
| FP4 (dane) rozrasta się jak etapy 0 i 10 | zakup czeka na „idealne dane” | FP4 **po** zakupie, chyba że FP0-04 mówi inaczej; limit: top 5 jej rankingu |
| Drugie podejście użytkowniczki po FP2 wykaże nowe problemy | wydłużenie fazy | 10-minutowy format; uwagi → FP3 lub FP6 |
| Brak wyniku testu w repo | plan opiera się na ustnym przekazie | FP0-01 jako pierwsze zadanie, bez wyjątków |
