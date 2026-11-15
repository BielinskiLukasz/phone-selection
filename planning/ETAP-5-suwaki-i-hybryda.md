# Etap 5 — Tryb suwaków i hybryda

**Cel:** dwa pozostałe tryby wyboru, kończące się tym samym kształtem danych sesji co quiz.
**Zależności:** etapy 2, 3, 4 (krótki quiz korzysta z przepływu z etapu 4).
**Dokumenty:** [QUIZ-SPEC.md](../specs/QUIZ-SPEC.md) (sekcje 5, 6, 7), [UI-SPEC.md](../specs/UI-SPEC.md) (sekcja 3.3).

## Zakres

- **W zakresie:** suwaki grup i kryteriów, panel filtrów, licznik puli na żywo, ekran dostrojenia, krótki quiz w hybrydzie, flaga ręcznej korekty.
- **Poza zakresem:** zmiany algorytmu (tylko korzystamy z `lib`).

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E5-01 | `GroupSlider`: suwak 0-5 z etykietą tekstową („3 z 5, ważne”), `aria-valuetext` | komponent suwaka |
| E5-02 | `CriterionSliders`: rozwijane suwaki kryteriów w grupie (ustawiają udziały w grupie) | szczegółowe wagi |
| E5-03 | `FilterPanel`: budżet (1500/1800/2000) i pamięć (dowolna / min. 256 GB) | filtry sesji |
| E5-04 | Licznik „Pasuje X z 10 telefonów” z `countPool`, `aria-live` | informacja zwrotna |
| E5-05 | Ekran Suwaki: startowo neutralne wartości (grupy 2, kryteria 2), przycisk „Pokaż wyniki” → `computeRanking` | tryb suwaków |
| E5-06 | Hybryda: krótki quiz (pytania z `inShortQuiz` + G1) i przejście do ekranu Dostrojenie | przepływ hybrydowy |
| E5-07 | Dostrojenie: wartości wyliczone z odpowiedzi, plakietka „Wyliczone z Twoich odpowiedzi”, `manualOverride`, **Przywróć wyliczone** | korekta ręczna |
| E5-08 | Zapis: ręczne wartości w `Session.weights`/`groupImportance` z flagą, ranking z nich | spójny model sesji |
| E5-09 | Ekran Start: aktywacja kart trybów Suwaki i Quiz + suwaki | wszystkie tryby dostępne |

## Testy akceptacyjne

1. **Gdy** ustawię w suwakach ważność „Bateria” 5, a pozostałych 0, **to** ranking jest równoważny rankingowi z silnika dla takich wag.
2. **Gdy** zmienię filtr budżetu na 1500 zł, **to** licznik pokazuje liczbę telefonów w budżecie i komunikat o uzupełnieniu powyżej budżetu.
3. **Gdy** przejdę krótki quiz, **to** suwaki Dostrojenia mają wartości identyczne z wyliczonymi przez silnik z tych samych odpowiedzi.
4. **Gdy** ręcznie zmienię suwak i kliknę **Przywróć wyliczone**, **to** wartości wracają do wyliczonych, a flaga `manualOverride` znika.
5. **Gdy** ukończę każdy z trzech trybów, **to** sesja ma ten sam kształt (`weights`, `groupImportance`, `filters`, `ranking`).
6. **Gdy** użyję tylko klawiatury, **to** obsłużę suwaki strzałkami.

## Ryzyka i otwarte pytania

- Suwaki w trybie dotykowym są trudne do precyzyjnego ustawienia: dla grup używamy skali 0-5 z krokiem 1 i dużą powierzchnią dotyku.
- Różnica semantyczna: suwak grupy ustawia `G_g`, nie średnią wag kryteriów; opis w interfejsie musi to jasno komunikować („Jak ważna jest ta rzecz?”).

## Definicja ukończenia

Trzy tryby prowadzą do kart z tym samym modelem danych; testy akceptacyjne 1-6 zielone.
