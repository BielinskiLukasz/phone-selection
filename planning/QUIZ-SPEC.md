# QUIZ-SPEC — pytania, wagi i algorytm rankingu

Dokument jest **źródłem prawdy** dla treści quizu i obliczania rankingu. Jeśli `PROJECT.md` mówi coś innego, obowiązuje ten plik. Realizują go etapy 2 (silnik), 4 (quiz) i 5 (suwaki i hybryda).

Wartości liczbowe w tym dokumencie zostały sprawdzone symulacją na danych z `phones.json` (stan z 14.11.2026). Parametry oznaczone jako „do kalibracji” mają być stałymi w jednym miejscu kodu (`lib/scoringConfig.ts`).

---

## 1. Zasady pisania pytań

1. **Pytamy o sytuacje, nie o „ważność”.** „Jak często robisz zdjęcia dziecka w ruchu?” zamiast „Jak ważny jest autofokus?”. Na pytania o ważność każdy odpowiada „bardzo”.
2. **Język bez żargonu.** Zero „mAh”, „OIS”, „IP68” w pytaniach. Techniczne słowa tylko w polu „Dlaczego pytamy?” albo w szczegółach telefonu.
3. **Trzy do czterech odpowiedzi** na pytanie, każda krótka, plus zawsze **„Nie wiem / pomiń”** (nie wnosi nic do wag).
4. **Jedno pytanie na ekran**, z paskiem postępu i tekstem „Dlaczego pytamy?” (jedno zdanie, rozwijane).
5. Odpowiedzi nie ujawniają telefonów. Żadnych nazw marek ani modeli w treści quizu.

## 2. Model obliczeń

### 2.1 Kryteria i grupy

14 kryteriów (jak w `PROJECT.md`, sekcja 7.1) w **6 grupach**:

| Grupa (`groupId`) | Nazwa w interfejsie | Kryteria |
|---|---|---|
| `battery` | Bateria i ładowanie | `battery`, `charging` |
| `camera` | Aparat | `photoDay`, `photoIndoor`, `photoMotion`, `selfie`, `video`, `zoom` |
| `storage` | Pamięć | `storage` |
| `longevity` | Aktualizacje i trwałość | `updates`, `durability` |
| `smooth` | Ekran i płynność | `display`, `smoothness` |
| `price` | Cena | `value` |

### 2.2 Dwa poziomy wag (zmiana względem wcześniejszej wersji)

Symulacja pokazała, że płaskie wagi na 14 kryteriach są błędne: grupa „Aparat” ma sześć kryteriów, więc przy równych wagach zdominowałaby wynik, nawet gdy użytkowniczka najbardziej ceni baterię. Dlatego wagi liczymy w dwóch poziomach:

1. **Waga kryterium wewnątrz grupy** (`w_c`, skala 0-5): **maksimum** wartości z odpowiedzi na pytania dotyczące tego kryterium (każda odpowiedź to niezależny powód, żeby cenić kryterium; „Pomiń” nic nie wnosi; dotyczy `battery` ← A1, A2 i `display` ← E1, E2; do 18.11.2026 była średnia — przełącznik `MULTI_ANSWER_AGGREGATION`); bez odpowiedzi domyślnie **2**. Waga mówi, **jak bardzo** kryterium liczy się *w swojej grupie*; z wag liczymy udziały `share_c = w_c / Σ w_c` w grupie (przy samych zerach udziały równe).
2. **Ważność grupy** (`G_g`):
   - grupy wybrane w kroku „trzy najważniejsze rzeczy”: pasmo z miejsca — 1. miejsce **5**, 2. miejsce **4**,
     3. miejsce **3** — skorygowane siłą odpowiedzi: `G_g = pasmo + 0,3 × (wyliczone − 1,3)`, maksymalnie ±0,6
     (pierwsze miejsce nasyca się na 5, bo to sufit skali). Kolejność świadomego wyboru jest dzięki temu
     zachowana zawsze, a odpowiedzi nie są odrzucane: pasma 4,4-5 / 3,4-4,6 / 2,4-3,6 nie nakładają się.
     Wariant czysto addytywny (`G_g = wyliczone + 1,5 / 1,0 / 0,5`) jest zaimplementowany jako
     `TOP_THREE_MODE = additive` w `lib/scoringConfig.ts`, ale **nie jest domyślny**: pozwala arytmetyce
     odpowiedzi odwrócić świadomy wybór, bo grupa z sześcioma pytaniami (Aparat) zbiera więcej „dowodów”
     niż grupa z dwoma (Bateria) — u persony „żona” oddałoby to pierwszeństwo aparatowi zamiast baterii
     (PROJECT 2, sekcja 2: „Dobra bateria ma pierwszeństwo przed najlepszym aparatem”);
   - pozostałe grupy: `0,5 + 0,4 × średnia wag odpowiedzianych kryteriów grupy` (bez odpowiedzi: średnia = 2, czyli 1,3). Zakres 0,5 do 2,5. Wyjątek: gdy odpowiedziano na **wszystkie** kryteria grupy i średnia wynosi 0, ważność grupy to 0 (grupa ignorowana); częściowe zera grupy nie zerują (np. tylko B4/B5/B6 „zero” → 0,5).
   - grupa `price`: jeśli nie jest w trójce, wartość z pytania o budżet (F1) przechodzi przez ten sam wzór.

