# Wybór telefonu — PROJECT.md

Statyczna strona (GitHub Pages), która pomaga wybrać nowy smartfon **po cechach, a nie po nazwie**. Użytkowniczka odpowiada na pytania lub ustawia suwaki, strona liczy ranking, pokazuje trzy anonimowe karty (miejsca 1–3, z ceną i % dopasowania), a nazwę i link do sklepu ujawnia dopiero po wyborze.

> Status dokumentu: wersja robocza z wywiadu planistycznego. Rzeczy do potwierdzenia są zebrane w sekcji [Otwarte kwestie](#14-otwarte-kwestie).

---

## 1. Cel i zasady

| Zasada | Znaczenie |
|---|---|
| Wybór po cechach | Nazwy, marki i zdjęcia są ukryte do momentu wyboru, żeby nie sugerować się marką |
| Ranking z jasnych reguł | Wagi cech z odpowiedzi użytkowniczki, oceny telefonów z danych (nie z wrażeń) |
| Praca na raty | Quiz można przerwać i wrócić po kilku dniach, także z innego urządzenia (patrz sekcja 9) |
| Brak backendu | Wszystko w przeglądarce, dane telefonów w pliku JSON w repo |
| Tylko polski | Brak i18n w MVP (stałe teksty trzymamy w jednym module, żeby ewentualna zmiana była tania) |

## 2. Profil użytkowniczki (punkt odniesienia do testów, nie źródło wag)

- Obecnie iPhone 8, nie jest przywiązana do systemu. Telefon **nowy**, używany 3–4 lata.
- Budżet docelowo **1500 zł**, w uzasadnionych przypadkach do **2000 zł** (twardy limit strony: 2000 zł).
- Priorytety (od najważniejszego): 1) bateria, 2) aparat do zdjęć rodzinnych, 3) duża pamięć, 4) bezproblemowe użytkowanie, 5) długie wsparcie aktualizacjami.
- Użycie: dużo zdjęć dziecka i rodziny (w domu i na zewnątrz w dzień), czasem selfie i filmy; Facebook, komunikatory, internet; bez gier.
- Pamięć: preferowane 256 GB, microSD to bonus; obecnie 20–50 GB zdjęć i filmów.
- Dodatkowo: rozmiar bez znaczenia, odporność na zachlapania mile widziana, Mi Band 6, marka dowolna, ale znana i godna zaufania.

Dobra bateria ma pierwszeństwo przed najlepszym aparatem — to wchodzi do wag domyślnych.

## 3. Zakres: lista telefonów

Lista wejściowa została zmieniona decyzjami użytkownika (14.11.2026):

- Ceny (z linkami do sklepów) podał użytkownik; wszystkie mieszczą się w limicie **2000 zł**, więc nie szukamy innych wariantów pamięci/procesora.
- **Pixel 10a** i **Pixel 9a** zostają w wersji **8/128 GB**.
- **Xiaomi 15T** bierzemy w wersji **12/512 GB** (ceny zbliżone do 256 GB).
- **Pixel 8a** wypada (model uznany za stary), jego miejsce zajmuje **Redmi Note 15 Pro 5G**.
- **Galaxy A55** wypada (brak w sprzedaży), jego miejsce zajmuje **Realme 16 Pro+ 5G**.
- Do danych trafiają wyłącznie telefony **nowe**, z polskiej dystrybucji.

| # | Model | Cena (14.11.2026) | Status |
|---|---|---|---|
| 1 | Samsung Galaxy A57 8/256 GB | 1729,00 zł | ok |
| 2 | Google Pixel 10a 8/128 GB | 1899,99 zł | ok |
| 3 | Samsung Galaxy A56 5G 8/256 GB | 1718,99 zł | ok |
| 4 | Xiaomi Redmi Note 15 Pro 5G 8/256 GB | 1299,00 zł | ok |
| 5 | Motorola Edge 60 12/256 GB | 1399,00 zł | ok |
| 6 | Xiaomi 15T 12/512 GB | 1999,00 zł | ok |
| 7 | Motorola Edge 70 Fusion 12/256 GB | 1658,12 zł | ok (aukcja sprawdzona, promocja do 30.11.2026) |
| 8 | Google Pixel 9a 8/128 GB | 1749,99 zł | ok |
| 9 | Nothing Phone (3a) 12/256 GB | 1779,00 zł | ok |
| 10 | Realme 16 Pro+ 5G 8/256 GB | 1959,99 zł | do potwierdzenia na stronie oferty (adres linku bez „plus”) |

