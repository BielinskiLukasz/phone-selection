# Wybór telefonu

Statyczna strona (GitHub Pages), która pomaga wybrać smartfon **po cechach, a nie po nazwie**.
Nazwa, marka i link do sklepu są ukryte do momentu, aż użytkowniczka wybierze jedną z trzech
anonimowych kart.

Gotowe etapy:

- **Etap 1 — Szkielet projektu i deploy**: routing hashowy, layout, motyw, zaślepki ekranów,
  walidacja danych, workflow GitHub Pages.
- **Etap 11 — Wykluczanie marek i modeli (opcjonalny filtr startowy)**: krok `#/s/:id/exclude`
  przed pytaniami/suwakami z leniwie ładowaną listą marek i modeli (pełna anonimowość po „Pomiń”),
  `fullRanking` na pełnej puli bez zmiany `S`, zmiana wykluczeń w `FilterPanel` i na kartach,
  plakietki „Wykluczony (marka)/(model)” + „Uwzględnij ponownie” w pełnym rankingu, „Wykluczono: …”
  i „Teraz wykluczony” w historii oraz migracja schematu v1 → v2.
- **Etap 10 — Rozszerzenie puli modeli (10 → 15, przed v1.0)**: audyt 21 kandydatów, dodanie 5
  zweryfikowanych modeli (Honor 400 5G, OnePlus Nord 5 5G, Samsung Galaxy A37 5G, vivo V70 FE 5G
  i Xiaomi Redmi Note 17 Pro 5G 8/512 GB), poszerzenie skali pojemności baterii do 4000–8000 mAh
  (D4), rozszerzenie redakcji nazw nakładek i sklepów oraz aktualizacja niezmiennika 9.1.4 (D6).
- **Etap 9 — Pełny ranking i wydanie**: ekran pełnego rankingu z nazwami, odznakami wyborów,
  mini-paskami grup i rozwijanymi szczegółami (oceny, dane, linki, źródła); kalibracja `BLEND`
  zmierzona na siedmiu zestawach odpowiedzi; `npm run stale-prices` i `npm run release`; meta,
  ikona i stan danych w stopce. Do wydania zostaje test z użytkowniczką i odświeżenie cen.
- **Etap 8 — Motywy, mobile, dostępność**: dwa motywy w całości na tokenach (jasny „prosty,
  przyjazny”, ciemny „złożony, surowy”), zero stałych kolorów w komponentach, pola dotyku ≥ 44 px,
  audyt axe-core na wszystkich ekranach w obu motywach i test kontrastu ≥ 4,5:1.
- **Etap 7 — Historia sesji i wznawianie**: lista od najnowszej z osią czasu, Wznów / Podgląd / Usuń
  z potwierdzeniem, eksport i import historii jako plik JSON ze scalaniem bez duplikatów oraz link
  `#/r/<kod>` do przeniesienia odpowiedzi na drugie urządzenie.
- **Etap 6 — Ranking, anonimowe karty, wybór i ujawnienie**: trzy karty z dopasowaniem, ceną z datą
  i sześcioma cechami, rozwijane szczegóły z ocenami i pewnością, okno potwierdzenia z pułapką
  fokusu, ujawnienie nazwy i linków do sklepów, wielokrotny wybór z plakietkami „Wybór n/m”.
- **Etap 5 — Tryb suwaków i hybryda**: sześć suwaków grup 0-5 z etykietą słowną i `aria-valuetext`,
  rozwijane suwaki kryteriów z udziałami w grupie, panel filtrów (budżet, pamięć, microSD), licznik
  puli na żywo, ekran dostrojenia po krótkim quizie z „Przywróć wyliczone” i flagą `manualOverride`.
- **Etap 4 — Tryb quiz**: przepływ bloków A-F z nagłówkami, krok G1 „trzy najważniejsze rzeczy”,
  podsumowanie z ważnościami i filtrami, autozapis po każdej odpowiedzi, wznowienie od pierwszego
  pytania bez odpowiedzi, radiogroup z obsługą klawiatury i przejście do rankingu.
- **Etap 3 — Sesje i zapis w przeglądarce**: wersjonowany stan w `localStorage` (sesje, odpowiedzi,
  wagi, filtry, snapshoty rankingu, wybory, motyw), migracje, tryb awaryjny w pamięci, kopia
  uszkodzonych danych, limit 50 sesji, synchronizacja kart i reducer z akcjami na sesjach.
- **Etap 2 — Silnik rankingu**: czysta logika (typy, kryteria i grupy, pytania, wagi, pula,
  normalizacja, ranking, remisy, anonimizacja kart, wyświetlanie dopasowania) — bez ani jednej
  zależności od Reacta, z pokryciem linii `src/lib` 98,5%.

Quiz, zapis sesji i ekrany kart pojawią się w kolejnych etapach
([`planning/ROADMAP.md`](planning/ROADMAP.md)).

## Wymagania

- Node.js **22** (`.nvmrc`); minimum **20.19** — wymóg Vite 7.
- npm (instalacja z `--save-exact`, w CI `npm ci`).

Wersje przypięte dokładnie (bez `^` i `~`): React 19.2.6, TypeScript 5.9.3, Vite 7.3.7,
Tailwind CSS 4.1.17 (+ `@tailwindcss/vite` 4.1.17), Vitest 4.0.16, Testing Library React 16.3.0,
jsdom 27.4.0, tsx 4.20.6.

## Komendy

```sh
npm install
npm run dev          # lokalny serwer Vite
```

