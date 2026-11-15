# Etap 6 — Ranking, anonimowe karty, wybór i ujawnienie

**Cel:** serce aplikacji: trzy anonimowe karty, wybór z potwierdzeniem, ujawnienie nazwy i linku, wielokrotny wybór z numeracją.
**Zależności:** etapy 2, 3, 4 (lub 5) oraz dane z etapu 0.
**Dokumenty:** [UI-SPEC.md](../specs/UI-SPEC.md) (sekcje 3.4, 3.5, 4, 8, 9, 10), [QUIZ-SPEC.md](../specs/QUIZ-SPEC.md) (sekcje 2.5, 8), [PROJECT.md](../../PROJECT.md) (sekcja 8).

## Zakres

- **W zakresie:** ekran kart, karta anonimowa, rozwijane szczegóły, okno potwierdzenia, karta odsłonięta, plakietki „Wybór n/m”, etykiety (powyżej budżetu, remis), baner starych cen, „Zmień odpowiedzi”, „Zacznij od nowa”.
- **Poza zakresem:** pełny ranking (etap 9), historia (etap 7).

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E6-01 | Ekran `#/s/:id/cards`: pobranie rankingu z sesji (snapshot) lub przeliczenie, układ 1 kolumna / 3 kolumny | ekran kart |
| E6-02 | `PhoneCardAnon`: nagłówek „Propozycja #n”, dopasowanie, cena z datą, sześć wierszy cech, przycisk wyboru | karta |
| E6-03 | `DetailsAccordion` + `ScoreBar` + `ConfidenceIcon`: oceny kryteriów, uzasadnienia, pełne dane | szczegóły |
| E6-04 | Etykiety: „Powyżej budżetu o X zł”, „Praktyczny remis z #m”, „brak danych” | zgodność z QUIZ-SPEC 2.5 |
| E6-05 | `ConfirmSheet`: potwierdzenie wyboru, pułapka fokusu, Esc | bezpieczny wybór |
| E6-06 | `PhoneCardRevealed`: nazwa, marka, linki do sklepów (`rel="noopener noreferrer"`), cena z datą, plakietka „Wybór n/m” | ujawnienie |
| E6-07 | Wielokrotny wybór: `addPick`, `useReveal`, pozostałe karty anonimowe | logika 1/2, 2/2 |
| E6-08 | Przyciski dolne: Zacznij od nowa (nowa sesja), Zmień odpowiedzi, Pokaż pełny ranking (po pierwszym wyborze, ekran w etapie 9) | nawigacja |
| E6-09 | Baner „Ceny mogą być nieaktualne” gdy najstarsza `checkedAt` > 30 dni | ostrzeżenie |
| E6-10 | (Opcjonalnie) dane ujawniane (`reveal`) w osobnym pliku `reveal.json` ładowanym dopiero przy wyborze; reszta aplikacji nie zawiera nazw | silniejsza anonimowość |
| E6-11 | Test wycieku w DOM: przeszukanie drzewa DOM, atrybutów (`alt`, `title`, `aria-*`, `data-*`), `document.title` i hasha adresu | brak nazw przed wyborem |

## Testy akceptacyjne

1. **Gdy** wejdę na ekran kart przed wyborem, **to** w DOM, atrybutach, tytule dokumentu i adresie nie ma żadnej nazwy ani marki telefonu z puli.
2. **Gdy** wybiorę kartę #2 i potwierdzę, **to** widzę jej nazwę, linki do sklepów i plakietkę „Wybór 1/1”, a karty #1 i #3 pozostają anonimowe.
3. **Gdy** następnie wybiorę kartę #1, **to** karta #2 pokazuje „Wybór 1/2”, karta #1 „Wybór 2/2”.
4. **Gdy** odświeżę stronę po wyborach, **to** odsłonięte karty pozostają odsłonięte z tymi samymi numerami.
5. **Gdy** kliknę „Wróć” w oknie potwierdzenia, **to** nic się nie odsłania.
6. **Gdy** budżet to 1500 zł, **to** trzecia karta ma etykietę „Powyżej budżetu o X zł”.
7. **Gdy** `checkedAt` cen jest starsze niż 30 dni, **to** widzę baner o możliwej nieaktualności cen.
8. **Gdy** kliknę „Zacznij od nowa”, **to** powstaje nowa sesja, a poprzednia zostaje w historii.

## Ryzyka i otwarte pytania

- **Anonimowość jest na poziomie interfejsu.** Dopóki nazwy są w pliku danych dostarczanym do przeglądarki, osoba z narzędziami deweloperskimi je zobaczy. Dla zastosowania rodzinnego to akceptowalne; E6-10 (osobny `reveal.json`) wzmacnia ochronę za niewielki koszt. Decyzja do podjęcia na początku etapu.
- Linki do sklepów mogą wygasać; w danych trzymamy datę i ogólną informację, a użytkownik widzi „Cena orientacyjna”.
- Karty dla puli < 3 telefonów (UI-SPEC 10).

## Definicja ukończenia

Testy akceptacyjne 1-8 zielone, w tym test wycieku nazw; przejście persony „żona” od Startu do ujawnienia działa bez błędów.