### 2.3 Normalizacja ocen telefonów

Oceny 0-100 z `phones.json` są ściśnięte (np. aparat 60-85, bateria 48-88), więc surowe wagi niewiele zmieniają ranking. Przed liczeniem **normalizujemy każde kryterium** na puli kandydatów metodą min-max i mieszamy z oceną surową:

```
n_c   = 100 × (s_c − min_c) / (max_c − min_c)        // 50, gdy max = min
s'_c  = BLEND × n_c + (1 − BLEND) × s_c               // BLEND = 0,5 (do kalibracji)
```

### 2.4 Wynik telefonu

```
GroupScore_g = Σ_c ( share_c × s'_c )                 // c należy do grupy g
S            = Σ_g ( G_g × GroupScore_g ) / Σ_g G_g   // 0-100
```

`value` liczymy przed normalizacją: `100 × (1 − (cena − 1200) / (budżet − 1200))`, obcięte do 0-100 (budżet z odpowiedzi F1; domyślnie 2000).

### 2.5 Pula kandydatów i filtry

- **Pula:** telefony z ceną ≤ 2000 zł (twardy limit strony) spełniające filtry pamięci (C2). Normalizacja z 2.3 dotyczy tej puli.
- **Karty:** trzy najlepsze z puli, których cena mieści się w budżecie z F1.
- **Za mało telefonów w budżecie:** gdy w budżecie są mniej niż trzy telefony, brakujące miejsca uzupełniamy **najlepiej dopasowanymi z puli powyżej budżetu**, z etykietą „Powyżej budżetu o X zł”. Przykład: budżet 1500 zł daje dwa telefony w budżecie i jeden dodany powyżej.
- **Remis:** telefony różniące się o mniej niż 2 punkty to „praktyczny remis”; interfejs pokazuje to na karcie. Kolejność przy remisie: niższa cena, potem wyższa ocena `battery`.

### 2.6 Parametry do kalibracji

| Parametr | Wartość | Uwagi |
|---|---|---|
| `BLEND` | 0,5 | 0 = surowe oceny, 1 = pełna normalizacja. **Potwierdzone pomiarem (E9-03)** — patrz poniżej |
| Ważność grup w trójce | pasma 5 / 4 / 3 | `TOP_THREE_IMPORTANCE` |
| Korekta pasma z odpowiedzi | `0,3 × (wyliczone − 1,3)`, max ±0,6 | `TOP_THREE_EVIDENCE_FACTOR`, `TOP_THREE_EVIDENCE_MAX` |
| Wariant alternatywny G1 | `additive`: `wyliczone + 1,5 / 1,0 / 0,5` | `TOP_THREE_MODE` (domyślnie `band`) |
| Ważność grupy poza trójką | `0,5 + 0,4 × średnia` | |
| Domyślna waga kryterium | 2 | |
| Agregacja wielu odpowiedzi o to samo kryterium | `max` | `MULTI_ANSWER_AGGREGATION` (`'max'` / `'mean'`); dotyczy `battery` (A1, A2) i `display` (E1, E2) |
| Próg „praktycznego remisu” | 2 pkt | |