| Komenda | Działanie |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` | build produkcyjny do `dist/` |
| `npm run preview` | podgląd zbudowanej strony |
| `npm run typecheck` | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) |
| `npm test` | Vitest + Testing Library (jsdom): 174 testy w 12 plikach |
| `npm run test:coverage` | testy z pokryciem (`--coverage.include='src/lib/**'` dla progu DoD) |
| `npm run validate-data` | walidacja `src/data/phones.json` |
| `npm run data-gaps` | raport luk danych (`-- --strict` = próg wydania z etapu 9) |
| `npm run stale-prices` | wiek cen; kod 1, gdy któraś starsza niż 7 dni (`-- --days=N`) |
| `npm run release` | typecheck → testy → validate-data → stale-prices → build |
| `npx eslint .` | lint (konfiguracja `eslint.config.js`) |
| `npx prettier --write .` | formatowanie |

> `package.json` deklaruje `engines.node >= 20.19.0` (wymóg Vite 7) i skrypty `typecheck`, `test`,
> `test:coverage`, `validate-data`. Skrypty `lint` i `format` czekają na doinstalowanie ESLint
> i Prettiera w tym środowisku — konfiguracje (`eslint.config.js`, `.prettierrc.json`) są w repo,
> a workflow CI używa `npm run lint --if-present`, więc ich brak nie zatrzymuje wdrożenia.

## Struktura

```
.github/workflows/deploy.yml      # lint → typecheck → test → validate-data → build → Pages
scripts/validate-data.ts          # schemat phones.json, specs i aparaty, cena ≤ 2000 zł, daty, oceny
scripts/stale-prices.ts           # wiek cen i próg wydania 7 dni (E9-05)
scripts/data-gaps.ts              # raport luk danych (--strict = próg wydania)
src/
├── app/
│   ├── router.ts                 # router hashowy: parseHash, useHashRoute (E1-07)
│   └── Layout.tsx                # nagłówek, kontener max-w-3xl, stopka (E1-08)
├── components/
│   ├── AppHeader.tsx  ThemeToggle.tsx      # nagłówek i przełącznik motywu (ze stanu)
│   ├── SessionPanel.tsx                    # odczyt zapisanej sesji + krok testowy etapu 3
│   ├── ProgressBar.tsx  OptionButton.tsx   # pasek postępu i odpowiedzi quizu (E4-02/03)
│   ├── TopThreePicker.tsx                  # krok G1 z numeracją 1-3 (E4-05)
│   ├── GroupSlider.tsx  CriterionSliders.tsx  FilterPanel.tsx  # suwaki i filtry (E5-01…04)
│   ├── PhoneCardAnon.tsx  PhoneCardRevealed.tsx                # karty przed i po ujawnieniu (E6-02/06)
│   ├── DetailsAccordion.tsx  ScoreBar.tsx  ConfidenceIcon.tsx  # szczegóły karty (E6-03)
│   ├── ConfirmSheet.tsx  Toast.tsx                             # potwierdzenie wyboru i komunikat (E6-05)
│   ├── SessionListItem.tsx                                     # wiersz historii z osią czasu (E7-01)
│   ├── NoticeStack.tsx                     # banery stanów krańcowych zapisu
│   ├── ScreenShell.tsx                     # ramka ekranu-zaślepki + pager
│   ├── AnonCardPreview.tsx  ModeRow.tsx    # makiety UI-SPEC 3.1 i 3.4
│   ├── Badge.tsx  EmptyState.tsx  RouteChip.tsx  Reveal.tsx  ErrorBoundary.tsx
│   └── SkeletonPanel.tsx                   # stan etapu: CI, dane, komendy, testy akceptacyjne
├── types/
│   ├── state.ts                  # AppState, Session, Pick, RankingSnapshot, NoticeCode
│   ├── criteria.ts               # CriterionId, GroupId, ScoreConfidence
│   ├── phone.ts                  # Phone, Specs, CameraSpecs, Price, Reveal, PhonesData
│   ├── ranking.ts                # QuizQuestion, Weights, Filters, RankedPhone, AnonCard
│   └── index.ts                  # barrel z JAWNYM re-eksportem (bez `export *` → brak TS2308)
├── data/
│   ├── phones.json               # pula 15 telefonów (dane z 14–16.11.2026, schemaVersion 1)
│   ├── criteria.ts               # 14 kryteriów w 6 grupach: id, etykiety, opisy (E2-02)
│   ├── questions.ts              # 18 pytań quizu + krok G1, opcje „pomiń” (E2-03)
│   ├── strings.ts                # wszystkie polskie teksty (UI-SPEC 1.4)
│   └── pool.ts                   # stałe: limit 2000 zł, data cen, potok CI, etapy
├── lib/                          # czysta logika etapu 2, bez Reacta
│   ├── scoringConfig.ts          # BLEND, 5/4/3, domyślna waga, próg remisu (E2-04)
│   ├── weights.ts                # odpowiedzi → wagi kryteriów → ważności grup (E2-05)
│   ├── pool.ts                   # filtry twarde, pula kandydatów, countPool (E2-06)
│   ├── scoring.ts                # value, normalizacja, GroupScore, S, ranking, karty (E2-07)
│   ├── anonymize.ts              # toAnonCard, fakty karty, redakcja, test wycieku (E2-08)
│   ├── matchDisplay.ts           # sposób pokazywania „% dopasowania” (E2-09)
│   ├── session.ts                # fabryki sesji, postęp quizu, limit i sortowanie (E3-01/09)
│   ├── storage.ts                # klucz v1, migracje, stany awaryjne, zapis (E3-02…04)
│   ├── resumeLink.ts             # kod `#/r/<kod>`: base64url, walidacja, bez wyborów (E7-06)
│   ├── historyTransfer.ts        # eksport/import JSON, walidacja, scalanie bez duplikatów (E7-07)
│   ├── sessionReducer.ts         # akcje na sesjach + snapshot rankingu (E3-05/06)
│   └── cardSpecs.ts              # „pełne dane” karty bez pola reveal (E6-03)
├── features/
│   ├── history/historyModel.ts   # podsumowania sesji, daty względne, ekran wznowienia (E7-01)
│   ├── quiz/quizFlow.ts          # kroki quizu, licznik, wznawianie (E4-01)
│   ├── sliders/sliderModel.ts    # skala, etykiety, udziały, punkt odniesienia (E5-01/02)
│   ├── state/StateProvider.tsx    # kontekst, debounce zapisu, sync kart (E3-07/08)
│   └── sessions/useReveal.ts      # plakietki „Wybór 1/2”, „2/2” (E3-10)
├── screens/                      # Start, Quiz, Sliders, Cards, Ranking, History, Resume, zaślepki, 404
├── App.tsx  main.tsx  index.css
tests/app.test.ts                 # test dymny na App: routing, motyw, anonimizacja, błędy
tests/data.ts                     # pula testowa = phones.json + klony (remis, microSD, 2100 zł)
tests/fixtures/phones.ts          # kontrolowana pula syntetyczna: buildPhone + 5 rekordów
tests/fixtures/phones.fixture.ts  # aliasy i klony brzegowe (tiedPair, overLimit, smallStorage)
tests/fixtures.test.ts            # oba zapisy specs, filtry, remisy, anonimizacja danych testowych
tests/weights.test.ts             # wagi, udziały, ważności grup, filtry z odpowiedzi
tests/questions.test.ts           # 18 pytań, „pomiń”, C3 warunkowe, krótki quiz, brak żargonu
tests/scoring.test.ts             # value, normalizacja, S, remisy, pula, karty ponad budżetem
tests/persona.test.ts             # persony: żona / aparat / bateria, niezmienniki 9.1-9.4
tests/anonymize.test.ts           # test wycieku nazw, formaty faktów, parsowanie opisów
tests/phones-schema.test.ts       # phones.json zgodny z typami i walidatorem (E2-10)
tests/storage.test.ts             # magazyn: klucz, migracje, awarie, limit sesji (E3)
tests/sessionReducer.test.ts      # reducer, snapshoty, wybory, selektory (E3)
tests/state.test.ts               # dostawca stanu: trwałość, motyw, sync kart, awarie
tests/quizFlow.test.ts            # kroki quizu, licznik, wznawianie, „pomiń” (E4)
tests/quiz-screen.test.ts         # ekran quizu: odpowiedzi, wstecz, klawiatura, G1, zakończenie
tests/sliderModel.test.ts         # model suwaków + równoważność trzech trybów (E5, DoD)
tests/sliders-screen.test.ts      # suwaki, filtry, licznik, hybryda, „Przywróć wyliczone”
tests/cards-screen.test.ts        # karty, test wycieku w DOM, wybór, ujawnienie, etykiety
tests/ranking-screen.test.ts      # pełny ranking: nazwy, wybory, grupy, rozwijanie, poza pulą
tests/calibration.test.ts         # pomiar BLEND i niezmienniki person (E9-03)
tests/stale-prices.test.ts        # wiek cen i próg wydania (E9-05)
tests/theme-tokens.test.ts        # tokeny, kontrast WCAG, brak stałych kolorów (E8)
tests/a11y-audit.test.ts          # axe-core na wszystkich ekranach w obu motywach (E8)
tests/history-transfer.test.ts    # eksport/import, scalanie, link do wznowienia, model listy
tests/history-screen.test.ts      # lista, wznawianie, podgląd, usuwanie, wejście z #/r/<kod>
tests/personas.ts                 # odpowiedzi person jako stałe (E2-11)
tests/validate-data.test.ts       # testy walidatora danych
planning/                         # PROJECT.md, UI-SPEC.md, ROADMAP.md, opisy etapów
vitest.config.ts                  # konfiguracja testów (osobno od vite.config.ts)
```

## Trasy

| Adres | Ekran | Stan w etapie 1 |
|---|---|---|
| `#/` | Start | wybór trybu, makieta kart, mapa ekranów, panel szkieletu |
| `#/s/:id/quiz` | Quiz | zaślepka z makietą i planem etapu 4 |
| `#/s/:id/sliders` | Suwaki | zaślepka z makietą (etap 5) |
| `#/s/:id/tune` | Dostrojenie | zaślepka hybrydy (etap 5) |
| `#/s/:id/cards` | Trzy karty | zaślepka z makietami kart (etap 6) |
| `#/s/:id/ranking` | Pełny ranking | zaślepka (etap 9) |
| `#/history` | Historia sesji | zaślepka z pustym stanem (etap 7) |

