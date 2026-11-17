# Wybór telefonu — ROADMAP.md

Etapy w kolejności realizacji. Każdy etap ma cel, zadania i **kryterium ukończenia (DoD)**. Szczegóły decyzji są w [PROJECT.md](./PROJECT.md).

Legenda: `[ ]` do zrobienia · `[~]` w toku · `[x]` zrobione

| Etap | Nazwa | Status |
|---|---|---|
| 0 | Dane telefonów i specyfikacja rankingu | `[x]` zrobione |
| 1 | Szkielet projektu i deploy | `[x]` zrobione |
| 2 | Silnik rankingu (czysta logika + testy) | `[x]` zrobione |
| 3 | Sesje i zapis w przeglądarce | `[x]` zrobione |
| 4 | Tryb quiz | `[x]` zrobione |
| 5 | Tryb suwaków i hybryda | `[x]` zrobione |
| 6 | Ranking, anonimowe karty, wybór i ujawnienie | `[x]` zrobione |
| 7 | Historia sesji i wznawianie | `[x]` zrobione |
| 8 | Motywy, mobile, dostępność | `[x]` zrobione |
| 9 | Pełny ranking, szlify i wydanie | `[~]` w toku (kod gotowy, czeka test i wydanie v1.0) |
| 10 | Rozszerzenie puli modeli (10 → 15, przed v1.0) | `[x]` zrobione |
| 11 | Wykluczanie marek i modeli (opcjonalny filtr startowy) | `[x]` zrobione |
| 12 | Wymiary i waga (grupa „Wymiary i waga”) oraz zdjęcia telefonów | `[x]` zrobione |
| 13 | Faza poprawkowa i zakup (`FIX-PHASE.md`; w planie nazwana „etapem 12”, bo powstał przed commitem poręczności) | `[~]` FP0 i FP1 w kodzie, FP2 w większości; FP3-FP6 czekają na dane z testu i decyzje |
| 14 | Poprawa interfejsu (`FIX-UI-PHASE.md`: UIP0-UIP3) | `[~]` UIP0 i UIP1 gotowe; UIP2 — Start, nagłówek/stopka, karta, opcje quizu, historia, plakietki rankingu; reszta w kolejce |

---

## Etap 0 — Dane telefonów i specyfikacja rankingu

**Cel:** komplet zweryfikowanych danych o 10 telefonach (z poprawką wariantów do 2000 zł) oraz zamrożona lista kryteriów.

- [x] Zebrać ceny (PL, nowe, polska dystrybucja) z datą sprawdzenia (9 z 10 gotowe, 1 do potwierdzenia)
- [x] Zebrać specyfikacje: bateria, ładowanie, ekran, IP, microSD, aparaty, aktualizacje, waga
- [x] Zebrać wyniki niezależnych testów (czas pracy baterii, aparat) jako podstawę ocen 0–100 (część: DXOMARK/PhoneArena/GSMArena; dla 15T i Realme brak testów)
- [x] Warianty: wszystkie ceny ≤ 2000 zł, zostajemy przy wariantach z listy (Pixel 10a i 9a w wersji 128 GB)
- [x] Wypełnić `scores` + `basis` dla każdego kryterium (z pewnością ocen i listą braków)
- [x] Zatwierdzić listę kryteriów i zasady wyprowadzania wag z odpowiedzi (PROJECT.md, 7.6)

**Lista zadań do domknięcia etapu:** [`../Etap-0-todo.md`](../Etap-0-todo.md) — podział na decyzje
użytkownika (potwierdzenie oferty Realme, zatwierdzenie kryteriów i wag, referencja 9.1, promocja
Edge 70 Fusion) i prace agenta (polityki aktualizacji, testy baterii i aparatów, ekran 15T, waga
i microSD Redmi, zawartość pudełek, raport luk, odświeżenie cen).

**DoD:** `phones.json` przechodzi walidację (komplet pól, ceny ≤ 2000 zł, daty cen), brak wartości „z pamięci” bez źródła.

**Stan po etapie 0 (domknięcie):** walidator 0 błędów i 1 ostrzeżenie (NFC w Realme — brak źródła, pole `null`), 10 rekordów ze statusem `ok`, zero ocen „z braku danych” (`scoresEstimatedNeutral` puste we wszystkich rekordach). Uzupełnione ze źródeł: polityki aktualizacji (15T 4+6 lat wg GSMArena, Redmi 4+6 wg nanoreview/gsmspecs, Nothing 3 wersje, Realme 3+4 wg 91mobiles), wytrzymałość baterii z testów (15T: GSMArena 57:44 h → 59; Edge 70 Fusion: PCMark 17 h 34 min → 80; Realme: PCMark 19 h → 92), ekran 15T (AMOLED 3200 nitów), IP68/IP69 + MIL-STD Edge 60 (durability 100), microSD Edge 60 (jedyny w puli), wagi (Redmi 210 g, Realme 203 g, Edge 70 Fusion 193 g), zawartość pudełek (Edge 60, Nothing 3a, Realme, Pixele — bez zasilacza), aparaty 15T i A56 z oficjalnych specyfikacji. Reguły przeliczania danych „miękkich” (C1) są w PROJECT 7.5 i w `src/data/scoringRules.ts`; spójność ocen pilnuje `tests/score-rules.test.ts`, luki raportuje `npm run data-gaps`. **Nowe liczby referencyjne person**: QUIZ-SPEC 9.1-9.4. Na etap 9 zostaje: odświeżenie cen (próg 7 dni, `npm run data-gaps -- --strict`), NFC w Realme, niezależne testy aparatów Redmi/Realme/15T (oceny `low`).

### Stan danych (aktualizowany na bieżąco)

**Uzupełnienia specyfikacji (po 14.11.2026):** pola potwierdzone w oficjalnych specyfikacjach producentów (Motorola, Xiaomi mi.com, Google Pixel Help) trafiły do `phones.json`: IP, waga, microSD, NFC, ładowanie bezprzewodowe, zawartość pudełka, ekran i aparaty 15T. Oceny liczone ze wzorów PROJECT 7.5 zaktualizowane: Edge 60 `durability` 90 i `storage` 80 (slot microSD), 15T `charging` 69, `durability` 90, `zoom` 60. Nic nie zostało uzupełnione „z pamięci”; pola bez potwierdzenia zostały `null` (m.in. `updatesYears` dla 15T i Realme, jakość ekranu 15T, testy czasu pracy). Skutek uboczny: Edge 60 ma slot microSD, więc pytanie warunkowe **C3 jest aktywne** (18 pytań zamiast 17), a walidator zgłasza 16 zamiast ~40 ostrzeżeń. Referencja QUIZ-SPEC 9.1 zmieniła się na #3: Xiaomi 15T (57,9) wyprzedza Realme 16 Pro+ (55,9) — #1 Edge 70 Fusion (71,2) i #2 Edge 60 (62,4) bez zmian; testy person sprawdzają niezmienniki, nie te liczby.

Oceny 0-100 wyliczone wg reguł z PROJECT.md (sekcja 7.5); pewność ocen i braki danych są w `phones.json` (`scoreConfidence`, `scoresEstimatedNeutral`). Ceny i linki podał użytkownik (14.11.2026). Wariant 8/128 GB zostaje dla Pixela 10a i 9a, a Xiaomi 15T bierzemy w wersji 12/512 GB. Pixel 8a i Galaxy A55 wypadły z listy, weszły Redmi Note 15 Pro 5G i Realme 16 Pro+ 5G.

