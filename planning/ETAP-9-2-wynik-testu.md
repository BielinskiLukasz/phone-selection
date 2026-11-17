# E9 — wynik testu z użytkowniczką (FP0-01) i decyzje zakupowe

> **Status: SZABLON DO WYPEŁNIENIA przez użytkownika.** Test E9-06 odbył się (informacja ustna), ale jego wynik
> nie jest jeszcze w repo. Cała faza poprawkowa (`FIX-PHASE.md`) opiera się na tym pliku — wypełnij go jako
> pierwsze zadanie (FP0-01), a sesję wyeksportuj do `tests/fixtures/user-session.json` (FP0-02).
> Pola w nawiasach `[ … ]` zastąp treścią; nie zostawiaj domysłów — jeśli czegoś nie wiesz, wpisz „nie wiem”.

## 1. Przebieg testu (protokół: `E9-test-uzytkownika.md`)

| Pole | Wartość |
|---|---|
| Data i miejsce | `[ RRRR-MM-DD, telefon / komputer, motyw jasny / ciemny ]` |
| Tryb | `[ quiz / suwaki / hybryda ]` |
| Zadanie 1 — przejście quizu do kart | czas: `[ mm:ss ]` · zatrzymania: `[ przy których pytaniach ]` |
| Zadanie 2 — wybór telefonu i ujawnienie | czas: `[ mm:ss ]` · uwagi: `[ … ]` |
| Zadanie 3 — powrót i drugi wybór / historia | czas: `[ mm:ss ]` · uwagi: `[ … ]` |
| Pytania niejasne lub „nie wiem” | `[ identyfikatory pytań, np. B2, D4 ]` |
| Co zaskoczyło (pozytywnie / negatywnie) | `[ … ]` |

## 2. Odpowiedzi na 6 pytań po teście

1. Czy wiedziałaś, dlaczego dany telefon jest #1? `[ tak / częściowo / nie — dlaczego ]`
2. Czy brakowało jakiejś cechy na karcie? `[ … ]`
3. Czy procent dopasowania coś Ci mówił? `[ … ]`
4. Czy cena i link do sklepu były jasne? `[ … ]`
5. Czy chciałabyś wykluczyć jakąś markę na starcie? `[ … ]`
6. Czy kupiłabyś telefon z karty #1 bez dalszego szukania? `[ tak / nie — co jeszcze sprawdzić ]`

## 3. Kandydat do zakupu

| Pole | Wartość |
|---|---|
| **Kandydaci** (wg użytkownika, 16.11.2026) | **Motorola Edge 70 Fusion 12/256 GB**, **Samsung Galaxy A57 5G 8/256 GB**, **Xiaomi 15T 12/512 GB** — kolejność/karty `[ do uzupełnienia ]` |
| **Drugi wybór** | `[ który z trzech; karta # ]` |
| Powód wyboru (słowami użytkowniczki) | `[ … ]` |
| Dopasowanie na karcie | `[ % ]` |
| Cena i sklep widoczne przy wyborze | `[ … zł, sklep, data ceny ]` |

## 4. Decyzje (FP0-04 i bramka kandydata)

| ID | Decyzja | Wartość |
|---|---|---|
| FP0-04 | **Data planowanego zakupu** (≤ 5 dni → tylko FP1 przed zakupem; > 1 tydzień → FP1 → FP2 → FP3 → FP4 dla top 5) | `[ RRRR-MM-DD ]` |
| FP0-02 | Sesja wyeksportowana do `tests/fixtures/user-session.json` (Historia → Eksport → obiekt `sessions[i]`) | `[ tak / nie ]` |
| FP1-07 | Mi Band 6 — potwierdzona zgodność dla kandydata (Zepp Life / Mi Fitness, powiadomienia w tle) | `[ … ]` |

## 5. Weryfikacja przed zakupem (FP1-01) — kandydat i drugi wybór