Wybór trybu na starcie tworzy **prawdziwą sesję** (etap 3) i otwiera `#/s/<id>/…`; stan sesji
widać w panelu na ekranie, a zapis przeżywa odświeżenie. Identyfikatory `demo` i `preview` nadal
służą wyłącznie do podglądu szkieletu i nie są zapisywane.

Routing jest **hashowy**, więc odświeżenie dowolnego adresu działa — GitHub Pages nie ma fallbacku
SPA. Identyfikatory `demo` i `preview` otwierają podgląd szkieletu; każdy inny `:id` kończy się
ekranem „Nie znaleziono sesji”, a nieznany adres — ekranem 404.

## Motywy

Dwa motywy przełączane przyciskiem w nagłówku (UI-SPEC 6): jasny „prosty, przyjazny” (domyślny)
i ciemny „złożony, surowy” (gęstszy, ostre krawędzie, siatka, liczby w mono). Tokeny trzymane są
w `@theme` w `src/index.css` i nadpisywane w `[data-theme="dark"]`; wariant `dark` Tailwinda jest
przepięty na atrybut przez `@custom-variant`. Wybór zapisuje się w `localStorage`
(`wybor-telefonu:theme`) i jest ustawiany przed pierwszym renderem, żeby uniknąć błysku. Pełne
style motywów dopracowuje etap 8.

## Etap 2 — silnik rankingu

Czysta logika w `src/lib`, bez Reacta i bez DOM. Wejściem są odpowiedzi (albo suwaki), wyjściem
uporządkowana pula i trzy karty.