| Model | Cena | Specyfikacja | Oceny | Uwagi |
|---|---|---|---|---|
| Galaxy A57 8/256 | `[x]` 1729,00 zł | `[x]` | `[ ]` | drugi odczyt: morele.net 1799,96 zł; 5000 mAh, 45 W (bez ładowarki), 6 lat aktualizacji |
| Pixel 10a 8/128 | `[x]` 1899,99 zł | `[x]` | `[ ]` | 5100 mAh, 30 W (część źródeł: 23 W), 7 lat aktualizacji, IP68; w pudełku brak zasilacza (support.google.com) |
| Galaxy A56 5G 8/256 | `[x]` 1718,99 zł | `[x]` | `[ ]` | 5000 mAh, 45 W (bez ładowarki), 6 lat aktualizacji do 03.2032, IP67 |
| Redmi Note 15 Pro 5G 8/256 | `[x]` 1299,00 zł | `[~]` | `[ ]` | zebrane: bateria 6580 mAh, 45 W, IP66/IP68; brak lat aktualizacji; recenzje krytyczne wobec oprogramowania |
| Motorola Edge 60 12/256 | `[x]` 1399,00 zł | `[x]` | `[ ]` | uzupełnione ze specyfikacji producenta: IP69/IP68, 179 g, microSD, NFC, bez ładowania bezprzewodowego; oceny `durability` 90 i `storage` 80 ze wzorów PROJECT 7.5 |
| Xiaomi 15T 12/512 | `[x]` 1999,00 zł | `[x]` | `[~]` | uzupełnione z mi.com/pl i mi.com/global: 6,83″ 120 Hz, 194 g, 67 W, IP68, NFC, bez microSD i bez zasilacza, aparaty 50 MP + tele 50 MP 2x + 12 MP + 32 MP; oceny `charging` 69, `durability` 90, `zoom` 60 ze wzorów/klasy sprzętu. **Do potwierdzenia:** `updatesYears` (brak polityki aktualizacji dla 15T), jasność i jakość ekranu, testy czasu pracy |
| Motorola Edge 70 Fusion 12/256 | `[x]` 1658,12 zł | `[x]` | `[ ]` | aukcja sprawdzona: nowy, X-KOM_PL, promocja do 30.11.2026, limit 1 szt.; waga 193 g wg specyfikacji producenta (rozbieżność 177/193 g rozstrzygnięta) |
| Pixel 9a 8/128 | `[x]` 1749,99 zł | `[x]` | `[ ]` | 5100 mAh, 23 W, 7 lat aktualizacji, IP68; ta sama wydajność co 10a; w pudełku brak zasilacza |
| Nothing Phone (3a) 12/256 | `[x]` 1779,00 zł | `[x]` | `[ ]` | 5000 mAh, 50 W, IP64, bez bezprzewodowego ładowania; test gsmManiaK: bardzo dobra bateria; 4 aktualizacje Androida |
| Realme 16 Pro+ 5G 8/256 | `[~]` 1959,99 zł | `[~]` | `[ ]` | **do potwierdzenia na stronie oferty:** adres linku to „16 pro 5g” (bez plusa); specyfikacja wpisana dla Pro+ |

---|---|---|---|---|
| Galaxy A57 8/256 | `[x]` 1729,00 zł | `[x]` | `[ ]` | drugi odczyt: morele.net 1799,96 zł; brak potwierdzonych lat aktualizacji |
| Pixel 10a 8/128 | `[x]` 1899,99 zł | `[~]` | `[ ]` | zostaje 128 GB; brak mAh baterii |
| Galaxy A56 5G 8/256 | `[x]` 1718,99 zł | `[x]` | `[ ]` | 5000 mAh, 45 W (bez ładowarki), 6 lat aktualizacji do 03.2032, IP67 |
| Pixel 8 8/256 | `[~]` 1979,00 zł | `[ ]` | `[ ]` | **do potwierdzenia:** link to Pixel 8, na liście był Pixel 8a; oferta Allegro (czy nowy?) |
| Motorola Edge 60 12/256 | `[x]` 1399,00 zł | `[~]` | `[ ]` | zebrane: 5200 mAh, 68 W, 3 wersje Androida + 4 lata poprawek; brak IP i wagi |
| Xiaomi 15T 12/256 | `[~]` 1999,00 zł | `[ ]` | `[ ]` | **do potwierdzenia:** adres linku wskazuje wariant 12/512 GB |
| Motorola Edge 70 Fusion 12/256 | `[x]` 1658,12 zł | `[ ]` | `[ ]` | oferta Allegro, sprawdzić sprzedawcę |
| Pixel 9a 8/128 | `[x]` 1749,99 zł | `[ ]` | `[ ]` | zostaje 128 GB |
| Nothing Phone (3a) 12/256 | `[x]` 1779,00 zł | `[x]` | `[ ]` | 5000 mAh, 50 W, IP64, bez bezprzewodowego ładowania; test gsmManiaK: bardzo dobra bateria; 4 aktualizacje Androida |
| Galaxy A55 5G 8/256 | `[ ]` brak | `[ ]` | `[ ]` | **brak właściwego linku:** podany link morele.net to Galaxy A57 |

---|---|---|---|---|
| Galaxy A57 8/256 | `[~]` | `[x]` | `[ ]` | oferty 2099–2339 zł (powyżej limitu); wariant 8/128 ok. 1899 zł; brak liczby lat aktualizacji |
| Pixel 10a | `[~]` | `[x]` | `[ ]` | 256 GB: premiera 2799 zł, oficjalnie 3299 zł; brak potwierdzonej oferty 256 GB ≤ 2000 zł; brak mAh |
| Galaxy A56 5G 8/256 | `[~]` | `[x]` | `[ ]` | oferty od ok. 1500 do 1950 zł, mocno zależne od sklepu i daty; brak mocy ładowania |
| Pixel 8a 256 | `[ ]` | `[ ]` | `[ ]` | |
| Motorola Edge 60 12/256 | `[ ]` | `[ ]` | `[ ]` | |
| Xiaomi 15T 12/256 | `[ ]` | `[ ]` | `[ ]` | |
| Motorola Edge 70 Fusion 12/256 | `[ ]` | `[ ]` | `[ ]` | |
| Pixel 9a | `[ ]` | `[ ]` | `[ ]` | sprawdzić 256 GB ≤ 2000 zł |
| Nothing Phone (3a) 12/256 | `[ ]` | `[ ]` | `[ ]` | |
| Galaxy A55 5G 8/256 | `[ ]` | `[ ]` | `[ ]` | |

---

## Etap 1 — Szkielet projektu i deploy

**Cel:** pusta aplikacja działa lokalnie i jest wdrożona na GitHub Pages.

- [x] Vite 7.3.7 + React 19.2.6 + TypeScript 5.9.3 + Tailwind 4.1.17 (wersje przypięte)
- [x] ESLint, Prettier, Vitest + Testing Library
- [x] Router hashowy i layout (nagłówek z miejscem na przycisk motywu)
- [x] `vite.config.ts` z `base`, workflow GitHub Actions, włączone Pages (źródło: GitHub Actions)
- [x] Skrypt `validate-data` podpięty pod CI

**DoD:** adres Pages pokazuje ekran startowy; CI buduje i wdraża po wypchnięciu do `main`.

## Etap 2 — Silnik rankingu

**Cel:** poprawna, przetestowana logika bez UI.

- [x] Typy: `Phone`, `Criterion`, `Question`, `Weights`, `Filters`
- [x] `scoring.ts`: filtry twarde, wzór `S`, `value`, remisy
- [x] Mapowanie odpowiedzi quizu na wagi (start neutralny, odpowiedzi ustawiają wagi, krok „trzy najważniejsze” z mnożnikami 1,5 / 1,3 / 1,15 / 0,85)
- [x] Persona testowa „żona”: test, że jej odpowiedzi dają ranking zgodny z jej priorytetami
- [x] `anonymize.ts`: budowa danych karty bez pól `reveal`
- [x] Testy: skrajne wagi, filtry (budżet, microSD), remisy, brak ujawniania nazw w danych karty

**DoD:** pokrycie testami kluczowych ścieżek; test sprawdza, że obiekt karty nie zawiera nazwy, marki ani linków.

**Stan po etapie 2:** `src/lib` bez zależności od Reacta, pokrycie linii 98,5%, 63 testy zielone (8/8 testów akceptacyjnych etapu 2, niezmienniki person 9.1.1-9.1.4 i 9.4). Persony liczone na syntetycznej puli `tests/fixtures/phones.fixture.ts`, bo `phones.json` jest pusty do czasu domknięcia etapu 0 — po wgraniu danych testy trzeba przełączyć na `phones.json` i ponownie skalibrować `BLEND`. Decyzja QUIZ-SPEC 10.1: na karcie `round(S)` + opis słowny, przeskalowanie (najlepszy = 100%) w szczegółach.

