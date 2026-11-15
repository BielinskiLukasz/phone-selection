# Wybór telefonu

Statyczna strona (GitHub Pages), która pomaga wybrać smartfon **po cechach, a nie po nazwie**.
Nazwa, marka i link do sklepu są ukryte do momentu, aż użytkowniczka wybierze jedną z trzech
anonimowych kart.

To **Etap 1 — Szkielet projektu i deploy**: routing, layout, motyw, zaślepki ekranów, walidacja
danych i wdrożenie są gotowe. Quiz, silnik rankingu i zapis sesji pojawią się w kolejnych etapach
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
├── data/
│   ├── phones.json               # pula telefonów (etap 0 — celowo pusta)
│   ├── strings.ts                # wszystkie polskie teksty (UI-SPEC 1.4)
│   └── pool.ts                   # stałe: limit 2000 zł, data cen, potok CI, etapy
├── features/theme/useTheme.ts    # data-theme + localStorage
├── screens/                      # Start, zaślepki sesji, Historia, 404, brak sesji
├── App.tsx  main.tsx  index.css
tests/app.test.ts                 # test dymny na App: routing, motyw, anonimizacja, błędy
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

## Wdrożenie (GitHub Pages)

1. W ustawieniach repozytorium: **Pages → Source: GitHub Actions** (krok ręczny, jednorazowy).
2. `vite.config.ts` trzyma stałą `REPO_BASE = '/phone-selection/'` — zmiana nazwy repozytorium
   wymaga zmiany tylko tej jednej stałej.
3. Wypchnięcie do `main` uruchamia `.github/workflows/deploy.yml`:
   `checkout → setup-node (22) → npm ci → lint → typecheck → test → validate-data → build →
   upload-pages-artifact → deploy-pages` (uprawnienia `pages: write`, `id-token: write`).

## Dane telefonów i aktualizacja cen

`src/data/phones.json` jest w etapie 1 celowo pusty — dane zbiera etap 0. Zasady:

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
3. Wpisz nową datę w `src/data/pool.ts` (`PRICES_CHECKED_AT`) — to z niej korzystają teksty
   interfejsu i ostrzeżenie o nieaktualnych cenach.
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