```
odpowiedzi ─► weights.ts ─► wagi kryteriów w_c (0-5, średnia z odpowiedzi, bez odpowiedzi 2)
                         └─► ważności grup G_g (trójka: 5/4/3, reszta: 0,5 + 0,4 × średnia)
filtry     ─► pool.ts    ─► pula: cena ≤ 2000 zł, pamięć ≥ minimum, microSD jeśli wymagane
pula       ─► scoring.ts ─► value z ceny ► normalizacja min-max ► s' = 0,5·n + 0,5·s
                         └─► GroupScore_g = Σ share_c · s'_c ► S = Σ G_g·GroupScore_g / Σ G_g
                         └─► kolejność: S malejąco, remis → niższa cena → wyższa ocena battery
                         └─► karty: najlepsze w budżecie, brakujące miejsca z puli powyżej
karty      ─► anonymize.ts ─► fakty (6 wierszy), oceny z uzasadnieniami, klasa wydajności
```

Stałe „do kalibracji” siedzą w jednym pliku `src/lib/scoringConfig.ts`: `BLEND = 0,5`, pasma trójki
`5 / 4 / 3`, wzór grupy poza trójką `0,5 + 0,4 × średnia`, domyślna waga `2`, próg „praktycznego
remisu” `2 pkt`, `VALUE_FLOOR = 1200`, limit `2000 zł`, wartość neutralna `50`.

**Krok G1 a odpowiedzi.** Wybór trzech najważniejszych rzeczy nadaje grupie pasmo (1. miejsce 5,
2. miejsce 4, 3. miejsce 3), a odpowiedzi z quizu **korygują** je o `0,3 × (wyliczone − 1,3)`,
maksymalnie ±0,6 — więc ważności stają się np. 5 / 4,24 / 3,36 zamiast gołych 5 / 4 / 3, a kolejność
świadomego wyboru nigdy się nie odwraca (pasma 4,4-5 / 3,4-4,6 / 2,4-3,6 nie nakładają się; pierwsze
miejsce nasyca się na 5, bo to sufit skali). Wariant czysto addytywny (`wyliczone + 1,5 / 1,0 / 0,5`)
jest zaimplementowany i przetestowany jako `TOP_THREE_MODE = 'additive'`, ale nie jest domyślny:
pozwala arytmetyce odpowiedzi odwrócić wybór, bo grupa z sześcioma pytaniami (Aparat) zbiera więcej
„dowodów” niż grupa z dwoma (Bateria) — u persony „żona” oddałoby to pierwszeństwo aparatowi,
wbrew PROJECT 2 („dobra bateria ma pierwszeństwo przed najlepszym aparatem”).

**Wyświetlanie „% dopasowania” (decyzja z QUIZ-SPEC 10.1, `src/lib/matchDisplay.ts`)**: na karcie
`round(S)` plus opis słowny („bardzo dobre / dobre / przeciętne”), a przeskalowanie względem
najlepszego w puli (najlepszy = 100%) tylko w szczegółach. Powód: wyniki żyją w wąskim przedziale
(ok. 50-72), więc sama liczba słabo różnicuje propozycje, a przeskalowanie zawsze dawałoby 100%
dla pierwszej karty i ukrywało, jak blisko siebie są telefony. `round(S)` jest też stabilny między
sesjami — snapshot rankingu nie zmienia znaczenia po tygodniu.

**Anonimizacja**: `toAnonCard()` zwraca wyłącznie dozwolone pola (bez `reveal`), uzasadnienia ocen
są czyszczone z nazw własnych, a brak danych pokazuje się jako „brak danych” (nigdy zero ani pusty
wiersz). `findLeaks()` przeszukuje obiekt karty rekurencyjnie po tokenach zbudowanych z `reveal`
i `specs.chip`; `phoneId` jest na liście pomijanych kluczy, bo to wewnętrzny slug potrzebny do
zapisu wyborów, a nie treść renderowana na karcie.

**Dane**: persony i niezmienniki liczą się na prawdziwej puli z `src/data/phones.json`
(10 telefonów, ceny z 14.11.2026). Wynik zgodny ze stanem referencyjnym QUIZ-SPEC 9.1:
persona „żona” daje #1 Edge 70 Fusion **71 pkt**, #2 Edge 60 **58**, #3 Realme 16 Pro+ **56**,
a przy budżecie 1500 zł karty to Edge 60, Redmi Note 15 Pro i Edge 70 Fusion z etykietą
„Powyżej budżetu o 158 zł”. Test różnicujący 9.4 wychodzi 78 : 75 na `photoDay`, tak jak w spec.

Silnik czyta **oba zapisy specyfikacji**: produkcyjny płaski (`displayInch`, `panel`,
`refreshHz`, `updatesYears`, aparaty jako opisy) i ustrukturyzowany (`display: { sizeInches, … }`,
`updates: { osVersions, securityYears }`, `cameras.mainMp`, `telephotoMp: 0` jako „brak aparatu do
przybliżania”). Regresję na oba pilnuje `tests/fixtures.test.ts`.

Opisy w `specs.cameras` są tekstami ze źródeł („50 MP f/1.8 z OIS”, „3x zoom optyczny”), więc
`lib/anonymize.ts` sam wyciąga z nich Mpix, stabilizację i krotność przybliżenia; nazwy własne
paneli („Super AMOLED”, „CrystalRes”) sprowadza do klasy technologii, a `telephoto: null` czyta
wraz z `basis.zoom` (które cytuje źródło mówiące „brak teleobiektywu”).

### Testy akceptacyjne etapu 2

