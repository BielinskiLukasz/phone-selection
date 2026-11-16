# UI-SPEC — ekrany, komponenty, motywy

Specyfikacja interfejsu dla etapów 1, 4-8. Treść pytań i algorytm są w [QUIZ-SPEC.md](./QUIZ-SPEC.md), dane w `phones.json`, zasady ogólne w [PROJECT.md](../../PROJECT.md).

---

## 1. Zasady ogólne

1. **Mobile-first.** Projektujemy od szerokości 360 px. Układ dla komputera to ta sama treść w kolumnie `max-w-3xl` (karty rzędem od 1024 px).
2. **Jedna główna czynność na ekran.** Jeden wyraźny przycisk główny, reszta drugorzędna.
3. **Pola dotyku ≥ 44 × 44 px**, odstępy między przyciskami ≥ 8 px.
4. **Tylko polski**, teksty w jednym module `src/data/strings.ts`.
5. **Zero zdjęć telefonów** (anonimowość i prawa autorskie). Zamiast nich proste ikony cech.
6. **Praca na raty:** każdy ekran zapisuje stan od razu, nic nie wymaga „Zapisz”.
7. **Minimalny ruch:** animacje krótkie (do 300 ms), wyłączane przy `prefers-reduced-motion`.

## 2. Mapa ekranów i adresy (hash)

| Adres | Ekran | Uwagi |
|---|---|---|
| `#/` | Start | wybór trybu, wznowienie, link do historii |
| `#/s/:id/quiz` | Quiz | pytania A-F i krok G1 |
| `#/s/:id/sliders` | Suwaki | tryb suwaków |
| `#/s/:id/tune` | Dostrojenie | po krótkim quizie w hybrydzie |
| `#/s/:id/cards` | Trzy karty | anonimowe karty, wybór, ujawnienie |
| `#/s/:id/ranking` | Pełny ranking | po wyborze, na żądanie |
| `#/history` | Historia sesji | lista, podgląd, wznawianie |

Nazwy widoków to ASCII, bez parametrów zapytania. Wejście na adres nieistniejącej sesji kończy się komunikatem i powrotem do Startu.

## 3. Ekrany

### 3.1 Start

- Nagłówek aplikacji z przyciskiem motywu (ikona, sekcja 6).
- Krótki opis: „Odpowiedz na kilka pytań, a pokażemy trzy telefony, które pasują do Twoich potrzeb. Nazwy odkryjemy dopiero po Twoim wyborze.”
- Trzy karty trybów: **Quiz** (ok. 5 min), **Suwaki** (ok. 2 min), **Quiz + suwaki** (ok. 3 min).
- Jeśli istnieje nieukończona sesja: baner „Wróć do rozpoczętego wyboru (pytanie 7 z 17)” z przyciskiem **Wznów**.
- Link „Historia wyborów”.
- **Stany:** pusty (pierwsza wizyta, bez baneru), błąd odczytu zapisu (komunikat i przycisk „Zacznij od nowa”).

### 3.2 Quiz

- **Nagłówek:** nazwa bloku i licznik („Aparat · 5 z 17”), pasek postępu, przycisk „Wstecz”.
- **Treść:** pytanie, odpowiedzi jako duże przyciski jednokrotnego wyboru (`role="radiogroup"`), na końcu „Nie wiem / pomiń” wizualnie słabszy. Wybór zapisuje odpowiedź i po ok. 250 ms przechodzi dalej (z możliwością wstecz).
- „Dlaczego pytamy?” jako rozwijany akapit.
- „Zapisz i wyjdź” w menu nagłówka (zapis i tak jest automatyczny).
- **Krok G1 „Trzy najważniejsze rzeczy”:** sześć kafelków grup; dotknięcie dodaje kafelek do trójki z numerem 1-3 w kółku, ponowne dotknięcie zdejmuje (numeracja się przelicza). Przycisk **Pokaż wyniki** aktywny po wyborze trzech, obok „Pomiń ten krok”.
- **Stany:** brak odpowiedzi (przyciski odznaczone), odpowiedź wybrana (podświetlona po powrocie), pytanie warunkowe pominięte (bez śladu w liczniku).

### 3.3 Suwaki i dostrojenie