Aktualny stan zebranych danych: `src/data/phones.json` i sekcja „Stan danych” w [ROADMAP.md](./ROADMAP.md).

## 4. Stack

| Element | Wersja |
|---|---|
| React | 19.2.6 |
| TypeScript | 5.9.3 |
| Tailwind CSS | 4.1.17 (plugin `@tailwindcss/vite` w tej samej wersji) |
| Vite | 7.3.7 (wymaga Node.js 20.19+ lub 22.12+) |
| Menedżer pakietów | npm (instalacja z `--save-exact`, w CI `npm ci`) |
| Hosting | GitHub Pages (GitHub Actions) |

Dodatki rekomendowane (wersje dobierane do Vite 7 przy zakładaniu repo): `@vitejs/plugin-react`, Vitest + Testing Library (testy silnika rankingu i storage), ESLint + Prettier.

Bez `react-router` w MVP: widoki sterowane stanem sesji + prosty router oparty o hash (GitHub Pages nie ma SPA fallbacku, więc ścieżki w stylu `/session/123` dałyby 404 po odświeżeniu).

## 5. Przepływ użytkownika

```
Start ──► wybór trybu ──► (quiz | suwaki | hybryda) ──► ranking (liczony w tle)
                                                          │
                               ┌──────────────────────────┘
                               ▼
              3 anonimowe karty: #1, #2, #3 (cena, % dopasowania, cechy)
                               │  „Więcej szczegółów” (rozwijane: oceny, pełne dane)
                               ▼
                    wybór karty ──► ujawnienie: nazwa + link do sklepu
                               │
        ┌──────────────────────┼───────────────────────────┐
        ▼                      ▼                           ▼
 wybór innej karty      quiz od nowa            „Pokaż pełny ranking” (10 telefonów, z nazwami)
 (kolejny wybór, 1/2)   (nowa sesja w historii)
```

Ekrany: **Start**, **Quiz**, **Suwaki**, **Ranking/karty**, **Zwycięzca**, **Pełny ranking**, **Historia sesji**.

## 6. Tryby wyboru

### 6.1 Quiz
Pytania pogrupowane w bloki tematyczne (bateria, aparat, pamięć, codzienność, budżet), pasek postępu, zapis po każdej odpowiedzi. Każda odpowiedź dodaje „efekty” do wag kryteriów (patrz sekcja 7). Długość: **ok. 14–16 pytań**, dobrana tak, żeby każde pytanie realnie zmieniało ranking (pytania bez wpływu na wynik usuwamy po testach na danych).

### 6.2 Suwaki
Jeden suwak ważności (0–5) dla każdego kryterium, suwaki twardych filtrów (budżet, minimalna pamięć) i przełączniki „musi mieć” (np. microSD). Wartości startowe pochodzą z profilu z sekcji 2.

### 6.3 Hybryda
Krótki quiz (bloki: bateria, aparat, budżet), potem ekran suwaków **wypełnionych wynikami quizu** do ręcznego dostrojenia.

## 7. Model rankingu

### 7.1 Kryteria

| id | Kryterium | Co ocenia |
|---|---|---|
| `battery` | Czas pracy na baterii | pojemność + wyniki testów czasu pracy |
| `charging` | Ładowanie | moc, czas do 50%/100%, ładowarka w zestawie |
| `photoDay` | Zdjęcia w dzień | jakość głównego aparatu na zewnątrz |
| `photoIndoor` | Zdjęcia w domu | słabe światło, szum, stabilizacja |
| `photoMotion` | Zdjęcia dziecka w ruchu | autofocus, szybkość, ostrość w ruchu |
| `selfie` | Selfie | aparat przedni |
| `video` | Filmy rodzinne | rozdzielczość, stabilizacja, dźwięk |
| `zoom` | Zoom | teleobiektyw / jakość przybliżenia |
| `storage` | Pamięć | pojemność + microSD jako bonus |
| `updates` | Wsparcie aktualizacjami | lata aktualizacji systemu i zabezpieczeń |
| `smoothness` | Płynność na co dzień | przeglądarka, komunikatory, Facebook |
| `display` | Ekran | jasność na słońcu, płynność, jakość |
| `durability` | Odporność | klasa IP, szkło, konstrukcja |
| `value` | Stosunek jakości do ceny | liczony z ceny i budżetu sesji |