**Zmiana modelu G1 (po etapie 6):** ważność grupy z trójki to pasmo 5 / 4 / 3 **skorygowane siłą odpowiedzi**
(`+0,3 × (wyliczone − 1,3)`, maksymalnie ±0,6, pierwsze miejsce nasyca się na 5) zamiast gołych 5 / 4 / 3 —
wybór i odpowiedzi łączą się, a kolejność świadomego wyboru nigdy się nie odwraca. Wariant addytywny
(`wyliczone + 1,5 / 1,0 / 0,5`) został policzony na danych i odrzucony jako domyślny: u persony „żona”
aparat (6 pytań, odpowiedzi 5) wygrywał z baterią (2 pytania, odpowiedzi 3) mimo wyboru „bateria na 1. miejscu”,
co łamie PROJECT 2 i referencję 9.1. Jest dostępny jako `TOP_THREE_MODE = 'additive'` i ma własne testy.
Nowa referencja 9.1: #1 Edge 70 Fusion 69 pkt, #2 Realme 16 Pro+ 67, #3 Xiaomi 15T 62, #4 Edge 60.

## Etap 3 — Sesje i zapis w przeglądarce

**Cel:** trwały stan z wersjonowanym schematem.

- [x] `storage.ts`: odczyt/zapis `localStorage`, walidacja, migracje (`schemaVersion`)
- [x] Model `Session` (tryb, odpowiedzi, wagi, filtry, snapshot rankingu, wybory)
- [x] Obsługa braku/uszkodzenia danych (bezpieczny reset z komunikatem)
- [x] Hook `useSessions` (utworzenie, aktualizacja, wznowienie)

**DoD:** odświeżenie strony nie gubi postępu; uszkodzony zapis nie wywraca aplikacji.

**Stan po etapie 3:** klucz `wybor-telefonu:v1` (schemat v1) z migracjami, zapis z opóźnieniem 300 ms i natychmiastowy przy `visibilitychange`/`pagehide`, kopia uszkodzonych danych pod `wybor-telefonu:backup`, tryb w pamięci przy braku `localStorage`, limit 50 najnowszych sesji, synchronizacja kart zdarzeniem `storage` (ostatni zapis wygrywa), snapshot rankingu z `dataVersion` z `_meta.generatedOn`, `useReveal` z plakietkami 1/2 i 2/2. 7 z 7 testów akceptacyjnych etapu 3 zielone (171 testów w projekcie, 97% linii w `src/lib`).

## Etap 4 — Tryb quiz

- [x] Finalna lista ~14–16 pytań z efektami
- [x] Bloki tematyczne, pasek postępu, nawigacja wstecz
- [x] Zapis po każdej odpowiedzi, możliwość przerwania i powrotu
- [x] Ekran podsumowania przed liczeniem rankingu

**DoD:** pełne przejście quizu generuje wagi i filtry; przerwanie w połowie i powrót odtwarza stan.

**Stan po etapie 4:** `src/features/quiz/quizFlow.ts` (czysta logika kroków: nagłówki bloków, pytania, G1, podsumowanie, `resumeIndex`), `src/screens/QuizScreen.tsx` oraz komponenty `ProgressBar`, `OptionButton`, `TopThreePicker`. Lista pytań wynika z QUIZ-SPEC (18 pytań, w tym warunkowe C3 — aktywne, bo Edge 60 ma slot microSD; ROADMAP mówił o ~14-16, ale QUIZ-SPEC jest źródłem prawdy). Hybryda prowadzi krótki zestaw 7 pytań i kończy na `#/s/:id/tune` (ekran etapu 5). Zapis po każdej odpowiedzi, auto-przejście po 250 ms, `Wstecz` z podświetloną odpowiedzią, radiogroup z obsługą strzałek i spacji, fokus na nagłówku pytania, ostrzeżenie przy większości „pomiń”, przycisk `Pokaż wyniki` liczony na `computeRanking` + status `completed`. Testy akceptacyjne 1-7 zielone (`tests/quizFlow.test.ts`, `tests/quiz-screen.test.ts`). **Zostaje E4-10**: przegląd treści pytań z użytkownikiem i żoną.

## Etap 5 — Tryb suwaków i hybryda

- [x] Suwaki ważności 0–5 dla kryteriów (czytelne także na telefonie)
- [x] Filtry: budżet, minimalna pamięć, „musi mieć microSD”
- [x] Hybryda: skrócony quiz → suwaki wypełnione wynikami
- [x] Podgląd na żywo, ile telefonów spełnia filtry

**DoD:** każdy z trzech trybów kończy się tym samym obiektem wag i filtrów w sesji.

**Stan po etapie 5:** `src/features/sliders/sliderModel.ts` (skala 0-5 z krokiem 0,1 — wartości wyliczone bywają ułamkowe, np. 1,3), komponenty `GroupSlider` (etykieta „3 z 5, ważne”, `aria-valuetext`, szybki wybór 0-5, znacznik wartości wyliczonej na torze), `CriterionSliders` (udziały w grupie) i `FilterPanel` (budżet 1500/1800/2000, pamięć dowolna/256 GB, microSD, licznik puli w `aria-live` oraz komunikat o uzupełnieniu powyżej budżetu). Ekran `SlidersScreen` obsługuje oba warianty: `#/s/:id/sliders` (start neutralny — ważności grup 2 wg QUIZ-SPEC 6) i `#/s/:id/tune` (wartości z krótkiego quizu, plakietka „Wyliczone z Twoich odpowiedzi”, `manualOverride` i „Przywróć wyliczone” przez nową akcję reducera `session/restore-computed`). Zgodnie z QUIZ-SPEC 6 suwak grupy ustawia `G_g` wprost, a suwaki kryteriów udziały `w_c`. Testy akceptacyjne 1-6 zielone (`tests/sliderModel.test.ts`, `tests/sliders-screen.test.ts`), w tym test równoważności trzech trybów (DoD).

## Etap 6 — Ranking, anonimowe karty, wybór i ujawnienie

- [x] Ekran trzech kart (kolejność rankingu, numer miejsca, % dopasowania, cena z datą)
- [x] „Więcej szczegółów” (oceny z uzasadnieniami, pełne dane)
- [x] Wybór karty → ujawnienie nazwy i linków do sklepu
- [x] Powrót i kolejny wybór, plakietki „Wybór 1/2”, „2/2”
- [x] Ekran zwycięzcy

**DoD:** przed wyborem w DOM nie ma nazwy ani marki żadnego telefonu; po wyborze wcześniej wybrane karty pozostają odsłonięte z numerem wyboru.

**Stan po etapie 6:** `src/screens/CardsScreen.tsx` (układ 1 kolumna / 3 od 1024 px), komponenty `PhoneCardAnon`, `PhoneCardRevealed`, `DetailsAccordion`, `ScoreBar`, `ConfidenceIcon`, `ConfirmSheet`, `Toast` oraz `src/lib/cardSpecs.ts` (pełne dane bez pola `reveal`, procesor jako klasa wydajności, każda wartość przez redakcję tokenów). Karty powstają ze snapshotu sesji (`toAnonCardsFromSnapshot`), więc wynik obejrzany po tygodniu się nie zmienia. Etykiety: „Powyżej budżetu o X zł”, „Praktyczny remis z #m”, „brak danych”, baner starych cen (>30 dni), komunikat przy puli <3. Wybór potwierdzany oknem u dołu (pułapka fokusu, Esc, przywrócenie fokusu), plakietki „Wybór n/m” z `useReveal`, przyciski „Zacznij od nowa”, „Zmień odpowiedzi”, „Pokaż pełny ranking” (po pierwszym wyborze; ekran w etapie 9). **E6-10 (osobny `reveal.json`) pominięty świadomie:** build jest jednoplikowy (`vite-plugin-singlefile`) i wcieliłby taki plik w `dist/index.html`, więc anonimowość zostaje na poziomie interfejsu — tak jak opisuje to sekcja „Ryzyka” — a pilnuje jej test wycieku E6-11 (węzły tekstu, atrybuty `alt`/`title`/`aria-*`/`data-*`/`href`, tytuł dokumentu i hash). Testy akceptacyjne 1-8 zielone, w tym przejście persony od Startu do ujawnienia (`tests/cards-screen.test.ts`, `tests/app.test.ts`).

## Etap 7 — Historia sesji i wznawianie

