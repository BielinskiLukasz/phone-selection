# Etap 8 — Motywy, mobile, dostępność

**Cel:** dopracowany wygląd w dwóch motywach, komfort na telefonie i dostępność.
**Zależności:** etapy 4-7 (ekrany istnieją).
**Dokumenty:** [UI-SPEC.md](../specs/UI-SPEC.md) (sekcje 6, 7, 8, 10), [PROJECT.md](../../PROJECT.md) (sekcja 10).

## Zakres

- **W zakresie:** tokeny i style obu motywów, przycisk przełączania, zapamiętanie wyboru, korekty układu na szerokościach 360-1280 px, audyt dostępności, stany krańcowe.
- **Poza zakresem:** nowe funkcje.

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E8-01 | Tokeny w `@theme` i nadpisania w `[data-theme="dark"]` zgodnie z UI-SPEC 6; wariant `dark` Tailwinda na atrybut | dwa zestawy tokenów |
| E8-02 | `ThemeToggle`: ikona słońce/księżyc, `aria-label`, zapis w stanie (etap 3), ustawienie atrybutu przed pierwszym renderem (brak „mignięcia”) | przełącznik |
| E8-03 | Przejście wszystkich komponentów na tokeny (zero stałych kolorów w komponentach) | spójność |
| E8-04 | Motyw jasny: duże zaokrąglenia, luźne odstępy, miękkie cienie | „prosty, przyjazny” |
| E8-05 | Motyw ciemny: małe zaokrąglenia, wyraźne ramki, gęstsze odstępy, liczby i etykiety w monospace, paski ocen widoczne od razu | „złożony, surowy” |
| E8-06 | Przegląd układu na 360, 390, 430, 768, 1024, 1280 px; pasek przycisków przyklejony do dołu z `safe-area-inset-bottom` | brak przewijania poziomego |
| E8-07 | Audyt dostępności: kontrast, fokus, `radiogroup`, `aria-valuetext`, `aria-live`, pułapka fokusu w oknie potwierdzenia, `prefers-reduced-motion` | zgodność z UI-SPEC 8 |
| E8-08 | Stany krańcowe z UI-SPEC 10 (brak zapisu, uszkodzone dane, `noscript`, pula 0/1/2) | odporność |
| E8-09 | Ikony cech (bateria, aparat, pamięć, aktualizacje, odporność, ekran) jako inline SVG | zestaw ikon bez zależności |

## Testy akceptacyjne

1. **Gdy** kliknę ikonę motywu, **to** zmienia się cały interfejs, a po odświeżeniu motyw jest zapamiętany i nie ma „mignięcia” innym motywem.
2. **Gdy** otworzę każdy ekran w szerokości 360 px, **to** nie ma przewijania poziomego.
3. **Gdy** uruchomię automatyczny audyt dostępności (np. axe) na każdym ekranie w obu motywach, **to** brak błędów poziomu poważnego i krytycznego.
4. **Gdy** użyję samej klawiatury, **to** przejdę cały proces (od Startu do ujawnienia) z widocznym fokusem.
5. **Gdy** włączę ograniczenie ruchu w systemie, **to** animacje ujawnienia i przejść są wyłączone.
6. **Gdy** sprawdzę kontrast tekstów, **to** w obu motywach wynosi co najmniej 4,5:1.

## Ryzyka i otwarte pytania

- Interpretacja motywu ciemnego („złożony, surowy”): decyzja robocza w UI-SPEC 6, do potwierdzenia przez użytkownika przed E8-05.
- Mignięcie motywu przy starcie wymaga ustawienia atrybutu w `index.html` zanim załaduje się React.

## Definicja ukończenia

Testy akceptacyjne 1-6 zielone; przegląd wizualny obu motywów zatwierdzony przez użytkownika.
