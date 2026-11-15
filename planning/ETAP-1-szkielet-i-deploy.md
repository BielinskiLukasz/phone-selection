# Etap 1 — Szkielet projektu i deploy

**Cel:** pusta, ale kompletna aplikacja (build, testy, lint, routing, motyw-szkielet) wdrożona na GitHub Pages.
**Zależności:** brak (może ruszyć równolegle z domknięciem etapu 0).
**Dokumenty:** [PROJECT.md](../../PROJECT.md) (sekcje 4, 11, 12), [UI-SPEC.md](../specs/UI-SPEC.md) (sekcje 1, 2, 7).

## Zakres

- **W zakresie:** inicjalizacja repo, przypięte wersje, Tailwind 4, lint/format, testy, router hashowy z pustymi ekranami, layout z nagłówkiem, deploy, walidacja danych w CI.
- **Poza zakresem:** logika rankingu, quiz, sesje, właściwe style motywów (etap 8).

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E1-01 | Utworzyć projekt Vite (szablon `react-ts`) i przypiąć wersje: `react` i `react-dom` 19.2.6, `typescript` 5.9.3, `vite` 7.3.7, `tailwindcss` i `@tailwindcss/vite` 4.1.17 (instalacja z `--save-exact`). Dodać `@vitejs/plugin-react` w wersji zgodnej z Vite 7 i `@types/react` dla Reacta 19 | `package.json`, `package-lock.json` |
| E1-02 | Zadeklarować `engines.node` (`>=20.19`, wymóg Vite 7), dodać `.nvmrc` z Node 22 | spójne środowisko lokalne i CI |
| E1-03 | Tailwind 4: plugin w `vite.config.ts`, `@import "tailwindcss";` w `src/index.css`, pusty blok `@theme` z tokenami z UI-SPEC (sekcja 6) | style działają |
| E1-04 | `tsconfig` w trybie ścisłym (`strict`, `noUncheckedIndexedAccess`), `resolveJsonModule` dla `phones.json` | brak błędów typów |
| E1-05 | ESLint + Prettier, skrypty `lint`, `format`, `typecheck` | zielone komendy |
| E1-06 | Vitest + Testing Library + jsdom, skrypt `test`, jeden test dymny renderujący `App` | zielony test |
| E1-07 | Router hashowy (`useHashRoute`) z trasami z UI-SPEC sekcja 2, ekrany-zaślepki, obsługa nieznanej trasy | nawigacja działa po odświeżeniu |
| E1-08 | Layout: `AppHeader` z miejscem na `ThemeToggle` (szkielet), kontener `max-w-3xl`, moduł `strings.ts` | wspólny układ |
| E1-09 | `vite.config.ts`: `base: '/<nazwa-repo>/'` (nazwa do ustalenia, trzymana w jednej stałej) | poprawne ścieżki zasobów |
| E1-10 | Workflow `deploy.yml`: `checkout` → `setup-node` (22, cache npm) → `npm ci` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run validate-data` → `npm run build` → `upload-pages-artifact` → `deploy-pages` (uprawnienia `pages: write`, `id-token: write`) | wdrożenie po wypchnięciu do `main` |
| E1-11 | Skrypt `scripts/validate-data.ts`: schemat `phones.json` (pola z PROJECT.md, sekcja 13), cena ≤ 2000, `checkedAt` w formacie daty, komplet `scores` (0-100, `null` tylko w `value`), ostrzeżenie o cenach starszych niż 30 dni | komenda `npm run validate-data` |
| E1-12 | README: wymagane Node, komendy, struktura, proces aktualizacji cen | dokumentacja |

## Struktura po etapie

```
.github/workflows/deploy.yml
scripts/validate-data.ts
src/app/{App.tsx,router.ts,Layout.tsx}
src/components/{AppHeader.tsx,ThemeToggle.tsx}
src/data/{phones.json,strings.ts}
src/index.css  src/main.tsx
vite.config.ts  tsconfig*.json  eslint.config.js  .nvmrc  README.md
```

## Testy akceptacyjne

1. **Gdy** uruchomię `npm run build`, **to** build kończy się bez błędów i ostrzeżeń typów.
2. **Gdy** otworzę `#/history` i odświeżę stronę, **to** widzę ekran historii (zaślepkę), a nie 404.
3. **Gdy** wypchnę zmianę do `main`, **to** workflow przechodzi i strona jest dostępna pod adresem Pages.
4. **Gdy** w `phones.json` ustawię cenę 2100 zł, **to** `validate-data` kończy się błędem.
5. **Gdy** sprawdzę `package.json`, **to** wersje React, TypeScript, Vite i Tailwind są dokładnie takie jak w sekcji 4 PROJECT.md (bez `^` i `~`).

## Ryzyka i otwarte pytania

- **Nazwa repo** wpływa na `base` i adres. Do czasu decyzji stała `REPO_BASE` w jednym pliku.
- Wersje pomocnicze (`@vitejs/plugin-react`, typy Reacta, Vitest) dobieramy do Vite 7 w momencie zakładania repo i zapisujemy w README.
- Włączenie Pages w ustawieniach repo (źródło: GitHub Actions) to krok ręczny.

## Definicja ukończenia

Wszystkie testy akceptacyjne zielone; adres Pages pokazuje ekran startowy z działającą nawigacją.
