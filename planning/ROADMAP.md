# Wybór telefonu — ROADMAP.md

Etapy w kolejności realizacji. Każdy etap ma cel, zadania i **kryterium ukończenia (DoD)**. Szczegóły decyzji są w [PROJECT.md](./PROJECT.md).

Legenda: `[ ]` do zrobienia · `[~]` w toku · `[x]` zrobione

| Etap | Nazwa | Status |
|---|---|---|
| 0 | Dane telefonów i specyfikacja rankingu | `[~]` w toku |
| 1 | Szkielet projektu i deploy | `[ ]` |
| 2 | Silnik rankingu (czysta logika + testy) | `[ ]` |
| 3 | Sesje i zapis w przeglądarce | `[ ]` |
| 4 | Tryb quiz | `[ ]` |
| 5 | Tryb suwaków i hybryda | `[ ]` |
| 6 | Ranking, anonimowe karty, wybór i ujawnienie | `[ ]` |
| 7 | Historia sesji i wznawianie | `[ ]` |
| 8 | Motywy, mobile, dostępność | `[ ]` |
| 9 | Pełny ranking, szlify i wydanie | `[ ]` |

---

## Etap 0 — Dane telefonów i specyfikacja rankingu

**Cel:** komplet zweryfikowanych danych o 10 telefonach (z poprawką wariantów do 2000 zł) oraz zamrożona lista kryteriów.

- [~] Zebrać ceny (PL, nowe, polska dystrybucja) z datą sprawdzenia (9 z 10 gotowe, 1 do potwierdzenia)
- [~] Zebrać specyfikacje: bateria, ładowanie, ekran, IP, microSD, aparaty, aktualizacje, waga
- [~] Zebrać wyniki niezależnych testów (czas pracy baterii, aparat) jako podstawę ocen 0–100 (część: DXOMARK/PhoneArena/GSMArena; dla 15T i Realme brak testów)
- [x] Warianty: wszystkie ceny ≤ 2000 zł, zostajemy przy wariantach z listy (Pixel 10a i 9a w wersji 128 GB)
- [x] Wypełnić `scores` + `basis` dla każdego kryterium (z pewnością ocen i listą braków)
- [ ] Zatwierdzić listę kryteriów i zasady wyprowadzania wag z odpowiedzi (PROJECT.md, 7.6)

**DoD:** `phones.json` przechodzi walidację (komplet pól, ceny ≤ 2000 zł, daty cen), brak wartości „z pamięci” bez źródła.

### Stan danych (aktualizowany na bieżąco)

Oceny 0-100 wyliczone wg reguł z PROJECT.md (sekcja 7.5); pewność ocen i braki danych są w `phones.json` (`scoreConfidence`, `scoresEstimatedNeutral`). Ceny i linki podał użytkownik (14.11.2026). Wariant 8/128 GB zostaje dla Pixela 10a i 9a, a Xiaomi 15T bierzemy w wersji 12/512 GB. Pixel 8a i Galaxy A55 wypadły z listy, weszły Redmi Note 15 Pro 5G i Realme 16 Pro+ 5G.

| Model | Cena | Specyfikacja | Oceny | Uwagi |
|---|---|---|---|---|
| Galaxy A57 8/256 | `[x]` 1729,00 zł | `[x]` | `[ ]` | drugi odczyt: morele.net 1799,96 zł; 5000 mAh, 45 W (bez ładowarki), 6 lat aktualizacji |
| Pixel 10a 8/128 | `[x]` 1899,99 zł | `[x]` | `[ ]` | 5100 mAh, 30 W (część źródeł: 23 W), 7 lat aktualizacji, IP68 |
| Galaxy A56 5G 8/256 | `[x]` 1718,99 zł | `[x]` | `[ ]` | 5000 mAh, 45 W (bez ładowarki), 6 lat aktualizacji do 03.2032, IP67 |
| Redmi Note 15 Pro 5G 8/256 | `[x]` 1299,00 zł | `[~]` | `[ ]` | zebrane: bateria 6580 mAh, 45 W, IP66/IP68; brak lat aktualizacji; recenzje krytyczne wobec oprogramowania |
| Motorola Edge 60 12/256 | `[x]` 1399,00 zł | `[~]` | `[ ]` | zebrane: 5200 mAh, 68 W, 3 wersje Androida + 4 lata poprawek; brak IP i wagi |
| Xiaomi 15T 12/512 | `[x]` 1999,00 zł | `[~]` | `[ ]` | wariant 512 GB; zebrane: 5500 mAh, Dimensity 8400 Ultra; moc ładowania i aktualizacje do potwierdzenia (większość testów dotyczy wersji Pro) |
| Motorola Edge 70 Fusion 12/256 | `[x]` 1658,12 zł | `[x]` | `[ ]` | aukcja sprawdzona: nowy, X-KOM_PL, promocja do 30.11.2026, limit 1 szt. |
| Pixel 9a 8/128 | `[x]` 1749,99 zł | `[x]` | `[ ]` | 5100 mAh, 23 W, 7 lat aktualizacji, IP68; ta sama wydajność co 10a |
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