- [x] Lista sesji (data, tryb, status, ostatni wybór)
- [x] Wznawianie nieukończonych, podgląd ukończonych, usuwanie
- [x] Start nowego quizu bez utraty poprzednich
- [x] (opcjonalnie) link do wznowienia w hashu i eksport/import historii do pliku

**DoD:** można rozpocząć trzy sesje, przeglądać je i wznowić nieukończoną.

**Stan po etapie 7:** `#/history` z osią czasu od najnowszej (`SessionListItem`: data względna i pełna, tryb, status, postęp quizu, wybrane telefony z miejscem i dopasowaniem, wersja danych snapshotu), **Wznów** na pierwsze pytanie bez odpowiedzi, **Podgląd** ukończonej sesji na kartach ze snapshotu (nie nowy ranking), **Usuń** z potwierdzeniem w oknie u dołu, stan pusty z przyciskiem Start, nowa sesja nie rusza starych. Opcje weszły do zakresu: **E7-06** link `#/r/<kod>` (base64url z `{v, mode, answers, topThree}`, bez `picks`, bo te odkrywałyby nazwy; otwarcie tworzy nową sesję i liczy ranking aktualnymi danymi) oraz **E7-07** eksport i import pliku JSON z walidacją i scalaniem bez duplikatów (ten sam `id` wygrywa nowszym `updatedAt`, limit 50). Nowe moduły: `lib/resumeLink.ts`, `lib/historyTransfer.ts`, `features/history/historyModel.ts`, akcja reducera `history/import` i `session/create` z odpowiedziami. Testy akceptacyjne 1-6 zielone (`tests/history-transfer.test.ts`, `tests/history-screen.test.ts`).

## Etap 8 — Motywy, mobile, dostępność

- [x] Przycisk z ikoną: motyw jasny (prosty, przyjazny) ↔ ciemny (złożony, surowy)
- [x] Tokeny w `@theme`, wariant `dark` oparty o `data-theme`
- [x] Testy na telefonie: duże pola dotyku, brak przewijania w poziomie
- [x] Dostępność: kontrast, focus, etykiety suwaków, obsługa klawiatury

**DoD:** oba motywy spójne na telefonie i komputerze; wybór motywu zapamiętany.

**Stan po etapie 8:** tokeny w `@theme` i nadpisania w `[data-theme="dark"]` (kolory, `--radius-card` 16 px → 2 px, `--pad-card` 24 → 12, cienie, nowe `--color-on-accent` i `--shadow-pop`) — komponenty nie mają ani jednego stałego koloru, co pilnuje test skanujący `src/**/*.tsx`. Jasny motyw pokazuje 4 cechy karty z rozwinięciem do 6, ciemny — wszystkie cechy w tabeli i oceny od razu (UI-SPEC 6). Pola dotyku ≥ 44 px (poprawione: szybki wybór suwaka, chip adresu, zamknięcie baneru, link „podgląd”); jedyny szeroki element (potok CI) siedzi w regionie z przewijaniem osiągalnym z klawiatury. Dostępność: skip-link w landmarku, hierarchia nagłówków bez przeskoków (poprawione `dl`/`dt` w konsoli routera, `h4` → `h3` w szczegółach karty, dodany `h2` listy historii), `aria-labelledby` wskazujący istniejący nagłówek pytania, radiogroup ze strzałkami i spacją, `aria-valuetext` na suwakach, `aria-live` na licznikach, pułapka fokusu i Esc w oknie potwierdzenia, `prefers-reduced-motion` wyłączający animacje. **Testy akceptacyjne 1-6 zielone**: `tests/theme-tokens.test.ts` (kontrast ≥ 4,5:1 dla 7 par tekst/tło w obu motywach liczony ze wzoru WCAG wprost z `index.css`, brak mignięcia — skrypt w `<head>` przed modułem, brak stałych kolorów, ikony inline SVG bez `<img>`), `tests/a11y-audit.test.ts` (axe-core na 9 stanach ekranów × 2 motywy: 0 błędów poważnych i krytycznych, przejście klawiaturą, zapamiętanie motywu) i `tests/edge-states.test.ts` (pula 0/1/pełna, `noscript`). Przegląd wizualny obu motywów czeka na zatwierdzenie użytkownika.

## Etap 9 — Pełny ranking, szlify i wydanie

- [x] Przycisk „Pokaż pełny ranking” (wszystkie 15 telefonów z nazwami) po wyborze zwycięzcy
- [x] Kalibracja stałych rankingu na prawdziwych danych
- [~] E9-05 Odświeżenie cen i dat — **przesunięte na dzień zakupu** (FIX-PHASE FP1-03/FP6-01): narzędzia gotowe (`npm run stale-prices` zna teraz także daty końca promocji), ceny z 14-16.11.2026
- [x] E9-06 Test z użytkowniczką **wykonany** — użytkowniczka przeszła proces i ma kandydata do zakupu; wynik do wpisania w `E9-wynik-testu.md` (FP0-01)
- [~] E9-07 Poprawki po teście = **faza poprawkowa (etap 13, `FIX-PHASE.md`)**
- [ ] Tag `v1.0`, adres Pages na telefonie — po FP1-FP3

**DoD:** wersja gotowa do realnego użycia; ceny odświeżone w ciągu ostatnich 7 dni.

**Stan po etapie 9 (część techniczna):** ekran `#/s/:id/ranking` (`src/screens/RankingScreen.tsx`) z wszystkimi telefonami z puli: miejsce, `S`, dopasowanie z opisem, cena z datą, odznaki „Twój wybór n/m”, znacznik praktycznego remisu, mini-paski sześciu grup (GroupScore ze snapshotu, z odtworzeniem z wag dla starszych zapisów), rozwijany wiersz z 14 ocenami i pewnością, pełnymi danymi, linkami do sklepów, innymi odczytami ceny i źródłami; sekcja „Poza pulą” z powodem odrzucenia (limit 2000 zł / pamięć / microSD) oraz ostrzeżenie, gdy `dataVersion` snapshotu różni się od `_meta.generatedOn`. Kalibracja (E9-03) zmierzona na 7 zestawach odpowiedzi: `BLEND = 0,5` potwierdzone (0,75 łamie niezmiennik 9.1.3, 0,25 referencję 9.3), wnioski w QUIZ-SPEC 2.6, pomiar zamknięty testem `tests/calibration.test.ts`. Narzędzia wydania: `npm run stale-prices` (próg 7 dni, kod 1 przy przeterminowanych cenach) i `npm run release` (typecheck → testy → validate-data → stale-prices → build). Meta: tytuł, opis, `og:*`, `color-scheme`, dwa `theme-color`, ikona jako inline SVG (bez zewnętrznego zasobu), `noscript`, stan danych w stopce (liczba telefonów, data cen, limit). **Zostaje:** odświeżenie cen w dniu wydania, test z użytkowniczką i poprawki (protokół: `E9-test-uzytkownika.md`), tag `v1.0` i sprawdzenie adresu Pages na telefonie.

## Etap 10 — Rozszerzenie puli modeli (10 → 15, przed v1.0)

**Cel:** zweryfikować 21 kandydatów względem zasad projektu i rozszerzyć pulę przed wydaniem v1.0 (decyzje D1–D6 w [`ETAP-10-rozszerzenie-puli-modeli.md`](./ETAP-10-rozszerzenie-puli-modeli.md)).

