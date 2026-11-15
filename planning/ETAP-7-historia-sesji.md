# Etap 7 — Historia sesji i wznawianie

**Cel:** przegląd poprzednich wyborów, wznawianie nieukończonych quizów, usuwanie; opcjonalnie przenoszenie na drugie urządzenie.
**Zależności:** etapy 3, 4, 6.
**Dokumenty:** [UI-SPEC.md](../specs/UI-SPEC.md) (sekcja 3.7), [PROJECT.md](../../PROJECT.md) (sekcja 9).

## Zakres

- **W zakresie:** ekran historii, podgląd ukończonych sesji z snapshotu, wznawianie, usuwanie z potwierdzeniem, nowa sesja bez utraty starych.
- **Opcjonalnie (na końcu etapu):** link do wznowienia i eksport/import historii do pliku.

## Zadania

| ID | Zadanie | Wynik |
|---|---|---|
| E7-01 | Ekran `#/history`: lista sesji od najnowszej (`SessionListItem`): data, tryb, status, postęp, „Wybrano: …” | przegląd |
| E7-02 | **Wznów**: otwiera quiz na pierwszym pytaniu bez odpowiedzi albo suwaki z zapisanymi wartościami | wznawianie |
| E7-03 | **Podgląd**: karty z snapshotu rankingu (z odsłoniętymi wyborami); informacja „dane z dnia …” | podgląd stały w czasie |
| E7-04 | **Usuń** z potwierdzeniem; stan pusty z przyciskiem Start | zarządzanie |
| E7-05 | Start nowej sesji nie zmienia ani nie usuwa starych | nowa sesja |
| E7-06 | (Opcja) Link do wznowienia `#/r/<kod>`: kod = odpowiedzi i trójka G1 w base64url z numerem wersji; otwarcie tworzy nową sesję z tymi odpowiedziami i **przelicza ranking aktualnymi danymi** | przenoszenie między urządzeniami |
| E7-07 | (Opcja) Eksport i import historii jako plik JSON (z walidacją i scalaniem bez duplikatów) | kopia zapasowa |

## Testy akceptacyjne

1. **Gdy** utworzę trzy sesje (jedna nieukończona), **to** lista pokazuje je w odpowiedniej kolejności z właściwymi statusami.
2. **Gdy** wznowię nieukończoną sesję, **to** trafiam na pierwsze pytanie bez odpowiedzi.
3. **Gdy** otworzę podgląd ukończonej sesji po zmianie `phones.json`, **to** widzę karty z dnia zapisu, a nie nowy ranking.
4. **Gdy** usunę sesję i potwierdzę, **to** znika z listy i z `localStorage`.
5. **Gdy** (E7-06) otworzę link wygenerowany na innym urządzeniu, **to** powstaje nowa sesja z tymi samymi odpowiedziami.
6. **Gdy** (E7-07) zaimportuję plik z tą samą sesją, **to** nie powstaje duplikat.

## Ryzyka i otwarte pytania

- Link do wznowienia i eksport są **opcjonalne**: decyzja, czy robimy je w MVP, zapada przed etapem (PROJECT.md 14, punkt 2).
- Kod w linku zawiera tylko odpowiedzi (bez danych osobowych); nie dołączamy wyborów, bo odkrywałyby nazwy.

## Definicja ukończenia

Testy 1-4 zielone (5-6 jeśli opcje wchodzą do zakresu); historia przetrwa odświeżenie i wiele sesji.
