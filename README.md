# Connactiv – Web-App Mock (Pitch-Demo)

Connactiv ist eine **pitchfähige Mock-Web-App**, die den Kern einer Produktidee demonstriert:  
Menschen finden **Events in ihrer Nähe** und **connecten sich bereits vor dem Event**, um nicht allein hinzugehen.

Diese App ist **kein fertiges Produkt**, sondern ein **visueller und interaktiver Demonstrator** für ein 2–3-minütiges Pitch-Video im Rahmen eines BWL-Moduls.

---

## Ziel des Projekts

- Den **Nutzermehrwert** von Connactiv in unter 30 Sekunden verständlich machen
- Eine **reale Nutzungssituation simulieren**
- Im Video zeigen: *So fühlt sich das Produkt an*

Nicht-Ziele:
- Kein Backend
- Keine echten Nutzer
- Keine Live-Daten
- Keine Monetarisierung

---

## Kernidee

> Das Problem ist nicht, dass es zu wenige Events gibt.  
> Das Problem ist, dass man nicht weiß, **mit wem man hingeht**.

Connactiv verbindet Events mit sozialer Anschlussfähigkeit.

---

## Demo-Flow (User Journey)

1. Nutzer öffnet Connactiv
2. Standort wird ermittelt (oder Demo-Fallback)
3. Karte zeigt Events in der Nähe
4. Nutzer klickt ein Event an
5. Event-Detail (Bottom Sheet) öffnet sich
6. Nutzer klickt „Teilnehmen“
7. Vorab-Chat (Dummy) wird angezeigt

Dieser Flow ist exakt der, der im Pitch-Video gescreencaptured wird.

---

## Features

- 🗺️ Kartenansicht (Berlin)
- 📍 Nutzerstandort (echt oder Fallback)
- 📌 Event-Marker im Umkreis
- 📄 Event-Detailansicht
- 💬 Vorab-Chat (statisch)
- 📱 Mobile-First / 9:16 optimiert (TikTok-Style)

Alle Features sind **bewusst vereinfacht** und dienen ausschließlich der Demonstration.

---

## Projektstruktur 
connactiv/  
├─ README.md              # Projektbeschreibung & Setup  
├─ index.html             # Hauptscreen: Explore / Kartenansicht  
├─ chat.html              # Chat Preview (Demo)  
│  
├─ assets/  
│  └─ logo.svg            # Logo / Branding  
│  
├─ css/  
│  ├─ reset.css           # CSS Reset (Browser-Defaults entfernen)  
│  ├─ globals.css         # Globale Styles (Farben, Typografie, Layout)  
│  ├─ explore.css         # Styles für index.html (Karte & Bottom Sheet)  
│  └─ chat.css            # Styles für chat.html (Chat Preview)
│  
├─ js/  
│  ├─ explore.js          # Kartenlogik, Events, Bottom Sheet  
│  ├─ chat.js             # Chat-Demo-Logik  
│  ├─ geo.js              # Geodistanz-Berechnung & Nearby-Filter  
│  └─ ui.js               # UI-Helfer (Animationen, Toggles)  
│  
├─ data/  
│  ├─ events.json         # Statische Event-Daten (Mock)  
│  └─ chats.json          # Statische Chat-Nachrichten (Mock)  
│  
└─ pitch/  
   └─ skript.md           # Skript für das Pitch-Video  

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
    - Hinweis "Demo-Chat"


### JavaScript-Logik

#### `explore.js`
- Initialisiert die Karte
- Lädt Events aus `events.json`
- Setzt Marker
- Öffnet/schließt das Bottom Sheet
- Leitet bei "Teilnehmen" zu `chat.html`

#### `chat.js`
- Lädt Chat-Nachrichten aus `chats.json`
- Rendert statische Chat-Bubble-UI

### `geo.js`
- Berechnet Entfernungen zwischen Standort und Events
- Filtert Events im Umkreis (z.B. 1-3 km)

### `ui.js`
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
  "category": "Drinks",
  "lat": 52.5208,
  "lng": 13.4095,
  "startTime": "Heute 20:00",
  "priceLabel": "free",
  "attendeesCount": 8,
  "tags": ["low pressure", "english friendly"],
  "venueName": "Local Pub"
}
```

#### `chats.json`
- Enthält pro Event eine kleine Auswahl an Demo-Nachrichten
- Keine echte Chat-Logik

### Project-Dokumentation
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
### Lokal starten
- Dateien direkt im Browser öffnen  
**oder**
- Lokalen Server nutzen

### Hinweis
Diese Web-App ist **bewusst unvollständig**.  
Ihr Zweck ist es, eine Idee **erlebbar zu machen**, nicht sie technisch ausszubauen.  
> Wenn der Pitch überzeugt, hat die App ihren Zweck erfüllt.