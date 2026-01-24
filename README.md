# Connactiv – Web-App Mock (Pitch-Demo)

Connactiv ist eine **pitchfähige Mock-Web-App**, die den Kern einer Produktidee demonstriert:  
Menschen entdecken **Events in ihrer Nähe** und können sich **bereits vor dem Event vernetzen**, um nicht allein hinzugehen.

Die App ist **kein Produkt**, sondern ein **visueller und interaktiver Demonstrator** für ein 2–3-minütiges Pitch-Video im Rahmen eines BWL-Moduls.

---

## Ziel des Projekts

- Den **Nutzermehrwert von Connactiv in <30 Sekunden** verständlich machen
- Eine **reale Nutzungssituation simulieren**
- Im Pitch zeigen: *So fühlt sich das Produkt an*

### Nicht-Ziele
- Kein Backend
- Keine Authentifizierung
- Keine Live-Daten
- Keine Monetarisierung
- Keine technische Skalierung

---

## Kernidee

> Das Problem ist nicht, dass es zu wenige Events gibt.  
> Das Problem ist, dass man nicht weiß, **mit wem man hingeht**.

Connactiv verbindet **Events mit sozialer Anschlussfähigkeit**.

---

## Demo-Flow (User Journey)

1. Nutzer öffnet Connactiv
2. Standort wird ermittelt  
   → nach 2 Sekunden Fallback auf Demo-Standort (Berlin)
3. Karte erscheint, Event-Marker poppen nacheinander auf
4. Nutzer klickt ein Event
5. Event-Details öffnen sich im Bottom Sheet
6. Nutzer klickt **„Teilnehmen“**
7. Vorab-Chat (statisch) wird geöffnet

Dieser Flow ist **exakt der Ablauf**, der im Pitch-Video gezeigt wird.

---

## Features (Ist-Stand)

- 🗺️ Kartenansicht (Leaflet + OpenStreetMap)
- 📍 Nutzerstandort (GPS oder Demo-Fallback)
- 📌 Ca. 50 Event-Marker  
  - wenige „echte“ Events  
  - viele realistisch wirkende Dummy-Events
- 📄 Event-Detailansicht als Bottom Sheet
- 🏷️ Einheitliches Tag-System  
  - gleiche Farben im Header & Bottom Sheet  
  - natürlicher Farbverlauf von links nach rechts
- 📏 Distanzanzeige zum Event (vom Demo-Standort)
- 💬 Vorab-Chat (statisch, pitchrelevant)
- 👥 Teilnehmerzahl konsistent zwischen Event & Chat
- 📱 Mobile-First, 9:16 optimiert (TikTok-Style)

Alle Features sind **bewusst vereinfacht** und dienen ausschließlich der Präsentation der Idee.

---

## Projektstruktur

```text
connactiv/
├─ README.md              # Projektbeschreibung (dieses Dokument)
├─ index.html             # Explore View (Karte + Events)
├─ chat.html              # Chat-Demo
│
├─ assets/
│  └─ logo.svg            # Branding
│
├─ css/
│  ├─ reset.css           # CSS Reset
│  ├─ globals.css         # Typografie, Tokens, Basestyles
│  ├─ explore.css         # Explore UI (Map, Chips, Bottom Sheet)
│  └─ chat.css            # Chat UI
│
├─ js/
│  ├─ explore.js          # Zentrale App-Logik (Map, Standort, Events)
│  ├─ chat.js             # Chat-Demo-Logik
│  └─ ui.js               # Kleine UI-Helfer
│
├─ data/
│  ├─ events.json         # Statische Event-Daten (inkl. Dummy-Events)
│  └─ chats.json          # Statische Chat-Nachrichten
│
└─ pitch/
   └─ skript.md           # Pitch-Video-Skript
```
---

### Dateien im Detail

#### `index.html` - Explore / Map View
- Einstiegspunkt in der App
- Zeigt:
    - Karte (Leaflet + OpenStreetMap)
    - Nutzerstandort
    - Event-Marker
- Klick auf Marker öffnet Event-Detail (Bottom Sheet)

#### `chat.html` - Chat Preview
- Simuliert den Vorab-Chat eines Events
- Zeigt:
    - Eventtitel
    - Statische Nachrichten

### JavaScript-Logik

#### `explore.js`
- Initialisiert die Karte
- Ermittelt Standort (GPS → Fallback nach 2s)
- Lädt Events aus `events.json`
- Setzt Marker
- Rendert Filter-Chips & Event-Tags (Gradient-System)
- Öffnet/schließt das Bottom Sheet
- Berechnet Entfernungen zwischen Standort und Events
- Übergibt Event-Kontext an den Chat
- Leitet bei "Teilnehmen" zu `chat.html`

#### `chat.js`
- Liest Event-ID & Teilnehmerzahl aus der URL
- Setzt Chat-Header (Eventname + Zeit)
- Zeigt statische Demo-Nachrichten

#### `ui.js`
Kleine UI.Hilfsfunktionen
- z.B.:
    - Bottom-Sheet-animationen
    - Toast-Nachrichten
    - Klassen-Toggles


### Datenmodell
Events werden aus einer statischen JSON-Datei geladen.

#### `events.json`
Beispiel:
```json
{
  "id": "event-1",
    "title": "Pub Quiz Night",
    "lat": 52.5208,
    "lng": 13.4095,
    "startTime": "Heute 20:00",
    "attendeesCount": 8,
    "tags": ["low pressure", "english friendly"]
}
```

#### `chats.json`
- Enthält pro Event eine kleine Auswahl an Demo-Nachrichten
- Keine echte Chat-Logik

### Projekt-Dokumentation
#### `workflow.md`
- Beschreibt den konkreten Umsetzungs- und Arbeitsplan für die Web-App.

---

## Design-Prinzipien
- Mobile First
- Große Typografie
- Wenige Farben
- Klare Kontraste
- Optimiert für Screen Recording im Hochkant-Format

## Verwendung im Pitch-Video
Die App wird nicht erklärt, sondern gezeigt.  
  
Typischer Recording-Ablauf:
1. `ìndex.html` öffnen
2. Standort erscheint
3. Event-Marker poppen auf
4. Event anklicken
5. "Teilnehmen"
6. Chat kurz scrollen
7. Ende

Dauer des App-Segments im Video: **20-30 Sekunden**

## Setup & Nutzung
- Keine Build-Tools notwendig
- Reines HTML / CSS / JS
- Hosting über Vercel
- Eigene Domain angebunden

### Hinweis
Diese Web-App ist **bewusst unvollständig**.  
Ihr Zweck ist es, eine Idee **erlebbar zu machen**, nicht sie technisch ausszubauen.  
> Wenn der Pitch überzeugt, hat die App ihren Zweck erfüllt.