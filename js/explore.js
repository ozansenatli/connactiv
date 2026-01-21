// js/explore.js
const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 13;

const map = L.map("map", {zoomControl:true}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.titleLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);

async function loadEvents(){
    const res = await fetch("./data/events.json");
    if (!res.ok) throw new Error("events.json konnte nicht geladen werden");
    return res.json();
}

function addEventMarkers(events) {
    events.forEach((ev) => {
        const marker = L.marker([ev.lat, ev.lng]).addTo(map);
        marker.bindPopup(`<strong>${ev.title}</strong><br>${ev.starttime ?? ""}`);
    });
}

(async function init(){
    const events = await loadEvents();
    addEventMarkers(events);
})();