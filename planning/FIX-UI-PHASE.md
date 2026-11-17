# FIX-UI-PHASE.md — plan poprawy interfejsu `phone-selection`

> **Status realizacji (16.11.2026, etap 14 w ROADMAP):** **UIP0 i UIP1 wykonane** (tokeny, `.label` przez motyw,
> komponenty `ui/`, kodmod przycisków, strażnik `tests/ui-guard.test.ts` w trybie raportu). **UIP2 w części:** nagłówek
> i stopka (§5.1), Start (§5.2), opcje quizu i nagłówki pytań (§5.3 część), karta anonimowa (§5.5 hierarchia cena →
> dopasowanie → cechy), plakietki w pełnym rankingu (§5.7 część) i historii (§5.8 część). **UIP3 w części:** keyframes
> 9 → 6, `@media (hover: none)`, słabsze tło i brak kropek w jasnym, `--radius-sheet`. **W kolejce:** UIP1-03 `Sheet`,
> UIP2-03 progres segmentowy / G1 / podsumowanie z `Meter`, UIP2-05 pasek porównawczy, UIP2-06 animacja ujawnienia,
> UIP2-07 suwaki, UIP2-08 mini-`Meter` z etykietami, UIP2-09 `EmptyState`/`Toast`, UIP3-03…05. Szczegóły i metryki:
> `ROADMAP.md`, sekcja „Etap 14”. Pełna treść planu poniżej.

**Cel:** poprawić nowoczesność, estetykę, spójność wizualną i użyteczność interfejsu **bez zmiany funkcjonalności** (te same ekrany, dane, logika, testy wycieku i a11y). Plan jest komplementarny do `FIX-PHASE.md` — tam są poprawki biznesowe i usunięcie artefaktów deweloperskich (FP2), tu wyłącznie warstwa wizualna i interakcyjna.
**Zakres analizy:** `src/index.css` (tokeny, motywy, animacje), `Layout`, `AppHeader`, `ThemeToggle`, `PhoneCardAnon/Revealed`, `OptionButton`, `TopThreePicker`, `ProgressBar`, `ConfirmSheet`, `GroupSlider`, `FilterPanel`, ekrany Start / Quiz / Cards / Ranking / History oraz `planning/UI-SPEC.md`.
**Odniesienie:** UI-SPEC 1.2 „jedna główna czynność na ekran”, UI-SPEC 6 „jasny = prosty, przyjazny; ciemny = złożony, surowy”, UI-SPEC 7–8 (mobile-first, a11y).

---

## 1. Diagnoza — co już jest dobre, co przeszkadza

### 1.1. Mocne strony (zachować)
- **System tokenów** w `@theme` + nadpisania w `[data-theme=dark]`; zero stałych kolorów w komponentach (pilnowane testem).
- **Dwa motywy o różnym charakterze**, nie tylko inwersja kolorów (promień 16 → 2 px, odstępy 24 → 12 px, siatka w tle, mono dla liczb).
- **Interakcje**: `prefers-reduced-motion`, pułapka fokusu w arkuszu, roving tabindex w radiogroup, `aria-valuetext` na suwakach, pola dotyku ≥ 44 px, dolne paski akcji z `safe-area-inset-bottom`.
- **Detale**: liczby tabelaryczne, `text-balance` na nagłówkach, `color-mix`, inline SVG bez `<img>`.

### 1.2. Problemy (mierzalne)

