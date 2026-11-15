# Etap 9 — Pełny ranking, szlify i wydanie

**Cel:** ostatnie funkcje, kalibracja rankingu na prawdziwych danych, odświeżenie cen, test z użytkowniczką i wydanie.
**Zależności:** etapy 1-8.
**Dokumenty:** [QUIZ-SPEC.md](../specs/QUIZ-SPEC.md) (sekcje 2.6, 9, 10), [UI-SPEC.md](../specs/UI-SPEC.md) (sekcja 3.6), [PROJECT.md](../../PROJECT.md) (sekcje 13, 14).

## Zakres

- **W zakresie:** ekran pełnego rankingu, kalibracja, odświeżenie danych, test użyteczności, polish, wydanie i instrukcja aktualizacji cen.
- **Poza zakresem:** nowe tryby i funkcje.

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E9-01 | Ekran `#/s/:id/ranking`: wszystkie telefony z pul z nazwami, dopasowaniem, ceną, odznakami wyborów, mini-paskami grup, rozwijaniem szczegółów | pełny ranking |
| E9-02 | Przycisk „Pokaż pełny ranking” widoczny dopiero po pierwszym wyborze (połączenie z E6-08) | zgodność z decyzją produktową |
| E9-03 | **Kalibracja:** przegląd `BLEND`, ważności grup i sposobu pokazywania procentu na personach i na kilku realnych zestawach odpowiedzi; zapis wniosków w QUIZ-SPEC | zatwierdzone parametry |
| E9-04 | **Odświeżenie danych:** ceny i linki (data ≤ 7 dni przed wydaniem), potwierdzenie modelu Realme 16 Pro+ (nazwa na stronie oferty), uzupełnienie braków z `scoresEstimatedNeutral` (lata aktualizacji, klasa IP, ładowanie Xiaomi 15T i Realme) | świeże, kompletne dane |
| E9-05 | Skrypt `npm run stale-prices`: lista telefonów z ceną starszą niż 7 dni | wsparcie utrzymania |
| E9-06 | Test użyteczności z użytkowniczką: trzy zadania (przejdź quiz, wybierz telefon, wróć i wybierz drugi), obserwacja, lista poprawek | raport z testu |
| E9-07 | Poprawki po teście (treść pytań, układ, długość quizu) | wersja po testach |
| E9-08 | Meta i drobiazgi: tytuł, opis, ikona, `noscript`, komunikat o dacie danych w stopce | gotowy produkt |
| E9-09 | Lista kontrolna wydania i instrukcja aktualizacji cen (edycja JSON → `validate-data` → push) w README | proces utrzymania |
| E9-10 | Wydanie (tag, wdrożenie, sprawdzenie adresu Pages na telefonie) | wersja 1.0 |

## Testy akceptacyjne

1. **Gdy** po wyborze kliknę „Pokaż pełny ranking”, **to** widzę wszystkie telefony z pul z nazwami i odznakami moich wyborów.
2. **Gdy** uruchomię `validate-data` w dniu wydania, **to** nie ma ostrzeżeń o starych cenach (≤ 7 dni).
3. **Gdy** użytkowniczka wykona trzy zadania z E9-06, **to** kończy je bez pomocy w czasie do ok. 10 minut, a uwagi są zapisane.
4. **Gdy** otworzę stronę na telefonie z Pages, **to** pierwszy ekran ładuje się poprawnie, a motyw i odpowiedzi działają.
5. **Gdy** przejdę lista kontrolna wydania, **to** wszystkie pozycje są odhaczone.

## Ryzyka i otwarte pytania

- Dane o cenach starzeją się szybko: po wydaniu każda zmiana ceny to edycja JSON i ponowne wdrożenie (instrukcja w README).
- Edge 70 Fusion ma promocję do 30.11.2026 z limitem sztuk: przed wydaniem trzeba potwierdzić, że oferta jeszcze trwa.
- Braki w ocenach kamer o pewności `low` (Xiaomi 15T, Realme, Redmi) mogą wymagać dodatkowych testów niezależnych.

## Definicja ukończenia

Wydana wersja 1.0 z odświeżonymi danymi, przetestowana z użytkowniczką, z udokumentowanym procesem aktualizacji cen.