- Sześć suwaków grup 0-5 z etykietami („Bateria i ładowanie: ważne” itd.) i wartością tekstową („3 z 5”).
- Przy każdej grupie przycisk „Szczegóły”, który rozwija suwaki kryteriów w tej grupie.
- Panel filtrów: **Budżet** (do 1500 / 1800 / 2000 zł) i **Pamięć** (dowolna / minimum 256 GB).
- Licznik na żywo: „Pasuje 13 z 15 telefonów” (komunikat `aria-live="polite"`).
- Przycisk **Pokaż wyniki**.
- Ekran „Dostrojenie” (hybryda) to ten sam ekran z wartościami wyliczonymi z quizu, plakietką „Wyliczone z Twoich odpowiedzi” i przyciskiem **Przywróć wyliczone**.

### 3.4 Trzy karty (anonimowe)

Układ: pionowa lista na telefonie, trzy kolumny od 1024 px. Nad kartami zdanie „Trzy propozycje dla Ciebie. Nazwy odkryjemy po wyborze.” oraz (jeśli dotyczy) informacja „Mało telefonów mieści się w budżecie, jedna propozycja jest droższa”.

**Karta anonimowa:**

| Element | Treść |
|---|---|
| Nagłówek | „Propozycja #1” + znacznik „Praktyczny remis z #2” (gdy różnica < 2 pkt) |
| Dopasowanie | „Dopasowanie 71%” (sposób wyświetlania w QUIZ-SPEC, sekcja 10) |
| Cena | „1658 zł” oraz drobnym drukiem „cena z 14.11.2026” i etykieta „Powyżej budżetu o 158 zł”, gdy dotyczy |
| Cechy | 6 wierszy z ikonami (tabela w sekcji 4) |
| Szczegóły | przycisk „Więcej szczegółów” rozwijający oceny i dane (sekcja 3.5) |
| Działanie | przycisk główny **Wybieram tę propozycję** |

**Wybór:** dotknięcie przycisku otwiera okno u dołu: „Wybierasz propozycję #2? Odkryjemy jej nazwę i link do sklepu.” z przyciskami **Odkryj** i **Wróć**. Po potwierdzeniu karta zmienia się w **kartę odsłoniętą**:

- nazwa telefonu, marka, przyciski „Zobacz w sklepie (nazwa sklepu)” otwierane w nowej karcie z `rel="noopener noreferrer"`,
- cena z datą i uwaga „Cena orientacyjna, sprawdź w sklepie”,
- plakietka **„Wybór 1/1”** (po kolejnych wyborach: „Wybór 1/2”, „Wybór 2/2”; liczba po ukośniku to łączna liczba wyborów w sesji),
- pozostałe dwie karty zostają anonimowe z przyciskiem „Wybieram tę propozycję”.

Pod kartami: **Zacznij od nowa** (nowa sesja), **Pokaż pełny ranking** (widoczny dopiero po pierwszym wyborze), **Zmień odpowiedzi** (powrót do quizu lub suwaków w tej samej sesji; generuje nowy ranking).

### 3.5 Więcej szczegółów (rozwijane)

- Paski ocen 0-100 dla kryteriów (z etykietą grupy) z małą ikoną pewności (pełna / połowa / pusta dla `high` / `medium` / `low`). Kryteria z wartością neutralną z braku danych: „brak danych”.
- Krótkie uzasadnienia ocen (`basis`) w drugim planie, bez nazw modeli.
- Pełne dane: ekran, procesor jako „klasa wydajności”, bateria, ładowanie, waga i wymiary, aparaty, pamięć, aktualizacje, odporność, łączność.
- W motywie ciemnym (sekcja 6) paski ocen są widoczne od razu, bez rozwijania.

### 3.6 Pełny ranking

Lista wszystkich telefonów w puli z numerem miejsca, nazwą, ceną, dopasowaniem, odznakami wyborów („Twój wybór 1/2”) i mini-paskami sześciu grup. Dotknięcie wiersza rozwija szczegóły i linki do sklepów. Komunikat „Ranking dotyczy stanu danych z 14.11.2026. Ceny sprawdź w sklepie.”

### 3.7 Historia sesji