**Wynik kalibracji po rozszerzeniu puli do 15 modeli i skali baterii 4000–8000 mAh (E9-03 + Etap 10, D4):**

| BLEND | rozstęp S (persony) | 9.1.3 (lider zostaje w trójce + priorytet baterii przy filtrze 256 GB) | persona „bateria” #1 (8340 mAh) | persona „żona” #1 |
|---|---|---|---|---|
| 0 | 17–21 pkt | ✅ | Redmi Note 15 Pro ❌ | Redmi Note 17 Pro (brak 4K) |
| 0,25 | 18,5–22 pkt | ✅ | Redmi Note 17 Pro ✅ | Redmi Note 17 Pro (brak 4K) |
| **0,5** | **19,7–24,1 pkt** | **✅ (vivo zostaje w top 3 i #1 wśród 256 GB; #1 nadal max bateria)** | **Redmi Note 17 Pro ✅** | **vivo V70 FE ≈ Edge 70 Fusion ✅** |
| 0,75 | 21,6–26 pkt | ❌ (lider wypada z top 3, wygrywa Xiaomi 15T ze słabszą baterią) | Redmi Note 17 Pro ✅ | Edge 70 Fusion |
| 1 | 23,6–28 pkt | ❌ (lider wypada z top 3, wygrywa Xiaomi 15T) | Redmi Note 17 Pro ✅ | Edge 70 Fusion |

`BLEND = 0,5` zostaje: równoważy mocną baterię i dobry aparat u persony „żona” (67 / 67 / 65 —
praktyczny remis vivo V70 FE i Edge 70 Fusion przed Redmi Note 17 Pro 5G), daje zwycięstwo ogniwu
8340 mAh u persony „bateria” i nie pozwala filtrowi 256 GB zepchnąć priorytetu baterii na dalszy plan
(co dzieje się przy 0,75 i 1). Pomiary zamyka `tests/calibration.test.ts`.

Procent dopasowania na karcie to `round(S)` z opisem słownym („bardzo dobre / dobre / przeciętne”),
a przeskalowanie względem najlepszego w puli jest w szczegółach — decyzja z sekcji 10.1 potwierdzona
w E9-03: przy BLEND 0,5 trójka „żony” to 69 / 67 / 62, czyli 100% / 97% / 90% po przeskalowaniu,
więc sama liczba bez opisu nadal byłaby mało czytelna.

## 3. Typy (szkic)

```ts
type GroupId = 'battery' | 'camera' | 'storage' | 'longevity' | 'smooth' | 'price';
type CriterionId = 'battery' | 'charging' | 'photoDay' | 'photoIndoor' | 'photoMotion'
                 | 'selfie' | 'video' | 'zoom' | 'storage' | 'updates' | 'smoothness'
                 | 'display' | 'durability' | 'value';

interface QuizOption {
  id: string;                                   // np. 'A1-b'
  label: string;
  sets?: Partial<Record<CriterionId, number>>;  // wartość 0-5 dla kryterium
  budgetMax?: 1500 | 1800 | 2000;               // tylko F1
  minStorageGb?: 256;                           // tylko C2
  skip?: true;                                  // „Nie wiem / pomiń”
}

interface QuizQuestion {
  id: string;                                   // 'A1', 'B3', ...
  block: 'battery' | 'camera' | 'storage' | 'everyday' | 'display' | 'budget';
  text: string;
  why: string;                                  // „Dlaczego pytamy?”
  options: QuizOption[];
  appliesWhen?: (phones: Phone[]) => boolean;   // pominięcie pytania bez wpływu na wynik
  inShortQuiz?: boolean;                        // tryb hybrydowy
}

interface TopThreeAnswer { picks: [GroupId, GroupId, GroupId]; }   // kolejność ma znaczenie
```

## 4. Pytania

Wartości `→` to waga kryterium (0-5) ustawiana przez odpowiedź. Każde pytanie ma też „Nie wiem / pomiń”. Kolumna „Krótki” oznacza udział w trybie hybrydowym.

### Blok A. Bateria i ładowanie

| ID | Pytanie | Odpowiedzi → wartości | Dlaczego pytamy? | Krótki |
|---|---|---|---|---|
| A1 | Ile godzin dziennie patrzysz w ekran telefonu? | Do 2 godzin → `battery` 1 · 2-4 godziny → 3 · 4-6 godzin → 4 · Ponad 6 godzin → 5 | Im więcej ekranu, tym ważniejsza bateria. | tak |
| A2 | Czy zdarzają się dni, gdy nie masz jak naładować telefonu (wyjazd, wycieczka, długi dzień poza domem)? | Prawie nigdy → `battery` 1 · Czasem → 3 · Często → 5 | Przy takich dniach liczy się bateria na dwa dni, a nie sama szybkość ładowania. | tak |
| A3 | Jak zwykle ładujesz telefon? | Zawsze na noc → `charging` 0,25 · Czasem w ciągu dnia → 1,5 · Często potrzebuję szybkiego doładowania → 5 | Szybkie ładowanie ratuje dzień, gdy bateria padnie w drodze. | nie |

### Blok B. Aparat

| ID | Pytanie | Odpowiedzi → wartości | Dlaczego pytamy? | Krótki |
|---|---|---|---|---|
| B1 | Jak często robisz zdjęcia w domu, wieczorem albo przy sztucznym świetle? | Rzadko → `photoIndoor` 1 · Czasem → 3 · Często → 5 | Słabe światło to najtrudniejszy test dla aparatu. | tak |
| B2 | Jak często fotografujesz dziecko lub rodzinę w ruchu (zabawa, bieganie)? | Rzadko → `photoMotion` 1 · Czasem → 3 · Często → 5 | Ruchome obiekty wymagają szybkiego, pewnego ustawiania ostrości. | tak |
| B3 | Jak często robisz zdjęcia na zewnątrz w dzień (spacery, plac zabaw, wyjazdy)? | Rzadko → `photoDay` 1 · Czasem → 3 · Często → 5 | W dzień większość telefonów radzi sobie dobrze, ale różnią się szczegółami i kolorami. | tak |
| B4 | Jak często robisz selfie? | Prawie nigdy → `selfie` 0 · Czasem → 3 · Często → 5 | Aparat przedni to osobny aparat o osobnej jakości. | nie |
| B5 | Jak często nagrywasz filmy? | Prawie nigdy → `video` 0 · Czasem → 3 · Często → 5 | Wideo wymaga stabilizacji i dobrego dźwięku. | nie |
| B6 | Czy zdarza się, że fotografujesz z daleka (występ dziecka, plac zabaw, zwierzęta)? | Nie → `zoom` 0 · Czasem → 3 · Często → 5 | Z daleka dobre zdjęcia robi tylko telefon z osobnym aparatem do przybliżania. | nie |

### Blok C. Pamięć

| ID | Pytanie | Odpowiedzi → wartości | Dlaczego pytamy? | Krótki |
|---|---|---|---|---|
| C1 | Ile zdjęć i filmów chcesz trzymać w telefonie? | Niewiele, resztę usuwam albo przenoszę → `storage` 1 · Sporo, część w chmurze → 3 · Wszystko w telefonie, chmura sporadycznie → 5 | Zdjęcia i filmy zajmują najwięcej miejsca. | tak |
| C2 | Czy telefon z pamięcią mniejszą niż 256 GB w ogóle wchodzi w grę? | Tak, jeśli reszta jest dobra → bez filtra · Nie, minimum 256 GB → filtr `minStorageGb = 256` | Pamięci nie da się potem zwiększyć. | nie |
| C3 | Czy chcesz móc włożyć kartę pamięci microSD? | Nie ma znaczenia → `storage` bez zmian · Chcę, jeśli się da → `storage` 5 | Karta pozwala tanio zwiększyć pamięć. | nie |

**C3 jest warunkowe** (`appliesWhen`): pytanie pojawia się tylko, gdy przynajmniej jeden telefon w puli ma slot microSD. Dla zebranych danych żaden telefon go nie ma (dla części pole jest nieznane), więc C3 jest pomijane. Zasada ogólna: **pytania, których odpowiedź nie może zmienić rankingu, nie są zadawane**.

### Blok D. Codzienność i trwałość

| ID | Pytanie | Odpowiedzi → wartości | Dlaczego pytamy? | Krótki |
|---|---|---|---|---|
| D1 | Jak bardzo przeszkadzają Ci chwilowe zacięcia i wolne otwieranie aplikacji? | Prawie wcale → `smoothness` 1 · Trochę → 3 · Bardzo → 5 | Różnice w szybkości widać nawet przy przeglądarce i komunikatorach. | nie |
| D2 | Czy telefon bywa narażony na wodę (deszcz, zachlapania, dziecko z kubkiem)? | Rzadko → `durability` 0 · Czasem → 3 · Często, chcę mieć spokój → 5 | Odporność na wodę ratuje przed głupimi wpadkami. (`durability` = klasa IP + MIL-STD; szkło i upadki nie są oceniane.) | nie |
| D3 | Jak długo chcesz używać tego telefonu? | 2 lata → `updates` 1 · 3-4 lata → 3 · 5 lat lub dłużej → 5 | Telefon bez aktualizacji bezpieczeństwa przestaje być bezpieczny. | nie |

### Blok E. Ekran

| ID | Pytanie | Odpowiedzi → wartości | Dlaczego pytamy? | Krótki |
|---|---|---|---|---|
| E1 | Jak często używasz telefonu na zewnątrz w pełnym słońcu? | Rzadko → `display` 0 · Czasem → 3 · Często → 5 | W słońcu liczy się jasność ekranu. | nie |
| E2 | Jak często oglądasz na telefonie filmy, zdjęcia i dłuższe materiały? | Rzadko → `display` 0 · Czasem → 3 · Często → 5 | Przy oglądaniu liczy się jakość i płynność ekranu. | nie |

Dla `display` liczymy maksimum z E1 i E2 (jasność w słońcu = 5 i rzadkie oglądanie = 1 daje 5, nie 3).

### Blok F. Budżet

| ID | Pytanie | Odpowiedzi → wartości | Dlaczego pytamy? | Krótki |
|---|---|---|---|---|
| F1 | Ile możesz wydać na telefon? | Do 1500 zł, twardo → `budgetMax` 1500, `value` 5 · Do 1800 zł → 1800, `value` 3 · Do 2000 zł, jeśli warto → 2000, `value` 1 · Najlepiej do 1500 zł, dopłacę do 1800 zł, jeśli telefon będzie wyraźnie lepszy → 1500 (`budgetStretch` 1800), `value` 4 | Cena zawęża wybór i wpływa na ocenę opłacalności. | tak |

### Podsumowanie

| ID | Krok | Opis |
|---|---|---|
| G1 | **Wybierz trzy najważniejsze rzeczy** | Lista sześciu grup z sekcji 2.1, użytkowniczka wskazuje trzy po kolei (1., 2., 3.). Wynik przechodzi do ważności grup (sekcja 2.2). Pominięcie kroku jest dozwolone: wtedy ważność grup liczymy tylko ze wzoru dla grup poza trójką. |

Razem: **18 pytań (C3 warunkowe, przy obecnych danych pomijane, czyli 17 zadawanych) + krok podsumowania**, około 4-5 minut. Kolejność ekranów: A → B → C → D → E → F → G1. Pytania warto przeplatać krótkimi nagłówkami bloków, żeby przerwanie w połowie było czytelne.

## 5. Tryb hybrydowy: krótki zestaw

Pytania z `inShortQuiz`: A1, A2, B1, B2, B3, C1, F1 (siedem) plus G1. Po nich ekran suwaków (patrz `UI-SPEC.md`) pokazuje wyliczone ważności grup i wagi kryteriów do ręcznej korekty.

## 6. Tryb suwaków

- **Sześć suwaków grup** (0-5), każdy ustawia bezpośrednio `G_g`. Opcjonalnie rozwijane suwaki kryteriów w grupie (ustawiają `w_c`, czyli udziały w grupie).
- Filtry: budżet (1500 / 1800 / 2000), minimalna pamięć (bez ograniczeń / 256 GB).
- Wartości startowe suwaków: neutralne (grupy 2, kryteria 2). Żadnych profili „z góry”.

## 7. Zapis odpowiedzi

Sesja zapisuje: `answers` (id pytania → id opcji), `topThree`, wyliczone `groupImportance` i `criterionWeights` (snapshot), filtry i ranking (snapshot z wynikami `S`). Ręczna korekta suwakami w hybrydzie nadpisuje wartości snapshotu i jest oznaczona flagą `manualOverride`.

## 8. Przypadki brzegowe

| Sytuacja | Zachowanie |
|---|---|
| Wszystkie odpowiedzi „pomiń” | Wagi neutralne, ranking wg ocen ogólnych; ekran ostrzega, że wynik jest mało spersonalizowany |
| Budżet 1500 zł | Trzy telefony w budżecie (po etapie 10, D6); gdy w budżecie są <3 telefony, brakujące miejsca uzupełniają propozycje z etykietą „Powyżej budżetu” (sekcja 2.5) |
| Filtr „min. 256 GB” usuwa telefony | Pula mniejsza; normalizacja liczona na pozostałych |
| Mniej niż 3 telefony w puli | Pokazujemy tyle, ile jest, z komunikatem |
| Oceny „neutralne 50” (brak danych) | Karta oznacza kryterium jako „brak danych” w szczegółach |
| Zmiana odpowiedzi w już ukończonym quizie | Tworzy nowy ranking w tej samej sesji; poprzednie wybory (`picks`) zostają w historii |
| Dwa telefony różnią się o mniej niż 2 pkt | Etykieta „praktyczny remis” |

## 9. Persony testowe i testy akceptacyjne

Odpowiedzi persony zapisujemy w testach jako stałe. Wyniki poniżej to **stan referencyjny z danych na 16.11.2026 (pula 15 modeli, etap 10)**; testy sprawdzają **niezmienniki**, a nie dokładne liczby, żeby aktualizacja cen nie psuła testów.

### 9.1 Persona „żona” (profil z `PROJECT.md`, sekcja 2)

| Pytanie | Odpowiedź |
|---|---|
| A1 / A2 / A3 | 2-4 godziny (3) / Czasem (3) / Zawsze na noc (1) |
| B1 / B2 / B3 | Często (5) / Często (5) / Często (5) |
| B4 / B5 / B6 | Czasem (3) / Czasem (3) / Czasem (3) |
| C1 / C2 | Wszystko w telefonie (5) / Tak, jeśli reszta jest dobra |
| D1 / D2 / D3 | Trochę (3) / Czasem (3) / 3-4 lata (3) |
| E1 / E2 | Czasem (3) / Czasem (3) |
| F1 | Do 2000 zł, jeśli warto |
| G1 | 1. Bateria i ładowanie, 2. Aparat, 3. Pamięć |

Stan referencyjny (po rozszerzeniu puli do 15 modeli w etapie 10 i zmianie skali baterii na 4000–8000 mAh, D4): **#1 vivo V70 FE (67 pkt), #2 Edge 70 Fusion (67 pkt — praktyczny remis z #1), #3 Redmi Note 17 Pro 5G (65 pkt)**, #4 Realme 16 Pro+ (65 pkt), #5 Edge 60 (63 pkt), #6 Xiaomi 15T (63 pkt). Ważności grup persony: bateria 5, aparat 4,24, pamięć 3,36, aktualizacje i trwałość 1,7, ekran i płynność 1,7, cena 1,3. Pixel 10a i Pixel 9a (128 GB) nie wchodzą do trójki.

**Niezmienniki:**
1. Żaden telefon z 128 GB nie jest w trójce przy `storage` w trójce najważniejszych.
2. Średnia ocena `battery` w trójce ≥ średniej puli (referencyjnie: 87,0 kontra 57,0).
3. Włączenie filtra „min. 256 GB” pozostawia dotychczasowego lidera w trójce (i na #1 wśród modeli 256 GB), a zwycięzca po filtrze pochodzi z dotychczasowej trójki i zachowuje priorytet baterii.
4. *(Zaktualizowane w etapie 10, D6)* Gdy w budżecie 1500 zł mieszczą się co najmniej 3 telefony (referencyjnie 3: Edge 60, Redmi Note 15 Pro 5G i Galaxy A37 5G; 4, gdy Honor 400 spadnie do ≤ 1500 zł), wszystkie trzy karty mieszczą się w budżecie bez etykiety „Powyżej budżetu”; gdy po zawężeniu puli lub budżetu w limicie zostają mniej niż 3 telefony, brakujące miejsca uzupełniają najlepiej dopasowane telefony z etykietą „Powyżej budżetu o X zł”.

### 9.2 Persona „aparat” (kontrolna)

A1, A2, A3 = 1; B1-B6 = 5; C1 = 3; D1 = 3, D2 = 1, D3 = 3; E1, E2 = 3; F1 = 2000; G1 = Aparat, Pamięć, Ekran i płynność. Referencyjnie: **#1 Xiaomi 15T (71 pkt), #2 Edge 60 (67), #3 OnePlus Nord 5 (67)**, #4 Edge 70 Fusion (64), #5 Honor 400 (63). Ważności: aparat 5, pamięć 4,12, ekran i płynność 3,12, bateria 0,9.

### 9.3 Persona „bateria” (kontrolna)

A1, A2 = 5, A3 = 1; B1-B6 = 1; C1 = 3; D1-D3 = 3; E1, E2 = 1; F1 = 2000; G1 = Bateria i ładowanie, Cena, Aktualizacje i trwałość. Referencyjnie: **#1 Redmi Note 17 Pro 5G (65 pkt, 8340 mAh), #2 Redmi Note 15 Pro 5G (63), #3 Edge 70 Fusion (63)**, #4 vivo V70 FE (62), #5 Edge 60 (62).

### 9.4 Test różnicujący (niezmiennik między personami)

Średnia oceny `battery` w trójce persony „bateria” **>** analogiczna średnia persony „aparat”, a średnia oceny `photoDay` w trójce persony „aparat” **>** persony „bateria” (referencyjnie: `battery` **78,3 kontra 43,0** oraz `photoDay` **78,7 kontra 69,3**). Jeśli test nie przechodzi, poprawiamy pytania, mapowanie albo `BLEND`, a nie oceny telefonów.

### 9.5 Wykluczenia marek i modeli (Krok 0, Etap 11)

- Normalizacja min-max i wyniki `S` są liczone na pełnej puli po filtrach twardych — wykluczenie modelu `#1` persony „żona” (`vivo-v70-fe-5g-8-256`) przesuwa na karty `#2`, `#3` i `#4` z numeracją `#1–#3`, zostawiając wykluczony model na miejscu `1.` w `fullRanking` z identycznym `S` i `excluded = 'model'`.
- Wykluczenie marki (`excludedBrands: ['Xiaomi']`) usuwa z kart wszystkie obecne i przyszłe modele tej marki (`excluded = 'brand'`), a przy budżecie 1500 zł karta uzupełniająca „Powyżej budżetu” pochodzi wyłącznie z niewykluczonych telefonów.

## 10. Otwarte kwestie

1. ~~**Wyświetlanie „% dopasowania”.**~~ **Rozstrzygnięte (etap 2, potwierdzone w E9-03):** na karcie `round(S)` + opis słowny („bardzo dobre” ≥ 66, „dobre” ≥ 57, „przeciętne” poniżej), a przeskalowanie (najlepszy w puli = 100%) w szczegółach karty i w pełnym rankingu. Powód: przy wąskim rozstępie (69 / 67 / 62 u persony „żona”) sama liczba słabo różnicuje, a przeskalowanie zawsze dawałoby 100% dla pierwszej propozycji.
2. **Zaufanie do ocen kamer.** Część ocen aparatu ma pewność `low` (patrz `phones.json`, `scoreConfidence`). Czy karta ma to sygnalizować użytkowniczce, czy tylko szczegóły?
3. **Brak pytań o system i markę** — świadomie pominięte (brak przywiązania do systemu, wszystkie telefony z listy to Android, marka bez znaczenia).
4. **Mi Band 6** — nie wpływa na ranking; informacja o zgodności trafia do szczegółów telefonów po weryfikacji.