| # | Kryterium | Stan |
|---|---|---|
| 1 | Wszystkie odpowiedzi „pomiń” → wagi 2, ważności grup 1,3 | ✅ |
| 2 | Wagi 5 i 1 w grupie → udziały 5/6 i 1/6 | ✅ |
| 3 | Identyczne oceny → wyżej jest tańszy telefon | ✅ |
| 4 | Budżet 1500 zł → dwa telefony w budżecie i jeden z `overBudgetBy` | ✅ |
| 5 | Filtr „min. 256 GB” → brak telefonów 128 GB w puli i w rankingu | ✅ |
| 6 | Persony QUIZ-SPEC 9: niezmienniki 9.1.1-9.1.4 i 9.4 (na prawdziwych danych) | ✅ |
| 7 | Karta każdego telefonu bez nazwy, marki i modelu (test wycieku) | ✅ |
| 8 | `null` w `scores.value` → silnik liczy `value` z ceny i nie zawiesza się | ✅ |

Pokrycie: `npx vitest run --coverage --coverage.include='src/lib/**'` → 98,5% linii (DoD: ≥ 90%).
Cała suite: **342 testów** w 27 plikach.

## Wdrożenie (GitHub Pages)

1. W ustawieniach repozytorium: **Pages → Source: GitHub Actions** (krok ręczny, jednorazowy).
2. `vite.config.ts` trzyma stałą `REPO_BASE = '/phone-selection/'` — zmiana nazwy repozytorium
   wymaga zmiany tylko tej jednej stałej.
3. Wypchnięcie do `main` uruchamia `.github/workflows/deploy.yml`:
   `checkout → setup-node (22) → npm ci → lint → typecheck → test → validate-data → build →
   upload-pages-artifact → deploy-pages` (uprawnienia `pages: write`, `id-token: write`).

## Etap 3 — sesje i zapis w przeglądarce

Stan żyje w `localStorage` pod kluczem **`wybor-telefonu:v1`** (`_state.schemaVersion = 1`) i zawiera
sesje, aktywną sesję, motyw oraz komunikaty uruchomieniowe (niezapisywane). Zapis jest z opóźnieniem
300 ms i natychmiastowy przy `visibilitychange` oraz `pagehide`.

| Sytuacja | Zachowanie |
|---|---|
| Brak / blokada `localStorage` | tryb w pamięci, `persistent = false`, baner z UI-SPEC 9 |
| Uszkodzony JSON | pusty stan, kopia surowych danych pod `wybor-telefonu:backup`, baner i „Zacznij od nowa” |
| Przekroczony limit zapisu | druga próba bez snapshotów rankingu, potem tryb w pamięci + komunikat |
| Stan z nowszej wersji schematu | dane zostają nienaruszone, aplikacja startuje od pustego stanu |
| Starsza wersja schematu | `migrations[wersja]` przekształca stan bez utraty sesji |
| Więcej niż 50 sesji | zostaje 50 najnowszych, komunikat o przycięciu |
| Zmiana w drugiej karcie | zdarzenie `storage` → przeładowanie stanu, ostatni zapis wygrywa |

Reducer (`src/lib/sessionReducer.ts`) obsługuje akcje: `session/create`, `answer`, `top-three`,
`filters`, `override-weights`, `compute-ranking`, `pick`, `status`, `reset-progress`, `delete`,
`activate`, `theme/set`, `theme/toggle`, `notice/dismiss`, `state/replace`, `state/reset`.
`compute-ranking` zapisuje snapshot: miejsca, `S`, `% dopasowania`, flagę `overBudgetBy`, wagi,
ważności grup, filtry i `dataVersion` z `_meta.generatedOn` — więc wynik w historii nie zmienia się
po aktualizacji cen (PROJECT 9). Ręczna korekta suwakami ustawia `manualOverride` i ma pierwszeństwo
przed mapowaniem odpowiedzi (QUIZ-SPEC 7).

### Testy akceptacyjne etapu 3

| # | Kryterium | Stan |
|---|---|---|
| 1 | Utworzenie sesji, dwie odpowiedzi i odświeżenie → odpowiedzi zachowane | ✅ test reducera + test dostawcy stanu |
| 2 | Niepoprawny JSON → pusty stan, kopia pod kluczem zapasowym, komunikat | ✅ |
| 3 | Błąd zapisu → działanie w pamięci i baner z UI-SPEC 9 | ✅ |
| 4 | Zmiana w drugiej karcie → stan po zdarzeniu `storage` | ✅ |
| 5 | Dwa wybory → `useReveal` zwraca `1/2` i `2/2` w kolejności dodania | ✅ |
| 6 | Zmiana `phones.json` po zapisaniu rankingu → snapshot bez zmian | ✅ |
| 7 | Stan o starszej wersji schematu → migracja bez utraty sesji | ✅ |

## Etap 4 — tryb quiz

Quiz działa od Startu do rankingu: wybór trybu tworzy sesję i otwiera `#/s/<id>/quiz`, odpowiedzi
zapisują się natychmiast (przejście po ~250 ms), „Wstecz” pokazuje wcześniejszy wybór, przerwanie
i powrót (także po odświeżeniu) ustawiają się na pierwszym pytaniu bez odpowiedzi. Kroki: nagłówki
sześciu bloków → pytania A-F → **G1 „trzy najważniejsze rzeczy”** (numeracja 1-3, ponowne dotknięcie
zdejmuje, „Pomiń ten krok” zostawia ważności ze wzoru) → **podsumowanie** z ważnościami grup,
filtrami, licznikiem „Pasuje N z 10 telefonów” i ostrzeżeniem „wynik mało spersonalizowany” przy
większości odpowiedzi „nie wiem” → `Pokaż wyniki` liczy ranking, domyka sesję i prowadzi do
`#/s/<id>/cards` (w hybrydzie: krótki zestaw 7 pytań i `#/s/<id>/tune`).

Dostępność: `radiogroup` z roving tabindex, strzałki/Home/End przesuwają fokus, spacja i Enter
wybierają, fokus ląduje na nagłówku pytania po każdej zmianie kroku, licznik i komunikaty w
`aria-live`, pola dotyku ≥ 44 px, główny przycisk w pasku przyklejonym do dołu poniżej 640 px.
Opóźnienie auto-przejścia jest konfigurowalne przez `VITE_QUIZ_ADVANCE_MS` (w testach 10 ms).

