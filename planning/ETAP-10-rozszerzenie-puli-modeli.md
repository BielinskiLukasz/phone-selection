# Etap 10 — Weryfikacja kandydatów i rozszerzenie puli modeli (10 → 15)

> **Status: ZAMKNIĘTY (16.11.2026, zrealizowany przed v1.0).** Wszystkie decyzje D1–D6 i zadania
> E10-01–E10-13 wykonane. Pula rozszerzona z 10 do **15 modeli** (`src/data/phones.json`), sufit
> pojemności baterii zmieniony na **8000 mAh** (D4), niezmiennik 9.1.4 zaktualizowany (D6).
> Walidator: 0 błędów, 1 dotychczasowe ostrzeżenie (`specs.nfc` w Realme); `data-gaps --strict`,
> `stale-prices`, `typecheck`, pełny zestaw testów Vitest (27 plików) i `npm run build` zielone.

**Cel:** zweryfikować listę 21 proponowanych smartfonów względem reguł projektu (limit **2000 zł**, nowe egzemplarze z polskiej dystrybucji, horyzont użytkowania **3–4 lata**, brak duplikatów wariantów i brak wartości „z pamięci”), ustalić docelową pulę oraz przeprowadzić spójną aktualizację danych, reguł ocen, anonimizacji, kalibracji, testów i dokumentacji.
**Zależności:** etapy 0–9 (zamknięte dane v1 dla 10 modeli, silnik rankingu, anonimizacja, walidator i strażnik wydania).
**Dokumenty:** [PROJECT.md](./PROJECT.md) (sekcje 2, 3, 5, 7.5, 8, 13), [ROADMAP.md](./ROADMAP.md) (Etap 0, Etap 9, „Stan danych”), [QUIZ-SPEC.md](./QUIZ-SPEC.md) (sekcje 2.6, 9.1–9.4, 10.1), [UI-SPEC.md](./UI-SPEC.md) (sekcje 3.3, 3.6, 4, 8), [ETAP-0-dane-telefonow-aktualizacja.md](./ETAP-0-dane-telefonow-aktualizacja.md).

## Legenda właścicieli

| Znacznik | Kto | Zakres |
|---|---|---|
| 👤 **Ty** | użytkownik | decyzje o włączeniu modeli warunkowych, ręczne potwierdzenie ofert z marketplace'ów (Allegro, Empik, Kaufland) i akceptacja rekalibracji stałych |
| 🤖 **Ja** | agent | zebranie specyfikacji i testów ze źródeł, przeliczenie ocen ze wzorów PROJECT 7.5 + C1, edycja kodu i testów, walidacja i aktualizacja dokumentacji |
| 👤🤖 **Wspólnie** | oboje | przegląd zmian we wzorach (`BATTERY_CAPACITY_SPAN_MAH`, `VALUE_FLOOR`, `BLEND`) oraz akceptacja nowych rankingów referencyjnych person |

---

## 1. Werdykt: czy powinniśmy rozszerzyć listę do wszystkich 21 modeli?

**Krótka odpowiedź: TAK — warto rozszerzyć pulę, ale selektywnie (z 10 do 13 modeli w wariancie rekomendowanym lub do 15–16 modeli po potwierdzeniu ofert warunkowych), a NIE do pełnych 21 pozycji.**

Rozszerzenie „w ciemno” o całą listę 21 modeli złamałoby twarde reguły z `PROJECT.md` i obniżyłoby jakość rekomendacji:

