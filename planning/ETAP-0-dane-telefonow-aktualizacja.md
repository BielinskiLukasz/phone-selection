# Etap 0 — dane telefonów i specyfikacja rankingu: co zostało

> **Status: ZAMKNIĘTY.** Wszystkie zadania A1-A5, B1-B10 i C1-C4 wykonane albo rozstrzygnięte
> decyzją użytkownika. Walidator: 0 błędów, 1 ostrzeżenie (NFC w Realme — brak źródła, pole `null`).
> Poniżej oryginalna lista z wynikami; na końcu „Co zostaje (etap 9)” i podsumowanie zmian.

Dokument roboczy. Stan na **po uzupełnieniu specyfikacji z oficjalnych stron producentów**
(Motorola, Xiaomi `mi.com`, Google Pixel Help): `src/data/phones.json` ma 10 telefonów,
walidator zgłasza **0 błędów i 16 ostrzeżeń**, testy: **174 zielone**, `tsc --noEmit` czysty.

Etap 0 pozostaje `[~] w toku` w [`planning/ROADMAP.md`](planning/ROADMAP.md), bo część danych
nadal jest `null` (reguła projektu: **brak danych = null, nigdy wartość zgadywana**), a jeden
rekord ma status `needs_confirmation`.

## Legenda właścicieli

| Znacznik | Kto | Dlaczego |
|---|---|---|
| 👤 **Ty** | użytkownik | decyzje produktowe albo strony, które blokują automatyczny odczyt (Empik, Allegro) i wymagają ludzkiej weryfikacji oferty |
| 🤖 **Ja** | agent | wyszukanie i przeczytanie źródeł publicznych, wpisanie potwierdzonych wartości, przeliczenie ocen ze wzorów PROJECT 7.5, aktualizacja `basis`/`scoreConfidence`, uruchomienie walidatora i testów |
| 👤🤖 **Wspólnie** | oboje | ja przygotowuję propozycję z wyliczeniami, Ty ją zatwierdzasz (zmiana specyfikacji rankingu albo liczb referencyjnych) |

---

## A. Zadania, które musisz zrobić Ty (👤)

### A1. ✅ Potwierdzone przez użytkownika → `status: ok`, specyfikacja Pro+ zweryfikowana ze źródłami
Rekord `realme-16-pro-plus-5g-8-256` ma status `needs_confirmation`: cena 1959,99 zł jest z Empiku,
ale adres oferty zawiera **„realme-16-pro-5g” bez „plus”**, a Empik blokuje odczyt strony, więc nie
da się tego zweryfikować automatycznie. Oficjalne ceny premierowe: Pro 8/256 = 1799 zł,
Pro+ 8/256 = 2299 zł — 1959,99 zł pasuje i do obniżonego Pro+, i do podniesionego Pro.

**Do sprawdzenia na stronie oferty:** pełna nazwa, procesor (Pro+: Snapdragon 7 Gen 4 /
Pro: Dimensity 7300 Max), bateria (7000 vs 6500 mAh), aparaty (Pro+ ma peryskop 50 MP 3,5x, Pro nie),
ekran (6,8″ vs 6,78″).

**Co dalej:** jeśli to **Pro+** → zmieniam `status` na `ok` i usuwam zastrzeżenie z `price.note`.
Jeśli to **zwykły Pro** → rekord ma już gotowy wariant awaryjny w `specs.ifItIsPlainPro`
(chip, RAM, bateria, ekran, aparaty): przepisuję go do pól głównych, przeliczam oceny
(`battery`, `durability`, `smoothness`, `zoom`, `storage`) i daję znać, jak zmieni się ranking.
Opcja trzecia: podajesz link do pewnej oferty Pro+ ≤ 2000 zł z innego sklepu.

