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

## Features (Mock)

- 🗺️ Kartenansicht (Berlin)
- 📍 Nutzerstandort (echt oder Fallback)
- 📌 Event-Marker im Umkreis
- 📄 Event-Detailansicht
- 💬 Vorab-Chat (statisch)
- 📱 Mobile-First / 9:16 optimiert (TikTok-Style)

Alles ist **UI-only** und bewusst vereinfacht.

---

## Tech-Stack (empfohlen)

- Frontend: HTML/CSS/JS **oder** React + Vite
- Karte: Leaflet.js + OpenStreetMap
- Styling: CSS oder Tailwind
- Daten: statische JSON-Dateien
- Hosting: Vercel oder GitHub Pages