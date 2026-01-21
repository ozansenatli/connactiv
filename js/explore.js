// js/explore.js
const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 13;

const map = L.map("map", {zoomControl:true}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);

function setFallback() {
    const user = DEFAULT_CENTER;
    L.circleMarker(user, {
        radius: 8,
        color: "#1452eb",
        weight: 2,
        fillOpacity: 0.8,
    }).addTo(map);
    map.setView(user, DEFAULT_ZOOM);
}

function setUserLocation() {
    if (!navigator.geolocation) return setFallback();
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const user = [pos.coords.latitude, pos.coords.longitude];
            L.circleMarker(user, {radius:8}).addTo(map);
            map.setView(user, 14);
        },
        () => setFallback(),
        {enableHighAccuracy: true, timeout: 5000}
    );
}

async function loadEvents(){
    const res = await fetch("./data/events.json");
    if (!res.ok) throw new Error("events.json konnte nicht geladen werden");
    return res.json();
}

function addEventMarkers(events) {
    if (!Array.isArray(events)) return;

    events.forEach((ev) => {
        const marker = L.marker([ev.lat, ev.lng]).addTo(map);
        marker.bindPopup(`<strong>${ev.title}</strong><br>${ev.startTime ?? ""}`);
    });
}

(async function init(){
    setUserLocation();
    const events = await loadEvents();
    addEventMarkers(events);
})();