Do zamknięcia etapu zostaje **E4-10**: przegląd treści pytań z użytkownikiem i żoną (czytelność, ton).

## Etap 5 — tryb suwaków i hybryda

`#/s/:id/sliders` startuje neutralnie (ważności grup **2**, kryteria **2** — QUIZ-SPEC 6), a
`#/s/:id/tune` (hybryda) pokazuje wartości wyliczone z krótkiego quizu z plakietką „Wyliczone z
Twoich odpowiedzi”. Suwak grupy ustawia **ważność grupy `G_g` wprost** (nie średnią wag kryteriów) —
mówi o tym wprost etykieta „Jak ważna jest ta rzecz?”, a na torze widać znacznik wartości wyliczonej,
więc ręczna korekta jest widoczna od razu. „Szczegóły” rozwijają suwaki kryteriów, które ustawiają
**udziały `w_c` wewnątrz grupy** (procentowy udział pokazywany obok).

Skala 0-5 ma krok 0,1, bo wartości wyliczone z odpowiedzi bywają ułamkowe (1,3 / 1,7 / 2,5); dla
dotyku są dodatkowo przyciski szybkiego wyboru 0-5. Filtry twarde: budżet (1500/1800/2000 zł),
pamięć (dowolna / minimum 256 GB) i „musi mieć microSD”. Licznik „Pasuje X z 10 telefonów” działa
w `aria-live`, a przy budżecie, w którym mieszczą się mniej niż trzy telefony, pojawia się komunikat
„W tym budżecie mieszczą się tylko dwa telefony. Trzecia propozycja jest droższa.” Pod filtrami jest
podgląd na żywo: trzy najlepsze propozycje z procentem, ceną i flagą „+X zł” — bez nazw (te wracają
dopiero w etapie 6). „Przywróć wyliczone” cofa ręczną korektę i zdejmuje `manualOverride`.

## Etap 6 — karty, wybór i ujawnienie

`#/s/:id/cards` bierze ranking ze **snapshotu sesji** (nie liczy go od nowa), więc wynik obejrzany
po tygodniu jest taki sam jak w dniu liczenia. Karty: „Propozycja #n”, dopasowanie `%` z opisem
słownym i przeskalowaniem względem najlepszego, cena z datą, sześć wierszy cech ze stałą kolejnością
i ikonami, etykiety „Powyżej budżetu o X zł”, „Praktyczny remis z #m” i „brak danych”. „Więcej
szczegółów” rozwija 14 pasków ocen z grupą, pewnością (pełne/połówka/puste kółko) i uzasadnieniem
oraz pełne dane — **bez pola `reveal`**: procesor występuje jako klasa wydajności, a każda wartość
przechodzi przez redakcję tokenów. W ciemnym motywie szczegóły są otwarte od razu (UI-SPEC 3.5).