1. **10 z 21 modeli jest już w `src/data/phones.json`** — w tym **Xiaomi 15T** w lepszym wariancie **12/512 GB** za 1999 zł (dodanie obok niego 12/256 GB zdublowałoby ten sam telefon w top 3 persony „aparat”).
2. **3 nowe modele (vivo V70 FE, Honor 400, OnePlus Nord 5) zdecydowanie warto dodać** — to świeże roczniki (2025–2026), szeroko dostępne jako nowe w polskich elektromarketach w cenie ≤ 2000 zł, z długim wsparciem (do 2031–2032 r.) i realnie różnymi profilami (7000 mAh + 90 W; kompaktowy 6,55″ + 6 lat wsparcia + 200 MP; eks-flagowy Snapdragon 8s Gen 3 + 144 Hz w cenie ~1549–1729 zł).
3. **3 modele są warunkowe (Samsung Galaxy A37 5G, Xiaomi Redmi Note 17 Pro 5G, Xiaomi Redmi Note 14 Pro+ 5G)** — wymagają decyzji użytkownika i weryfikacji konkretnej oferty PL (A37 w dużych sieciach kosztuje 1799 zł, czyli drożej niż lepszy Galaxy A57 za 1729 zł; Redmi Note 17 Pro 8/512 GB kosztuje oficjalnie 2199 zł > limit 2000 zł, a oferty ~1659 zł pochodzą z marketplace'u Kaufland i mają baterię 8340 mAh przebijającą sufit wzoru 7000 mAh; Redmi Note 14 Pro+ 5G to wycofywany rocznik 2024/2025 zastąpiony przez obecnego Note 15 Pro 5G).
4. **5 modeli należy odrzucić (Apple iPhone 16e, Nothing Phone (2a), Honor 200, OnePlus Nord 4, Motorola Edge 50 Neo)** — łamią twardy limit 2000 zł (iPhone 16e: 2849–2999 zł w sieciach, min. ~2364 zł) albo precedens z `PROJECT.md` sekcja 3 (gdzie odrzucono Pixela 8a z 05.2024 jako starego i Galaxy A55 z 03.2024 jako wycofanego): są to modele z 2024 roku, wycofywane z elektromarketów, z krótkim pozostałym wsparciem lub zastąpione wprost przez nowsze i lepiej wycenione modele z tej samej listy.

### Podsumowanie ilościowe audytu (21 pozycji)

| Kategoria decyzji | Liczba | Modele |
|---|---|---|
| **A. Już w puli (`phones.json`)** | **10** | Galaxy A57 8/256, Pixel 10a 8/128, Galaxy A56 5G 8/256, Edge 60 12/256, Xiaomi 15T *(zostaje 12/512 zamiast 12/256)*, Edge 70 Fusion 12/256, Pixel 9a 8/128, Nothing Phone (3a) 12/256, Realme 16 Pro+ 5G 8/256, Redmi Note 15 Pro 5G 8/256 |
| **B. Rekomendowane do dodania** | **3** | **vivo V70 FE 8/256 GB**, **Honor 400 8/256 GB**, **OnePlus Nord 5 8/256 GB** |
| **C. Warunkowo (decyzja 👤)** | **3** | **Samsung Galaxy A37 5G 8/256 GB**, **Xiaomi Redmi Note 17 Pro 5G 8/512 GB**, **Xiaomi Redmi Note 14 Pro+ 5G 8/256 GB** |
| **D. Odrzucone** | **5** | **Apple iPhone 16e 128 GB**, **Nothing Phone (2a) 12/256 GB**, **Honor 200 8/256 GB**, **OnePlus Nord 4 12/256 GB**, **Motorola Edge 50 Neo 8/256 GB** |

---

## 2. Szczegółowa ocena wszystkich 21 modeli

### 2.1 Grupa A — Modele już obecne w `src/data/phones.json` (10)

| # | Model z listy | Rekord w `phones.json` | Cena bazowa PL | Decyzja | Uwagi do Etapu 10 |
|---|---|---|---|---|---|
| 1 | Samsung Galaxy A57 8/256 GB | `galaxy-a57-8-256` | 1729,00 zł (sferis.pl) | **Zostaje** | Odświeżyć cenę przy wspólnym `PRICES_CHECKED_AT` |
| 2 | Google Pixel 10a 8/128 GB | `pixel-10a-8-128` | 1899,99 zł (mediaexpert.pl) | **Zostaje** | Świadomy wyjątek 128 GB (PROJECT 3); 7 lat wsparcia |
| 3 | Samsung Galaxy A56 5G 8/256 GB | `galaxy-a56-5g-8-256` | 1718,99 zł (empik.com) | **Zostaje** | Sprawdzić aktualną cenę vs A57 (jeśli droższy od A57, nadal może zostać jako punkt odniesienia) |
| 4 | Motorola Edge 60 12/256 GB | `motorola-edge-60-12-256` | 1399,00 zł (euro.com.pl) | **Zostaje** | Jedyny model z `microSd: true` (utrzymuje aktywne pytanie C3) + IP68/IP69 + MIL-STD + tele 3x |
| 5 | Xiaomi 15T 12/256 GB | `xiaomi-15t-12-512` | 1999,00 zł (komputronik.pl) | **Zostaje 12/512 GB (nie duplikować)** | W puli jest już lepszy wariant 12/512 GB w limicie 2000 zł (`storage: 100`). Na 12/256 GB schodzimy **tylko**, gdyby 12/512 GB przebił 2000 zł przy odświeżeniu cen (wtedy zmiana `id` na `xiaomi-15t-12-256`, `variant.storageGb: 256`, `scores.storage: 75`) |
| 6 | Motorola Edge 70 Fusion 12/256 GB | `motorola-edge-70-fusion-12-256` | 1658,12 zł (Allegro X-KOM_PL) | **Zostaje** | Promocja z limitem 1 szt. ważna do 30.11.2026 — zweryfikować cenę regularną (~1799 zł) |
| 7 | Google Pixel 9a 8/128 GB | `pixel-9a-8-128` | 1749,99 zł (mediaexpert.pl) | **Zostaje** | Świadomy wyjątek 128 GB; 7 lat wsparcia |
| 8 | Nothing Phone (3a) 12/256 GB | `nothing-phone-3a-12-256` | 1779,00 zł (proshop.pl) | **Zostaje** | Przy okazji można ponownie sprawdzić oficjalną deklarację lat poprawek (6 lat) |
| 9 | realme 16 Pro+ 8/256 GB | `realme-16-pro-plus-5g-8-256` | 1959,99 zł (empik.com) | **Zostaje** | Domknąć `specs.nfc` przy dostępnej oficjalnej karcie produktu (jedyne ostrzeżenie walidatora) |
| 10 | Xiaomi Redmi Note 15 Pro 5G 256 GB | `redmi-note-15-pro-5g-8-256` | 1299,00 zł (euro.com.pl) | **Zostaje** | Najtańszy pewny model z dużą baterią (6580 mAh) w oficjalnej dystrybucji |

### 2.2 Grupa B — Nowe modele rekomendowane do dodania (3)

| # | Model (proponowane `id`) | Premiera | Cena PL (nowy, 2026) | Kluczowe dane (wariant PL/UE) | Dlaczego dodać i na co uważać |
|---|---|---|---|---|---|
| 11 | **vivo V70 FE 8/256 GB** (`vivo-v70-fe-5g-8-256`) | 03/04.2026 | **1799 zł** (RTV Euro AGD, Media Expert, x-kom, Neonet; Ceneo od ~1547–1775 zł; cena sugerowana 2099 zł) | **7000 mAh Si/C** (GSMArena >67 h → `battery ≈ 95`), **90 W** (`charging = 100`), brak Qi, 6,83″ AMOLED 1.5K 120 Hz (1900 nitów), Dimensity 7360 Turbo, 200 MP OIS + 8 MP UW / 32 MP AF selfie, brak tele, **IP68/IP69** (`durability = 95`), 200 g, NFC, brak microSD, Android 16 + OriginOS 6, poprawki do 03.2032 (AER) | **DODAJ (priorytet 1).** Świeży rocznik 2026, pełna dostępność w dużych elektromarketach ≤ 1800 zł, trafia prosto w priorytet #1 (bateria 7000 mAh + 90 W) i #5 (wsparcie do 2032). Uwaga: brak optyki ZEISS w wersji FE (tylko zwykły V70 ją ma), wideo 4K@30, potwierdzić liczbę dużych wersji Androida na `vivo.com` |
| 12 | **Honor 400 8/256 GB** (`honor-400-8-256`) | 05.2025 | **1599–1818 zł** (promocje Media Expert / RTV Euro AGD 1599 zł, Ceneo ~1818–1998 zł, premierowo 1999 zł) | **5300 mAh Si/C (UE!)**, **66 W** (`charging = 68`), brak Qi, 6,55″ AMOLED 120 Hz (5000 nitów peak), Snapdragon 7 Gen 3, 200 MP OIS + 12 MP UW / 50 MP selfie, brak tele, **IP65** (część rynków IP66 → `durability = 55/70`), 184 g, NFC, brak microSD, Android 15 + MagicOS 9, **6 wersji OS + 6 lat poprawek** w UE (`updates = 86`) | **DODAJ (priorytet 2).** Lekki i poręczny (184 g, 6,55″), 256 GB, świetny główny aparat i selfie 50 MP, 6 lat wsparcia dla serii 400 w UE. **Pułapki źródłowe:** 1) wariant europejski ma **5300 mAh** (nie 6000 mAh z rynków poza UE); 2) zweryfikować IP65 vs IP66 dla SKU PL; 3) opisać w `basis.updates` deklarację producenta 6+6 lat |
| 13 | **OnePlus Nord 5 8/256 GB** (`oneplus-nord-5-5g-8-256`) | 07.2025 | **1549–1799 zł** (Media Expert 1549–1729 zł, Media Markt 1729–1799 zł, Ceneo od ~1399–1685 zł; uwaga: RTV Euro AGD bywa 2099 zł) | **5200 mAh (UE!)**, **80 W** SuperVOOC (`charging = 87`), brak Qi, 6,83″ Swift AMOLED 1.5K **144 Hz**, **Snapdragon 8s Gen 3**, 50 MP OIS + 8 MP UW / 50 MP AF selfie, brak tele, **IP65** (`durability = 55`), brak microSD, NFC, Android 15 + OxygenOS 15, **4 wersje OS + 6 lat poprawek** (`updates = 71`) | **DODAJ (priorytet 3).** Najmocniejszy procesor obok Xiaomi 15T, ekran 144 Hz, mocne selfie 50 MP AF, 6 lat poprawek i świetna cena blisko progu 1500 zł. **Pułapka źródłowa:** wariant UE/PL ma baterię **5200 mAh** (nie 6800 mAh z Indii!) i wymaga wskazania sklepu z ceną ≤ 1800 zł (nie 2099 zł) |

### 2.3 Grupa C — Modele warunkowe (do decyzji użytkownika 👤) (3)