- [x] Audyt 21 modeli i decyzje D1–D6: dodano **Honor 400 5G 8/256 GB** (1599 zł), **OnePlus Nord 5 5G 8/256 GB** (1600,99 zł), **Samsung Galaxy A37 5G 8/256 GB** (1359 zł; drugi odczyt 1299 zł), **vivo V70 FE 5G 8/256 GB** (1799 zł, D1) i **Xiaomi Redmi Note 17 Pro 5G 8/512 GB** (1799 zł promo Media Expert / Ceneo od 1579 zł, D2); **Xiaomi 15T** zostaje jako **12/512 GB** (D3); odrzucono iPhone 16e (>2000 zł) oraz 5 modeli z 2024 r. (Nord 4, Edge 50 Neo, Nothing 2a, Redmi Note 14 Pro+, Honor 200)
- [x] D4: zmiana sufitu pojemności baterii w `src/data/scoringRules.ts` z 7000 na **8000 mAh** (`BATTERY_CAPACITY_SPAN_MAH = 4000`: 4000 mAh = 0, 8000 mAh = 100) i przeliczenie `scores.battery` wszystkich 15 rekordów
- [x] Rozszerzenie `KNOWN_FORBIDDEN` w `src/lib/anonymize.ts` (nakładki `MagicOS`/`OxygenOS`/`OriginOS`, technologie ładowania, układy i sklepy) oraz przekazanie pełnej puli `PHONES` do `specRows` w `src/lib/cardSpecs.ts`
- [x] Dynamiczne `EXPECTED_POOL_SIZE = 15` i `PRICES_CHECKED_AT = '2026-11-16'` w `src/data/pool.ts` i `src/data/strings.ts`
- [x] D6 i kalibracja: aktualizacja niezmiennika 9.1.4 (3 telefony ≤ 1500 zł → komplet kart w budżecie), potwierdzenie `BLEND = 0,5` oraz aktualizacja testów i dokumentacji

**Stan po etapie 10:** `src/data/phones.json` zawiera **15 rekordów** ze statusem `ok` i zerem `scoresEstimatedNeutral`; walidator zgłasza **0 błędów** i 1 dotychczasowe ostrzeżenie (`specs.nfc: null` w Realme); `npm run data-gaps -- --strict` i `npm run stale-prices` zielone (wszystkie ceny ≤ 2 dni); zero wycieków marek/nakładek w kartach i `specRows`; wszystkie 27 plików testowych zielone. Nowa referencja person: żona `#1 vivo V70 FE (67 pkt)`, `#2 Edge 70 Fusion (67 pkt, praktyczny remis)`, `#3 Redmi Note 17 Pro 5G (65 pkt)`; aparat `#1 Xiaomi 15T (71 pkt)`; bateria `#1 Redmi Note 17 Pro 5G (65 pkt)`.

## Etap 11 — Wykluczanie marek i modeli (opcjonalny filtr startowy)

**Cel:** opcjonalny krok startowy `#/s/:id/exclude` przed pytaniami/suwakami pozwalający wykluczyć całe marki lub pojedyncze modele z trzech propozycji przy zachowaniu ich w pełnym rankingu z oznaczeniem ([`ETAP-11-wykluczanie-marek-i-modeli.md`](./ETAP-11-wykluczanie-marek-i-modeli.md)).

- [x] Schemat v2 (`migrations[1]`): `Filters.excludedBrands`, `Filters.excludedPhoneIds`, `Session.exclusionsStep: 'pending' | 'done'`
- [x] Ustandaryzowane pola `brand` i `modelName` (bez marki) we wszystkich 15 rekordach `phones.json` + walidacja w `scripts/validate-data.ts` (oraz domknięcie luk w 5 nowych modelach: `peakNits: 1900` i `chargingTests` w Galaxy A37, `ramType` i `updatesYears` w Nord 5, vivo V70 FE i Redmi Note 17 Pro 5G)
- [x] `src/lib/exclusions.ts` + `rank().fullRanking`: normalizacja i `S` na pełnej puli, karty z trzech najlepszych niewykluczonych (uzupełnienie powyżej budżetu tylko z niewykluczonych), blokada przy 0 i ostrzeżenie przy 1–2 pozostałych
- [x] `ExcludeScreen` (`#/s/:id/exclude`), `ExclusionPicker` i `ExclusionSheet` z leniwym ładowaniem katalogu nazw (`src/data/exclusionCatalog.ts`), integracja ze Startem, `FilterPanel`, `CardsScreen` (zmiana bez przeliczania `S`), `RankingScreen` (plakietki „Wykluczony (marka)/(model)” + „Uwzględnij ponownie”) i `HistoryScreen` („Wykluczono: …” + „Teraz wykluczony”)
- [x] Testy akceptacyjne 1–9 w `tests/exclusions.test.ts`, audyt `axe-core` w obu motywach i test wycieku nazw po kliknięciu „Pomiń”

---

## Etap 12 — Wymiary i waga (poręczność) oraz zdjęcia telefonów

**Cel:** pozwolić premiować mniejsze i lżejsze telefony (obecny telefon użytkowniczki to kompakt, a cała pula ma 6,3-6,83″) i pokazać, jak telefon wygląda — bez naruszania anonimowości kart.

- [x] Nowa, siódma grupa **`size` — „Wymiary i waga”** z kryterium **`compactness`** (`src/data/criteria.ts`, `src/types/criteria.ts`): własny suwak grupy i chip w kroku G1; `CRITERIA_COUNT = 15`
- [x] Wzór obiektywny w `src/data/scoringRules.ts`: `compactness = 0,45 × lekkość (g) + 0,45 × mała powierzchnia (wys. × szer.) + 0,10 × smukłość (mm)`; `scores.compactness` dla 15 rekordów, walidacja w `scripts/validate-data.ts`
- [x] Pytanie **D4** w bloku „Codzienność” („Czy zależy Ci na mniejszym i lżejszym telefonie?” → `compactness` 0 / 3 / 5), quiz ma 19 pytań; persony zaktualizowane (`tests/personas.ts`)
- [x] `PhonePhoto` (`src/components/PhonePhoto.tsx`): wizualizacja telefonu na karcie anonimowej bez nazw oraz zdjęcie producenta (`reveal.photoUrl`, wypełnione dla 15 rekordów) pokazywane dopiero po ujawnieniu — w karcie, szczegółach i pełnym rankingu
- [x] Wiersz „Wymiary i waga” w `cardSpecs`, nowe tokeny w anonimizacji, aktualizacja testów (`ranking-screen`, `sliders-screen`, `score-rules`, `phones-schema`, `calibration`, liczebności kryteriów i pytań)

**Stan po etapie 12:** 15 kryteriów w 7 grupach, 19 pytań; komplet testów zielony. **Poprawka 16.11.2026 (wieczór):** test „2., 7. i 8.” w `tests/exclusions.test.ts` (pełny przepływ karty → ranking → historia) trwa 4-6 s w jsdom i wysypywał się na domyślnym limicie 5 s Vitest — podniesiony `testTimeout`/`hookTimeout` do 20 s w `vitest.config.ts` i jawny limit tego testu.

---

## Etap 13 — Faza poprawkowa i zakup (FIX-PHASE)

**Podstawa:** [`FIX-PHASE.md`](./FIX-PHASE.md) (review 1 + review 2, 22 zmiany P0-P3; test E9-06 wykonany — jest kandydat).
**Cel fazy:** nie „czy produkt działa”, tylko **„czy zakup na podstawie tego wyniku będzie trafny i bezpieczny”**.
Kolejność = ryzyko zakupowe: FP1 (bezpieczny zakup) → FP2 (produkt bez szumu) → FP3 (zaufanie do wyniku) → FP4 (dane) → FP5 (proces, v1.0) → FP6 (po zakupie).
Zmiany algorytmu i ocen przechodzą przez **bramkę kandydata** (`tests/user-session.test.ts` + `E12-zmiany-rankingu.md`).

**FP0 — utrwalenie testu (dzień 0)**
- [x] FP0-01 `E9-wynik-testu.md` wypełniony 17.11.2026: tryb **suwaki** (bateria 4,5 · aparat 5 · pamięć 4 · aktualizacje 3 · wymiary 2 · cena 0; wykluczone Google/Honor/vivo/Realme/OnePlus/Nothing); karta #1 **Xiaomi 15T**, #2 **Edge 70 Fusion**, #3 Redmi Note 17 Pro — trzy wybory; przychylnie też Galaxy A57; z rozmowy: aktualizacje i rozmiar ważniejsze, niż wyszło z suwaków; cena i wygląd też się liczą
- [x] FP0-02 bramka kandydata **aktywna**: prawdziwa sesja w `tests/fixtures/user-session.json`, `tests/user-session.test.ts` zielony (silnik odtwarza karty 15T › Edge 70 Fusion › Note 17 Pro)
- [x] FP0-03 ROADMAP (ten wpis, tabela §0.2 w etapie 9)
- [x] FP0-04 data zakupu **26.11.2026** → scenariusz „> 1 tydzień”: FP1 → FP2 → FP3 → **FP4 przed zakupem** (decyzja użytkownika) → ponowne przejrzenie kart
- [x] Decyzje użytkownika 16.11.2026: kandydaci = **Edge 70 Fusion 12/256, Galaxy A57 8/256, Xiaomi 15T 12/512**; budżet **elastyczny** jako domyślny (FP3-05); FP3-02 **tylko plakietka**, bez kary; daty premiery doszukać (FP1-07); panele dev **usunąć** (FP2-02)