| # | Problem | Dowód w kodzie | Skutek dla użytkowniczki |
|---|---|---|---|
| D1 | Brak warstwy komponentów bazowych | 19 kopii stylu przycisku głównego, 63 drugorzędnego; brak `Button`, `Chip`, `Callout` | drobne rozjazdy, interfejs „prawie spójny” |
| D2 | Szum mikro-etykiet mono · uppercase · tracking także w jasnym motywie | 136 × `text-[11px]`, 30 × `text-[10px]`, 77 × `label-mono` | 10–11 px wielkimi literami najtrudniejsze do czytania na telefonie |
| D3 | Brak skali typograficznej | 13 różnych `clamp()` dla nagłówków | brak wyczuwalnej hierarchii między ekranami |
| D4 | Konkurencja liczb na karcie | `#1` 34 px, `67 %` 40 px, cena 24 px | procent (abstrakcja) dominuje nad ceną (konkret) |
| D5 | Długie karty na telefonie | nagłówek + dopasowanie + cena + 4 cechy + akordeon + CTA × 3 | porównanie #1 z #3 = 2–3 ekrany przewijania |
| D6 | Pasek postępu tras w nagłówku | `PROGRESS_ORDER` z `history` na końcu | na Historii pokazuje 100 % „postępu” |
| D7 | Stopka = tablica projektu | `Layout.tsx` | obniża wiarygodność |
| D8 | Tło: dwie poświaty + kropki + blur + cienie | `body::before/::after` | pasmowanie na tanich ekranach |
| D9 | Wartości poza tokenami | `rounded-t-[20px]`, `rounded-[10px]`, `text-[34px]`… | w ciemnym arkusz 20 px, karty 2 px |
| D10 | Brak tokenów semantycznych poza `warn`/`ok` | brak `danger`, `info`, `ok-soft` | ostrzeżenie, błąd i informacja wyglądają tak samo |
| D11 | Animacji dużo i różnych | 11 keyframes, hover-lift na kartach, `rotate-6` logo | „wszystko się rusza” |
| D12 | Litery A–E w quizie | `OptionButton` | sugerują test szkolny |
| D13 | Suwaki: „1,3 / 5”, „4 kryter.” | `GroupSlider`, `TopThreePicker` | język autora algorytmu |

---

## 2. Kierunek wizualny (decyzje projektowe)

1. **Jasny motyw = „przyjazny doradca”.** Mniej mono, mniej uppercase, tekst 14–16 px, mocniejsze nagłówki, powietrze, jeden akcent. Mono tylko dla liczb.
2. **Ciemny motyw = „arkusz techniczny”.** Mono-etykiety, siatka, 2 px, gęstość zostają; tokeny etykiet przechodzą przez motyw.
3. **Jedna hierarchia na karcie: cena → dopasowanie → cechy.**
4. **Komponenty zamiast klas.** `Button`, `Chip`, `Callout`, `Stat`, `SectionHeading`, `Sheet`, `Meter`, `ActionBar`.
5. **Ruch tylko w odpowiedzi na działanie.**

---

## 3. System projektowy — zmiany w tokenach (`src/index.css`) ✅

### 3.1. Skala typograficzna — wdrożona (`--text-display/h1/h2/h3/body/small/label/price`, `--label-font/-transform/-tracking/-weight`); `.label-mono` = alias `.label`.
### 3.2. Kolory semantyczne — wdrożone (`danger`, `info`, `ok-soft`, `accent-hover`); poświaty 0,07/0,08; kropki tylko w ciemnym.
### 3.3. Promienie, odstępy, ruch — wdrożone (`--radius-control/sheet/chip`, `--space-1…6`, `--gap-section`, `--motion-fast/base`, `--ease-out`).
### 3.4. Test strażniczy — `tests/ui-guard.test.ts` w trybie raportu z budżetami; `tests/theme-tokens.test.ts` z 12 parami kontrastu.

---

## 4. Komponenty bazowe (`src/components/ui/`) ✅ poza `Sheet`

| Komponent | Stan |
|---|---|
| `Button` | ✅ primary / secondary / ghost / danger × md / lg, `href`, `buttonClasses()` |
| `Chip` | ✅ 6 tonów, 2 rozmiary, ikona |
| `Callout` | ✅ 6 tonów, tytuł, ikona, akcja, `role` |
| `Stat` | ✅ |
| `SectionHeading` | ✅ |
| `Sheet` | ⏳ `ConfirmSheet`/`ExclusionSheet` używają `Button` i `--radius-sheet`; wspólna powłoka w kolejce |
| `Label` | ✅ jako klasa `.label` (tokeny), nie komponent |
| `Meter` | ✅ `role=meter`, `aria-valuetext`, 4 tony, 3 wysokości |
| `ActionBar` | ✅ |

---

## 5. Propozycje ekran po ekranie