### 7.2 Dane wejściowe
- Każdy telefon ma dla każdego kryterium ocenę **0–100** (`scores`) oraz krótkie uzasadnienie (`basis`) ze wskazaniem źródła. Oceny są wyprowadzane z twardych danych (mAh, lata aktualizacji, klasa IP, wyniki niezależnych testów), nie „na oko”.
- Użytkowniczka ma wagi **0–5** dla każdego kryterium (0 = ignoruj).

### 7.3 Wzór

```
S      = Σ(waga_i × ocena_i) / Σ(waga_i)                 // 0–100
Dopas. = round(S)                                        // pokazywane jako „% dopasowania”
```

- **Filtry twarde** (przed liczeniem): cena ≤ budżet sesji, pamięć ≥ minimum, microSD jeśli oznaczone „musi”.
- **Remis:** niższa cena, potem wyższa ocena `battery`.
- **`value`:** `100 × (1 − (cena − 1200) / (budżet − 1200))`, obcięte do 0–100 (stałe do kalibracji na prawdziwych danych).
- **Wagi wynikają wyłącznie z odpowiedzi** (patrz 7.6). Start jest neutralny, profil z sekcji 2 nie wpływa na wynik.
- Silnik rankingu to **czysta funkcja** (`lib/scoring.ts`) z testami jednostkowymi (np. „bateria=5, reszta=0 daje najwyższy `battery`”).

### 7.4 Szkic pytań quizu

| Blok | Pytanie (robocze) | Wpływ na |
|---|---|---|
| Bateria | Ile godzin dziennie ekran jest włączony? | `battery` |
| Bateria | Czy zdarzają się dni bez dostępu do ładowarki? | `battery` |
| Bateria | Szybkie ładowanie czy ładowanie na noc? | `charging` |
| Aparat | Jak często robisz zdjęcia w domu przy sztucznym świetle? | `photoIndoor` |
| Aparat | Jak często dziecko jest w ruchu na zdjęciach? | `photoMotion` |
| Aparat | Zdjęcia na zewnątrz w dzień — jak ważna jest jakość? | `photoDay` |
| Aparat | Jak ważne są selfie? | `selfie` |
| Aparat | Jak często nagrywasz filmy? | `video` |
| Aparat | Czy zdarza się fotografować z daleka (występy, plac zabaw)? | `zoom` |
| Pamięć | Minimalna pamięć (128 / 256 / 512 GB)? | filtr + `storage` |
| Pamięć | Czy karta microSD jest ważna? | `storage` / filtr |
| Codzienność | Jak bardzo przeszkadzałyby zawieszki i spowolnienia? | `smoothness` |
| Codzienność | Jak ważna jest odporność na wodę i upadki? | `durability` |
| Codzienność | Ile lat aktualizacji chcesz mieć? | `updates` |
| Ekran | Jak ważny jest ekran (jasność w słońcu, płynność)? | `display` |
| Budżet | Do ilu zł? (do 1500 / 1800 / 2000) | filtr + `value` |
| Podsumowanie | Wybierz trzy najważniejsze rzeczy (kolejność ma znaczenie) | mnożniki grup |

### 7.5 Reguły oceniania telefonów (zastosowane w `phones.json`)

Każdy telefon ma w `scores` ocenę 0-100 na kryterium, w `basis` uzasadnienie ze źródłem, w `scoreConfidence` pewność (`high` / `medium` / `low`), a w `scoresEstimatedNeutral` listę kryteriów bez danych.

**Kryteria obiektywne (wzory):**

| Kryterium | Wzór |
|---|---|
| `battery` | `0,5 × pojemność + 0,5 × wytrzymałość`; pojemność = `(mAh − 4000) / 3000 × 100` (4000 mAh = 0, 7000 mAh = 100); wytrzymałość = ocena z testów i recenzji (0-100) |
| `charging` | `(W − 15) / 75 × 100`, +8 pkt za ładowanie bezprzewodowe (23 W ≈ 11, 45 W = 40, 68 W ≈ 71, 90 W = 100) |
| `updates` | `lata / 7 × 100`, gdzie lata = średnia z liczby dużych aktualizacji systemu i lat poprawek (7 lat = 100, 6 lat ≈ 86, 3+4 lata ≈ 50) |
| `storage` | 128 GB = 40, 256 GB = 75, 512 GB = 100 (slot microSD dałby bonus, żaden telefon z listy go nie ma) |
| `durability` | IP68/IP69 + MIL-STD = 100, IP68 = 90, IP66/IP68 = 88, IP67 = 80, IP64 = 55 |

