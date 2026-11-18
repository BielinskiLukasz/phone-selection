# Plan 4 — opis odporności zgodny z tym, co liczymy

Najpierw przeczytaj `README.md` w tym katalogu (zasady wspólne).

## Problem

- `durability` opisano jako „Klasa IP, szkło, konstrukcja”, a grupę `longevity` jako „odporność na wodę
  i upadki”. Tymczasem `durabilityScore` (`src/data/scoringRules.ts`) liczy **wyłącznie** klasę IP oraz
  obecność normy MIL-STD. Szkło i konstrukcja nie wchodzą do oceny, a D2 pyta tylko o wodę.
- Użytkownik czytający opis (suwaki, opis grupy) spodziewa się czegoś, czego model nie mierzy.

## Decyzje (przyjęte)

- **Nie dodajemy pytania o upadki** („zostaw pytania”). Poprawiamy opisy tak, by odpowiadały modelowi.
- **Etykieta kryterium „Odporność” zostaje** — jest używana na kartach, w rankingu i w testach UI;
  zmiana etykiety to szerszy refaktor z ryzykiem dla `a11y-audit` i `ui-guard`.
- Nowe brzmienie: kryterium → „Klasa IP (woda i pył) oraz norma wojskowa MIL-STD, jeśli telefon ją ma.”;
  grupa → „Lata wsparcia oraz odporność na wodę i pył.”

## Pliki

- `src/data/criteria.ts` — `description` kryterium `durability` (l. 33) i grupy `longevity` (l. 62).
- `src/phone-template.json` — komentarze przy polach odporności (jeśli opisują szkło/konstrukcję jako
  część oceny, popraw).
- `planning/QUIZ-SPEC.md` i `planning/PROJECT.md` (ok. l. 163, szkic pytań: „odporność na wodę i upadki”)
  — dopisek o węższym znaczeniu.

## Kroki

1. `grep -rn "Klasa IP, szkło\|wodę i upadki\|upadki" src tests planning` — znajdź wszystkie wystąpienia
   (w tym w testach, które mogą porównywać opisy).
2. Sprawdź, gdzie wyświetla się `description` kryterium i grupy (`grep -rn "\.description" src/screens
   src/components src/features`), czy nowy tekst mieści się w układzie (suwaki, karty grup) i nie
   zawiera nazw marek (testy anonimowości) ani twardo zakodowanych kolorów.
3. Zmień opisy w `criteria.ts`; zaktualizuj dokumenty z kroku 1.
4. `npx tsc --noEmit`, `npx vitest run`; różnice względem bazy → `TESTY-DO-NAPRAWY.md`, „Plan 4”.
   Jeśli jakiś test porównuje stary opis, to jedyny spodziewany skutek.

## Testy do dopisania (sesja końcowa)

Brak (zmiana tekstowa). Opcjonalnie: test, że opis `durability` nie zawiera słów „szkło” i „upadk”,
żeby opis nie rozjechał się znowu z `durabilityScore`.

## Poza zakresem

Pytanie o upadki, zmiana `durabilityScore`, zmiana etykiety „Odporność”, nowe pole w `phones.json`.

Sugerowany komunikat: `docs(data): align durability description with scoring`
