# Etap 10 — Rozszerzenie puli modeli (10 → 14, opcjonalnie 15)

> **Status: WYKONANY 16.11.2026 — pula 15 telefonów.** Decyzje użytkownika: **D1** vivo dodajemy ·
> **D2** Redmi Note 17 Pro 5G 8/512 dodajemy · **D3** Xiaomi 15T zostaje 12/512 · **D4** wzór pojemności
> baterii zmieniony na 4000-8000 mAh (8000 mAh = 100) · **D5** przed v1.0 · **D6** nowe brzmienie 9.1.4.
> Wynik: 5 nowych rekordów ze źródłami (GSMArena z etykietą UE, recenzje, polskie karty sklepów),
> `battery` przeliczone dla całej puli, 348 testów zielonych, walidator 0 błędów. **Zostaje na dzień
> wydania (E10-11, razem z E9-04):** ponowny odczyt cen nowych rekordów ze stron sklepów (dziś: odczyt
> indeksu Ceneo z 16.11.2026) i podmiana `shopLinks` z porównywarki na sklepy; rozstrzygnięcie ceny A37
> (1293 vs 1582 zł); potwierdzenie liczby wersji systemu Redmi Note 17 Pro (dziś `updates` z jednej
> składowej); `chargerInBox` pięciu nowych rekordów. Szczegóły: ROADMAP „Etap 10”, QUIZ-SPEC 2.6 i 9.