**Reguły C1 (zatwierdzone przy domykaniu etapu 0, kod: `src/data/scoringRules.ts`):**

| Obszar | Reguła |
|---|---|
| Wytrzymałość baterii | Test GSMArena („estimated battery endurance”, godziny): `100 × (h − 40) / 30`. Test PCMark (91mobiles): `100 × (h − 8) / 12`. Wynik testu ma pierwszeństwo przed oceną z recenzji; źródło i metoda trafiają do `specs.batteryTests`, a liczba do `specs.batteryEndurance` |
| Ekran bez pomiarów | Progi jasności szczytowej: ≥3000 nitów = 80, 1500-2999 = 70, 1000-1499 = 60, brak danych = 50 (neutralne). Bonus +5 za odświeżanie ≥144 Hz. Niezależny pomiar/test ma pierwszeństwo przed regułą sprzętową |
| Odporność | IP68/IP69 + MIL-STD = 100, **IP68/IP69 bez MIL-STD = 95**, IP68 = 90, IP66/IP68 = 88, IP67 = 80, IP66 = 70, IP64/IP65 = 55 |
| Ładowanie | Zawartość pudełka (`chargerInBox`) nie zmienia oceny — to informacja dla użytkowniczki, nie jakość ładowania |
| Aparat z testu wariantu Pro | Ocena wariantu Pro pomniejszona o 10 pkt, pewność `low` i jawne zdanie w `basis` („ocena wyprowadzona z wyników 15T Pro … z obniżeniem o ok. 10 pkt”) |
| Aktualizacje przy jednej składowej | Gdy znana jest tylko liczba wersji systemu albo tylko lata poprawek, ocena liczy się z tej jednej składowej (`lata / 7 × 100`), a brak drugiej jest opisany w `basis` |

Spójność ocen z tymi regułami pilnuje test `tests/score-rules.test.ts`, a luki raportuje
`npm run data-gaps` (`--strict` = próg wydania z etapu 9).

**Kryteria oceniane na podstawie dowodów:** `photoDay`, `photoIndoor`, `photoMotion`, `selfie`, `video`, `zoom`, `smoothness`, `display`. Punktem wyjścia są niezależne wyniki (DXOMARK, PhoneArena, GSMArena, testy polskich redakcji) oraz sprzęt (OIS, teleobiektyw, sensor), a przy braku wyników klasa sprzętu. Każda ocena ma opis podstawy i pewność. **Aparat jest najmniej obiektywnym kryterium**, a dane są niespójne (różne metodyki DXOMARK, testy innych wariantów, np. 15T Pro zamiast 15T).

**Brak danych:** wartość neutralna **50**, wpis w `scoresEstimatedNeutral` i pewność `low`. Silnik rankingu ma pokazywać taką ocenę na karcie jako szacunek („brak danych”).

**`value`:** liczone w aplikacji: `100 × (1 − (cena − 1200) / (budżet − 1200))`, obcięte do 0-100.

**Wagi:** nie ma wag domyślnych. Profil żony służy tylko jako persona testowa (patrz 7.6).

### 7.6 Skąd biorą się wagi (z odpowiedzi użytkowniczki)