- [ ] Vite 7.3.7 + React 19.2.6 + TypeScript 5.9.3 + Tailwind 4.1.17 (wersje przypięte)
- [ ] ESLint, Prettier, Vitest + Testing Library
- [ ] Router hashowy i layout (nagłówek z miejscem na przycisk motywu)
- [ ] `vite.config.ts` z `base`, workflow GitHub Actions, włączone Pages (źródło: GitHub Actions)
- [ ] Skrypt `validate-data` podpięty pod CI

**DoD:** adres Pages pokazuje ekran startowy; CI buduje i wdraża po wypchnięciu do `main`.

## Etap 2 — Silnik rankingu

**Cel:** poprawna, przetestowana logika bez UI.

- [ ] Typy: `Phone`, `Criterion`, `Question`, `Weights`, `Filters`
- [ ] `scoring.ts`: filtry twarde, wzór `S`, `value`, remisy
- [ ] Mapowanie odpowiedzi quizu na wagi (start neutralny, odpowiedzi ustawiają wagi, krok „trzy najważniejsze” z mnożnikami 1,5 / 1,3 / 1,15 / 0,85)
- [ ] Persona testowa „żona”: test, że jej odpowiedzi dają ranking zgodny z jej priorytetami
- [ ] `anonymize.ts`: budowa danych karty bez pól `reveal`
- [ ] Testy: skrajne wagi, filtry (budżet, microSD), remisy, brak ujawniania nazw w danych karty

**DoD:** pokrycie testami kluczowych ścieżek; test sprawdza, że obiekt karty nie zawiera nazwy, marki ani linków.

## Etap 3 — Sesje i zapis w przeglądarce

**Cel:** trwały stan z wersjonowanym schematem.

- [ ] `storage.ts`: odczyt/zapis `localStorage`, walidacja, migracje (`schemaVersion`)
- [ ] Model `Session` (tryb, odpowiedzi, wagi, filtry, snapshot rankingu, wybory)
- [ ] Obsługa braku/uszkodzenia danych (bezpieczny reset z komunikatem)
- [ ] Hook `useSessions` (utworzenie, aktualizacja, wznowienie)

**DoD:** odświeżenie strony nie gubi postępu; uszkodzony zapis nie wywraca aplikacji.

## Etap 4 — Tryb quiz

- [ ] Finalna lista ~14–16 pytań z efektami
- [ ] Bloki tematyczne, pasek postępu, nawigacja wstecz
- [ ] Zapis po każdej odpowiedzi, możliwość przerwania i powrotu
- [ ] Ekran podsumowania przed liczeniem rankingu

**DoD:** pełne przejście quizu generuje wagi i filtry; przerwanie w połowie i powrót odtwarza stan.

## Etap 5 — Tryb suwaków i hybryda

- [ ] Suwaki ważności 0–5 dla kryteriów (czytelne także na telefonie)
- [ ] Filtry: budżet, minimalna pamięć, „musi mieć microSD”
- [ ] Hybryda: skrócony quiz → suwaki wypełnione wynikami
- [ ] Podgląd na żywo, ile telefonów spełnia filtry

**DoD:** każdy z trzech trybów kończy się tym samym obiektem wag i filtrów w sesji.

## Etap 6 — Ranking, anonimowe karty, wybór i ujawnienie

- [ ] Ekran trzech kart (kolejność rankingu, numer miejsca, % dopasowania, cena z datą)
- [ ] „Więcej szczegółów” (oceny z uzasadnieniami, pełne dane)
- [ ] Wybór karty → ujawnienie nazwy i linków do sklepu
- [ ] Powrót i kolejny wybór, plakietki „Wybór 1/2”, „2/2”
- [ ] Ekran zwycięzcy

**DoD:** przed wyborem w DOM nie ma nazwy ani marki żadnego telefonu; po wyborze wcześniej wybrane karty pozostają odsłonięte z numerem wyboru.

## Etap 7 — Historia sesji i wznawianie

- [ ] Lista sesji (data, tryb, status, ostatni wybór)
- [ ] Wznawianie nieukończonych, podgląd ukończonych, usuwanie
- [ ] Start nowego quizu bez utraty poprzednich
- [ ] (opcjonalnie) link do wznowienia w hashu i eksport/import historii do pliku

**DoD:** można rozpocząć trzy sesje, przeglądać je i wznowić nieukończoną.

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
