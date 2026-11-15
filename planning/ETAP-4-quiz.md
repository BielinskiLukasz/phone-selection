# Etap 4 — Tryb quiz

**Cel:** pełne przejście quizu A-F i kroku G1 aż do wygenerowania rankingu, z zapisem postępu i wznawianiem.
**Zależności:** etapy 2 i 3.
**Dokumenty:** [QUIZ-SPEC.md](../specs/QUIZ-SPEC.md) (sekcje 1, 4, 5, 8), [UI-SPEC.md](../specs/UI-SPEC.md) (sekcje 3.1, 3.2, 8).

## Zakres

- **W zakresie:** ekran startowy z wyborem trybu (quiz aktywny, pozostałe tryby zaślepki), przepływ pytań, krok G1, pominięcia, wstecz, wznawianie, przekierowanie do kart.
- **Poza zakresem:** ekran kart (etap 6), suwaki (etap 5).

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E4-01 | `useQuizFlow(session)`: lista aktywnych pytań (z `appliesWhen`), indeks bieżącego, `next`, `prev`, licznik „n z N”, pierwsze pytanie bez odpowiedzi do wznowienia | logika przepływu |
| E4-02 | `QuestionScreen` + `OptionButton` (radiogroup, „Nie wiem / pomiń”, rozwijane „Dlaczego pytamy?”) | ekran pytania |
| E4-03 | `ProgressBar` i nagłówek bloku (nazwa bloku, licznik) | orientacja w quizie |
| E4-04 | Autozapis odpowiedzi i przejście po ok. 250 ms; wybór odznaczony po powrocie | płynność |
| E4-05 | `TopThreePicker` (krok G1): kafelki grup, numeracja 1-3, zdejmowanie, „Pomiń ten krok” | wybór trójki |
| E4-06 | Zakończenie: `computeRanking`, status sesji, przejście do `#/s/:id/cards` | ranking po quizie |
| E4-07 | Ekran Start: karta trybu Quiz tworzy sesję, baner „Wróć do rozpoczętego wyboru” | wejście i wznowienie |
| E4-08 | Ostrzeżenie „wynik mało spersonalizowany” przy większości odpowiedzi „pomiń” | zachowanie z QUIZ-SPEC 8 |
| E4-09 | Dostępność: fokus na nagłówku pytania po zmianie, obsługa klawiatury | zgodność z UI-SPEC 8 |
| E4-10 | Przegląd treści pytań z użytkownikiem i żoną (czytelność, ton) | zatwierdzony tekst |

## Testy akceptacyjne

1. **Gdy** przejdę quiz odpowiedziami persony „żona”, **to** trafiam do kart, a sesja ma 17 odpowiedzi i trójkę G1.
2. **Gdy** w połowie quizu odświeżę stronę i kliknę „Wznów”, **to** wracam do pierwszego pytania bez odpowiedzi.
3. **Gdy** kliknę „Wstecz”, **to** widzę wcześniej wybraną odpowiedź podświetloną i mogę ją zmienić.
4. **Gdy** w puli nie ma telefonu ze slotem microSD, **to** pytanie C3 nie jest zadawane i nie liczy się w „n z N”.
5. **Gdy** pominę krok G1, **to** ranking liczy się bez trójki (ważności grup ze wzoru dla grup poza trójką).
6. **Gdy** odpowiem „pomiń” na wszystkie pytania, **to** zobaczę ostrzeżenie o mało spersonalizowanym wyniku.
7. **Gdy** użyję tylko klawiatury, **to** przejdę cały quiz (strzałki i spacja wybierają odpowiedź).

## Ryzyka i otwarte pytania

- **Treść pytań** to największe ryzyko jakości: źle sformułowane pytanie daje złą wagę. Etap kończy przegląd z żoną (E4-10).
- Automatyczne przejście po wyborze może przeszkadzać osobom wolniej czytającym: opcja wyłączenia (do rozważenia po testach).
- Długość (17 pytań) może zniechęcać: sprawdzamy w teście użyteczności (etap 9).

## Definicja ukończenia

Quiz od Startu do tworzenia rankingu działa na telefonie i komputerze, postęp przetrwa odświeżenie, testy akceptacyjne 1-7 zielone.