| # | Model (proponowane `id`) | Premiera | Cena PL (2026) | Kluczowe dane | Warunek włączenia |
|---|---|---|---|---|---|
| 14 | **Samsung Galaxy A37 5G 8/256 GB** (`galaxy-a37-5g-8-256`) | 03.2026 | **1799 zł** w RTV Euro AGD i x-kom; **1315–1595 zł** na Allegro / PriceSpy | 5000 mAh (GSMArena EU 53:00 h → endurance 43, `battery = 38`), 45 W (`charging = 40`), 6,7″ Super AMOLED 120 Hz (1246 nitów zmierzone), Exynos 1480, 50 MP OIS + 8 MP UW + 5 MP makro / 12 MP selfie, **IP68** (`durability = 90`), 196 g, brak microSD, Android 16, **6 lat wsparcia do 03.2032** (`updates = 86`) | **WARUNKOWO.** Przy cenie sklepowej **1799 zł pominąć** — jest droższy i słabszy pod każdym względem od obecnych w puli Galaxy A57 (1729 zł) i A56 (1719 zł). **Dodać wyłącznie**, jeśli 👤 potwierdzi wiarygodnego sprzedawcę PL za **≤ 1499–1550 zł** (wtedy daje świetną budżetową opcję z IP68 i 6 latami wsparcia w progu 1500 zł) |
| 15 | **Xiaomi Redmi Note 17 Pro 5G 8/512 GB** (`redmi-note-17-pro-5g-8-512`) | 08/09.2026 | **2199 zł** w oficjalnych sieciach (Avans, Electro, Media Expert, Euro) — **powyżej limitu!** Marketplace Kaufland / Ceneo od **1659 zł** (wariant 6/256 GB oficjalnie 1799 zł) | **8340 mAh Si/C (!)**, 67 W (`charging = 69`), brak Qi, 6,83″ AMOLED 1.5K 120 Hz, Snapdragon 6s Gen 4, 8/512 GB (`storage = 100`), 50 MP OIS + 8 MP UW / 16 MP selfie, brak tele, **IP68** (`durability = 90`), **223 g**, brak microSD, Android 16 + HyperOS 3 | **WARUNKOWO.** Oficjalna cena 8/512 GB (2199 zł) łamie `BUDGET_LIMIT_PLN = 2000`. **Dodać tylko**, jeśli: 1) 👤 potwierdzi polską dystrybucję i gwarancję w ofercie ≤ 2000 zł (np. 1659 zł), 2) ustalimy sufit wzoru baterii (`8340 mAh > 7000 mAh`, patrz sekcja 3.1). Wariant 6/256 GB za 1799 zł odradzamy (6 GB RAM na 3–4 lata). Brak jeszcze pełnych niezależnych testów aparatu (`scoreConfidence = low`) |
| 16 | **Xiaomi Redmi Note 14 Pro+ 5G 256 GB** (`redmi-note-14-pro-plus-5g-8-256`) | 09.2024 (PL 01.2025) | **1179–1411 zł** (Ceneo 3 sklepy, Empik 1251 zł; wycofywany u operatorów i w dużych sieciach) | 5110 mAh (UE; Notebookcheck Wi-Fi 19,5 h), **120 W** HyperCharge (nasyca `charging = 100`), 6,67″ AMOLED 1.5K 120 Hz (3000 nitów), Snapdragon 7s Gen 3, 200 MP OIS + 8 MP + 2 MP, **IP68** (`durability = 90`), 205–210 g, brak microSD, Android 14, 3+4 lata wsparcia (`updates = 50`) | **RACZEJ POMINĄĆ (opcjonalny).** Dwie generacje za Note 17 Pro i generację za obecnym w puli Redmi Note 15 Pro 5G (1299 zł, 6580 mAh, 4+6 lat wsparcia). Włączać wyłącznie, jeśli zależy nam na dodatkowym telefonie ≤ 1300 zł i ładowaniu 120 W — wymaga wtedy sprawdzenia `VALUE_FLOOR` (cena < 1200 zł) i sufitu `charging` |

### 2.4 Grupa D — Modele odrzucone (nie dodawać do `phones.json`) (5)

| # | Model | Premiera | Cena PL (2026) | Powód odrzucenia względem `PROJECT.md` |
|---|---|---|---|---|
| 17 | **Apple iPhone 16e 128 GB** | 02.2025 | **2849–2999 zł** w elektromarketach (Media Expert, x-kom, Euro, Sferis); min. rynkowe ~2364–2499 zł | **Łamie twardy limit 2000 zł o 400–1000 zł** (`validate-data` i `release-guard.test.ts` blokują publikację). Dodatkowo tylko 128 GB, ekran 60 Hz, pojedynczy aparat 48 MP bez ultraszerokiego/tele, wolne ładowanie, brak MagSafe, a użytkowniczka nie jest przywiązana do iOS (PROJECT 2) |
| 18 | **Nothing Phone (2a) 12/256 GB** | 03.2024 | **1699 zł** (1 sklep na Ceneo — Proshop; tańsze oferty Allegro ~1499 zł to sztuki **powystawowe**) | **Zbyt stary (starszy niż odrzucony Pixel 8a z 05.2024)**, śladowa dostępność nowych sztuk, krótkie pozostałe wsparcie (start z Androidem 14, poprawki do 03.2028), tylko IP54 i zaledwie 80 zł taniej od obecnego w puli następcy **Nothing Phone (3a) 12/256 GB (1779 zł)** z teleobiektywem 2x i IP64 |
| 19 | **Honor 200 8/256 GB** | 05/06.2024 | **1175–1399 zł** (pojedyncze oferty Allegro; Proshop 2699 zł; wycofany z dużych sieci) | **Wycofany z regularnej dystrybucji, rocznik 2024**, krótkie pozostałe wsparcie (start z Androidem 14, polityka 3+4 lata / AER 06.2027 — nie pokrywa 3–4 lat użytkowania do 2030 r.), brak pełnej klasy IP. Całkowicie zastąpiony przez nowszego **Honora 400** (6 lat aktualizacji, IP65) |
| 20 | **OnePlus Nord 4 12/256 GB** | 07.2024 | **1636–1799 zł** (Allegro OnePlus 1699 zł, Electro/MediaMarkt 1759 zł, Ceneo 1799 zł — słaba dostępność) | **Nieopłacalny na tle następcy:** przez końcówki magazynowe kosztuje tyle samo lub więcej niż nowszy o rok **OnePlus Nord 5 8/256 GB (1549–1729 zł)**, który oferuje szybszy Snapdragon 8s Gen 3, ekran 144 Hz, lepsze selfie 50 MP AF i wsparcie do 2031 r. (zamiast połowy 2030 r.) |
| 21 | **Motorola Edge 50 Neo 8/256 GB** | 08.2024 | **945–1549 zł** na Allegro/Kaufland/Amazon (duży rozrzut, kody dystrybucji zagranicznej np. `RO`, brak w dużych sieciach) | **Słaba bateria 4310 mAh** (`batteryCapacityScore = 10/100`, Notebookcheck Wi-Fi 13,7 h) stoi w sprzeczności z priorytetem #1 użytkowniczki; wycofana z głównych elektromarketów; w puli jest już nowsza **Motorola Edge 60 12/256 GB za 1399 zł** (RTV Euro AGD) z 5200 mAh, 12 GB RAM, IP68/IP69 + MIL-STD, tele 3x i microSD |

---

## 3. Co edytować w istniejącym projekcie (`phone-selection`)

Architektura projektu jest w większości dynamiczna (`PHONES.map`, `countPool`, `activeQuestions`, `it.each(POOL)`), ale w **6 obszarach** występują jawne założenia o puli 10 modeli, dacie `2026-11-14`, zakresach wzorów, zakazanych tokenach marek i wynikach referencyjnych person.

### 3.1 Dane i reguły ocen (`src/data/`, `src/lib/scoringConfig.ts`)

