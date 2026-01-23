# Connactiv – Workflow & Umsetzungsplan (Pitch-Demo)

Dieses Dokument beschreibt den **konkreten Umsetzungs-Workflow** der Connactiv
Mock-Web-App in ihrem **aktuellen, pitch-fertigen Zustand**.

Ziel ist **kein Produkt**, sondern eine **stabile, glaubwürdige und filmreife Demo**,
die den Kernnutzen von Connactiv innerhalb weniger Sekunden erlebbar macht.

---

## 1. Zieldefinition

**Primäres Ziel**

Eine Web-App-Demo, die zeigt:
> „Ich finde ein Event – und ich weiß, mit wem ich hingehe.“

**Sekundäre Ziele**
- Hochkant-tauglich (9:16, Mobile First)
- Ohne Erklärung verständlich
- Ruhige, natürliche UI (kein Prototyp-Look)
- Screen-Recording-ready

**Explizite Nicht-Ziele**
- Kein Backend
- Kein Login
- Keine Echtzeit-Features
- Keine Datenpersistenz
- Keine Skalierung

---

## 2. Definition of Done (gesamt)

Die App gilt als **fertig**, wenn:

- die Karte zuverlässig lädt
- der Standort realistisch erscheint (GPS oder Demo-Fallback)
- viele Events sichtbar sind (echte + Dummy-Events)
- alle Marker klickbar sind
- das Bottom Sheet stabil öffnet und schließt
- Farben & Tags konsistent wirken
- der Join-Flow in einen Chat führt
- der komplette Flow ohne Erklärung verständlich ist
- die App im Screen-Recording überzeugt

---

## 3. Technische Grundstruktur

### Architekturprinzip
- **Vanilla HTML / CSS / JS**
- Keine Build-Tools
- Keine Frameworks
- Fokus auf Lesbarkeit & Kontrolle

### Zentrale Dateien
- `index.html` → Explore View (Karte + Events)
- `explore.js` → gesamte App-Logik
- `explore.css` → komplettes Explore-Styling
- `chat.html` / `chat.js` → Chat-Preview
- `events.json` / `chats.json` → statische Demo-Daten

---

## 4. Phase 1 – Karte & Standort

### 4.1 Karte initialisieren
- Leaflet + OpenStreetMap
- Default-Zentrum: Berlin
- Map in „Card“ eingebettet (abgerundet, Schatten)

**Done, wenn**
- Karte sichtbar ist
- keine Console Errors auftreten

---

### 4.2 Standort-Handling (Demo-Logik)

**Umsetzung**
- Beim Start: Status-Pill „Standort wird ermittelt…“
- Parallel:
  - Versuch, echten Standort zu holen
  - Timer von 2 Sekunden für Fallback
- Nach 2 Sekunden:
  - Dummy-Standort (Berlin)
  - Status-Pill verschwindet
- Kommt GPS vorher → GPS gewinnt

**Ziel**
- Kein Warten
- Kein technisches Gefühl
- Immer ein sichtbarer Standort

---

## 5. Phase 2 – Events & Marker

### 5.1 Event-Daten

**events.json enthält**
- wenige „echte“ Events
- viele realistisch wirkende Dummy-Events (~50)
- alle Events haben:
  - Koordinaten
  - Startzeit
  - Teilnehmeranzahl
  - Tags

**Wichtig**
- Dummy-Events sind **visuell nicht unterscheidbar**

---

### 5.2 Marker-Rendering

**Umsetzung**
- Marker werden zeitversetzt hinzugefügt („Pop-In“)
- Alle Marker sehen gleich aus
- Klick auf Marker öffnet Bottom Sheet

**Ziel**
- Lebendigkeit
- Event-Dichte
- Glaubwürdigkeit

---

## 6. Phase 3 – Tag-System & Filter

### 6.1 Tag-System (zentrales Element)

**Prinzip**
- Alle Tags werden global gesammelt
- Alphabetisch sortiert
- Diese Reihenfolge bestimmt einen **link→rechts Farbverlauf**

**Wichtig**
- Ein Tag hat **überall dieselbe Farbe**
  - Header-Chips
  - Bottom-Sheet-Tags

**Technik**
- Farben werden **einmal in JS berechnet**
- Übergabe über CSS-Variablen (`--chip-bg`, `--chip-fg`)

---

### 6.2 Filter-Chips (Header)

**Umsetzung**
- Horizontal scrollbare Chips
- „Alle“ als neutraler Default
- Farbige Chips für Tags
- Aktiv-Zustand sichtbar

**Hinweis**
- Filter sind visuell, nicht funktional
- Fokus liegt auf Pitch-Wirkung

---

## 7. Phase 4 – Bottom Sheet (Event-Detail)

### Inhalte
- Event-Titel
- Startzeit
- Distanz zum Standort
- Teilnehmeranzahl (ohne dich)
- Event-Tags (farbkonsistent)
- CTA: „Teilnehmen“

### Verhalten
- Öffnet per Marker-Klick
- Sperrt Hintergrund-Scroll & Map
- Schließt per Button oder Backdrop

**Ziel**
- Klare, ruhige Informationshierarchie
- Kein „Modal-Stress“

---

## 8. Phase 5 – Join-Flow & Chat

### 8.1 Join-Flow

- Klick auf „Teilnehmen“
- Weiterleitung zu `chat.html`
- Übergabe per URL:
  - Event-ID
  - Titel
  - Startzeit
  - Teilnehmeranzahl (ohne dich)

---

### 8.2 Chat-Preview

**Chat-Header**
- Event-Name
- Event-Zeit
- Teilnehmerzahl = Event-Teilnehmer + 1 (du)

**Chat-Inhalt**
- Statische Nachrichten aus `chats.json`
- Glaubwürdige Namen
- Kein Senden möglich

**Ziel**
- USP sichtbar machen
- „Ich bin nicht allein“

---

## 9. Phase 6 – Visual Polish

### Design-Prinzipien
- Mobile First
- Große Touch-Targets
- Weiche Radien & Schatten
- Subtile Animationen
- Keine technischen UI-Elemente

### Ergebnis
- Produkt-Feeling
- Kein Prototyp-Look
- Pitch-tauglich

---

## 10. Phase 7 – Pitch-Vorbereitung

### Empfohlener Demo-Flow (20–30 Sekunden)

1. App öffnen
2. Standort erscheint
3. Marker poppen auf
4. Event anklicken
5. Bottom Sheet kurz zeigen
6. „Teilnehmen“
7. Chat scrollen
8. Schnitt

---

## 11. Status

**Aktueller Stand**
- ✔ Feature-Complete (für Pitch)
- ✔ Stabil
- ✔ Screen-Recording-ready
- ✔ Verständlich ohne Erklärung

Weitere Entwicklung **nur bei Bedarf für Pitch**.

---

## Leitprinzip

> Nicht zeigen, was technisch möglich ist –  
> sondern zeigen, warum Menschen Connactiv nutzen würden.