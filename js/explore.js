// js/explore.js
const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 13;

const map = L.map("map", {zoomControl:true}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.titleLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);