**Cel:** dołączyć do `src/data/phones.json` telefony zatwierdzone w przeglądzie listy 21 modeli
(sekcja [„Wynik przeglądu listy”](#wynik-przeglądu-listy-21-modeli-podstawa-etapu) poniżej) — **Honor 400 8/256**, **Samsung Galaxy A37 5G 8/256**,
**OnePlus Nord 5 8/256**, **vivo V70 FE 8/256** (warunkowo **Redmi Note 17 Pro 5G 8/512**) — **bez zmiany
logiki rankingu**, z zachowaniem reguł etapu 0 (brak danych = `null`, każda wartość ze źródłem) i z ponownym
pomiarem person z QUIZ-SPEC 9.
**Zależności:** etap 0 (reguły danych i C1), etap 2 (silnik, normalizacja min-max), etap 9 (odświeżenie cen —
ten etap robimy w jednym przebiegu z E9-04/E9-05 albo tuż po v1.0, patrz D5).
**Dokumenty:** sekcja „Wynik przeglądu listy” w tym pliku (werdykty i ceny), [PROJECT.md](./PROJECT.md)
(sekcje 3, 7.5, 13), [QUIZ-SPEC.md](./QUIZ-SPEC.md) (2.6, 9, 10.1),
[ETAP-0-dane-telefonow-aktualizacja.md](./ETAP-0-dane-telefonow-aktualizacja.md) (zasady uzupełniania).

## Zakres

- **W zakresie:** nowe rekordy danych; stałe, teksty i testy zależne od liczebności puli; słownik anonimizacji;
  ponowny pomiar person i kalibracji `BLEND`; aktualizacja dokumentów; odświeżenie cen całej puli jednego dnia.
- **Poza zakresem:** nowe kryteria, nowe ekrany, zmiana limitu 2000 zł, iPhone 16e i pozostałe odrzucone modele,
  zmiana wzorów PROJECT 7.5 (poza ewentualną decyzją D4).

## Decyzje użytkownika przed startem (👤)

| ID | Decyzja | Domyślnie, jeśli brak odpowiedzi |
|---|---|---|
| D1 | **vivo V70 FE** — czy marka spełnia warunek „znana i godna zaufania” (PROJECT 2)? vivo to top-5 świata, ale cienka obecność w PL (powrót 2026, mniejsza sieć serwisowa). | dodajemy → pula **14** |
| D2 | **Redmi Note 17 Pro 5G 8/512** — dodać mimo słabego chipu (Snapdragon 6s Gen 4) i braku nagrywania 4K? Zysk: 512 GB i 8340 mAh za ~1579–1799 zł. | nie → pula 14; „tak” → pula **15** |
| D3 | **Xiaomi 15T**: zostaje 12/512 (decyzja z 14.11.2026) czy wracamy do 12/256 z listy? | zostaje 12/512; porównanie cen obu wariantów w E10-11 |
| D4 | Wzór pojemności baterii ma `clamp` → **100 już przy 7000 mAh** (`scoringRules.ts:16-19`); 8340 mAh nie dostaje premii. Zostawiamy? | zostawiamy (zmiana = PROJECT 7.5 + `tests/score-rules.test.ts:43`) |
| D5 | Kiedy: **przed v1.0** (jeden przebieg cen dla 14-15 rekordów) czy jako **v1.1** po wydaniu? | przed v1.0, razem z E9-04 |
| D6 | Nowe brzmienie niezmiennika **9.1.4** (dziś: budżet 1500 zł → *dokładnie* dwie karty w budżecie i jedna „Powyżej budżetu”). Po dodaniu A37 (~1299) i Honor 400 (~1499) w budżecie będą 3-4 telefony. | „co najmniej dwie karty w budżecie; karta »Powyżej budżetu« tylko wtedy, gdy w budżecie jest mniej niż trzy telefony” |

## Zadania

| ID | Zadanie | Pliki / miejsca | Wynik |
|---|---|---|---|
| E10-01 | **Rekordy danych** — po jednym, w kolejności: Honor 400 → Galaxy A37 → Nord 5 → V70 FE (D1) → Note 17 Pro (D2). Pełny rekord wg schematu `galaxy-a57-8-256`: `id` (slug **zawiera pojemność**, np. `honor-400-8-256`, `galaxy-a37-5g-8-256`, `oneplus-nord-5-8-256`, `vivo-v70-fe-8-256`, `redmi-note-17-pro-5g-8-512` — test „id zgodne z wariantem”), `status: "ok"`, `reveal` (name, brand, ≥ 1 `shopLinks` https bez `utm_`/`ceneo_cid`), `variant` (`fromList` = nazwa dokładnie z listy użytkownika), `price` (pln ≤ 2000, source, url, checkedAt, providedBy, note, `otherObservations`), `specs` (komplet 28 pól; brak = `null`), `scores` (13 ocen + `value: null`), `basis` (14 wpisów z cytatem źródła), `sources`, `scoreConfidence` (dokładnie 13 kluczy), `scoresEstimatedNeutral: []` | `src/data/phones.json` | 4-5 nowych rekordów |
| E10-02 | **`_meta`**: `generatedOn` = wspólny `checkedAt`; nowa pozycja w `rules` („Etap 10: dołączone … na podstawie przeglądu listy z ETAP-10, decyzje D1-D6 z dnia …”); `specsCompletedNote` o źródłach nowych rekordów | `src/data/phones.json` → `_meta` | spójne metadane |
| E10-03 | **Stałe**: `EXPECTED_POOL_SIZE = 10` → 14/15 (`pool.ts:8`); `PRICES_CHECKED_AT` (`pool.ts:7`); `ENGINE_STATUS` (`pool.ts:70-71`: „żona #1 69 pkt”, „Budżet 1500 zł daje dwie karty…” → nowe liczby po E10-08); `SLIDERS_STATUS` (`pool.ts:129`: „z 10 telefonów”); `ROADMAP_STAGES` (`pool.ts:47`) — nowy wiersz `{ id: 10, name: 'Rozszerzenie puli modeli', done: false, active: true }` (stopka liczy `roadmapStatus().total` z etapów ≥ 1 → 10) | `src/data/pool.ts` | brak zaszytej „10” |
| E10-04 | **Teksty**: `strings.ts:371` („Pasuje 8 z 10 telefonów”) → tekst bez liczby albo z `pool.count`; przejrzeć `src/data/docs.ts`, `SkeletonPanel`, `SessionPanel` i ekrany-zaślepki pod kątem „10 telefonów” | `src/data/strings.ts`, `src/data/docs.ts`, `src/components/*` | teksty zgodne z pulą |
| E10-05 | **Anonimizacja**: `KNOWN_FORBIDDEN` (`anonymize.ts:314`) — marki `honor`, `oneplus`, `vivo` **już są**; dopisać nakładki i serie: `magicos`, `magic`, `oxygenos`, `oxygen`, `originos`, `funtouch`, `nord`, oraz sklepy z nowych źródeł: `neonet`, `oleole`, `euro` (RTV Euro AGD), `kaufland`, `skapiec`, `ceneo`, `e-smartphone`. Nazwy modeli, chipów i etykiety sklepów dochodzą automatycznie z `collectForbiddenTokens` (`reveal.name`, `brand`, `specs.chip`, `shopLinks.label`). Uwaga: `addTokens` pomija czyste liczby („400”) i tokeny < 3 znaków bez cyfry („FE”) — leak „Honor” i „V70” łapią `honor`/`v70`, ale w `basis` nie wolno pisać „model 400” bez marki. Uruchomić testy wycieku | `src/lib/anonymize.ts`, `tests/anonymize.test.ts`, `tests/cards-screen.test.ts` | karta bez marki i nakładki |
| E10-06 | **Testy liczebności**: `tests/phones-schema.test.ts:78-79` („jest 10 telefonów” → `EXPECTED_POOL_SIZE`) i komentarz `:11`; `tests/quiz-screen.test.ts:171` („Pasuje 10 z 10” → regex z `PHONES.length`) i `:234` (`entries.length` = 10 → `PHONES.length`); komentarz `tests/data.ts:5`. Pozostałe testy już liczą z `POOL.length`/`PHONES.length` (`ranking-screen`, `persona`, `scoring`, `history-transfer`, `edge-states`) — bez zmian | `tests/*` | brak stałej „10” w testach |
| E10-07 | **Testy person, reguł i wydania**: `tests/persona.test.ts:99-115` (9.1.4 wg D6), `:67` (trójka referencyjna „żony” — sprawdzić po każdym rekordzie), `tests/calibration.test.ts` (E9-03: rozstęp S i progi 0,25/0,75 — ponowny pomiar), `tests/score-rules.test.ts:107-150` (spójność nowych ocen z `scoringRules.ts` — przechodzi, jeśli oceny policzone z reguł), `tests/release-guard.test.ts` (status `ok`, cena ≤ 2000, ≤ 30 dni, 13 pewności) | `tests/*` | zielone bez wyjątków |
| E10-08 | **QUIZ-SPEC 9.1-9.4 i 2.6** — ponowny pomiar trzech person na nowej puli (tymczasowy wydruk rankingu dla `BLEND` 0 / 0,25 / 0,5 / 0,75 / 1), nowe liczby referencyjne i diff „co się przesunęło i dlaczego”. Spodziewane przesunięcia z normalizacji min-max: nowe **maksimum `smoothness`** (Snapdragon 8s Gen 3 w Nord 5 obniża znormalizowane oceny reszty), kolejne telefony z **`battery` = 100 pojemności** (V70 FE, Note 17 Pro), nowe **minimum `durability` 55** (IP65 w Honor 400 i Nord 5 podnosi znormalizowane oceny IP68) | `planning/QUIZ-SPEC.md` 9.1-9.4, 2.6; `tests/personas.ts` | zaktualizowana referencja |
| E10-09 | **Pytania i filtry** (opcjonalnie, poza DoD): pytanie C3 (microSD) pozostaje aktywne (Edge 60); filtr pamięci ma tylko „dowolna / min. 256 GB” (`FilterPanel.tsx:99-105`, typ `minStorageGb?: 256` w `types/ranking.ts:42`). Przy D2 = tak rozważyć opcję „min. 512 GB” (15T i Note 17 Pro) — wymaga zmiany typu, pytania, filtra i testów `sliders-screen` | `src/data/questions.ts`, `src/components/FilterPanel.tsx`, `src/types/ranking.ts` | decyzja zapisana |
| E10-10 | **Dokumenty**: `PROJECT.md` §3 (tabela modeli: nowe wiersze z ceną i statusem, nowa lista decyzji z datą, D3), §5 („10 telefonów” w diagramie), §7.5 (tylko przy D4 = zmiana); `ROADMAP.md` (tabela etapów: wiersz 10; „Stan danych”: nowe wiersze; akapit „Stan po etapie 10”); `README.md` (`:109` „pula 10 telefonów”, `:240`, `:323`, `:345`, sekcja „Stan danych” `:460-490`); ten plik (status zadań, zapis decyzji D1-D6) | `planning/*.md`, `README.md` | dokumenty = stan repo |
| E10-11 | **Odświeżenie cen całej puli jednego dnia** (14-15 rekordów, 2-3 sklepy każdy; Empik/Allegro blokują odczyt → 👤): wspólny `checkedAt`, poprzednie ceny do `otherObservations`, Edge 70 Fusion po 30.11.2026 → cena regularna (A5), 15T 12/256 vs 12/512 (D3), ceny **bez kuponów** (kupon do `price.note`) | `src/data/phones.json`, `pool.ts:7` | ceny ≤ 7 dni |
| E10-12 | **Walidacja po każdym kroku**: `npm run validate-data` (0 błędów; każde ostrzeżenie z uzasadnieniem w ROADMAP), `npm run data-gaps -- --strict`, `npm run stale-prices`, `npm test`, `npm run typecheck`, `npx eslint .`, `npm run build`; na końcu `npm run release` | `scripts/*`, CI | zielony potok |
| E10-13 | **UI na większej puli**: pełny ranking 14-15 wierszy na telefonie (przewijanie pionowe, brak poziomego — UI-SPEC 3.6), licznik puli w suwakach, sekcja „Poza pulą” przy budżecie 1500 zł, oba motywy; `tests/a11y-audit.test.ts` | `src/screens/RankingScreen.tsx`, `SlidersScreen.tsx` | bez regresji |
| E10-14 | **Wydanie**: przy D5 = przed v1.0 pula wchodzi do tagu `v1.0`; inaczej tag `v1.1` i wpis w README „co nowego” | repo | tag |

## Kolejność wykonania

1. **D1-D6** (👤) — bez D1/D2 nie wiadomo, czy pula ma 14 czy 15 rekordów.
2. **E10-01 (Honor 400)** + od razu **E10-03, E10-04, E10-06** — pierwszy nowy rekord wywraca testy liczebności, więc stałe i testy zmieniamy razem z nim.
3. **E10-05** — po pierwszym rekordzie uruchomić test wycieku; dopisać brakujące tokeny.
4. **E10-01 (A37, Nord 5, V70 FE, Note 17 Pro)** — po każdym rekordzie **E10-12** i diff person (żona / aparat / bateria); jeśli zmienia się #1 „żony”, zapisać dlaczego — **nie poprawiać wagami** (PROJECT 7.6 pkt 6).
5. **E10-07 + E10-08** — po ostatnim rekordzie: nowe liczby referencyjne, nowe brzmienie 9.1.4, ponowny pomiar `BLEND`.
6. **E10-09** (decyzja), **E10-13** (UI), **E10-10** (dokumenty).
7. **E10-11** w dniu wydania → **E10-12** (`npm run release`) → **E10-14**.

## Szablon pracy nad jednym rekordem (checklista)

- [ ] **Cena**: sklep z polskiej dystrybucji, egzemplarz nowy, ≤ 2000 zł, URL bez `utm_*`/`ceneo_cid`, `checkedAt` = dzień odczytu, drugi odczyt w `otherObservations`.
- [ ] **Specyfikacja** z oficjalnej strony producenta (+ GSMArena / Notebookcheck): `displayInch`, `panel`, `refreshHz`, `resolution`, `peakNits`, `ramGb`, `storageGb`, `storageType`, `microSd`, `chip`, `batteryMah`, `chargingW`, `wirelessCharging`, `chargerInBox`, `ip`, `weightG`, `thicknessMm`, `dimensionsMm`, `cameras` (main / ultrawide / macro / telephoto / selfie — opis ze źródła, parser bierze pierwszą liczbę przed „MP”), `os`, `updatesOsGenerations` + `updatesSecurityYears` (model preferowany, A4), `updatesNote`, `sim`, `nfc`, `video`, `bluetooth`, `batteryCycles`, `batteryTests` + `batteryEndurance`, `chargingTests`.
- [ ] **Oceny obiektywne** wyłącznie funkcjami z `src/data/scoringRules.ts`: `battery` (0,5 × pojemność + 0,5 × wytrzymałość z testu GSMArena/PCMark — bez testu ocena z recenzji i pewność `medium`), `charging`, `updates`, `storage`, `durability`.
- [ ] **Oceny dowodowe** (`photoDay`, `photoIndoor`, `photoMotion`, `selfie`, `video`, `zoom`, `smoothness`, `display`): DXOMARK / GSMArena / PhoneArena / Notebookcheck / polskie redakcje; bez testu — klasa sprzętu, pewność `low` i zdanie o luce w `basis` (test „oceny low mają zdanie o luce”).
- [ ] `basis.zoom` zawiera „brak teleobiektywu (zoom 2x z kadrowania)”, gdy `telephoto: null` (reguła B8) — dotyczy wszystkich pięciu kandydatów.
- [ ] `sources`: URL do **każdej** wpisanej wartości; `basis` cytuje źródło, nie tylko liczbę.
- [ ] `npm run validate-data` → `npm test` → `npm run typecheck` → diff person → wiersz w ROADMAP „Stan danych”.

## Punkt startu dla każdego rekordu (z przeglądu listy; wartości ze wzorów do potwierdzenia po wpisaniu specyfikacji)

| Telefon | Co już wiemy (źródła w przeglądzie) | Do potwierdzenia przed wpisem | Wstępne oceny ze wzorów |
|---|---|---|---|
| Honor 400 8/256 | SD 7 Gen 3, 6,55″ AMOLED 120 Hz, 5300 mAh Si/C, 66 W, 200 MP OIS + 12 MP UW, 50 MP selfie, IP65, 184 g, 6 + 6 lat | klasa IP na karcie PL (Allegro pisze IP67, oficjalnie IP65), zasilacz w pudełku, godziny testu baterii | pojemność 43 · `charging` 68 · `updates` 86 · `storage` 75 · `durability` 55 |
| Galaxy A37 5G 8/256 | Exynos 1480, 6,7″ Super AMOLED 120 Hz, 5000 mAh, 45 W, 50 MP OIS + 8 MP UW + 5 MP, 12 MP selfie, IP68, 196 g, 6 + 6 lat (do 03/2032), 1200 cykli | cena właśnie 8/256 (1249 zł może być 6/128), zasilacz (brak), godziny testu baterii | pojemność 33 · `charging` 40 · `updates` 86 · `storage` 75 · `durability` 90 |
| OnePlus Nord 5 8/256 | SD 8s Gen 3, 6,83″ AMOLED 144 Hz, 5200 mAh (EU), 80 W, 50 MP OIS + 8 MP UW, 50 MP selfie, IP65, 4 + 6 lat (do 07/2031), brak eSIM | oferta sklepu regularnego (nie marketplace), wariant EU = 5200 mAh, zasilacz | pojemność 40 · `charging` 87 · `updates` 71 · `storage` 75 · `durability` 55 · `display` +5 za 144 Hz |
| vivo V70 FE 8/256 | Dimensity 7360 Turbo, 6,83″ AMOLED 120 Hz, 7000 mAh, 90 W, 200 MP + UW, 32 MP selfie, 4K przód i tył, IP68/IP69, 200 g | **polityka aktualizacji** (wersje + lata; brak źródła → ocena z jednej składowej wg C1, nigdy zgadywana), zasilacz, godziny testu | pojemność 100 · `charging` 100 · `storage` 75 · `durability` 95 |
| Redmi Note 17 Pro 5G 8/512 (D2) | SD 6s Gen 4, 6,83″ AMOLED 1,5K 120 Hz, 8340 mAh, 67 W, 223 g, LPDDR4X/UFS 3.1, **brak 4K** | klasa IP z mi.com/pl, polityka aktualizacji, oferta ≤ 2000 zł w sklepie regularnym | pojemność 100 (clamp, D4) · `charging` 69 · `storage` 100 · `video` niskie z uzasadnieniem |

## Testy akceptacyjne

1. **Gdy** uruchomię `npm test` po dodaniu rekordów, **to** wszystkie testy są zielone z `EXPECTED_POOL_SIZE` równym liczbie rekordów, a żaden test nie ma zaszytej liczby „10”.
2. **Gdy** otworzę karty przed wyborem (oba motywy), **to** w DOM, atrybutach i adresie nie ma „Honor”, „OnePlus”, „Nord”, „vivo”, „V70”, „A37”, „MagicOS”, „OxygenOS”, „OriginOS” ani nazw sklepów z nowych źródeł.
3. **Gdy** odpowiem jak persona „żona” z budżetem 1500 zł, **to** trójka spełnia 9.1.1-9.1.3 oraz nowe 9.1.4 (D6), a QUIZ-SPEC 9 ma liczby zgodne z wydrukiem.
4. **Gdy** otworzę suwaki, **to** licznik pokazuje „Pasuje N z 14 (15) telefonów” i po filtrze „min. 256 GB” spada o dwa Pixele.
5. **Gdy** uruchomię `npm run data-gaps -- --strict` i `npm run stale-prices` w dniu wydania, **to** oba kończą się kodem 0.
6. **Gdy** otworzę pełny ranking na telefonie, **to** 14-15 wierszy przewija się pionowo bez poziomego scrolla, a axe nie zgłasza naruszeń.
7. **Gdy** porównam PROJECT §3, ROADMAP „Stan danych” i README ze stanem `phones.json`, **to** liczba telefonów, data cen i lista modeli są identyczne.

## Ryzyka i otwarte pytania

- **Normalizacja min-max** (`BLEND = 0,5`): nowe maksima (`smoothness`, `battery`) i minimum (`durability`) przesuwają znormalizowane oceny wszystkich telefonów — może zmienić #1 „żony” (dziś Edge 70 Fusion 69,4). Reakcja: opis w QUIZ-SPEC, nie zmiana wag (PROJECT 7.6 pkt 6); jeśli łamie niezmiennik 9.1.3, powtórzyć pomiar `BLEND` (E9-03).
- **Pewność ocen aparatów** nowych modeli bez DXOMARK → `low` z jawnym zdaniem; Note 17 Pro bez 4K obniża `video` — wpływ na personę „aparat”.
- **vivo — polityka aktualizacji**: jeśli nie znajdziemy źródła, `updates` liczy się z jednej składowej (C1) albo zostaje `null` + neutralne 50 + wpis w `scoresEstimatedNeutral` — to łamie test „zero ocen neutralnych” (`phones-schema`, `release-guard`, `score-rules`) → wtedy test dostaje jawny wyjątek z uzasadnieniem, a ROADMAP wpis „brak źródła”.
- **Ceny promocyjne**: Honor store 1499 zł z kuponem, Proshop Nord 5 1499 zł (03.2026) — do `price.pln` wchodzi cena bez kuponu z aktualnego dnia; promocje czasowe do `note` (jak A5 dla Edge 70 Fusion).
- **Krótkie tokeny** w anonimizacji: „400” (czyste cyfry) i „FE” (2 znaki) nie są tokenami — w `basis` pisać pełne nazwy tylko tam, gdzie i tak są redagowane; test wycieku musi objąć nowe rekordy.
- **Czas**: 4-5 rekordów × 1-2 h źródłowej pracy + pomiar person + dokumenty ≈ 2 dni robocze agenta, plus decyzje 👤 (D1-D6, Empik/Allegro).
- **Filtr 512 GB** (E10-09): bez niego Note 17 Pro i 15T nie mają osobnej ścieżki „duża pamięć” — pytanie C1 o pamięć daje tylko próg 256 GB.

## Wynik przeglądu listy 21 modeli (podstawa etapu)

Przegląd z listopada 2026 (ceny z Ceneo / Skąpiec / kart sklepów znalezione przez wyszukiwarkę — **przed
wpisem do `phones.json` odczytać ponownie na stronie oferty**, reguła: każda wartość ma URL w `sources`).
Kryteria: twardy limit 2000 zł, nowy egzemplarz z polskiej dystrybucji, model nie zastąpiony następcą
(miarą jest Pixel 8a z 05.2024 odrzucony 14.11.2026 jako „stary”), priorytety persony z PROJECT 2.

| Werdykt | Modele z listy | Uzasadnienie |
|---|---|---|
| **Już w puli (10)** | Galaxy A57, Pixel 10a, Galaxy A56, Edge 60, Xiaomi 15T (w puli 12/512 — D3), Edge 70 Fusion, Pixel 9a, Nothing (3a), realme 16 Pro+, Redmi Note 15 Pro | bez zmian |
| **Dodać (4)** | Honor 400 8/256 (~1432–1599 zł, 05.2025) · Galaxy A37 5G 8/256 (~1249–1499 zł, 03.2026) · OnePlus Nord 5 8/256 (~1499–1709 zł, 07.2025) · vivo V70 FE 8/256 (~1547–1799 zł, Q1 2026; D1) | nowe, w PL dystrybucji, ≤ 2000 zł; łatają największą lukę puli — dziś tylko 2 z 10 telefonów kosztuje ≤ 1500 zł (budżet docelowy); trzy nowe marki |
| **Warunkowo (2)** | Redmi Note 17 Pro 5G 8/512 (~1579–1799 zł, 09.2026; D2) · Redmi Note 14 Pro+ 5G 8/256 (1039–1499 zł, 01.2025) | Note 17 Pro: maksimum baterii i pamięci, ale słaby chip i brak 4K; Note 14 Pro+: dwukrotnie zastąpiony (Note 15 Pro w puli jest nowszy i tańszy) — raczej pominąć |
| **Odrzucić (5)** | Motorola Edge 50 Neo (09.2024, 4310 mAh, 1-2 sklepy) · Nothing Phone (2a) (03.2024, następca w puli) · Honor 200 (06.2024, następca = Honor 400) · OnePlus Nord 4 (brak ofert PL, import > 2000 zł) · Apple iPhone 16e 128 GB (2424–2999 zł) | modele z 2024 r. zastąpione lub znikające ze sprzedaży; iPhone powyżej twardego limitu (walidator zatrzymuje build) |

## Definicja ukończenia

Pula **14 (15)** rekordów ze statusem `ok` i cenami ≤ 7 dni; `validate-data` 0 błędów; `data-gaps -- --strict`
kod 0; wszystkie testy zielone bez zaszytych liczebności; test wycieku zielony dla nowych marek i nakładek;
QUIZ-SPEC 9.1-9.4 z nowymi liczbami i diffem; PROJECT §3, ROADMAP (tabela etapów + „Stan danych”) i README
zgodne z `phones.json`; `npm run release` przechodzi; decyzje D1-D6 zapisane w tym pliku.