1. **Start neutralny:** każde kryterium ma wagę 2 (na skali 0-5). Kryterium, którego nie dotyczy żadne pytanie, zostaje neutralne.
2. **Odpowiedzi ustawiają wagi bezpośrednio.** Każda odpowiedź ma przypisaną wartość 0-5 dla jednego lub kilku kryteriów (np. „zdarzają się dni bez ładowarki: często” daje `battery = 5`). Gdy kilka pytań dotyczy tego samego kryterium, waga to średnia z ich wartości.
3. **Pytania o skłonności, nie o „ważność”.** Pytania w stylu „jak ważny jest aparat?” dają wszystko na 5. Lepsze są pytania o sytuacje („jak często robisz zdjęcia w domu wieczorem?”) i o kompromisy („wolisz telefon z lepszym aparatem czy z baterią na dwa dni?”).
4. **Krok końcowy „wybierz trzy najważniejsze rzeczy”** z listy grup: bateria i ładowanie, aparat, pamięć, aktualizacje i trwałość, ekran i płynność, cena. Kolejność wyboru ma znaczenie: waga kryteriów w grupie wybranej jako pierwsza jest mnożona przez 1,5, druga przez 1,3, trzecia przez 1,15, a pozostałe grupy przez 0,85 (wynik obcinany do 0-5). Wymusza wybory i zapobiega temu, że wszystko wychodzi „bardzo ważne”, a zajmuje kilka sekund.
5. **Suwaki i hybryda** pokazują i pozwalają poprawić tak wyliczone wagi.
6. **Persona testowa „żona”** (profil z sekcji 2) to zestaw odpowiedzi w testach: quiz uruchomiony z tymi odpowiedziami ma dawać ranking zgodny z jej priorytetami (bateria przed aparatem, pamięć 256 GB, długie wsparcie). Jeśli nie daje, poprawiamy pytania lub mapowanie, a nie wagi.

## 8. Anonimowe karty