Po sprawdzeniu wpisz do rekordu w `phones.json`: `reveal.verifiedForPurchaseAt: "RRRR-MM-DD"` oraz
`reveal.verifiedForPurchase: [ "wariant 8/256 GB zgodny ze stroną sklepu", "cena … zł (sklep …)", "promocja do …", "brak ładowarki w zestawie", "poprawki do MM.RRRR", "Mi Band 6: …" ]` — karta pokaże sekcję „Sprawdzone przed zakupem”.

**Wykonane 16.11.2026 (źródła: strony sklepów przez e-katalog/monitorpromocji, Ceneo, Komputronik, Media Expert, microsite Motoroli, 91mobiles):**

| Sprawdzenie | Edge 70 Fusion 12/256 | Galaxy A57 8/256 | Xiaomi 15T 12/512 |
|---|---|---|---|
| Wariant na stronie sklepu = `phones.json` | ✓ 12/256 GB | ✓ 8/256 GB (SM-A576B) | ✓ 12/512 GB — ale oferta **zakończona** |
| Cena w dniu sprawdzenia | 1658,12 zł (Allegro, promocja); **1899 zł** w x-kom / Media Expert / RTV Euro AGD / Media Markt | **1729 zł** sferis.pl; 1799 zł morele.net; 1829 zł x-kom | Komputronik 1999 zł: „produkt archiwalny — sprzedaż zakończona”; **12/512 od 2249,99 zł**, 12/256 od 2149 zł → **> 2000 zł** |
| Dostępność | Allegro: limit 1 szt.; sieci: dostępny | sferis: dostępny w 1 dzień | brak oferty ≤ 2000 zł |
| Gwarancja PL | Allegro X-KOM_PL (firma, 98,6% poleceń) — **gwarancja producenta nie podana w ofercie, zapytać**; sieci: standardowa | standardowa (sklep) | — |
| Sklep czy marketplace | Allegro = marketplace; alternatywa: sieci (oficjalna dystrybucja) | sklep | Allegro/Kaufland = marketplace |
| Koniec promocji / warunek | **30.11.2026**, limit 1 szt.; regularnie 1799-1899 zł | brak promocji czasowej | — |
| Ładowarka w zestawie | **nie** (68 W TurboPower osobno) | **nie** (45 W USB PD PPS osobno) | **nie** (67 W osobno) |
| Koniec poprawek bezpieczeństwa | 03.2031 (3 wersje + 5 lat) | 03.2032 (6 + 6) | 09.2031 (4 + 6) |
| Mi Band 6 | Zepp Life ✓ (wyłączyć Adaptive Battery dla aplikacji) | Zepp Life ✓ (dodać do „nieuśpionych”) | Zepp Life ✓ (autostart w HyperOS) |

**Wnioski:** (1) Galaxy A57 — zakup bez ryzyka cenowego. (2) Edge 70 Fusion — jeśli kupować z promocji Allegro, **przed 30.11** i po potwierdzeniu gwarancji producenta u sprzedawcy; w sieci 1899 zł to +241 zł. (3) **Xiaomi 15T w cenie ≤ 2000 zł już nie istnieje** — karta ostrzega „Ta oferta już nie jest dostępna”; do decyzji: zostawić rekord w puli (ostrzeżenie) czy nadać `status: over_budget` (zniknie z kart i rankingu).

## 6. Co poprawić — uwagi użytkowniczki przypisane do faz

| Uwaga | Faza / zadanie |
|---|---|
| `[ … ]` | `[ FP1-xx / FP2-xx / FP3-xx / FP5-xx ]` |

## 7. Zakup (FP6-01) i retro (FP6-02)

| Pole | Wartość |
|---|---|
| Data zakupu, model, cena, sklep | `[ … ]` |
| `npm run stale-prices` w dniu zakupu | `[ wynik ]` |
| Ocena trafności po 2 tygodniach (1-5) | `[ ]` |
| Czy coś zaskoczyło (cecha, której aplikacja nie pokazała) | `[ … ]` |