| Plik | Miejsce w pliku | Co zmienić | Dlaczego |
|---|---|---|---|
| `src/data/phones.json` | `_meta.generatedOn`, `_meta.rules`, `_meta.specsCompletedNote`, tablica `phones[]` | Dopisać zatwierdzone nowe rekordy (3 w wariancie rekomendowanym → łącznie **13**; do **15–16** w wariancie rozszerzonym) w schemacie `schemaVersion: 1`; odświeżyć `price.checkedAt` i `_meta.generatedOn` do wspólnej daty; zaktualizować opis wyjątków w `_meta.rules[2]`; wyczyścić linki z `utm_*` i `ceneo_cid` | Jedyne źródło prawdy o telefonach; każdy rekord musi mieć 13 ocen liczbowych + `value: null`, pełne `basis` ze źródłem, 13 wpisów `scoreConfidence`, `scoresEstimatedNeutral: []`, `specs.batteryEndurance` i niepustą tablicę `sources` |
| `src/data/pool.ts` | Linia 7 (`PRICES_CHECKED_AT`), linia 8 (`EXPECTED_POOL_SIZE`), linie 41–52 (`ROADMAP_STAGES`), linie 60–66 (`ENGINE_STATUS`), linia 129 (`SLIDERS_STATUS`) | Zmienić `EXPECTED_POOL_SIZE = 10` → `13` (lub docelowe `N`); zaktualizować `PRICES_CHECKED_AT` (albo pobierać z `DATA_VERSION`); dopisać etap 10 do `ROADMAP_STAGES`; w `SLIDERS_STATUS` zastąpić stałe `„Pasuje X z 10 telefonów”` interpolacją `EXPECTED_POOL_SIZE`; w `ENGINE_STATUS` zaktualizować opis wyników person i liczby kart w budżecie 1500 zł | Stopka, panel stanu i komunikaty techniczne korzystają z `EXPECTED_POOL_SIZE` i `PRICES_CHECKED_AT` |
| `src/data/strings.ts` | Linia 52 (`priceNote`), linia 124 (komunikat o dacie cen i ocen), linia 371 (`„Pasuje 8 z 10 telefonów”`) | Zastąpić zahardkodowaną datę `14.11.2026` formatowaniem z `PRICES_CHECKED_AT` / `DATA_VERSION`, a tekst w linii 371 uzależnić od `EXPECTED_POOL_SIZE` | Przy każdej kolejnej aktualizacji puli lub cen teksty UI nie rozjadą się z `phones.json` |
| `src/data/scoringRules.ts` | Linie 13–14 (`BATTERY_CAPACITY_FLOOR_MAH`, `BATTERY_CAPACITY_SPAN_MAH`), linie 53–54 (`CHARGING_FLOOR_W`, `CHARGING_SPAN_W`), linie 97–106 (`DURABILITY_RULES`, `durabilityScore`) | **Wariant rekomendowany (13 modeli):** wzory działają bez zmian (vivo V70 FE: 7000 mAh → 100, 90 W → 100, IP68/IP69 → 95; Honor 400: 5300 mAh → 43, 66 W → 68, IP65 → 55 / IP66 → 70; OnePlus Nord 5: 5200 mAh → 40, 80 W → 87, IP65 → 55, 144 Hz → bonus +5 w `displayScoreFromHardware`). **Jeśli wejdzie Redmi Note 17 Pro 5G (8340 mAh):** decyzja 👤🤖 — zostawić `clamp` na 100 (7000 i 8340 mAh mają po 100 pkt pojemności, różnicuje je `batteryEndurance`) albo podnieść `BATTERY_CAPACITY_SPAN_MAH` z `3000` na `4500` (sufit 8500 mAh) i **przeliczyć `scores.battery` wszystkim rekordom w `phones.json`**. **Jeśli wejdzie Redmi Note 14 Pro+ (120 W):** analogiczna decyzja dla `CHARGING_SPAN_W` (`75` → `105`) | Test `tests/score-rules.test.ts` wymaga zgodności `phones.json` ze wzorami z tolerancją ±1 pkt |
| `src/lib/scoringConfig.ts` | Linia 7 (`BLEND`), linia 39 (`TIE_THRESHOLD`), linia 43 (`VALUE_FLOOR = 1200`), linie 55–58 (`MATCH_LABEL_THRESHOLDS`) | Zweryfikować kalibrację na rozszerzonej puli: 1) dla puli 13 modeli wszystkie ceny są ≥ 1299 zł, więc `VALUE_FLOOR = 1200` zostaje bez zmian (gdyby wszedł Redmi Note 14 Pro+ za ~1179 zł, obniżyć `VALUE_FLOOR` do `1000`); 2) uruchomić macierz `BLEND ∈ {0, 0.25, 0.5, 0.75, 1}` i sprawdzić rozstęp oraz progi `veryGood: 66` / `good: 57` | Większa pula może zmienić `min`/`max` w normalizacji min-max i zmniejszyć odstęp między #1 a #2 (np. Edge 70 Fusion vs vivo V70 FE) |
| `src/data/questions.ts` | Linie 165–188 (`C2`, `C3`), linie 251–261 (`F1`) | Bez zmian strukturalnych: `C3` pozostaje aktywne (`motorola-edge-60-12-256` ma `microSd: true`), `C2` nadal odfiltrowuje dwa Pixele 128 GB, a progi `F1` (1500 / 1800 / 2000 zł) zyskują lepsze pokrycie w przedziale 1500–1800 zł (Honor 400, OnePlus Nord 5, vivo V70 FE, ew. Galaxy A37 w progu ≤ 1500 zł) | Zachowuje pełną kompatybilność zapisanych odpowiedzi w `localStorage` i linków `#/r/<kod>` |

### 3.2 Anonimizacja i ochrona przed wyciekiem marki (`src/lib/`)

| Plik | Miejsce w pliku | Co zmienić | Dlaczego |
|---|---|---|---|
| `src/lib/anonymize.ts` | Linie 76–83 (`panelLabel`), linie 279–282 (`GENERIC_WORDS`), linie 299–307 (`KNOWN_FORBIDDEN`), linie 340–360 (`redact`), linie 378–400 (`findLeaks`) | 1) Rozszerzyć `KNOWN_FORBIDDEN` o nazwy nakładek, technologii ładowania, GPU i sklepów nowych modeli: `'magicos'`, `'oxygenos'`, `'originos'`, `'funtouch'`, `'nothingos'`, `'helloui'`, `'supervooc'`, `'vooc'`, `'flashcharge'`, `'supercharge'`, `'turbopower'`, `'hypercharge'`, `'glyph'`, `'harcourt'`, `'auralight'`, `'aquatouch'`, `'pantone'`, `'adreno'`, `'xclipse'`, `'mali'`, `'samsung-hp5'`, `'hp5'`, `'isocell'`, `'imx'`, `'euro'`, `'oleole'`, `'neonet'`, `'avans'`, `'electro'`, `'kaufland'`, `'amazon'`, `'ceneo'`, `'simplybuy'`. *(Marki `'vivo'`, `'honor'`, `'oneplus'` oraz `'zeiss'` już są na liście!)*<br>2) Dodać `'fe'` i `'turbo'` do weryfikacji: `'fe'` (2 znaki) w `vivo V70 FE` jest pomijane przez `addTokens` (`word.length < 3`), ale `V70` trafia poprawnie jako token z cyfrą; `'nord'` (OnePlus Nord 5) trafia poprawnie jako wyraz z wielkiej litery; sprawdzić, czy `'swift'` (Swift AMOLED w Nord 5) nie wymaga dopisania do `KNOWN_FORBIDDEN` (`panelLabel` już poprawnie sprowadza `"Swift AMOLED"` do `"AMOLED"`).<br>3) Sprawdzić fałszywe alarmy `findLeaks` (używa `haystack.includes(token)`): token `'euro'` nie występuje w polskich etykietach karty, ale warto przetestować wszystkie `basis` i `specRows` na pełnej puli | Nowe marki (vivo, Honor, OnePlus) wnoszą własne nazwy nakładek i szybkiego ładowania w `basis` oraz `specs.chargingNote` / `specs.batteryType`; test E6-11 i `tests/anonymize.test.ts` nie mogą przepuścić żadnej nazwy własnej |
| `src/lib/cardSpecs.ts` | Linia 42 (`specRows(phone, labels, pool?)`) | Przekazać opcjonalnie `pool: readonly Phone[] = []` do `collectForbiddenTokens(phone, pool)` i podać `PHONES` w miejscu wywołania (`DetailsAccordion` / `CardsScreen`) | Obecnie `specRows` zbiera tokeny tylko z bieżącego rekordu — gdyby opis w `specs` wspomniał inny model z puli (np. `V70` albo `Nord 4`), nie zostałby zredagowany |
| `src/types/phone.ts` | Bez zmian wymaganych | Obecny schemat `Phone` i `Specs` w pełni pokrywa wszystkie pola nowych modeli (`batteryType: "Si/C"`, `updatesOsGenerations`, `updatesSecurityYears`, `refreshHz: 144`, `ip: "IP65"` / `"IP68/IP69"`) | Brak potrzeby podnoszenia `_meta.schemaVersion` ani `AppState.schemaVersion` |