**FP1 — bezpieczny zakup (P0)**
- [x] FP1-01 weryfikacja trzech kandydatów (16.11.2026, `reveal.verifiedForPurchase`): **Edge 70 Fusion** — 1658,12 zł to promocja Allegro (X-KOM_PL) do 30.11, limit 1 szt., po niej **1899 zł** w x-kom/Media Expert/RTV Euro AGD (nadal ≤ 2000); gwarancję producenta potwierdzić u sprzedawcy. **Galaxy A57** — sferis.pl nadal 1729 zł (SM-A576B), morele 1799 zł, bez promocji czasowej. **Xiaomi 15T 12/512** — oferta 1999 zł (Komputronik) **zakończona**; aktualnie 12/512 od 2249,99 zł, 12/256 od 2149 zł → **powyżej limitu**; rekord ma `price.priceUnavailableSince` i ostrzeżenie na karcie — **decyzja użytkownika: zostawić w puli czy `over_budget`?**
- [x] FP1-02 Realme 16 Pro+: walidator ostrzega, gdy link modelu z „+” nie zawiera członu „plus”; strona produktu Ceneo 193078329 („realme 16 Pro+ 5G 8/256GB”) potwierdza, że oferta 1959,99 zł to wariant Pro+ (drugie źródło: realmeshop.pl 2299 zł) — zapis w `auditNote`, `priceCompareUrl`, drugi link
- [~] FP1-03 odświeżenie 15 cen — **w dniu zakupu 26.11** (jak w planie); 17.11: Xiaomi 15T dostał `price.currentMarketPricePln` 2249,99 zł (Ceneo; x-kom/Neonet 2499, 12/256 od 2149) obok ostatniej ceny w limicie — rekord zostaje w puli z ostrzeżeniem (decyzja użytkownika); Edge 70 Fusion: zakup z Allegro przed 30.11 (decyzja)
- [x] FP1-04 `price.regularPricePln / promoEndsAt / promoCondition` + walidacja; Edge 70 Fusion (do 30.11, Allegro, limit 1 szt., regularnie 1799 zł) i Redmi Note 17 Pro (kod do 19.11, regularnie 2199 zł); tekst na karcie anonimowej (bez sklepu) i odsłoniętej (z warunkiem)
- [x] FP1-05 ładowarka: zdanie przy cenie na odsłoniętej karcie i w pełnym rankingu („W pudełku nie ma ładowarki… dolicz ok. 80-150 zł, pełna moc X W…”); dla `null` — „producent nie deklaruje”
- [x] FP1-06 każdy link sklepu z ceną, datą i typem (sklep / oficjalna dystrybucja / marketplace); porównywarka wydzielona jako przycisk „Sprawdź aktualną cenę” (`reveal.priceCompareUrl`, 15/15; Ceneo — strona produktu albo wyszukiwanie)
- [x] FP1-07 `specs.securitySupportUntil` dla **15/15** (Pixel 10a 03.2033 — 7 lat od dostępności 5.03.2026; Edge 70 Fusion 03.2031 — 3 wersje + 5 lat poprawek wg microsite Motoroli; realme 02.2030 — 4 lata od premiery PL 12.02.2026); `wearableNotes` (Mi Band 6 przez Zepp Life, Mi Fitness nie obsługuje Band 6; wyłączyć optymalizację baterii dla aplikacji) dla trzech kandydatów
- [x] FP1-08 `price.note` → `userNote` (UI) + `auditNote` (weryfikacja); walidator odrzuca stare `note`
- [x] FP1-09 sekcja „Sprawdzone przed zakupem: ✓ … · data” — kod gotowy, pokazuje się po wypełnieniu `verifiedForPurchaseAt` (FP1-01)

**FP2 — produkt bez szumu**
- [x] FP2-01 mobilny CTA: „Zacznij quiz” tworzy sesję; przy niedokończonej — „Wznów wybór” na właściwy ekran (wykluczenia / tryb / karty)
- [x] FP2-02 panele deweloperskie (eyebrow „Etap…”, mapa ekranów, konsola routera, panel etapów, linki „podgląd”, demo) **usunięte ze Startu** (decyzja użytkownika; komponenty zostają w repo, makiety `#/s/demo/*` osiągalne tylko z adresu); **zostaje:** stopka z postępem etapów i komunikaty „etap 3/7” w `strings`
- [x] FP2-03 Start = jeden główny przycisk „Zacznij quiz (ok. 5 min)”; suwaki pod zwijanym „Inne sposoby”; hybryda tylko w dev (kod zostaje)
- [x] FP2-04 wykluczenia jako opcja: nowa sesja startuje od pytań (`exclusionsStep: 'done'`), link „Chcę z góry wykluczyć markę lub model” na Starcie i w podsumowaniu quizu, po ujawnieniu przycisk „Nie chcę tej marki — pokaż inną propozycję” (bez przeliczania S)
- [x] FP2-05 `#/s/:id/ranking` bez wyboru → przyjazna blokada „Najpierw wybierz jedną z trzech propozycji” (test wycieku: zero nazw)
- [ ] FP2-06 `value` w pełnym rankingu z `rawScore(…, snapshot.filters.budgetMax)` i cena ze snapshotu — **do zrobienia**
- [x] FP2-07 etykiety wg celu: G1 → „Dalej: podsumowanie”, podsumowanie i dostrojenie → „Pokaż 3 propozycje”
- [ ] FP2-08 fleksja `plural()` w całym `strings.ts` — **do zrobienia** (częściowo w tekstach etapu 11)
- [x] FP2-09 na karcie „67 %” z wyjaśnieniem w `title`; „% najlepszego” tylko w szczegółach

