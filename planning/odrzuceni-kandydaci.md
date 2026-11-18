# Odrzuceni kandydaci (usunięci z `phones.json`)

Szkice kandydatów (`unverified` / `needs_confirmation`, bez `variant`/`specs`/`price`/`scores`/`basis`), usunięte z `src/data/phones.json` 18.11.2026, żeby bramka wydania (`tests/release-guard.test.ts`) przechodziła. Poniżej pełne notatki weryfikacyjne z 18.11.2026 — jeśli któryś model wróci do sprzedaży w Polsce, zacznij od nich i dodaj rekord od nowa wg `src/phone-template.json`. Ceny przy linkach to wartości z szkicu (niezweryfikowane).

Nic nie zmienia się w rankingu: silnik i tak ignorował niekompletne rekordy (pula nadal 24 modele).

## Wariant niepotwierdzony (`needs_confirmation`)

### Samsung Galaxy XCover 8 Pro 8/128 GB — `galaxy-xcover-8-pro-8-128`

- Marka / model: Samsung / Galaxy XCover 8 Pro 8/128 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-samsung+galaxy+xcover+8+pro
- Link: ceneo.pl (compare), cena ze szkicu: 2699 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-samsung+galaxy+xcover+8+pro

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Galaxy XCover 8 Pro nie istnieje jako produkt: Samsung nigdy go nie ogłosił ani nie wprowadził do sprzedaży w Polsce. Nazwa 'XCover8 Pro' pochodzi wyłącznie z przecieków z lat 2024-2025 (certyfikat baterii BIS EB-BG766GBY, certyfikat TUV Rheinland, wpis Geekbench) dla numeru modelu SM-G766B. Samsung oficjalnie wprowadził ten sam numer SM-G766B jako Galaxy XCover7 Pro (polska strona Samsunga: 'Galaxy XCover7 Pro Black 128 GB', SM-G766BZKDEEE, 6 GB RAM + 128 GB, status 'Produkt niedostępny'; komunikat prasowy Samsung Polska z 14.04.2025: 6 GB + 1

### Oppo Reno 16 Pro 5G 12/256 GB — `oppo-reno-16-pro-5g-12-256`

- Marka / model: Oppo / Reno 16 Pro 5G 12/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-oppo+reno+16+pro
- Link: ceneo.pl (compare), cena ze szkicu: 2899 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-oppo+reno+16+pro

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Model Reno16 Pro 5G istnieje i jest sprzedawany w Polsce (premiera PL 17.08.2026, regularna sprzedaż od 27.08.2026), ale WYŁĄCZNIE w wariancie 12 GB + 512 GB (UFS 3.1) za 3799 zł (cena regularna). Wariant 12/256 GB nie jest oferowany w Polsce: oficjalna strona producenta PL, CHIP, Tabletowo i gsmonline wymieniają tylko 12/512 GB, a na otwartej stronie Ceneo są wyłącznie oferty 12/512 GB (Czarny od 3505 zł, Biały od 3693 zł); selektor wariantów Ceneo zawiera opcję 256 GB, ale bez żadnej oferty 12/256. Agregatory (91mobiles, mysmartprice) wymieni

### HMD Skyline 2 8/256 GB — `hmd-skyline-2-8-256`

- Marka / model: HMD / Skyline 2 8/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-hmd+skyline+2
- Link: ceneo.pl (compare), cena ze szkicu: 1999 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-hmd+skyline+2

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Model HMD Skyline 2 nie został oficjalnie zapowiedziany ani wprowadzony do sprzedaży. gsmManiaK.pl (10.07.2026) opisuje wyłącznie przecieki (autor pisze, że nie wiadomo, czy model w ogóle się ukaże), Notebookcheck (publikacja 05.07.2026, aktualizacja 05.10.2026) podaje 'no official confirmation yet' i spodziewany start w 2026 bez daty. Polska strona producenta (hmd.com/pl_pl/smartphones, pobrana dziś) nie zawiera Skyline 2 (jest jedynie podstrona oryginalnego Skyline), Ceneo na zapytanie 'hmd skyline 2' zwraca wyłącznie oryginalnego Skyline (m.

### Huawei Nova 13 Pro 12/512 GB — `huawei-nova-13-pro-12-512`

- Marka / model: Huawei / Nova 13 Pro 12/512 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-huawei+nova+13+pro
- Link: ceneo.pl (compare), cena ze szkicu: 2399 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-huawei+nova+13+pro

  > Weryfikacja 2026-11-18: brak zweryfikowanej oferty w PL; Otwarte i sprawdzone dziś: MediaMarkt 1488413 - 'PRODUKT PO EKSPOZYCJI', 2199 zł, może pochodzić z ekspozycji lub zwrotu (nie nowy, pominięty jako cena); x-kom 1311802 - 'Produkt wycofany', bez ceny; Komputronik 949103 - 'Produkt archiwalny - sprzedaż zakończona', 2999 zł; Morele 14629057 - brak ceny, 'Powiadom mnie o dostępności'; Ceneo 179942326 - 'Aktualnie brak ofert', ostatnia cena 2199 zł (bez daty); mGSM - tylko egzemplarz po ekspozycji 2199 zł. Strony Avans, Media Expert, Euro, Electro, Allegro i Monitor Promocji zwracają 403 dla

## Brak zweryfikowanej oferty lub wariantu (`unverified`)

### Google Pixel 9 8/128 GB — `pixel-9-8-128`

- Marka / model: Google / Pixel 9 8/128 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-google+pixel+9+128gb
- Link: ceneo.pl (compare), cena ze szkicu: 2700 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-google+pixel+9+128gb

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Wariant 8/128 GB NIE istnieje. Pixel 9 (model podstawowy) ma w Polsce zawsze 12 GB RAM i jest sprzedawany w dwóch wersjach pamięci: 12/128 GB oraz 12/256 GB (PurePC: ceny premierowe 4049 zł i 4499 zł; x-kom, Komputronik, MediaMarkt, Empik: 12/128 GB). Wariant 8/128 GB dotyczy Pixela 9a (inny model). Dossier opisuje Pixela 9 12/128 GB; id i modelName z placeholdera nie zostały zmienione.

### CMF Phone 2 Pro 8/256 GB — `cmf-phone-2-pro-8-256`

- Marka / model: CMF / Phone 2 Pro 8/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-cmf+phone+2+pro+8%2F256
- Link: ceneo.pl (compare), cena ze szkicu: 1100 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-cmf+phone+2+pro+8%2F256

  > Weryfikacja 2026-11-18: brak zweryfikowanej oferty w PL; Jedyny polski sprzedawca wariantu 8/256 GB to oficjalny sklep pl.nothing.tech (dane wariantu 'White / 8+256GB' = 1099,0 PLN w danych strony). Strona produktu 2026-11-18: 'Sold out' + 'Notify me'; dane strukturalne strony (Shopify) pokazują availableForSale=false dla wszystkich 8 wariantów kolor/pamięć, w tym 8+256GB w kolorach Black, White, Light Green i Orange (każdy 1099,0 PLN). Brak oferty telefonu w x-kom i morele (wyszukiwarki zwracają tylko akcesoria), brak telefonu w wynikach Ceneo. Allegro/mediaexpert/euro zwróciły 403 - niespraw

### OnePlus 13R 12/256 GB — `oneplus-13r-12-256`

- Marka / model: OnePlus / 13R 12/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-oneplus+13r+12%2F256
- Link: ceneo.pl (compare), cena ze szkicu: 2500 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-oneplus+13r+12%2F256

  > Weryfikacja 2026-11-18: brak zweryfikowanej oferty w PL; 2026-11-18: x-kom.pl (strona produktu 1297575): „Produkt wycofany”, bez ceny; Ceneo (wyszukiwanie smartfonów i akcesoriów): w ofercie są tylko akcesoria do 13R, brak telefonu; morele.net i komputronik.pl: brak telefonu w wynikach wyszukiwania; mediaexpert.pl, euro.com.pl, oleole.pl, allegro.pl: blokada dla automatu (nie sprawdzono). Jedyna otwarta oferta telefonu: MediaMarkt Marketplace (Foxway PL) — produkt ODNOWIONY „Jak nowy”, 2019 zł (nie jest nowy, więc nie jest ceną). Wcześniejsze ceny rynkowe nowego egzemplarza (nieaktualne): Komp

### Sony Xperia 10 VII 8/128 GB — `sony-xperia-10-vii-8-128`

- Marka / model: Sony / Xperia 10 VII 8/128 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-sony+xperia+10+vii
- Link: ceneo.pl (compare), cena ze szkicu: 1900 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-sony+xperia+10+vii

  > Weryfikacja 2026-11-18: brak zweryfikowanej oferty w PL; Sprawdzono dziś: Ceneo (produkty 193595862 biały i 193426460 czarny): 'Aktualnie brak ofert tego produktu' (Oferty 0); Morele (biały, XQFE54EUKCW.GC): w danych strony cena 2795,71 zł, ale availability = OutOfStock/'niedostępny' (nie jest to oferta do kupienia); Amazon.pl (B0FPDGZ18N biały, B0FPDFGFLZ czarny): 'Przedmiot jest obecnie niedostępny'. Sony PL (sony.pl) odrzuca klientów automatycznych (HTTP 403), x-kom/euro/mediaexpert/komputronik również 403 — nie sprawdzono. Cena premierowa 1999 zł (Telepolis, PurePC) jest historyczna. Ofert

### Oppo Reno 14 5G 12/256 GB — `oppo-reno-14-5g-12-256`

- Marka / model: Oppo / Reno 14 5G 12/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-oppo+reno+14+5g+12%2F256
- Link: ceneo.pl (compare), cena ze szkicu: 2300 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-oppo+reno+14+5g+12%2F256

  > Weryfikacja 2026-11-18: brak zweryfikowanej oferty w PL; Strony x-kom, Media Expert, Neonet, euro.com.pl, mediamarkt.pl zwracaly 403/410/brak ceny dla klienta automatycznego albo oznaczaly produkt jako wycofany, a strona producenta nie pokazuje ceny, wiec nie ma oferty ze sklepu, ktora dalo sie otworzyc i potwierdzic. Otwarte strony Ceneo pokazuja wylacznie oferty Allegro bez nazwy sprzedawcy i bez potwierdzenia stanu 'nowy' (Biały 2499,00 zl; Zielony 2033,28 zl). Z wyszukiwarki (NIEOTWARTE przez badacza, tylko fragmenty wynikow): Media Expert i Neonet ok. 2499 zl (Biały), euro.com.pl i Komput

### vivo V60 5G 12/256 GB — `vivo-v60-5g-12-256`

- Marka / model: vivo / V60 5G 12/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-vivo+v60+5g+12%2F256
- Link: ceneo.pl (compare), cena ze szkicu: 2200 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-vivo+v60+5g+12%2F256

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: vivo V60 5G (Snapdragon 7 Gen 4) NIE jest oficjalnie sprzedawany w Polsce ani w UE: oficjalne strony vivo PL i EU wymieniają w serii V tylko V70 Lite 5G, V70 i V70 FE (bez V60), Ceneo nie ma żadnego telefonu V60 5G (jest tylko V60 Lite 5G 8/256 GB oraz akcesoria), a polskie media (gsmManiaK, gsmonline) opisywały V60 wyłącznie jako premierę indyjską z własnymi spekulacjami o cenie ok. 2100-2500 zł - bez oficjalnej zapowiedzi dla Polski. W Polsce sprzedawany był inny model: vivo V60 Lite 5G (Dimensity 7360 Turbo, 8/256 GB, 6500 mAh, 1499 zł) - ni

### Infinix GT 30 Pro 12/256 GB — `infinix-gt-30-pro-12-256`

- Marka / model: Infinix / GT 30 Pro 12/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-infinix+gt+30+pro
- Link: ceneo.pl (compare), cena ze szkicu: 1500 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-infinix+gt+30+pro

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Model Infinix GT 30 Pro (X6873) istnieje globalnie, a wariant 12/256 GB jest podstawowym wariantem z premiery (Notebookcheck; dostępne też 8/256 i 12/512 GB wg GSMManiak/mGSM), ale NIE znaleziono dowodu sprzedaży w Polsce: Ceneo, x-kom i morele nie zwracają żadnego telefonu GT 30 Pro (tylko akcesoria lub brak wyników), katalog mGSM.pl: 'Brak informacji o cenach' i 'Nie znaleziono produktu' w sklepach, GSMManiak (21.05.2025) nie potwierdza dostępności w Polsce, a karta EPREL (nr 2499730) ma pustą listę państw EOG, w których model jest dostępny (

### Infinix Zero 50 Pro 5G 12/512 GB — `infinix-zero-50-pro-5g-12-512`

- Marka / model: Infinix / Zero 50 Pro 5G 12/512 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-infinix+zero+50+pro
- Link: ceneo.pl (compare), cena ze szkicu: 1799 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-infinix+zero+50+pro

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Nie znaleziono żadnego potwierdzenia, że model 'Infinix Zero 50 Pro 5G' istnieje (ani w wariancie 12/512 GB, ani innym). Wyszukiwanie 'Infinix Zero 50 Pro' zwraca tylko 'Zero 50 5G' (bez 'Pro'), który wg Smartprix jest plotką niepotwierdzoną przez wiarygodne źródła (agregatory podają sprzeczne dane: Dimensity 8300, 5500 mAh vs 5000 mAh/88 W, premiera od grudnia 2025 do 2026+). Ceneo: brak wyników dla 'infinix zero 50' (Brak wyników dla frazy wyszukania); polskie portale (gsmmaniak, telepolis, tabletowo, antyweb) nie opisują Zero 50 ani Zero 50 

### Asus ROG Phone 8 12/256 GB — `asus-rog-phone-8-12-256`

- Marka / model: Asus / ROG Phone 8 12/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-asus+rog+phone+8+12%2F256
- Link: ceneo.pl (compare), cena ze szkicu: 2999 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-asus+rog+phone+8+12%2F256

  > Weryfikacja 2026-11-18: brak zweryfikowanej oferty w PL; x-kom.pl (1211268): 'Produkt wycofany', bez ceny; komputronik.pl: 4999 zl, 'Produkt archiwalny - sprzedaz zakonczona'; allmar.com.pl: 2999 zl, 'Brak w magazynie', kraj wysylki Hiszpania; Ceneo 162717924 (czarny): 'Aktualnie brak ofert'; Ceneo 166462132 (szary): jedna oferta amazon.pl 5367,80 zl, ale tytul oferty na Ceneo nie pasuje do telefonu (opis dywanikow) i nie udalo sie otworzyc strony oferty - niezweryfikowana. Mediaexpert i Allegro zwracaja HTTP 403 dla automatu - nie otwarte (w wynikach wyszukiwarki widoczne fragmenty 2820 zl na

### Tecno Phantom V Flip 2 8/256 GB — `tecno-phantom-v-flip-2-8-256`

- Marka / model: Tecno / Phantom V Flip 2 8/256 GB
- Porównywarka: https://www.ceneo.pl/;szukaj-tecno+phantom+v+flip+2
- Link: ceneo.pl (compare), cena ze szkicu: 2499 zł, sprawdzono: brak — https://www.ceneo.pl/;szukaj-tecno+phantom+v+flip+2

  > Weryfikacja 2026-11-18: wariant nie potwierdzony: Globalny model ma wariant 8/256 GB (plus 8 GB pamięci wirtualnej wg producenta), ale nie znaleziono dowodu sprzedaży w Polsce. Polska strona producenta (tecno-mobile.com/pl) nie ma serii Phantom na liście smartfonów (tylko Spark, Pova, Camon, Pop). Notebookcheck podaje regiony sprzedaży: Afryka, Azja Południowo-Wschodnia, Bliski Wschód, Ameryka Łacińska i inne niewymienione - nie Europa. Ceneo i Morele pokazują wyłącznie akcesoria do tego modelu, nie telefon; Komorkomat: brak ceny/dostępności. Telepolis (09.2024) pisał jedynie, że telefon 'praw