### 3.3 Sesje, historia i kompatybilność wsteczna (`src/lib/storage.ts`, `src/screens/RankingScreen.tsx`)

- **Nie zmieniamy `id` istniejących 10 telefonów** (poza ewentualną świadomą zamianą `xiaomi-15t-12-512` → `xiaomi-15t-12-256`, której nie rekomendujemy). Dzięki temu wszystkie zapisane sesje w `localStorage` (`wybor-telefonu:v1`) zachowują poprawne odwołania w `ranking.entries`, `cards` i `picks`.
- Zmiana `_meta.generatedOn` automatycznie uaktywni istniejące ostrzeżenie na `RankingScreen` dla starszych sesji (różnica między `session.ranking.dataVersion` a `DATA_VERSION`), a nowe sesje oraz linki wznowienia `#/r/<kod>` policzą ranking już na rozszerzonej puli.

### 3.4 Skrypty utrzymaniowe (`scripts/`)

| Plik | Czy wymaga edycji kodu? | Działanie w Etapie 10 |
|---|---|---|
| `scripts/validate-data.ts` | **Nie** (iteruje dynamicznie po `phones[]`, sprawdza 14 kryteriów, `price.pln <= 2000`, format dat, URL bez śledzenia i braki w `specs`) | Uruchomić `npm run validate-data` po dodaniu każdego rekordu; cel: **0 błędów, 0 nowych ostrzeżeń** (pamiętać o formule `„brak teleobiektywu”` w `basis.zoom` dla vivo V70 FE, Honora 400, OnePlusa Nord 5, Galaxy A37 i Redmi Note 17 Pro, żeby walidator i `cameraFact` nie traktowały `telephoto: null` jako braku danych!) |
| `scripts/data-gaps.ts` | **Nie** | Uruchomić `npm run data-gaps` oraz `npm run data-gaps -- --strict` przed zamknięciem etapu |
| `scripts/stale-prices.ts` | **Nie** | Uruchomić `npm run stale-prices` (wszystkie rekordy — stare i nowe — z `checkedAt` ≤ 7 dni) |

### 3.5 Testy jednostkowe i integracyjne (`tests/`) — dokładna mapa zmian

| Plik testu | Linie wymagające aktualizacji | Co zmienić |
|---|---|---|
| `tests/phones-schema.test.ts` | Linie 11, 78–79, 127–130 | Zmienić `expect(POOL.length).toBe(10)` na `expect(POOL.length).toBe(EXPECTED_POOL_SIZE)` (13 lub docelowe `N`); zaktualizować opis testu i ewentualną listę jawnie udokumentowanych pól `null` (tak jak NFC w Realme) |
| `tests/quiz-screen.test.ts` | Linie 171, 234 | Zastąpić `/Pasuje 10 z 10 telefonów/` wyrażeniem opartym o `PHONES.length` oraz `entries.length` → `toBe(PHONES.length)` |
| `tests/persona.test.ts` | Linie 68–75, 89–91, 95–108, 134, 143 | Przeliczyć rankingi person `WIFE`, `CAMERA`, `BATTERY` na nowej puli: **vivo V70 FE** (7000 mAh, 90 W, IP68/IP69, wsparcie do 2032, 1799 zł) najprawdopodobniej wejdzie do top 3 persony „żona” i zawalczy o #1 z `motorola-edge-70-fusion-12-256` oraz `realme-16-pro-plus-5g-8-256`; zaktualizować referencję top 3 przy zachowaniu niezmienników 9.1.1–9.1.3 i 9.4. W teście 9.1.4 (budżet 1500 zł): jeśli dojdą modele ≤ 1500 zł (np. Galaxy A37, promocja Nord 5 ≤ 1500 zł, Redmi Note 14 Pro+), zaktualizować oczekiwane `inBudgetCount` (przy `inBudgetCount ≥ 3` wszystkie 3 karty będą w budżecie, a przypadek uzupełniania karty „Powyżej budżetu” przenieść na kontrolowaną podpulę w `tests/scoring.test.ts`) |
| `tests/calibration.test.ts` | Linie 38–39, 43–54, 57–64, 68–71, 96–101 | Ponownie uruchomić pomiar E9-03 dla `BLEND ∈ {0, 0.25, 0.5, 0.75, 1}`: sprawdzić rozstęp wyników, zwycięzcę persony `BATTERY` (vivo V70 FE lub ew. Redmi Note 17 Pro vs Edge 70 Fusion), zwycięzcę `CAMERA` (Xiaomi 15T) oraz odstęp #1–#2 względem `TIE_THRESHOLD = 2` (jeśli Edge 70 Fusion i vivo V70 FE dadzą prawdziwy praktyczny remis < 2 pkt, test powinien to jawnie odzwierciedlać zamiast traktować jako błąd!) |
| `tests/scoring.test.ts` | Linie 80–86, 206, 215–220 | Dopisać asercje ocen obiektywnych dla nowych modeli; sprawdzić listę `requireMicroSd: true` (wciąż `['motorola-edge-60-12-256']`, bo żaden z nowych kandydatów nie ma slotu microSD); zaktualizować listę modeli spełniających `inBudget(phone, 1500)` |
| `tests/sliderModel.test.ts` | Linie 181–182, 271 | Przy maksymalizacji grupy `battery` (obejmuje `battery` + `charging`) **vivo V70 FE** (7000 mAh + 90 W → `charging: 100`) może wyprzedzić `realme-16-pro-plus-5g-8-256` (7000 mAh + 80 W → `charging: 87`) — zaktualizować oczekiwane `cards[0]` i `cards[1]`; w linii 271 użyć `DATA_VERSION` zamiast stałego `'2026-11-14'` |
| `tests/sliders-screen.test.ts` | Linia 130 | Zaktualizować oczekiwane `session.ranking.cards[0]` analogicznie do `tests/sliderModel.test.ts` |
| `tests/anonymize.test.ts` | Dopisanie przypadków | Dodać testy tokenów i braku wycieku dla nowych marek i nakładek (`vivo`/`originos`, `honor`/`magicos`/`supercharge`, `oneplus`/`nord`/`oxygenos`/`supervooc`), `durabilityFact` dla `IP65`, `displayPerformanceFact` dla `144 Hz` i `cameraFact` dla 200 MP bez teleobiektywu |
| `tests/score-rules.test.ts` | Automatyczny `it.each(POOL)` + nowe testy jednostkowe | Wszystkie nowe rekordy automatycznie przejdą kontrolę spójności wzorów; dopisać testy dla `chargingScore(90, false) === 100`, `durabilityScore('IP65') === 55` i `displayScoreFromHardware(..., 144)` |
| Testy zależne od daty `2026-11-14` | `tests/ranking-screen.test.ts:78`, `tests/history-screen.test.ts:124`, `tests/history-transfer.test.ts:201,252`, `tests/sessionReducer.test.ts:69`, `tests/cards-screen.test.ts:375`, `tests/data.ts:5` | Po odświeżeniu `_meta.generatedOn` i `PRICES_CHECKED_AT` przepiąć asercje na import `DATA_VERSION` / `PRICES_CHECKED_AT` (w `history-screen.test.ts` zachować stałą datę tylko tam, gdzie test celowo buduje historyczną sesję z fikstury) |
| Testy bez zmian (regresja) | `tests/release-guard.test.ts`, `tests/cards-screen.test.ts` (E6-11 wyciek DOM), `tests/a11y-audit.test.ts`, `tests/edge-states.test.ts` | Uruchomić w całości i potwierdzić 0 błędów (w tym axe-core na `RankingScreen` z 13–16 wierszami i pełny skan DOM kart) |

