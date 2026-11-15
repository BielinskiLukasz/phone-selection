# Wybór telefonu

Statyczna strona (GitHub Pages), która pomaga wybrać smartfon **po cechach, a nie po nazwie**.
Nazwa, marka i link do sklepu są ukryte do momentu, aż użytkowniczka wybierze jedną z trzech
anonimowych kart.

Gotowe etapy:

- **Etap 1 — Szkielet projektu i deploy**: routing hashowy, layout, motyw, zaślepki ekranów,
  walidacja danych, workflow GitHub Pages.
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
| `npx tsc --noEmit` | typecheck (strict, `noUncheckedIndexedAccess`) |
| `npx vitest run` | testy (Vitest + Testing Library, środowisko jsdom) |
| `npx vitest run --coverage` | testy z pokryciem (`--coverage.include='src/lib/**'`) |
| `npx tsx scripts/validate-data.ts` | walidacja `src/data/phones.json` |
| `npx eslint .` | lint (konfiguracja `eslint.config.js`) |
| `npx prettier --write .` | formatowanie |

> W repo docelowym te same komendy są podpięte jako skrypty `lint`, `typecheck`, `test`,
> `validate-data`, `format` i wywoływane przez workflow CI.

## Struktura

```
.github/workflows/deploy.yml      # lint → typecheck → test → validate-data → build → Pages
scripts/validate-data.ts          # schemat phones.json, specs i aparaty, cena ≤ 2000 zł, daty, oceny
src/
├── app/
│   ├── router.ts                 # router hashowy: parseHash, useHashRoute (E1-07)
│   └── Layout.tsx                # nagłówek, kontener max-w-3xl, stopka (E1-08)
├── components/
│   ├── AppHeader.tsx  ThemeToggle.tsx      # szkielet motywu
│   ├── ScreenShell.tsx                     # ramka ekranu-zaślepki + pager
│   ├── AnonCardPreview.tsx  ModeRow.tsx    # makiety UI-SPEC 3.1 i 3.4
│   ├── Badge.tsx  EmptyState.tsx  RouteChip.tsx  Reveal.tsx  ErrorBoundary.tsx
│   └── SkeletonPanel.tsx                   # stan etapu: CI, dane, komendy, testy akceptacyjne
├── types/
│   ├── criteria.ts               # CriterionId, GroupId, ScoreConfidence
│   ├── phone.ts                  # Phone, Specs, CameraSpecs, Price, Reveal, PhonesData
│   ├── ranking.ts                # QuizQuestion, Weights, Filters, RankedPhone, AnonCard
│   └── index.ts                  # barrel z JAWNYM re-eksportem (bez `export *` → brak TS2308)
├── data/
│   ├── phones.json               # pula 10 telefonów (ceny z 14.11.2026, schemaVersion 1)
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
│   └── matchDisplay.ts           # sposób pokazywania „% dopasowania” (E2-09)
├── features/theme/useTheme.ts    # data-theme + localStorage
├── screens/                      # Start, zaślepki sesji, Historia, 404, brak sesji
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

Stałe „do kalibracji” siedzą w jednym pliku `src/lib/scoringConfig.ts`: `BLEND = 0,5`, ważności
trójki `5 / 4 / 3`, wzór grupy poza trójką `0,5 + 0,4 × średnia`, domyślna waga `2`, próg
„praktycznego remisu” `2 pkt`, `VALUE_FLOOR = 1200`, limit `2000 zł`, wartość neutralna `50`.

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
Cała suite: **127 testów** w 9 plikach.

## Wdrożenie (GitHub Pages)

1. W ustawieniach repozytorium: **Pages → Source: GitHub Actions** (krok ręczny, jednorazowy).
2. `vite.config.ts` trzyma stałą `REPO_BASE = '/phone-selection/'` — zmiana nazwy repozytorium
   wymaga zmiany tylko tej jednej stałej.
3. Wypchnięcie do `main` uruchamia `.github/workflows/deploy.yml`:
   `checkout → setup-node (22) → npm ci → lint → typecheck → test → validate-data → build →
   upload-pages-artifact → deploy-pages` (uprawnienia `pages: write`, `id-token: write`).

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
