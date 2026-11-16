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
| 8 | Motywy, mobile, dostępność | `[ ]` |
| 9 | Pełny ranking, szlify i wydanie | `[ ]` |

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

- [ ] Przycisk z ikoną: motyw jasny (prosty, przyjazny) ↔ ciemny (złożony, surowy)
- [ ] Tokeny w `@theme`, wariant `dark` oparty o `data-theme`
- [ ] Testy na telefonie: duże pola dotyku, brak przewijania w poziomie
- [ ] Dostępność: kontrast, focus, etykiety suwaków, obsługa klawiatury

**DoD:** oba motywy spójne na telefonie i komputerze; wybór motywu zapamiętany.

## Etap 9 — Pełny ranking, szlify i wydanie

- [ ] Przycisk „Pokaż pełny ranking” (10 telefonów z nazwami) po wyborze zwycięzcy
- [ ] Kalibracja stałych rankingu na prawdziwych danych
- [ ] Odświeżenie cen i dat przed wydaniem
- [ ] Przejście całego procesu przez żonę (test użyteczności), poprawki

**DoD:** wersja gotowa do realnego użycia; ceny odświeżone w ciągu ostatnich 7 dni.

---

## Zasada pracy

Po każdym etapie aktualizujemy ten plik (statusy, „Stan danych”) i `PROJECT.md`, jeśli zmieniła się decyzja.