### 3.6 Dokumentacja (`planning/`, `README.md`)

| Plik | Co zaktualizować |
|---|---|
| `planning/PROJECT.md` | Sekcja 3 (nowa tabela modeli z cenami, datą sprawdzenia, statusem oraz zwięzłą listą odrzuconych kandydatów z Etapu 10 i powodami — tak jak wcześniej dla Pixela 8a i Galaxy A55); sekcja 5 (diagram: `10 telefonów` → `N telefonów`); sekcja 7.5 (ewentualna korekta wzorów baterii/`VALUE_FLOOR`, jeśli wejdą modele warunkowe) |
| `planning/ROADMAP.md` | Tabela etapów (dodanie Etapu 10), sekcja „Stan danych” (nowe wiersze modeli i odświeżone ceny), opis Etapu 10 z wynikiem walidatora i nowymi liczbami referencyjnymi |
| `planning/QUIZ-SPEC.md` | Sekcja 2.6 (potwierdzenie kalibracji `BLEND` i `VALUE_FLOOR` na większej puli), sekcje 9.1–9.4 (nowe wyniki referencyjne person „żona”, „aparat”, „bateria” i testu różnicującego) |
| `planning/UI-SPEC.md` | Sekcja 3.3 i 8 (przykłady licznika `„Pasuje X z N telefonów”` — kosmetycznie) |
| `README.md` | Opis `src/data/phones.json` (liczba modeli i data cen), liczba testów po dopisaniu przypadków dla nowych marek, wzmianka o Etapie 10 |

---

## 4. Zakres

- **W zakresie (wariant rekomendowany — 13 modeli):**
  - zachowanie obecnych 10 modeli (w tym Xiaomi 15T w wariancie 12/512 GB) i wspólne odświeżenie cen/linków,
  - dodanie **vivo V70 FE 8/256 GB**, **Honor 400 8/256 GB** oraz **OnePlus Nord 5 8/256 GB** z pełną specyfikacją ze źródeł, testami baterii/aparatu, ocenami, `basis` i `scoreConfidence`,
  - rozszerzenie listy tokenów zakazanych w `anonymize.ts` i poprawka przekazywania `pool` w `cardSpecs.ts`,
  - uniezależnienie `strings.ts`, `pool.ts` i testów od zahardkodowanej liczby `10` i daty `14.11.2026`,
  - ponowna kalibracja i aktualizacja testów person oraz dokumentacji.
- **Opcjonalnie w zakresie (wariant rozszerzony — do 15–16 modeli, po decyzji 👤 w E10-01):**
  - **Samsung Galaxy A37 5G 8/256 GB** (pod warunkiem potwierdzonej oferty PL ≤ 1550 zł),
  - **Xiaomi Redmi Note 17 Pro 5G 8/512 GB** (pod warunkiem potwierdzonej polskiej dystrybucji ≤ 2000 zł i decyzji o suficie wzoru baterii dla 8340 mAh),
  - **Xiaomi Redmi Note 14 Pro+ 5G 8/256 GB** (pod warunkiem chęci włączenia starszego modelu ≤ 1300 zł i korekty `VALUE_FLOOR`).
- **Poza zakresem:**
  - dodawanie modeli odrzuconych (**Apple iPhone 16e 128 GB**, **Nothing Phone (2a) 12/256 GB**, **Honor 200 8/256 GB**, **OnePlus Nord 4 12/256 GB**, **Motorola Edge 50 Neo 8/256 GB**),
  - duplikowanie wariantu **Xiaomi 15T 12/256 GB** obok istniejącego `xiaomi-15t-12-512`,
  - podnoszenie limitu budżetu powyżej 2000 zł, dodawanie nowych kryteriów rankingu lub zmiana struktury quizu.

---

## 5. Zadania

