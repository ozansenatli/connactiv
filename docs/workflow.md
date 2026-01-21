# Connactiv – Umsetzungsplan Web-App (Mock)

Dieses Dokument beschreibt die **konkreten Arbeitsschritte** zur Umsetzung der
Connactiv Web-App als **pitchfähige Demo**.

Ziel ist kein Produkt, sondern ein **stabiler, filmbarer Demo-Flow**, der den
Kernnutzen der Idee in wenigen Sekunden vermittelt.

---

## Zieldefinition

- Funktionsfähige Mock-Web-App
- Mobile First / Hochkant nutzbar
- Fokus auf Demo-Flow für Pitch-Video
- Umsetzung in wenigen Tagen, mit minimalem technischen Overhead

---

## Definition of Done (gesamt)

Die Web-App gilt als „fertig“, wenn:

- die Karte zuverlässig lädt
- Event-Marker sichtbar und klickbar sind
- ein Event-Detail (Bottom Sheet) geöffnet werden kann
- der Join-Flow zur Chat Preview führt
- der gesamte Flow ohne Erklärung verständlich ist
- die App im Screen Recording überzeugend wirkt

---

## Phase 1: Grundsetup & Karte

### Schritt 1: `index.html` lauffähig machen
**Ziel:** Karte sichtbar, keine Fehler.

- HTML-Grundgerüst erstellen
- Leaflet CSS & JS via CDN einbinden
- `<div id="map"></div>` anlegen
- Karte initialisieren (Default: Berlin)

**Done, wenn:**
- Seite lädt
- Karte sichtbar ist
- keine Console Errors auftreten

---

## Phase 2: Events anzeigen

### Schritt 2: Event-Daten einbinden
**Ziel:** Events erscheinen als Marker.

- `events.json` mit realistischen Events füllen
- Events via `fetch` laden
- Marker pro Event auf Karte setzen

**Done, wenn:**
- Marker sichtbar sind
- Klick auf Marker möglich ist

---

### Schritt 3: Nutzerstandort (Demo)
**Ziel:** App wirkt persönlich.

- Browser-Geolocation oder fester Berlin-Fallback
- Eigener Marker für Nutzerstandort

**Done, wenn:**
- Standort visuell erkennbar ist

---

## Phase 3: Event-Detail (Bottom Sheet)

### Schritt 4: Bottom Sheet umsetzen
**Ziel:** Event-Informationen klar darstellen.

- Bottom Sheet HTML-Struktur anlegen
- Slide-up Animation via CSS
- Inhalte:
  - Titel
  - Zeit
  - Distanz (Mock)
  - Teilnehmeranzahl
  - Button „Teilnehmen“

**Done, wenn:**
- Bottom Sheet sauber öffnet/schließt
- Inhalte zum Event passen

---

### Schritt 5: Join-Flow
**Ziel:** Demo-Flow fortsetzen.

- Button „Teilnehmen“
- Weiterleitung zu `chat.html` mit Event-ID

**Done, wenn:**
- Klick zuverlässig zur Chat Preview führt

---

## Phase 4: Chat Preview

### Schritt 6: `chat.html` umsetzen
**Ziel:** USP sichtbar machen.

- Chat-Layout (statisch)
- Nachrichten aus `chats.json`
- Hinweis: „Demo-Chat“

**Done, wenn:**
- Chat glaubwürdig aussieht
- keine Interaktion nötig ist

---

## Phase 5: Styling & Feinschliff

### Schritt 7: UI-Polish
**Ziel:** Produkt-Feeling statt Prototyp.

- Große Typografie
- Wenige Farben
- Klare Buttons
- Mobile-optimiertes Layout

**Done, wenn:**
- App im Hochkant-Format gut lesbar ist
- nichts visuell stört

---

## Phase 6: Pitch-Vorbereitung

### Schritt 8: Demo-Flow festlegen
**Ziel:** Reproduzierbarer Recording-Ablauf.

1. `index.html` öffnen
2. Standort sichtbar
3. Event auswählen
4. Bottom Sheet öffnen
5. „Teilnehmen“
6. Chat kurz scrollen
7. Ende

---

### Schritt 9: Screen Recording
**Ziel:** Sauberes Videomaterial.

- Hochkant (9:16)
- 1080 × 1920
- Mehrere Takes aufnehmen

---

## Leitprinzip

> Die Web-App muss nicht vollständig sein.  
> Sie muss **richtig wirken** – für Nutzer und im Pitch.