Karta pokazuje: **miejsce w rankingu (#1–#3), % dopasowania, cenę (z datą sprawdzenia)** oraz zwięzły zestaw cech. Rozwijane „Więcej szczegółów” zawiera oceny kryteriów z uzasadnieniami i pełne dane techniczne.

Reguły anonimizacji (egzekwowane w `lib/anonymize.ts` i testach):
- brak zdjęć, nazw modeli, marek, nazw serii i nazw własnych funkcji marki (np. interfejsów, nazw chipów, nazw trybów aparatu);
- opisy cech neutralne i liczbowe: „5000 mAh”, „6,7″ AMOLED 120 Hz”, „7 lat aktualizacji”, „IP68”, „brak slotu microSD”, „aparat główny 50 Mpix z OIS”;
- cecha decydująca o wyborze zostaje na karcie nawet wtedy, gdy mogłaby sugerować markę (np. liczba lat aktualizacji). Celem jest eliminacja uprzedzeń marki, nie tajemnica kryptograficzna;
- dane o modelu (nazwa, marka, linki) są w osobnym polu `reveal`, które komponent kart **nie renderuje**, dopóki telefon nie trafi na listę wyborów sesji.

**Ujawnianie i wielokrotny wybór:** po wyborze karty pokazujemy nazwę i link(i) do sklepu. Użytkowniczka może wrócić i wybrać inną kartę. Każdy wybór jest zapisywany osobno; wcześniej wybrana karta pozostaje odsłonięta z plakietką **„Wybór 1/2”**, kolejna dostaje „Wybór 2/2”.

## 9. Sesje, historia i zapis

Brak backendu, więc stan jest w `localStorage` (klucz `wybor-telefonu:v1`, z numerem wersji schematu i migracją).

```ts
type Mode = 'quiz' | 'sliders' | 'hybrid';
type SessionStatus = 'in_progress' | 'completed';

interface Pick { phoneId: string; at: string; }               // kolejność w tablicy = numer wyboru

interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: Mode;
  status: SessionStatus;
  answers: Record<string, string>;                            // questionId -> answerId
  weights: Record<CriterionId, number>;                       // 0–5
  filters: { budgetMax: number; minStorageGb?: number; requireMicroSd?: boolean };
  ranking?: { phoneId: string; matchPercent: number }[];      // snapshot z momentu liczenia
  picks: Pick[];
}

interface AppState { schemaVersion: 1; sessions: Session[]; activeSessionId?: string; theme: 'light' | 'dark'; }
```

- **Historia:** lista sesji (data, tryb, status, ostatni wybór), podgląd, **wznawianie nieukończonych**, usuwanie.
- **Snapshot rankingu** w sesji: wynik przeglądany po tygodniu nie zmieni się, jeśli zaktualizujemy dane telefonów (nowa sesja liczy wg nowych danych).
- **Dwa urządzenia:** `localStorage` nie synchronizuje się między komputerem a telefonem. Propozycja (do potwierdzenia): **link do wznowienia** z odpowiedziami zakodowanymi w hashu adresu oraz opcjonalny eksport/import historii do pliku.

## 10. Motywy

Przycisk z ikoną przełącza dwa motywy (atrybut `data-theme` na `<html>`, wybór zapisany w `localStorage`):

| | Jasny | Ciemny |
|---|---|---|
| Charakter | prosty, przyjazny | złożony, surowy |
| Układ | duże odstępy, zaokrąglenia, jedna kolumna na telefonie | gęstszy układ, ostre krawędzie, siatka, czcionka techniczna (mono) dla liczb |
| Karty | miękkie, dużo bieli | „odczyty techniczne”, wyraźne ramki |

Implementacja w Tailwind 4: tokeny w `@theme`, wariant `dark` przepięty na atrybut: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`. Domyślnie motyw jasny.

## 11. Struktura repozytorium

```
.
├── .github/workflows/deploy.yml     # build + deploy na GitHub Pages
├── public/
├── scripts/validate-data.ts         # walidacja phones.json (schemat, ceny ≤ 2000, daty)
├── src/
│   ├── app/                         # App.tsx, router hashowy, layout
│   ├── components/                  # przyciski, karty, suwaki, ikona motywu
│   ├── features/
│   │   ├── quiz/  sliders/  ranking/  cards/  history/  theme/
│   ├── data/
│   │   ├── phones.json              # dane telefonów
│   │   ├── criteria.ts              # kryteria i wagi domyślne
│   │   └── questions.ts             # pytania quizu + efekty odpowiedzi
│   ├── lib/                         # scoring.ts, storage.ts, anonymize.ts
│   └── types/
├── PROJECT.md
├── ROADMAP.md
└── vite.config.ts                   # base: '/<nazwa-repo>/'
```

## 12. Deploy (GitHub Pages)

- `vite.config.ts`: `base: '/<nazwa-repo>/'` (nazwa repo do ustalenia).
- Workflow GitHub Actions: `checkout` → `setup-node` (Node 22) → `npm ci` → `npm run build` → `upload-pages-artifact` → `deploy-pages`. W ustawieniach repo: Pages → Source: GitHub Actions.
- Routing hashowy (`#/…`), więc odświeżenie strony zawsze działa.

## 13. Dane telefonów (`phones.json`)

Pola każdego rekordu:

| Pole | Opis |
|---|---|
| `id` | slug, np. `galaxy-a57-8-256` |
| `reveal` | `name`, `brand`, `shopLinks[]` (ujawniane po wyborze) |
| `variant` | RAM, pamięć, kolor-niezależne oznaczenie wariantu; `variantOf` jeśli zastąpiono wariant z listy |
| `price` | `pln`, `checkedAt` (data), `source` (sklep), `note` |
| `specs` | bateria (mAh), ładowanie (W), ekran, wymiary/waga, IP, microSD, aparaty, aktualizacje (lata), chip (klasa) itd. |
| `scores` | oceny 0–100 dla każdego kryterium |
| `basis` | uzasadnienie i źródło każdej oceny |
| `status` | `ok`, `over_budget`, `variant_swapped`, `unverified` |

Zasady zbierania danych:
- Dane tylko ze źródeł (karty produktowe sklepów, strony producentów, niezależne testy), bez uzupełniania z pamięci. Brak danych to `null` i status `unverified`, nigdy zgadywana wartość.
- Cena: polska dystrybucja, nowy egzemplarz, kilka sklepów, zapisujemy najniższą wiarygodną cenę z datą sprawdzenia. **Cena na stronie jest zawsze opatrzona datą** i traktowana jako orientacyjna (ceny zmieniają się codziennie).
- Przed publikacją każdej wersji: `npm run validate-data` (cena ≤ 2000 zł, komplet pól, świeżość cen).

## 14. Otwarte kwestie

1. **Nazwa repo** i adres Pages.
2. **Link do wznowienia / eksport historii** (sekcja 9): wdrażać w MVP czy później?
3. **Motyw ciemny „złożony”:** czy chodzi tylko o styl (gęstość, mono, ramki), czy też o więcej widocznych danych na kartach?
4. **Zdjęcia telefonów** po ujawnieniu: pomijamy czy dodajemy (kwestia praw do zdjęć)?
5. **Kalibracja** stałych rankingu (`value`, wagi domyślne) po zebraniu pełnych danych.
6. **Mi Band 6:** potwierdzić zgodność i ograniczenia z aplikacjami na Androidzie i dodać do „Więcej szczegółów”.