| ID | Kto | Zadanie | Główne pliki | Wynik |
|---|---|---|---|---|
| E10-01 | 👤 | Zatwierdzić docelową listę nowych modeli: wariant rekomendowany (+3: vivo V70 FE, Honor 400, OnePlus Nord 5) oraz decyzja dla 3 warunkowych (Galaxy A37, Redmi Note 17 Pro, Redmi Note 14 Pro+) | `planning/PROJECT.md` | zamrożona lista Etapu 10 |
| E10-02 | 👤🤖 | Zebrać i potwierdzić ceny PL (≤ 2000 zł, nowe, polska dystrybucja, po 2–3 odczyty na model) i odświeżyć ceny dotychczasowej dziesiątki (w tym promocję Edge 70 Fusion) | `src/data/phones.json` | świeże ceny z jedną datą `checkedAt` |
| E10-03 | 🤖 | Zebrać oficjalne specyfikacje wariantów **europejskich/polskich** nowych modeli (bateria UE: 5300 mAh w Honor 400, 5200 mAh w Nord 5, 7000 mAh w vivo V70 FE; IP, waga, microSD, NFC, zawartość pudełka, aparaty, polityka aktualizacji) | `src/data/phones.json` | kompletne `specs` i `sources` (brak danych = `null`) |
| E10-04 | 🤖 | Zebrać niezależne testy czasu pracy baterii (GSMArena / PCMark / Notebookcheck) i aparatów (DXOMARK / GSMArena / PhoneArena / polskie redakcje) dla każdego nowego modelu | `src/data/phones.json` | udokumentowane `batteryEndurance`, `batteryTests` i dowody dla aparatów |
| E10-05 | 👤🤖 | *(Tylko jeśli wejdzie Redmi Note 17 Pro 8340 mAh lub Note 14 Pro+ <1200 zł / 120 W)* Rozstrzygnąć korektę `BATTERY_CAPACITY_SPAN_MAH`, `CHARGING_SPAN_W` i `VALUE_FLOOR`; w razie zmiany przeliczyć oceny całej puli | `src/data/scoringRules.ts`, `src/lib/scoringConfig.ts`, `src/data/phones.json` | spójne wzory obiektywne |
| E10-06 | 🤖 | Wyliczyć wszystkie 13 ocen (`scores`), opisać `basis` (w tym jawne `„brak teleobiektywu”` tam, gdzie `telephoto: null`) i przypisać `scoreConfidence` | `src/data/phones.json` | kompletne rekordy zgodne z PROJECT 7.5 + C1 |
| E10-07 | 🤖 | Rozszerzyć `KNOWN_FORBIDDEN` w `anonymize.ts` (nakładki, technologie ładowania, GPU, sklepy) oraz przekazać `pool` do `collectForbiddenTokens` w `cardSpecs.ts` | `src/lib/anonymize.ts`, `src/lib/cardSpecs.ts`, `src/components/DetailsAccordion.tsx` | zero wycieków nazw dla nowych marek |
| E10-08 | 🤖 | Zaktualizować `EXPECTED_POOL_SIZE`, `PRICES_CHECKED_AT`, `ROADMAP_STAGES` i usunąć zahardkodowane `10` oraz `14.11.2026` z tekstów UI | `src/data/pool.ts`, `src/data/strings.ts` | dynamiczny licznik puli i daty danych |
| E10-09 | 🤖 | Uruchomić `npm run validate-data`, `npm run data-gaps -- --strict` i `npm run stale-prices`; usunąć ewentualne błędy i nieudokumentowane ostrzeżenia | `src/data/phones.json` | 0 błędów walidatora, świeże ceny |
| E10-10 | 👤🤖 | Przeprowadzić symulację person (`WIFE`, `CAMERA`, `BATTERY`, `skipAll`) i kalibracji `BLEND` na rozszerzonej puli; przedstawić diff rankingu względem puli 10 modeli | `src/lib/scoringConfig.ts`, `planning/QUIZ-SPEC.md` | zatwierdzone parametry i nowa referencja 9.1–9.4 |
| E10-11 | 🤖 | Zaktualizować testy wielkości puli, daty danych, person, kalibracji, suwaków i dopisać testy anonimizacji nowych marek | `tests/phones-schema.test.ts`, `tests/quiz-screen.test.ts`, `tests/persona.test.ts`, `tests/calibration.test.ts`, `tests/scoring.test.ts`, `tests/sliderModel.test.ts`, `tests/sliders-screen.test.ts`, `tests/anonymize.test.ts`, `tests/score-rules.test.ts`, `tests/ranking-screen.test.ts`, `tests/history-transfer.test.ts`, `tests/sessionReducer.test.ts`, `tests/cards-screen.test.ts` | 100% zielonych testów, bez kruchych stałych |
| E10-12 | 🤖 | Zaktualizować dokumentację projektową i README | `planning/PROJECT.md`, `planning/ROADMAP.md`, `planning/QUIZ-SPEC.md`, `planning/UI-SPEC.md`, `README.md` | spójne dokumenty i „Stan danych” |
| E10-13 | 🤖 | Wykonać pełny przebieg wydaniowy `npm run release` (`typecheck` → `test` → `validate-data` → `stale-prices` → `build`) i test dymny w obu motywach | `dist/` | gotowa paczka do wdrożenia na GitHub Pages |

---

## 6. Testy akceptacyjne