**FP3 — zaufanie do wyniku**
- [x] FP3-03 A3 → `charging` 0,25 / 1,5 / 4 (domyślna waga zostaje 2 — osobna wartość 1 łamała „start neutralny” suwaków); persona „żona”: Edge 70 Fusion 66,9 › Note 17 Pro 66,7 › vivo 65,7; **sesja użytkowniczki bez zmian** (bramka)
- [x] FP3-04 C3 „Chcę, jeśli się da” → `preferMicroSd` (+15 pkt `storage` tylko dla telefonu ze slotem, w sesji) zamiast podnoszenia wagi pamięci wszystkim; pula bez zmian
- [x] FP3-06 licznik filtrów „W budżecie do 1500 zł: 3 z 15” (plus „Pasuje X z 15” po wykluczeniach); „Pokaż 3 propozycje” zablokowane przy pustej puli
- [ ] FP3-07 `storage` 40/82/100 — **wstrzymane do FP6**: pomiar na sesji użytkowniczki zamienia jej trzecią kartę (Note 17 Pro → Edge 60) przed zakupem (`E12-zmiany-rankingu.md`)
- [x] FP3-02 plakietka „Wyraźny kompromis w Twoim priorytecie: Aparat” (grupa z trójki G1 z GroupScore < 40 **lub** kryterium z wagą 5 i oceną < 55); **bez kary punktowej** (decyzja użytkownika) — u „żony” dostaje ją Redmi Note 17 Pro (aparat 62 przy wadze 5), Edge 70 Fusion nie
- [x] FP3-05 budżet elastyczny: czwarta opcja F1 „Najlepiej do 1500 zł, dopłacę do 1800 zł, jeśli telefon będzie wyraźnie lepszy” (`budgetMax: 1500`, `budgetStretch: 1800`, `value: 4`), segment w panelu filtrów; karty = 2 najlepsze ≤ 1500 + najlepsza z pasma 1501-1800 **tylko gdy ma wyższy S** niż najlepsza w budżecie, z plakietką „Dopłata +X zł za +Y pkt”; ranking i S bez zmian. U „żony”: Edge 60 (59,7) · Redmi Note 15 Pro (54,9) · **vivo V70 FE 61,9 za 1799 zł — dopłata +400 zł za +2,2 pkt**. Opcje twarde 1500/1800/2000 zostają; dotychczasowe persony (F1-c) nie zmieniły się
- [ ] FP3-01 „Pasuje, bo… / Na co uważać”, FP3-08 cechy użytkowe (data końca poprawek na karcie anonimowej — uwaga żony o aktualizacjach), FP3-09 plakietka niskiej pewności (15T: 6 × `low` w aparacie!), FP3-10 suwaki „Dostrój” — następna tura
- [x] FP3-11 — **decyzja użytkownika: quiz zostaje 19 pytań** (zamknięte bez zmian)
**FP4 — dane i metodyka** — **przed zakupem (decyzja 17.11)**, priorytet dla top 5 użytkowniczki (15T, Edge 70 Fusion, Note 17 Pro, Edge 60, A57):
- [x] FP4-05 IP66/IP68 = 92 (Redmi Note 15 Pro) — bramka: bez wpływu na karty
- [x] FP4-08 daty wsparcia 15/15; Mi Band 6 dla trzech kandydatów (żona używa opaski)
- [ ] **FP4-02 aparaty z recenzji — najpilniejsze**: kandydat #1 (15T) ma 6 ocen aparatu z pewnością `low` („z 15T Pro −10”), a aparat to jej priorytet 5; do tego Edge 70 Fusion, Note 17 Pro, Edge 60
- [ ] FP4-01 jedna miara baterii (EPREL/Active Use) dla top 5; FP4-03 `updates` jako pozostałe lata od 26.11.2026; FP4-04 struktura aparatów; FP4-06 `basis`; FP4-07 Monte Carlo
**FP5 — proces i v1.0**
- [x] FP5-01 gotowy `planning/package.release.json` (nazwa `phone-selection`, `version 1.0.0`, `engines`, skrypty `typecheck`/`test`/`test:coverage`/`validate-data`/`data-gaps`/`stale-prices`/`release`) — **do wklejenia jako `package.json` w repo** (łańcuch `release` sprawdzony); ESLint/Prettier nieinstalowane — konfiguracje zostają, CI używa `--if-present`
- [x] FP5-04 statusy sesji: `in_progress` → **`awaiting_pick`** (ranking policzony, bez wyboru) → `completed` (po wyborze); **migracja v2 → v3** z testem; Start i historia prowadzą do „Wróć do swoich 3 propozycji”; `session/status: completed` bez `picks` daje `awaiting_pick`
- [~] FP5-02 walidator: promo, `userNote`, slug wariantu, `priceCompareUrl` — jest; `securitySupportUntil` wymagane — po FP4-03
- [ ] FP5-03 `storage.ts` nowszy schemat → `persistent: false`; FP5-05 link wznowienia v2; FP5-06 dokumentacja; FP5-07 `vite.config.ts`; FP5-08 wydanie — **tag v1.0 po FP3 (decyzja)**
**FP6 — po zakupie:** FP6-01 zakup (`stale-prices` + ręczne sprawdzenie), FP6-02 retro po 2 tygodniach (`E12-retro.md`), FP6-03 decyzja o zamknięciu/kontynuacji, FP6-04 lekcje w PROJECT.

**Stan po trzeciej turze (17.11.2026):** 31 plików testów, **404 zielone, 0 pomijanych** (bramka kandydata aktywna na prawdziwej sesji); `validate-data` 0 błędów, 3 ostrzeżenia (NFC Realme, 2 linki Realme bez „plus”). Wszystkie decyzje z listy pytań podjęte (patrz `E9-wynik-testu.md` §4). Ścieżka do zakupu 26.11: **FP4-02 (aparaty top 5) → FP3-01/08/09 → ponowne przejrzenie kart z użytkowniczką → FP1-03 (ceny 26.11) → FP6-01**.

---

## Etap 14 — Poprawa interfejsu (FIX-UI-PHASE)

**Podstawa:** [`FIX-UI-PHASE.md`](./FIX-UI-PHASE.md) — warstwa wizualna i interakcyjna **bez zmiany funkcjonalności** (te same ekrany, dane, logika, testy wycieku i a11y). Kierunek: jasny motyw = „przyjazny doradca” (sans, 12-16 px, jeden akcent), ciemny = „arkusz techniczny” (mono, uppercase, 2 px, siatka); cena → dopasowanie → cechy; komponenty zamiast klas; ruch tylko w odpowiedzi na działanie.

**UIP0 — fundament** (`src/index.css`)
- [x] UIP0-01 tokeny: skala typograficzna `--text-display/h1/h2/h3/body/small/label/price` (Tailwind 4 generuje z nich utility `text-h1`…), kolory semantyczne `--color-danger/-soft`, `--color-info/-soft`, `--color-ok-soft`, `--color-accent-hover`, promienie `--radius-control` (12/2 px), `--radius-sheet` (20/4 px), `--radius-chip`, odstępy `--space-1…6`, `--gap-section`, ruch `--motion-fast/base`, `--ease-out`; `tests/theme-tokens.test.ts` sprawdza 12 par kontrastu (było 7) — `--color-ok` jasny przyciemniony do `#276b49` (4,40 → 5,61:1 na `ok-soft`)
- [x] UIP0-02 `.label` z tokenów `--label-font/-transform/-tracking/-weight` przełączanych motywem (jasny: sans 12 px, pierwsza wielka; ciemny: mono uppercase 11 px); `.label-mono` został aliasem (84 miejsca bez zmian w kodzie)
- [x] UIP0-03 `tests/ui-guard.test.ts` — strażnik w **trybie raportu** (budżety naruszeń mogą tylko maleć): `text-[Npx]`, `rounded-[Npx]`, `tracking-[…]` poza `ui/`, ręczne przyciski, `text-[clamp(…)]`, import `features/lib/data` w `ui/`

**UIP1 — komponenty bazowe** (`src/components/ui/`)
- [x] UIP1-01/02 `Button` (primary/secondary/ghost/danger × md/lg, `href` → `<a>`, `buttonClasses()` dla miejsc z klasą), `Chip` (6 tonów), `Callout`, `Meter` (`role=meter`, `aria-valuetext`), `Stat`, `SectionHeading`, `ActionBar` (jeden dolny pasek z `safe-area-inset-bottom`); zasada: `ui/` nie importuje `features/`, `lib/` ani `data/` (test)
- [x] UIP1-04 podmiana ręcznych przycisków na `Button` (kodmod + ręcznie): **ręczne przyciski główne poza `ui/`: 21 → 0**, drugorzędne poza `ui/`: 25 → 4 (zostały 4 plakietki/etykiety, nie przyciski)
- [ ] UIP1-03 `Sheet` wspólny dla `ConfirmSheet`/`ExclusionSheet` (dziś: oba przez `Button` i `--radius-sheet`, wspólna powłoka — w kolejce)

**UIP2 — ekrany**
- [x] UIP2-01 nagłówek: pasek postępu tras (`PROGRESS_ORDER`) usunięty, **okruszek kroku „Pytania → Propozycje → Wybór”** tylko w sesji, ikona Historii z kropką nieukończonych; stopka = jedna linia „Dane z 16.11.2026 · 15 telefonów · limit 2000 zł” + zdanie o liczeniu i o danych w przeglądarce (bez dokumentów i kropek roadmapy)
- [x] UIP2-02 Start: `text-display`, jedno zdanie lead, `Button primary lg` bez przewijania, wznowienie jako `Callout accent` nad CTA, **jedna karta podglądu** bez talii i hover, „Jak to działa” w 3 krokach, mobilny `ActionBar` tym samym `Button`
- [x] UIP2-03 (część) `OptionButton` bez liter A-E i bez podglądu wag `sets`; radio-kropka po lewej, check po prawej; „pomiń” wizualnie najsłabszy (zostaje w radiogroup — klawiatura i testy); pytanie w `text-h1`; „dlaczego pytamy” zawsze widoczne jako zdanie `text-small` — **zostaje:** progres segmentowy, G1 bez „1,3 / 5”, podsumowanie z `Meter`
- [x] UIP2-04 karta anonimowa: **cena największą liczbą** (`text-price`), miejsce jako `Chip`, dopasowanie `text-h3` + `Meter`, chipy „w budżecie / Powyżej budżetu / Dopłata”, kompromis i niedostępna oferta jako `Callout`, cechy `text-small` z ikonami 20 px, „Wszystkie cechy” i CTA przez `Button`; hover-lift usunięty — sygnał hover to kolor obramowania
- [x] UIP2-08 (część) pełny ranking: „Twój wybór n/m” = `Chip ok`, „Wykluczony” = `Chip neutral` + przekreślenie, nazwa `text-h3`, przycisk „Poza pulą” przez `Button` — **zostaje:** mini-`Meter` z etykietami B·A·P·W·E·C, `SectionHeading` w rozwinięciu
- [x] UIP2-09 (część) historia: status jako `Chip` (ok/accent), Wznów/Podgląd/Usuń przez `Button primary/secondary/danger`, tytuł `text-h3` — **zostaje:** `EmptyState`, `Toast`
- [x] UIP2-06 animacja ujawnienia: `card-flip` 400 ms (`rotateY` z `backface-visibility`), przy `prefers-reduced-motion` samo przenikanie; keyframes nadal 6 (`fade-in` zszyty ze `screen-in`)
- [ ] UIP2-05 pasek porównawczy mobile — **wariant A** (decyzja): przyklejony pasek „#1 · 1799 zł · 67 %” z przewijaniem do karty; UIP2-07 suwaki (wartości słownie, znacznik jako kreska, szybki wybór tylko na desktopie)