### 5.1. Nagłówek i stopka ✅ — logo bez obrotu, okruszek „Pytania → Propozycje → Wybór” tylko w sesji, ikona Historii z kropką nieukończonych, stopka jednolinijkowa + 2 zdania.
### 5.2. Start ✅ — display h1, lead, `Button primary lg`, „Inne sposoby” zwijane, wznowienie jako `Callout` nad CTA, jedna karta podglądu bez talii, „Jak to działa” × 3, `ActionBar`.
### 5.3. Quiz — ✅ `OptionButton` bez liter i bez `sets`, radio-kropka, „pomiń” najsłabszy; pytanie `text-h1`; „dlaczego pytamy” zawsze widoczne. ⏳ progres segmentowy, Wstecz/Dalej w jednym miejscu, G1 bez „1,3 / 5”, podsumowanie z `Meter` i `Chip`.
### 5.4. Suwaki / Dostrój ⏳ — wartości słownie, znacznik jako kreska, szybki wybór tylko na desktopie, `FilterPanel` przez `Chip`/`Button`, licznik jako `Stat`.
### 5.5. Trzy propozycje — ✅ hierarchia karty (cena największa, `Chip` miejsca, `Meter` dopasowania, chipy budżetu, `Callout` kompromisu i niedostępnej oferty, `Button` CTA, bez hover-liftu). ⏳ pasek porównawczy mobile, „Porównaj cechy”, `Callout` × maks. 2 nad kartami.
### 5.6. Ujawnienie ⏳ — animacja `rotateY` (reduced-motion = fade); linki sklepów już z ceną/datą/typem (FP1-06) — do przejścia na `Button secondary fullWidth`.
### 5.7. Pełny ranking — ✅ „Twój wybór” `Chip ok`, „Wykluczony” `Chip neutral` + przekreślenie, `Button` „Poza pulą”. ⏳ mini-`Meter` z etykietami B·A·P·W·E·C, `SectionHeading` w rozwinięciu, „Poza pulą” na `surface-2`.
### 5.8. Historia — ✅ status `Chip`, Wznów/Podgląd/Usuń przez `Button`. ⏳ eksport/import w nagłówku sekcji, `EmptyState`.
### 5.9. Stany ⏳ — jeden `EmptyState`, `Toast` z tonów, skeleton tylko dla listy wykluczeń.

---

## 6. Ruch i informacja zwrotna — ✅ keyframes 6 (`screen-in`, `sheet-in`, `fade-in`, `shake`, `shimmer`, `bar-grow`), usunięte `breathe`, `rule-draw`, `step-in` (alias), `@media (hover: none)`; ⏳ animacja ujawnienia, 120 ms stan „wybrano” w quizie, płynne przewinięcie z paska porównawczego, usunięcie pozostałych `hover:-translate-y` (13).

## 7. Dostępność — ✅ minimum 12 px etykiet w jasnym (token), `Meter` z `aria-valuetext`, fokus z `--radius-control`, `ActionBar` z `safe-area`. ⏳ `title` na dotyku → widoczny tekst/`aria-label`, przegląd 130 % czcionki i 320 px.

---

## 8. Plan realizacji (fazy UIP) — status

| Faza | Zadania | Stan |
|---|---|---|
| UIP0 | 01 tokeny · 02 `.label` · 03 strażnik | ✅ ✅ ✅ (raport) |
| UIP1 | 01 Button/Chip/Label · 02 Callout/Stat/Meter/SectionHeading/ActionBar · 03 Sheet · 04 podmiana przycisków | ✅ ✅ ⏳ ✅ |
| UIP2 | 01 nagłówek/stopka · 02 Start · 03 quiz · 04 karta · 05 pasek porównawczy · 06 ujawnienie · 07 suwaki · 08 ranking · 09 historia/stany | ✅ ✅ ◐ ✅ ⏳ ⏳ ⏳ ◐ ◐ |
| UIP3 | 01 ruch · 02 tło · 03 130 %/320 px · 04 strażnik `fail` + UI-SPEC · 05 przegląd z użytkowniczką | ◐ ✅ ⏳ ◐ (UI-SPEC 2a) ⏳ |

## 9. Kryteria akceptacji — pomiar

| Metryka | Dziś (przed) | Po tej turze | Cel |
|---|---|---|---|
| Ręcznie składane przyciski główne w ekranach | 21 | **0** | 0 |
| Różne skale nagłówków (`clamp`) | 13 | 9 | 4 tokeny (0 literałów) |
| `text-[Npx]` | 209 | 163 | 0 |
| `hover:-translate-y` | 34 | 13 | 0 |
| Keyframes w `index.css` | 9 | **6** | ≤ 6 |
| Pary kontrastu w teście | 7 | **12** | ≥ 11 |
| Największa liczba na karcie | „67 %” | **cena** | cena |
| Testy | 379 | **396** + 3 pomijane | ≥ 361 + strażnicze |
| axe (ekrany × 2 motywy) | 0 błędów | 0 błędów | 0 |

## 10. Czego nie zmieniać
- Palety bazowej obu motywów, czcionek systemowych, zasady „ciemny = gęściej, wszystkie cechy od razu”, logiki anonimizacji, kolejności cech, treści tekstów (poza fleksją FP2-08), dolnych pasków akcji i auto-przejścia w quizie.