1. **Gdy** uruchomię `npm run validate-data` i `npm run stale-prices`, **to** wszystkie rekordy (13 w wariancie rekomendowanym lub `N` w rozszerzonym) przechodzą z 0 błędów, mają `price.pln <= 2000`, linki `https://` bez parametrów śledzących i `checkedAt` ≤ 7 dni.
2. **Gdy** uruchomię `tests/score-rules.test.ts`, **to** oceny `battery`, `charging`, `updates`, `storage` i `durability` każdego nowego i starego modelu zgadzają się ze wzorami z tolerancją ±1 pkt, a dla Honor 400 i OnePlus Nord 5 użyto europejskich pojemności baterii (5300 i 5200 mAh).
3. **Gdy** wygeneruję anonimowe karty i rozwinę „Więcej szczegółów” dla każdego telefonu z nowej puli, **to** `findLeaks` oraz test DOM E6-11 zwracają pustą listę (brak marek `vivo`/`Honor`/`OnePlus`, nazw serii `Nord`/`V70`, nakładek `MagicOS`/`OxygenOS`/`OriginOS`, technologii `SuperVOOC`/`FlashCharge`/`SuperCharge`, nazw chipów i sklepów).
4. **Gdy** otworzę ekran quizu lub suwaków bez aktywnych filtrów, **to** licznik w `aria-live` pokazuje `„Pasuje N z N telefonów”` (zgodne z `PHONES.length`), a po wyborze zwycięzcy i przejściu do `#/s/:id/ranking` widzę wszystkie `N` modeli z nazwami.
5. **Gdy** otworzę ukończoną sesję zapisaną przed Etapem 10 (z 10 telefonami w snapshocie), **to** podgląd kart i pełnego rankingu działa bez błędów, zachowuje dawne wybory i wyświetla komunikat o starszej wersji danych.
6. **Gdy** uruchomię testy person (`tests/persona.test.ts`) i kalibracji (`tests/calibration.test.ts`), **to** niezmienniki 9.1.1 (brak 128 GB w top 3 persony „żona”), 9.1.2 (średnia `battery` top 3 ≥ średniej puli), 9.1.3 (filtr 256 GB nie zmienia #1) i 9.4 (rozróżnialność person „bateria” i „aparat”) są spełnione.
7. **Gdy** uruchomię `tests/a11y-audit.test.ts` i `npm run release`, **to** audyt axe-core w obu motywach kończy się z 0 błędów poważnych/krytycznych, a produkcyjny `dist/index.html` buduje się czysto.

---

## 7. Ryzyka i otwarte pytania

1. **Różnice regionalne specyfikacji (UE vs Azja/Indie):** Honor 400 (5300 mAh w UE vs 6000 mAh poza UE), OnePlus Nord 5 (5200 mAh w UE vs 6800 mAh w Indiach) i Redmi Note 14 Pro+ (5110 mAh w UE vs 6200 mAh w Chinach). Kopiowanie testów czasu pracy z indyjskich redakcji zawyżyłoby `batteryEndurance` — bierzemy wyłącznie testy wariantu europejskiego/globalnego o tej samej pojemności.
2. **Rozbieżności w deklaracjach wsparcia:** dla Honora 400 producent deklaruje w UE 6 wersji Androida + 6 lat poprawek (do 2031 r.), natomiast katalog Android Enterprise Recommended wskazuje krótszą datę minimalną (06.2028); dla vivo V70 FE AER podaje poprawki do 03.2032 — trzeba potwierdzić oficjalną liczbę dużych wersji systemu na polskiej/europejskiej stronie producenta i opisać źródło w `basis.updates`.
3. **Praktyczny remis na szczycie rankingu:** vivo V70 FE (7000 mAh, 90 W, IP68/IP69, 1799 zł) i Motorola Edge 70 Fusion (7000 mAh, 68 W, IP68/IP69, 1658–1799 zł) mają bardzo zbliżony profil dla persony „żona” — różnica wyniku `S` może spaść poniżej `TIE_THRESHOLD = 2`. To pożądane zachowanie produktu (karta pokaże etykietę „Praktyczny remis z #1”), ale wymaga świadomej aktualizacji asercji w `tests/calibration.test.ts:100`.
4. **Sufit pojemności baterii (7000 mAh):** w razie włączenia Redmi Note 17 Pro 5G (8340 mAh) pozostawienie sufitu 7000 mAh ukrywa przewagę +1340 mAh w składowej pojemności, z kolei podniesienie sufitu do 8500 mAh obniży surowe oceny `battery` pozostałych modeli o ~3–10 pkt (np. 5000 mAh spadnie z 33 do 22 pkt pojemności) i wpłynie na progi `MATCH_LABEL_THRESHOLDS`.
5. **Oferty marketplace'owe:** najniższe ceny Redmi Note 17 Pro 8/512 GB (~1659 zł na Kauflandzie vs 2199 zł w sieciach) i Galaxy A37 8/256 GB (~1315–1595 zł na Allegro vs 1799 zł w sieciach) mogą pochodzić z dystrybucji pozaoficjalnej lub z fakturą VAT-marża — wymagają weryfikacji sprzedawcy przed wpisaniem do `phones.json`.

## 8. Definicja ukończenia (DoD)

- Zatwierdzona rozszerzona pula w `src/data/phones.json` (13 modeli w wariancie rekomendowanym lub uzgodnione `N` ≤ 16), wszystkie ze statusem `ok`, ceną ≤ 2000 zł sprawdzoną w ciągu ostatnich 7 dni i zerem wartości „z pamięci”.
- `npm run validate-data`: 0 błędów (każde ewentualne ostrzeżenie o polu `null` jawnie udokumentowane w `ROADMAP.md`).
- `npm run data-gaps -- --strict` i `npm run stale-prices`: kod wyjścia `0`.
- Zero wycieków marek, modeli, chipów, nakładek i sklepów w `tests/anonymize.test.ts` i teście DOM E6-11.
- Kalibracja i niezmienniki person zaktualizowane i zielone; `npm run release` przechodzi w całości bez błędów.
- Zaktualizowane pliki `planning/PROJECT.md`, `planning/ROADMAP.md`, `planning/QUIZ-SPEC.md` oraz `README.md`.

---

## 9. Zatwierdzone decyzje użytkownika (D1–D6) i wynik wdrożenia

| ID | Decyzja | Rozstrzygnięcie | Wdrożenie |
|---|---|---|---|
| **D1** | **vivo V70 FE 5G 8/256 GB** | **Dodajemy** | Dodany rekord `vivo-v70-fe-5g-8-256` (1799 zł w Euro/Media Expert/Neonet, 7000 mAh PL, 90 W, IP68/IP69, 5+6 lat wsparcia, GSMArena 67:21 h → `battery = 83`, `charging = 100`) |
| **D2** | **Xiaomi Redmi Note 17 Pro 5G 8/512 GB** | **Dodajemy** | Dodany rekord `redmi-note-17-pro-5g-8-512` (1799 zł promo Media Expert do 19.11.2026; odczyty Ceneo 1579 / 1779 zł, 8340 mAh, 67 W, 512 GB, IP68, wideo 1080p30 bez 4K, GSMArena 72:01 h → `battery = 100`) |
| **D3** | **Xiaomi 15T** — wariant pamięci | **Zostaje 12/512 GB** | Zachowano `xiaomi-15t-12-512` (1999 zł, `storage = 100`) bez duplikowania 12/256 GB |
| **D4** | Sufit pojemności we wzorze `batteryCapacityScore` | **8000 mAh** | Zmieniono `BATTERY_CAPACITY_SPAN_MAH` z `3000` na `4000` w `src/data/scoringRules.ts` (4000 mAh = 0, 8000 mAh = 100; 7000 mAh = 75, 8340 mAh = 100) i przeliczono `scores.battery` wszystkich 15 rekordów |
| **D5** | Moment wdrożenia | **Przed v1.0** | Zrealizowano w jednym przebiegu danych (`_meta.generatedOn = "2026-11-16"`, `EXPECTED_POOL_SIZE = 15`); wszystkie ceny mają wiek 0–2 dni (próg wydania: 7 dni) |
| **D6** | Nowe brzmienie niezmiennika **9.1.4** (budżet 1500 zł) | **Zatwierdzone** | Po dodaniu `galaxy-a37-5g-8-256` (1359 zł sferis.pl; drugi odczyt 1299 zł) i `honor-400-8-256` (1599 zł komputronik.pl; w promocjach bywa 1499 zł) w budżecie ≤ 1500 zł są 3 modele (Edge 60, Redmi Note 15 Pro 5G, Galaxy A37 5G) — wszystkie 3 karty mieszczą się w budżecie; uzupełnianie „Powyżej budżetu” nadal przetestowane dla puli < 3 w budżecie |

### Podsumowanie dodanych 5 modeli (pula 10 → 15)

1. `honor-400-8-256` — **Honor 400 5G 8/256 GB** (1599 zł, 5300 mAh UE, 66 W, IP65, 6+6 lat, 200 MP OIS + selfie 50 MP; GSMArena 56:28 h, PhoneArena Photo 142)
2. `oneplus-nord-5-5g-8-256` — **OnePlus Nord 5 5G 8/256 GB** (1600,99 zł, 5200 mAh UE, 80 W, IP65, 4+6 lat, Snapdragon 8s Gen 3, 144 Hz, 4K60; GSMArena 49:12 h)
3. `galaxy-a37-5g-8-256` — **Samsung Galaxy A37 5G 8/256 GB** (1359 zł, drugi odczyt 1299 zł, 5000 mAh, 45 W, IP68, 6+6 lat do 03.2032, Exynos 1480; GSMArena 53:00 h)
4. `vivo-v70-fe-5g-8-256` — **vivo V70 FE 5G 8/256 GB** (1799 zł, 7000 mAh PL, 90 W, IP68/IP69, 5+6 lat do 03.2032, 200 MP OIS; GSMArena 67:21 h)
5. `redmi-note-17-pro-5g-8-512` — **Xiaomi Redmi Note 17 Pro 5G 8/512 GB** (1799 zł promo Media Expert / Ceneo od 1579 zł, 8340 mAh, 67 W, IP68, 4+6 lat, 512 GB, wideo 1080p30; GSMArena 72:01 h)

### Diff rankingu person (`BLEND = 0,5`)

- **Persona „żona” (9.1):** `#1 vivo V70 FE (67 pkt)` · `#2 Motorola Edge 70 Fusion (67 pkt, praktyczny remis z #1)` · `#3 Xiaomi Redmi Note 17 Pro 5G (65 pkt)` · `#4 Realme 16 Pro+ (65 pkt)` · `#5 Motorola Edge 60 (63 pkt)` · `#6 Xiaomi 15T (63 pkt)`.
- **Persona „żona”, budżet 1500 zł (9.1.4, D6):** 3/3 karty w budżecie: `#1 Motorola Edge 60 (59 pkt, 1399 zł)` · `#2 Redmi Note 15 Pro 5G (56 pkt, 1299 zł)` · `#3 Samsung Galaxy A37 5G (51 pkt, 1359 zł)`.
- **Persona „aparat” (9.2):** `#1 Xiaomi 15T (71 pkt)` · `#2 Motorola Edge 60 (67 pkt)` · `#3 OnePlus Nord 5 (67 pkt)`.
- **Persona „bateria” (9.3):** `#1 Xiaomi Redmi Note 17 Pro 5G (65 pkt, battery = 100)` · `#2 Redmi Note 15 Pro 5G (63 pkt)` · `#3 Motorola Edge 70 Fusion (63 pkt)`.
- **Test różnicujący (9.4):** średnia `battery` **78,3 vs 43,0** (+35,3 pkt); średnia `photoDay` **78,7 vs 69,3** (+9,4 pkt).