**UIP3 — szlif**
- [x] UIP3-01 (część) keyframes **9 → 6** (usunięte `breathe`, `rule-draw`, `step-in` jako alias `screen-in`), `@media (hover: none)` wyłącza przesunięcia na dotyku, czasy z tokenów; `--radius-sheet` w arkuszach (D9)
- [x] UIP3-02 tło jasne: poświaty 0,13/0,16 → 0,07/0,08, kropki wyłączone (zostają w ciemnym)
- [ ] UIP3-03 przegląd 130 % czcionki i 320 px; UIP3-04 strażnik → `fail` **po domknięciu UIP2** (decyzja) + `UI-SPEC`; UIP3-05 10-minutowy przegląd z użytkowniczką — połączyć z ponownym przejrzeniem kart przed 26.11
- [x] Decyzja 17.11: etykiety jasnego motywu jako zwykły tekst 12 px — **zostają globalnie**

**Metryki (FIX-UI §9) — przed → po tej turze → cel:** ręczne przyciski główne 21 → **0** → 0 · `text-[Npx]` 209 → 163 → 0 · `text-[clamp(…)]` 13 → 9 → 0 (tokeny) · `hover:-translate-y` 34 → 13 → 0 · keyframes 9 → **6** → ≤ 6 · pary kontrastu 7 → **12** · największa liczba na karcie: „67 %” → **cena** · testy 379 → **396** zielonych + 3 pomijane.

---

## Historia zmian

Skrót tego, co i kiedy zmieniło się w projekcie (szczegóły w sekcjach etapów i plikach `ETAP-*.md`).

| Data | Zmiana | Commit |
|---|---|---|
| 14.11.2026 | Dokumenty planistyczne: PROJECT, ROADMAP, QUIZ-SPEC, UI-SPEC, plany etapów 1-9; lista 10 telefonów z cenami od użytkownika | `8c5a1be` … `9f26373` |
| 15.11.2026 | Etap 1 — szkielet, router hashowy, workflow GitHub Pages | `bacbe7b` |
| 16.11.2026 | Etap 2 — silnik rankingu (wagi, pula, normalizacja, anonimizacja); etap 3 — zapis sesji z migracjami; dane telefonów domknięte (etap 0) | `4634f94`, `b992723`, `e6b4fbf` |
| 16.11.2026 | Etap 4 — quiz A-F + G1; etap 5 — suwaki i hybryda; etap 6 — anonimowe karty, wybór i ujawnienie; korekta pasm G1 | `f538b6f`, `a43b801`, `d60d5df`, `e98a14a` |
| 16.11.2026 | Etap 7 — historia, wznawianie, link `#/r/<kod>`, eksport/import; etap 8 — motywy, mobile, audyt axe | `1422d17`, `0ded9d7` |
| 16.11.2026 | Etap 9 (część techniczna) — pełny ranking, kalibracja `BLEND = 0,5`, `stale-prices`, `release`; przygotowanie v1.0 | `3a4caf3` |
| 16.11.2026 | **Etap 10** — przegląd 21 kandydatów (decyzje D1-D6), pula 10 → 15 (Honor 400, Galaxy A37 5G, OnePlus Nord 5, vivo V70 FE, Redmi Note 17 Pro 5G 8/512), wzór baterii 4000-8000 mAh, nowe referencje person | `864815d` |
| 16.11.2026 | **Etap 11** — wykluczanie marek i modeli: schemat v2, `lib/exclusions.ts`, `rank().fullRanking`, ekran `#/s/:id/exclude`, panel filtrów, plakietki w pełnym rankingu i historii, testy akceptacyjne 1-9 | `baf7f06` |
| 16.11.2026 | **Etap 12** — grupa „Wymiary i waga” z kryterium `compactness`, pytanie D4, `PhonePhoto` i zdjęcia po ujawnieniu | `3281614` |
| 16.11.2026 | Stabilizacja testów: limit czasu 20 s dla przepływów komponentowych (`vitest.config.ts`), jawny limit testu „2., 7. i 8.” w `tests/exclusions.test.ts`; wpisy etapu 12 i ta historia w ROADMAP | — |
| 17.11.2026 | **Etap 13, tura 3 (decyzje użytkownika)**: sesja żony w bramce kandydata (zielona), `E9-wynik-testu.md` wypełniony, data zakupu 26.11; 15T z aktualną ceną rynkową 2249,99 zł; FP3-03 (charging z A3), FP3-04 (microSD jako bonus), FP3-06 (licznik „w budżecie”), FP4-05 (IP66/IP68 = 92) przez bramkę — karty użytkowniczki bez zmian; FP3-07 wstrzymane (zmieniałoby jej #3); FP5-04 statusy `awaiting_pick` + migracja v3; FP5-01 `planning/package.release.json`; UIP2-06 animacja ujawnienia | — |
| 16.11.2026 | **Etap 14 — poprawa interfejsu (FIX-UI, tura 1)**: tokeny typografii/kolorów/promieni/ruchu, `.label` przez motyw, komponenty `ui/` (Button, Chip, Callout, Meter, Stat, SectionHeading, ActionBar), kodmod przycisków (21 → 0 ręcznych głównych), nagłówek z okruszkiem kroku i prosta stopka, Start z jednym CTA, karta „cena → dopasowanie → cechy”, opcje quizu bez liter, chipy w historii i rankingu, 6 keyframes, słabsze tło, strażnik `ui-guard` | — |
| 16.11.2026 | Etap 13, tura 2: weryfikacja trzech kandydatów (FP1-01; oferta 15T za 1999 zł wygasła), Mi Band i daty wsparcia 15/15 (FP1-07), plakietka kompromisu bez kary (FP3-02), budżet elastyczny 1500/1800 (FP3-05), panele dev usunięte (FP2-02) | — |
| 16.11.2026 | **Etap 13 — faza poprawkowa (FIX-PHASE)**: FP1 bezpieczny zakup (promocje z datą końca, ładowarka, linki z ceną/datą/typem, porównywarka, daty wsparcia, `userNote`/`auditNote`, „Sprawdzone przed zakupem”), FP2 produkt bez szumu (jeden CTA, wykluczenia jako opcja, panele dev tylko w `?dev=1`, blokada rankingu przed wyborem, etykiety przycisków, procent z wyjaśnieniem), bramka kandydata (`tests/user-session.test.ts`), szablony `E9-wynik-testu.md` i `E12-zmiany-rankingu.md` | — |

**Do zrobienia przed v1.0 (etap 9 + 13):** FP0-01/FP0-04 (wynik testu i data zakupu), FP1-01 (ręczna weryfikacja kandydata), odświeżenie cen w dniu zakupu (`npm run stale-prices`), FP3 przez bramkę kandydata, tag `v1.0`.

## Zasada pracy

Po każdym etapie aktualizujemy ten plik (statusy, „Stan danych”) i `PROJECT.md`, jeśli zmieniła się decyzja.