### A2. ✅ Zatwierdzone (14 kryteriów w 6 grupach, wagi z QUIZ-SPEC 2.2)
Ostatni niezaznaczony checkbox etapu 0 w ROADMAP: PROJECT 7.1 (14 kryteriów w 6 grupach)
i PROJECT 7.6 / QUIZ-SPEC 2.2 (start neutralny 2, odpowiedzi ustawiają wagi, krok G1 z mnożnikami
5/4/3 i wzorem `0,5 + 0,4 × średnia` dla grup poza trójką). Silnik już tak liczy — potrzebna jest
tylko Twoja decyzja „zatwierdzone”, żeby zamknąć etap. **Jeśli chcesz coś zmienić** (np. wyrzucić
`zoom` albo scalić `photoDay`/`photoIndoor`), powiedz: zmiana dotknie `data/criteria.ts`,
`data/questions.ts`, `lib/weights.ts`, `lib/scoring.ts` i testów person — policzę skutki przed zmianą.

### A3. ✅ Zaktualizowane — QUIZ-SPEC 9.1-9.4 ma nowe liczby referencyjne
Po wpisaniu potwierdzonych specyfikacji stan referencyjny persony „żona” to:
**#1 Edge 70 Fusion 71,2 · #2 Edge 60 62,4 · #3 Xiaomi 15T 57,9** (Realme 16 Pro+ spadł na #4 z 55,9),
a test różnicujący 9.4 wychodzi 70,3 : 64,3 (bateria) i 78,0 : 75,3 (`photoDay`).
W QUIZ-SPEC 9.1 wpisany jest starszy stan (#3 Realme). 👤🤖 Ja przygotuję diff z nowymi liczbami
i uzasadnieniem (które pola je zmieniły), Ty decydujesz, czy aktualizujemy dokument.

### A4. ✅ Zostaje obecny model (`updatesYears` = lata poprawek, wersje w `updatesOsGenerations`)
W danych Edge 60 ma `updatesYears: 4` (= lata poprawek bezpieczeństwa), a liczba dużych wersji
Androida (3) siedzi w polu `updates` i w `updatesInterpretation`. Twoja instrukcja dopuszczała 5, 3
albo pozostawienie obecnego modelu — zostawiłem obecny, bo karta i tak pokazuje pełny zapis
„3 aktualizacje systemu, 4 lata poprawek”. 👤 Potwierdź albo powiedz, że wolisz jedno pole
`updatesYears` z inną definicją — wtedy ujednolicę model danych dla wszystkich 10 rekordów.

### A5. ✅ Zostaje cena promocyjna 1658,12 zł; odświeżenie przed wydaniem (etap 9)
1658,12 zł to aukcja Allegro (sprzedawca X-KOM_PL) z **promocją do 30.11.2026 i limitem 1 szt.**
👤 Zdecyduj, czy zostaje jako cena referencyjna (wtedy przy odświeżaniu cen przed wydaniem trzeba ją
zdjąć i wziąć cenę regularną ~1799 zł), czy od razu wpisujemy drugą obserwację z `price.otherObservations`.
To wpływa na `value` i na wynik persony „żona” (#1).

---

## B. Zadania agenta (🤖) — **wszystkie wykonane**

Każde z nich kończy się tak samo: wpisuję **tylko wartość ze źródła**, dodaję URL do `sources`,
aktualizuję `basis` (tak, żeby cytował źródło) i `scoreConfidence`, przeliczam ocenę ze wzoru
z PROJECT 7.5, usuwiam kryterium z `scoresEstimatedNeutral`, uruchamiam
`npm run validate-data` + `npm test` + `npm run typecheck` i aktualizuję „Stan danych” w ROADMAP.
**Jeśli źródła nie znajdę — pole zostaje `null`, a w `sources` dopisuję, co sprawdziłem.**

### B1. Polityka aktualizacji: Xiaomi 15T, Redmi Note 15 Pro, Realme 16 Pro+ (ostrzeżenia `updatesYears`)
**Jak:** `web_search` + `web_fetch` po oficjalnych stronach wsparcia (mi.com/pl i mi.com/global
→ sekcja „Software updates”, motorola.com/support, realme.com/pl support, forum MIUI/HyperOS
z komunikatem producenta), plus zapisy premierowe polskich redakcji cytujące deklarację producenta.
**Co wpisuję:** `updatesOsGenerations` + `updatesSecurityYears` (model preferowany, tak jak w Edge 70
Fusion) albo `updatesYears`, a `basis.updates` dostaje cytat. **Ocena:** `updates = lata / 7 × 100`,
gdzie lata = średnia z liczby wersji i lat poprawek (PROJECT 7.5) — czyli np. 4 wersje + 5 lat
poprawek → 4,5 / 7 × 100 = 64. Pewność `high`, kryterium znika z `scoresEstimatedNeutral`.
**Skutek uboczny:** zmienia ranking w grupie `longevity` — policzę i pokażę diff dla trzech person.

### B2. Wytrzymałość baterii: Xiaomi 15T, Realme 16 Pro+, Edge 70 Fusion (ocena `battery` = 50 z braku danych)
**Jak:** szukam testów **właściwego wariantu** (nie Pro): GSMArena „battery life” / active use score,
Notebookcheck (czas pracy w teście Wi-Fi), PhoneArena battery test, polskie testy (gsmManiaK,
tabletowo, android.com.pl) z podanymi godzinami. **Propozycja reguły (do zatwierdzenia 👤🤖 w C1):**
`endurance` 0–100 z godzin pracy ekranu/aktywnego użycia względem puli:
`endurance = 100 × (godziny − min_puli) / (max_puli − min_puli)`, z zapisem źródła w `basis.battery`
i godzinami w `specs.batteryTests`. **Ocena:** `battery = 0,5 × pojemność + 0,5 × wytrzymałość`,
pojemność = `(mAh − 4000) / 3000 × 100`. Bez reguły zatwierdzonej przez Ciebie wpisuję tylko
`batteryTests` (fakty) i zostawiam ocenę neutralną — nie zgaduję liczby.

### B3. Niezależne wyniki aparatów: Redmi Note 15 Pro, Realme 16 Pro+, Xiaomi 15T (`photoDay…zoom` z pewnością `low`)
**Jak:** DXOMARK (osobne strony dla modelu, nie wariantu Pro), PhoneArena camera score,
eftm/arecenze/gsmManiaK, testy porównawcze redakcji. Dla każdego kryterium aparatu zapisuję w
`basis` konkretny wynik i źródło, a `scoreConfidence` podnoszę do `medium`/`high` **tylko** gdy test
dotyczy dokładnie tego modelu. Gdy istnieje tylko test wariantu Pro — zostawiam dotychczasową regułę
„wynik Pro minus ~10 pkt” i pewność `low`, z jawnym zdaniem w `basis` (tak jest dziś dla 15T).

### B4. Ekran Xiaomi 15T: typ panelu i jasność (`display` = 50, ostrzeżenie o braku danych jakościowych)
**Jak:** `mi.com/pl/product/xiaomi-15t/specs/` i `mi.com/global/...` (mają `panel` i `peakNits`),
weryfikacja GSMArena. **Co wpisuję:** `specs.panel`, `specs.peakNits`, `specs.resolution` (jeśli jest),
a `displayNote` zamieniam na cytat. **Ocena `display`:** zostaje neutralna, dopóki nie ma pomiarów
lub testów — chyba że zatwierdzisz regułę z C2 (jasność → punkty). Karta zyska za to pełny wiersz
„6,83″ AMOLED 120 Hz” zamiast „ekran: brak danych”.

### B5. Redmi Note 15 Pro: waga, microSD, ładowanie bezprzewodowe (4 ostrzeżenia)
**Jak:** oficjalna specyfikacja `mi.com/pl/product/redmi-note-15-pro-5g` + GSMArena
(`motorola`/`xiaomi` pages mają `weight`, `card slot`, `wireless charging`). Wpisuję `weightG`,
`microSd` (true/false), `wirelessCharging` (true/false) i `chargerInBox`. Jeśli któryś telefon
dostanie `microSd: true`, pytanie C3 zostaje aktywne i filtr „musi mieć microSD” zwróci więcej
pozycji — sprawdzę wpływ na ranking i raportuję.

### B6. Zawartość pudełka: Edge 60, Nothing Phone (3a), Realme (3 ostrzeżenia `chargerInBox`)
**Jak:** strony „what's in the box” producenta (motorola.com/pl, nothing.tech, realme.com) albo
karty produktowe sklepów z sekcją „zestaw”. Wpisuję `true`/`false` i cytat w `chargingNote`.
**Wpływ na ranking:** żaden (`chargerInBox` nie wchodzi do wzoru `charging`), ale znika z karty
„brak danych” i domyka ostrzeżenia. Jeśli PROJECT 7.5 ma dostać bonus za ładowarkę w zestawie —
to decyzja 👤🤖 z C2.

### B7. Edge 70 Fusion: microSD (ostrzeżenie)
**Jak:** specyfikacja producenta (`en-emea.support.motorola.com`, a_id/192851) ma pozycję
„card slot”. Wpisuję `true`/`false`; przy `true` przeliczam `storage` (75 + 5 bonusu) i aktualizuję
`basis.storage`.

### B8. Galaxy A56 i Redmi: dopisek o braku teleobiektywu (2 ostrzeżenia `cameras.telephoto`)
**Jak:** to nie brak danych, tylko brak zdania w `basis.zoom`, po którym anonimizator poznaje,
że `telephoto: null` oznacza „telefon nie ma aparatu do przybliżania”. Sprawdzam w specyfikacji
producenta, że teleobiektywu faktycznie nie ma, i dopisuję do `basis.zoom` formułę
„…brak teleobiektywu (zoom 2x z kadrowania)” — tak jak w Pixelach i A57. Efekt: karta pokazuje
„bez aparatu do przybliżania” zamiast „brak danych”, a ostrzeżenia znikają.

### B9. Raport luk danych i próg przed wydaniem (narzędzia)
**Jak:** dopisuję `scripts/data-gaps.ts` — czyta `phones.json` i drukuje tabelę: telefon × pole
(`null`, `scoresEstimatedNeutral`, `scoreConfidence = low`, `status ≠ ok`) z licznikiem „ile zostało”.
Podpinam pod `npm run data-gaps`. Do tego test-strażnik dla etapu 9: build nie przechodzi, jeśli
jakiś rekord ma `needs_confirmation` albo cena jest starsza niż 7 dni (ROADMAP, DoD etapu 9).
**Zysk:** zamiast czytać 16 ostrzeżeń walidatora, widzisz jedno zestawienie „co blokuje wydanie”.

### B10. Odświeżenie cen w 2–3 sklepach na telefon
**Jak:** `web_fetch` po kartach produktowych (sferis, morele, mediaexpert, euro, komputronik,
proshop, mi store) — tam, gdzie sklep nie blokuje odczytu. Wpisuję najniższą wiarygodną cenę,
`checkedAt`, `source`, a dotychczasową cenę przenoszę do `price.otherObservations`; aktualizuję
`_meta.generatedOn` i `PRICES_CHECKED_AT` w `src/data/pool.ts`. **Ograniczenie:** Empik i Allegro
blokują automatyczny odczyt → te dwie oferty (Realme, Edge 70 Fusion) zostają po Twojej stronie (A1, A5).

---

## C. Wspólne (👤🤖) — **zatwierdzone i wykonane**

### C1. Reguły przeliczania „miękkich” danych na oceny
Zanim wpiszę liczby z B2/B3/B4, potrzebuję zatwierdzonych reguł (dziś PROJECT 7.5 definiuje tylko
wzory obiektywne). Ja przygotowuję propozycję z symulacją na obecnej puli, Ty zatwierdzasz:
1. `endurance` baterii z godzin testów (propozycja w B2),
2. `display`: czy jasność szczytowa i typ panelu wchodzą do oceny, czy tylko testy,
3. `charging`: czy brak ładowarki w pudełku obniża ocenę (dziś: nie),
4. aparat: jak liczyć ocenę, gdy istnieje tylko test wariantu Pro (dziś: −10 pkt, pewność `low`).
Każda reguła trafia do PROJECT 7.5 jako poprawka, a stałe do `lib/scoringConfig.ts`.

### C2. Kalibracja `BLEND` i progów opisu dopasowania (QUIZ-SPEC 10.1)
**Jak:** uruchamiam trzy persony na kompletnych danych i pokazuję rozstęp `S`, kolejność dla
`BLEND` = 0 / 0,25 / 0,5 / 0,75 / 1 oraz progi „bardzo dobre / dobre / przeciętne” (dziś 66 / 57).
Wybierasz wariant; zmieniam dwie stałe i testy referencyjne.

### C3. Mi Band 6 (PROJECT 14.6)
**Jak:** sprawdzam zgodność z aplikacjami na Androidzie (Mi Fit Lite / Zepp Life / Google Fit)
dla telefonów z puli i przygotowuję tekst do sekcji „Więcej szczegółów” karty. 👤 Ty potwierdzasz,
bo to Twoje urządzenie i Twoje oczekiwania (np. powiadomienia, płatności).

### C4. Aktualizacja dokumentów po zamknięciu etapu 0
Ja: `planning/ROADMAP.md` (checkboxy, „Stan danych”, status `[x]`), `planning/PROJECT.md`
(sekcja 3 — tabela modeli z cenami i statusem, sekcja 7.5 — nowe reguły), `planning/QUIZ-SPEC.md`
(9.1–9.4 liczby referencyjne), README (sekcja „Stan danych”). Ty: akceptacja diffów.

---

## Obecne ostrzeżenia walidatora — kto je zamyka

| # | Ostrzeżenie | Właściciel | Zadanie |
|---|---|---|---|
| 1 | `phones[2]` Galaxy A56 — `cameras.telephoto` | 🤖 | B8 |
| 2 | `phones[3]` Redmi — `cameras.telephoto` | 🤖 | B8 |
| 3 | `phones[3]` Redmi — `microSd` | 🤖 | B5 |
| 4 | `phones[3]` Redmi — `updatesYears` | 🤖 | B1 |
| 5 | `phones[3]` Redmi — `weightG` | 🤖 | B5 |
| 6 | `phones[3]` Redmi — `wirelessCharging` | 🤖 | B5 |
| 7 | `phones[4]` Edge 60 — `chargerInBox` | 🤖 | B6 |
| 8 | `phones[5]` Xiaomi 15T — `updatesYears` | 🤖 | B1 |
| 9 | `phones[6]` Edge 70 Fusion — `microSd` | 🤖 | B7 |
| 10 | `phones[8]` Nothing Phone (3a) — `chargerInBox` | 🤖 | B6 |
| 11–16 | `phones[9]` Realme — `chargerInBox`, `chargingW`, `ip`, `nfc`, `updatesYears`, `wirelessCharging` | 👤 → 🤖 | A1 (najpierw potwierdzenie, czy to Pro+), potem B1/B6 i uzupełnienie reszty z karty produktu |

Poza ostrzeżeniami walidatora zostają **luki w ocenach** (ich walidator nie zgłasza, bo pole ma
wartość neutralną 50): `battery` i `display` dla 15T, `battery`/`charging`/`updates`/`durability`
dla Realme, `updates` dla Redmi oraz oceny aparatu z pewnością `low` dla Redmi, Realme, 15T,
Edge 70 Fusion i Nothing (3a) → zadania B2, B3, B4 i C1.

---

## Proponowana kolejność

1. **A1** (Realme) — odblokowuje 6 ostrzeżeń i usuwa jedyny `needs_confirmation`.
2. **B1** (aktualizacje) — domyka 3 ostrzeżenia i podnosi jakość kryterium, które jest priorytetem 5 w profilu.
3. **B5 + B6 + B7 + B8** — reszta ostrzeżeń, wszystkie z oficjalnych specyfikacji, bez ryzyka.
4. **C1** (reguły) → **B2 + B3 + B4** — oceny, które dziś są neutralne albo `low`.
5. **A2 + A3 + A4 + A5** — decyzje produktowe i porządek w dokumentach.
6. **C2** (kalibracja `BLEND`) i **B9** (raport luk + strażnik wydania) — gotowość do etapu 9.
7. **B10** (odświeżenie cen) tuż przed publikacją.

## Definicja ukończenia etapu 0

- `npm run validate-data`: **0 błędów, 0 ostrzeżeń** (albo każde ostrzeżenie ma w ROADMAP jawne
  uzasadnienie „brak źródła — wartość neutralna”).
- Żaden rekord ze statusem `needs_confirmation`.
- Każda ocena inna niż neutralna 50 ma `basis` z cytatem źródła i `scoreConfidence` co najmniej `medium`,
  a każda ocena `low` ma w `basis` zdanie o tym, czego brakuje.
- Reguły z C1 i kalibracja z C2 wpisane do PROJECT 7.5 / QUIZ-SPEC 10.1 i do `lib/scoringConfig.ts`.
- Kryteria i zasady wag zatwierdzone (A2), liczby referencyjne person zaktualizowane (A3).
- Ceny sprawdzone w ciągu ostatnich 7 dni (ROADMAP, DoD etapu 9) i `_meta.generatedOn` zgodne z `checkedAt`.

## Zasady, których trzymam się przy każdym uzupełnieniu

1. Brak danych = `null`. Nigdy wartość „z pamięci” ani domyślna.
2. Każda wpisana wartość ma URL w `sources`, a `basis` cytuje źródło (nie tylko liczbę).
3. Oceny obiektywne liczę wyłącznie ze wzorów PROJECT 7.5; oceny „miękkie” tylko po zatwierdzeniu reguły (C1).
4. Po każdej zmianie: `npm run validate-data`, `npm test`, `npm run typecheck`, a przy zmianie ocen —
   diff rankingu dla trzech person i raport, co się przesunęło.
5. Zmiana danych pociąga aktualizację „Stan danych” w `planning/ROADMAP.md` (zasada pracy z ROADMAP).
6. Anonimizacja: do karty nie trafia nazwa, marka, model, chip ani nazwa sklepu — nowe pola opisowe
   (np. „50 MP Leica OIS”) są parsowane do liczb, a nazwy własne lądują na liście tokenów zakazanych.

---

## Co zostaje (przeniesione do etapu 9 — wydanie)

| Zadanie | Właściciel | Dlaczego nie blokuje etapu 0 |
|---|---|---|
| Odświeżenie cen (próg 7 dni) i `_meta.generatedOn` | 👤🤖 | DoD etapu 9; pilnuje `npm run data-gaps -- --strict` |
| NFC w Realme (`specs.nfc: null`) | 🤖 przy dostępnej karcie produktu | Jedyne ostrzeżenie walidatora; pole nie wchodzi do żadnej oceny |
| Niezależne testy aparatów Redmi, Realme, 15T | 🤖 | Oceny jawne jako `low` z regułą C1 (klasa sprzętu / wariant Pro −10 pkt) |
| Kalibracja `BLEND` i progów dopasowania (C2) | 👤🤖 | Silnik działa na `BLEND = 0,5`, niezmienniki person zielone |
| Ujednolicenie metody pomiaru wytrzymałości baterii | 👤🤖 | Reguły C1 mają przelicznik dla każdej metody, źródło w `batteryTests` |
| Mi Band 6: sen i kroki (C3) | 🤖 w etapie 6 | Trafia do „Więcej szczegółów” karty, bez wpływu na ranking |

## Wynik wykonania

- **Dane**: 10/10 rekordów `ok`, zero ocen neutralnych z braku danych, 1 ostrzeżenie walidatora.
- **Oceny przeliczone ze wzorów**: 15T `battery` 50→55, `updates` 50→71, `display` 50→80; Redmi `updates` 50→71;
  Edge 60 `durability` 90→100; Edge 70 Fusion `battery` 88→90; Nothing 3a `updates` 57→43 (3 wersje systemu,
  lata poprawek rozbieżne w źródłach); Realme `battery` 75→96, `charging` 50→87, `durability` 50→95.
- **Ranking po zmianach**: żona #1 Edge 70 Fusion 69,4 · #2 Realme 67,0 · #3 Edge 60 61,8; aparat #1 Xiaomi 15T 69,6;
  bateria #1 Edge 70 Fusion 67,3. Niezmienniki 9.1.1-9.1.4 i 9.4 zielone.
- **Nowe narzędzia**: `src/data/scoringRules.ts` (reguły C1 jako kod), `tests/score-rules.test.ts` (spójność ocen z regułami),
  `scripts/data-gaps.ts` + `npm run data-gaps [-- --strict]`, `tests/release-guard.test.ts` (strażnik wydania).