- Lista kart sesji od najnowszej: data, tryb, status („W trakcie” / „Ukończona”), „Wybrano: …” (jeśli są wybory), postęp quizu („pytanie 7 z 17”).
- Przyciski: **Wznów** (dla „W trakcie”), **Podgląd** (dla ukończonych, otwiera karty z snapshotu), **Usuń** (z potwierdzeniem).
- Pusty stan: „Nie masz jeszcze żadnych wyborów” i przycisk Start.

## 4. Treść anonimowej karty

Dane generuje `anonymize.ts` z `phones.json`; pola `reveal` nie przechodzą do komponentu karty. Cechy w stałej kolejności:

| Wiersz | Format | Przykład |
|---|---|---|
| Bateria | pojemność + moc ładowania + ew. bezprzewodowe | „7000 mAh · ładowanie 68 W · bez ładowania bezprzewodowego” |
| Aparat | główny z OIS/bez, szeroki kąt, przybliżanie, selfie | „Główny 50 MP ze stabilizacją · selfie 32 MP · bez aparatu do przybliżania” |
| Pamięć | GB + microSD | „256 GB · bez karty microSD” |
| Aktualizacje | lata systemu i zabezpieczeń | „3 aktualizacje systemu, 5 lat poprawek” |
| Odporność | klasa IP + opis | „Wodoszczelny i pyłoszczelny (IP68/IP69)” |
| Ekran i wydajność | przekątna, typ, odświeżanie, klasa wydajności | „6,78″ AMOLED 144 Hz · wydajność średnia” |

**Reguły (egzekwowane testami w etapie 2):**
- brak nazw marek, modeli, serii, procesorów (zamiast „Snapdragon 7s Gen 3” piszemy „klasa wydajności: średnia”), nazw własnych funkcji i systemów nakładkowych,
- cechy decydujące o wyborze zostają, nawet jeśli mogłyby sugerować markę (np. liczba lat aktualizacji),
- brak danych wyświetlamy jako „brak danych”, nie jako zero ani pusty wiersz,
- **klasa wydajności** wyprowadzamy z oceny `smoothness` (≥ 75 wysoka, 55-74 średnia, < 55 podstawowa).

## 5. Komponenty

`AppHeader`, `ThemeToggle`, `ModeCard`, `QuestionScreen`, `OptionButton`, `ProgressBar`, `TopThreePicker`, `GroupSlider`, `CriterionSliders`, `FilterPanel`, `PhoneCardAnon`, `PhoneCardRevealed`, `DetailsAccordion`, `ScoreBar`, `ConfidenceIcon`, `Badge`, `ConfirmSheet`, `SessionListItem`, `EmptyState`, `ErrorBoundary`, `Toast`.

Wszystkie komponenty prezentacyjne są **bez stanu biznesowego** (dostają dane i funkcje zwrotne), logika siedzi w `features/*` i `lib/*`.

## 6. Motywy

Przycisk z ikoną w nagłówku (słońce / księżyc, `aria-label` „Przełącz motyw: jasny lub ciemny”). Wybór zapisywany w stanie aplikacji. **Domyślnie jasny.**

| | **Jasny** — „prosty, przyjazny” | **Ciemny** — „złożony, surowy” |
|---|---|---|
| Tło / powierzchnia | ciepła biel `#FAF8F5` / `#FFFFFF` | grafit `#0B0F14` / `#121820` |
| Tekst / tekst drugorzędny | `#1F2937` / `#5B6472` | `#E6EDF3` / `#9AA7B4` |
| Akcent | ciepły błękit `#2F6FED` | zieleń sygnałowa `#4ADE80` |
| Obramowanie | brak lub subtelne `#E8E4DD` | wyraźne 1 px `#2A3441`, siatka |
| Zaokrąglenia | duże (16 px) | małe (2 px) |
| Odstępy | luźne (16/24 px) | gęste (8/12 px) |
| Typografia | sans systemowy, duże nagłówki | sans systemowy + `ui-monospace` dla liczb i etykiet, małe kapitaliki z odstępem liter |
| Karty | miękki cień, dużo bieli, 3-4 cechy widoczne od razu | „odczyty”: wszystkie cechy w tabeli, paski ocen widoczne od razu |