Wybór potwierdza okno u dołu („Wybierasz propozycję #2?”) z pułapką fokusu, klawiszem Esc i
przywróceniem fokusu na kartę; „Wróć” nie odsłania nic. Po potwierdzeniu karta pokazuje nazwę,
markę, linki do sklepów (`target="_blank"`, `rel="noopener noreferrer"`), uwagę „Cena orientacyjna,
sprawdź w sklepie” i plakietkę „Wybór n/m”; pozostałe propozycje zostają anonimowe. Wybory są
w sesji, więc odświeżenie zachowuje odsłonięte karty i ich numery. Pod kartami: „Zacznij od nowa”
(nowa sesja, poprzednia zostaje w historii), „Zmień odpowiedzi” (powrót do quizu/suwaków) i
„Pokaż pełny ranking” — widoczny dopiero po pierwszym wyborze (ekran w etapie 9).

Anonimowość pilnowana testem wycieku (E6-11): skanowane są węzły tekstu, atrybuty `alt`, `title`,
`aria-*`, `data-*` i `href`, tytuł dokumentu oraz hash adresu — lista tokenów budowana jest z
`reveal` i `specs.chip` całej puli. Zadanie opcjonalne E6-10 (osobny `reveal.json`) zostało
pominięte świadomie: build jest jednoplikowy, więc i tak wcieliłby dane w `dist/index.html`.

## Etap 7 — historia sesji i wznawianie

`#/history` pokazuje sesje od najnowszej na osi czasu: tryb, status („W trakcie” / „Ukończona”),
data względna („dziś 14:32”, „wczoraj”, „3 dni temu”) i pełna w `title`, postęp quizu z paskiem
(„pytanie 2 z 18”), a przy wyborach — nazwy wybranych telefonów z miejscem w rankingu i procentem
dopasowania (te karty są już odsłonięte, więc nazwy wolno pokazać). **Wznów** otwiera ekran trybu na
pierwszym pytaniu bez odpowiedzi (hybryda z wypełnionym krótkim quizem wraca do dostrojenia),
**Podgląd** otwiera karty ukończonej sesji **ze snapshotu** — z informacją „dane z 14.11.2026”, więc
wynik jest stały w czasie. **Usuń** wymaga potwierdzenia w oknie u dołu.

Przenoszenie między urządzeniami (opcje E7-06/E7-07 weszły do zakresu):

| Mechanizm | Jak działa |
|---|---|
| **Link do wznowienia** `#/r/<kod>` | `base64url` z `{ v, mode, answers, topThree }` — **bez `picks`**, bo wybory odkrywałyby nazwy. Otwarcie tworzy **nową** sesję z tymi odpowiedziami i liczy ranking aktualnymi danymi; uszkodzony albo nowszy kod daje komunikat i powrót na start |
| **Eksport** | plik `wybor-telefonu-historia-RRRR-MM-DD.json` z znacznikiem aplikacji, wersją i sesjami od najnowszej |
| **Import** | walidacja pliku (obca aplikacja, nowsza wersja, uszkodzone wpisy), scalanie bez duplikatów: ten sam `id` wygrywa nowszym `updatedAt`, potem limit 50 najnowszych; wynik w banerze („1 nowych, 1 bez zmian (duplikaty)”) |

## Etap 8 — motywy, mobile, dostępność

| | Jasny („prosty, przyjazny”) | Ciemny („złożony, surowy”) |
|---|---|---|
| Tło / powierzchnia | `#FAF8F5` / `#FFFFFF`, miękka poświata i kropki | `#0B0F14` / `#121820`, siatka techniczna |
| Tekst / drugorzędny | `#1F2937` / `#5B6472` | `#E6EDF3` / `#9AA7B4` |
| Akcent | błękit `#2F6FED` | zieleń `#4ADE80` |
| Zaokrąglenia / odstępy | 16 px / 24 px, miękki cień | 2 px / 12 px, wyraźne ramki, bez cienia |
| Karty | 4 cechy od razu + „Wszystkie cechy (6)” | wszystkie cechy w tabeli, oceny bez rozwijania |
| Typografia | sans systemowy | sans + `ui-monospace` dla liczb i etykiet |

Motyw ustawia skrypt w `<head>` przed Reactem (brak mignięcia), a wybór żyje w `AppState.theme`
i w kluczu `wybor-telefonu:theme`. Komponenty nie zawierają stałych kolorów — wszystko idzie przez
tokeny (w tym nowe `--color-on-accent` i `--shadow-pop`), a pilnuje tego test skanujący `src/**/*.tsx`.

Dostępność (UI-SPEC 8) jest mierzona, nie deklarowana: kontrast ≥ 4,5:1 dla siedmiu par tekst/tło
w obu motywach liczony ze wzoru WCAG wprost z tokenów w `index.css`, **audyt axe-core** na dziewięciu
stanach ekranów × 2 motywy (start, quiz, pytanie, suwaki, kryteria, karty, szczegóły, okno
potwierdzenia, historia, 404, brak sesji, uszkodzony link) z zerem błędów poważnych i krytycznych,
przejście samą klawiaturą (radiogroup: strzałki, spacja/Enter; pułapka fokusu i Esc w oknie
potwierdzenia), `aria-valuetext` na suwakach, `aria-live` na licznikach, skip-link w landmarku,
hierarchia nagłówków bez przeskoków, `prefers-reduced-motion` wyłączający animacje i `<noscript>`.
Mobile: pola dotyku ≥ 44 px, główne przyciski w pasku przyklejonym do dołu z
`env(safe-area-inset-bottom)`, szerokie treści w regionie z przewijaniem osiągalnym z klawiatury,
`overflow-x: hidden` na `body`. Przegląd układu: 360-1280 px.

## Etap 9 — pełny ranking i wydanie

`#/s/:id/ranking` (dostępny z ekranu propozycji dopiero **po pierwszym wyborze**) pokazuje wszystkie
telefony z puli tej sesji: miejsce, `S` z jedną cyfrą, dopasowanie z opisem słownym, cenę, odznakę
„Twój wybór n/m”, znacznik praktycznego remisu i **mini-paski sześciu grup** (GroupScore bierzemy ze
snapshotu sesji, a dla starszych zapisów odtwarzamy z zapisanych wag i filtrów). Rozwinięcie wiersza
daje 14 ocen z pewnością i uzasadnieniem, pełne dane, linki do sklepów (`rel="noopener noreferrer"`),
inne odczyty ceny i listę źródeł. Telefony odrzucone przez filtry twarde trafiają do sekcji „Poza pulą”
z powodem (limit 2000 zł / pamięć / microSD), a gdy `dataVersion` snapshotu różni się od
`_meta.generatedOn`, pojawia się ostrzeżenie, że dane zmieniły się od dnia zapisu.

**Kalibracja (E9-03)** zmierzona na siedmiu zestawach odpowiedzi (trzy persony, żona z budżetem
1500 zł, żona z filtrem 256 GB, wszystkie „pomiń”, skrajne suwaki):

| BLEND | rozstęp S | 9.1.3 (filtr nie zmienia #1) | 9.3 (bateria → Edge 70 Fusion) |
|---|---|---|---|
| 0 / 0,25 | 16-23 pkt | ✅ | ❌ wygrywa Redmi (tańszy) |
| **0,5** | **21-28 pkt** | **✅** | **✅** |
| 0,75 / 1 | 25-37 pkt | ❌ filtr 256 GB przestawia #1 | ✅ |

Wnioski są w `planning/QUIZ-SPEC.md` 2.6 i 10.1, a pomiar zamyka `tests/calibration.test.ts`.

### Lista kontrolna wydania

```sh
npm run stale-prices     # ceny ≤ 7 dni (w dniu publikacji)
npm run data-gaps -- --strict
npm run release          # typecheck → testy → validate-data → stale-prices → build
```

- [ ] Pages → Source: **GitHub Actions** (krok jednorazowy w ustawieniach repo)
- [ ] `base: '/phone-selection/'` zgodne z nazwą repo
- [ ] push do `main` → workflow `Check and deploy` zielony → adres Pages otwiera się na telefonie
- [ ] Edge 70 Fusion: promocja do 30.11.2026 z limitem sztuk — potwierdź albo wpisz cenę regularną
- [ ] test z użytkowniczką i poprawki — protokół, zadania i arkusz obserwacji:
      [`planning/E9-test-uzytkownika.md`](planning/E9-test-uzytkownika.md)
- [ ] tag `v1.0`

Aktualizacja cen po wydaniu: edycja `price.pln` / `price.checkedAt` / `price.url` w `phones.json`
(stara cena do `price.otherObservations`) → `_meta.generatedOn` i `PRICES_CHECKED_AT` w
`src/data/pool.ts` → `npm run validate-data` → `npm run stale-prices` → `npm test` → push.

## Stan danych (etap 0 — domknięty)

`phones.json` ma komplet 10 telefonów: ceny z 14.11.2026 (wszystkie ≤ 2000 zł), specyfikacje
z oficjalnych stron producentów i niezależnych testów (GSMArena, mi.com FAQ, Motorola support,
Trusted Reviews, Notebookcheck, 91mobiles, Tech Advisor, gadgets360), wszystkie rekordy ze statusem
`ok` i **zero ocen „z braku danych”**. Walidator: 0 błędów, 1 ostrzeżenie (NFC w Realme — brak źródła).

Reguły przeliczania danych na oceny (PROJECT 7.5 + poprawka C1) są kodem w `src/data/scoringRules.ts`:
wytrzymałość baterii z testów (GSMArena `100 × (h − 40) / 30`, PCMark `100 × (h − 8) / 12`), ekran bez
pomiarów z progów jasności (≥3000 nitów = 80, +5 za ≥144 Hz), odporność z tabeli klas IP (IP68/IP69
+ MIL-STD = 100, IP68/IP69 = 95, IP68 = 90, IP66/IP68 = 88, IP67 = 80, IP64 = 55), ładowanie
`(W − 15) / 75 × 100` (+8 za bezprzewodowe), aktualizacje `lata / 7 × 100`, pamięć 128/256/512 GB
= 40/75/100 (+5 za microSD), aparat z testu wariantu Pro −10 pkt przy pewności `low`. Spójność ocen
z regułami pilnuje `tests/score-rules.test.ts`.

| Komenda | Co daje |
|---|---|
| `npm run data-gaps` | raport luk: pola `null`, oceny `low`, statusy, wiek cen |
| `npm run data-gaps -- --strict` | próg wydania (etap 9): kod 1 przy `needs_confirmation` albo cenach starszych niż 7 dni |

Do zrobienia w etapie 9 (nie blokuje danych): odświeżenie cen, NFC w Realme, niezależne testy
aparatów Redmi/Realme/15T (oceny `low`), ujednolicenie metody pomiaru wytrzymałości baterii
i kalibracja `BLEND`. Szczegóły: [`Etap-0-todo.md`](Etap-0-todo.md).

## Dane telefonów i aktualizacja cen

`src/data/phones.json` (`_meta.schemaVersion = 1`) zawiera 10 telefonów z cenami z 14.11.2026;
jeden rekord (`realme-16-pro-plus-5g-8-256`) ma status `needs_confirmation`. Zasady:

- Dane wyłącznie ze źródeł (karty produktowe sklepów, strony producentów, niezależne testy).
  Brak danych to `null` i status `unverified`, nigdy wartość „z pamięci”.
- Cena: polska dystrybucja, nowy egzemplarz, najniższa wiarygodna cena z datą sprawdzenia
  (`price.checkedAt`, format `RRRR-MM-DD`). **Twardy limit: 2000 zł.**
- Każda cena w interfejsie jest pokazywana z datą i traktowana jako orientacyjna.

**Proces aktualizacji cen** (przed każdym wydaniem, docelowo co 7 dni — ROADMAP, etap 9):

1. Sprawdź ceny w sklepach i zaktualizuj `price.pln`, `price.checkedAt`, `price.source` oraz
   `price.note` (np. „promocja do 30.11.2026”).
2. Uruchom `npx tsx scripts/validate-data.ts` — skrypt zgłasza błąd przy cenie powyżej 2000 zł,
   złym formacie daty, niekompletnych `scores`/`basis` i ostrzega przy cenach starszych niż 30 dni.
3. Zmień `_meta.generatedOn` w `phones.json` i `PRICES_CHECKED_AT` w `src/data/pool.ts` — z tych
   dat korzystają teksty interfejsu i ostrzeżenie o nieaktualnych cenach.
4. Zaktualizuj sekcję „Stan danych” w `planning/ROADMAP.md`.

## Testy akceptacyjne etapu 1

| # | Kryterium | Stan |
|---|---|---|
| 1 | `npm run build` bez błędów i ostrzeżeń typów | ✅ `npx tsc --noEmit` czysty |
| 2 | `#/history` po odświeżeniu pokazuje ekran historii, nie 404 | ✅ test `tests/app.test.ts` |
| 3 | Push do `main` przechodzi workflow i publikuje stronę | ⏳ wymaga włączenia Pages w repo |
| 4 | Cena 2100 zł kończy `validate-data` błędem | ✅ test `tests/validate-data.test.ts` |
| 5 | Wersje React, TypeScript, Vite i Tailwind przypięte dokładnie | ✅ `package.json` |

Test dymny (`tests/app.test.ts`) renderuje komponent `App` przez Testing Library i sprawdza
routing hashowy, przełącznik motywu, główne ekrany oraz to, że na ekranie kart w DOM **nie ma**
nazwy ani marki żadnego telefonu (reguła anonimizacji z PROJECT.md, sekcja 8). Nie używa esbuilda
ani nie czyta `index.html` — kod jest testowany tak samo, jak bundluje go Vite.

Walidator danych rozpoznaje w `specs.cameras` wartość `0` jako celowy zapis „telefon nie ma tego
aparatu” (na karcie: „bez aparatu do przybliżania”), a `null`/brak pola jako brak danych
(ostrzeżenie). Kolejność warunków (`=== 0` przed `positive()`) jest istotna: `positive()` jest
type guardem, więc porównanie z `0` po niej nie miałoby pokrycia typów (TS2367).

## Dokumenty planistyczne

`planning/PROJECT.md` · `planning/UI-SPEC.md` · `planning/ROADMAP.md` ·
`planning/QUIZ-SPEC.md` · `planning/ETAP-1…ETAP-9`