**Decyzja robocza** dla „złożony”: różnica jest **wizualna i w gęstości prezentacji** (te same dane, w ciemnym motywie widoczne bez rozwijania). Logika, treść i wyniki są identyczne w obu motywach. Do potwierdzenia przez użytkownika.

**Implementacja (Tailwind 4):** tokeny jako zmienne CSS w `@theme` (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-accent`, `--radius-card`, `--space-card`, `--font-num`), nadpisywane w `[data-theme="dark"]`; wariant `dark` Tailwinda przepięty na atrybut: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`. Brak zewnętrznych czcionek.

## 7. Responsywność

| Szerokość | Układ |
|---|---|
| < 640 px | jedna kolumna, przyciski główne w pasku przyklejonym do dołu (z uwzględnieniem `env(safe-area-inset-bottom)`) |
| 640-1023 px | kolumna `max-w-2xl` wyśrodkowana, przyciski w treści |
| ≥ 1024 px | trzy karty obok siebie, suwaki w dwóch kolumnach |

Brak przewijania poziomego na żadnym ekranie. Tabele i długie listy w kontenerze z `overflow-x: auto`.

## 8. Dostępność

- `lang="pl"`, struktura nagłówków `h1` (ekran) i `h2` (sekcje).
- Odpowiedzi quizu jako `radiogroup` z obsługą klawiatury (strzałki, spacja). Po przejściu do kolejnego pytania fokus ląduje na nagłówku pytania.
- Suwaki: natywne `input[type=range]` z `aria-valuetext` („3 z 5, ważne”).
- Kontrast tekstu ≥ 4,5:1 w obu motywach; wyraźny wskaźnik fokusu; informacja nigdy tylko kolorem (numer miejsca, tekst „Powyżej budżetu”).
- Komunikaty zmian (licznik „Pasuje 8 z 10”, ujawnienie karty) w `aria-live="polite"`.
- Okno potwierdzenia wyboru z pułapką fokusu, zamykane Esc.

## 9. Kluczowe teksty (szkic)

| Miejsce | Tekst |
|---|---|
| Tytuł | „Jaki telefon do Ciebie pasuje?” |
| Brak zapisu | „Ta przeglądarka nie pozwala zapisać postępu (np. tryb prywatny). Możesz kontynuować, ale po zamknięciu strony odpowiedzi znikną.” |
| Ostrzeżenie o danych | „Ceny i oceny pochodzą z 14.11.2026. Przed zakupem sprawdź aktualną cenę w sklepie.” |
| Wybór | „Wybierasz propozycję #2? Odkryjemy jej nazwę i link do sklepu.” |
| Za mało telefonów | „W tym budżecie mieszczą się tylko dwa telefony. Trzecia propozycja jest droższa.” |
| Mało spersonalizowany wynik | „Większość odpowiedzi to „nie wiem”, więc wynik jest ogólny.” |

## 10. Stany krańcowe

| Sytuacja | Zachowanie |
|---|---|
| `localStorage` niedostępny | działa w pamięci, baner ostrzegawczy (sekcja 9) |
| Uszkodzone dane zapisu | komunikat, kopia surowych danych pod kluczem zapasowym, przycisk „Zacznij od nowa” |
| Wyłączony JavaScript | `<noscript>` z krótką informacją |
| Pula 0 telefonów | komunikat „Żaden telefon nie spełnia tych warunków” i przycisk zmiany filtrów |
| Pula 1-2 telefony | tyle kart, ile jest, z informacją |
| Stare dane (> 30 dni od daty cen) | żółty baner „Ceny mogą być nieaktualne” |

## 11. Otwarte kwestie

1. Sposób pokazywania „% dopasowania” (QUIZ-SPEC, sekcja 10).
2. Czy sygnalizować pewność ocen (`low`) na karcie, czy tylko w szczegółach (w tej specyfikacji: tylko w szczegółach).
3. Zdjęcia telefonów po ujawnieniu (poza zakresem do czasu decyzji o prawach).
4. Link do wznowienia na drugim urządzeniu (etap 7, opcjonalny).
5. Potwierdzenie interpretacji motywu „złożony, surowy” (sekcja 6).
