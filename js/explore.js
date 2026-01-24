// ============================================================
// Connactiv – Explore (final)
// ============================================================

const DEFAULT_CENTER = [52.52, 13.405]; // Berlin
const DEFAULT_ZOOM = 14;

// ------------------------------------------------------------
// Global State
// ------------------------------------------------------------
let currentUserLatLng = DEFAULT_CENTER;
let selectedEvent = null;
let allEvents = [];
const markerLayer = L.layerGroup();
const markerByEventId = new Map(); 
let userMarker = null;

const eventMarkerIcon = L.divIcon({
    className: "event-marker",
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
});

const userMarkerIcon = L.divIcon({
    className: "user-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// Tag-Farben: werden EINMAL berechnet und überall wiederverwendet
let ORDERED_TAGS = [];
let TAG_STYLE_BY_TAG = {};

// ------------------------------------------------------------
// Farbverlauf (links → rechts, natürlich)
// ------------------------------------------------------------
const CHIP_GRADIENT = [
    { bg: "#fde68a", fg: "#92400e" }, // amber
    { bg: "#bbf7d0", fg: "#166534" }, // green
    { bg: "#99f6e4", fg: "#0f766e" }, // teal
    { bg: "#bfdbfe", fg: "#1e40af" }, // blue
    { bg: "#e9d5ff", fg: "#6b21a8" }, // purple
    { bg: "#fbcfe8", fg: "#9d174d" }  // rose
];

// ------------------------------------------------------------
// DOM
// ------------------------------------------------------------
const map = L.map("map", { zoomControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

markerLayer.addTo(map);

const bottomSheet   = document.getElementById("bottomSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");

const eventTitleEl  = document.getElementById("eventTitle");
const eventSubEl    = document.getElementById("eventSub");
const eventBadgeEl  = document.getElementById("eventBadge");
const eventTagsEl   = document.getElementById("eventTags");

const filterBar     = document.getElementById("filterBar");
const statusPill    = document.getElementById("statusPill");

const closeSheetBtn = document.getElementById("closeSheetBtn");
const joinBtn       = document.getElementById("joinBtn");

// Hamburger Menü
const menuBtn       = document.getElementById("menuBtn");
const menuDropdown  = document.getElementById("menuDropdown");
let menuBackdropEl  = null;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function collectUniqueTags(events) {
    const set = new Set();
    events.forEach(ev => {
        (ev.tags || []).forEach(t => {
        if (t) set.add(String(t).trim());
        });
    });
    return Array.from(set);
}

function pickGradient(idx, total) {
    const t = total <= 1 ? 0 : idx / (total - 1);
    const n = CHIP_GRADIENT.length;
    const i = Math.floor(t * (n - 1));
    return CHIP_GRADIENT[i];
    }

    function buildTagStyles(tags) {
    const map = {};
    tags.forEach((t, i) => {
        map[t] = pickGradient(i, tags.length);
    });
    return map;
}

function applyTagVars(el, style) {
    if (!el || !style) return;
    el.style.setProperty("--chip-bg", style.bg);
    el.style.setProperty("--chip-fg", style.fg);
    el.style.setProperty("--tag-bg", style.bg);
    el.style.setProperty("--tag-fg", style.fg);
}

function distanceMeters(a, b) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);

    const h =
        Math.sin(dLat/2)**2 +
        Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;

    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function formatDistance(m) {
    if (m < 1000) return `${Math.round(m)} m entfernt`;
    return `${(m/1000).toFixed(1).replace(".", ",")} km entfernt`;
}

// ------------------------------------------------------------
// Map Base Layer
// ------------------------------------------------------------
L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> • <a href="https://opentopomap.org">OpenTopoMap</a> (CC BY-SA)',
    maxZoom: 17
}).addTo(map);

// ------------------------------------------------------------
// Standort-Handling (Demo-first)
// ------------------------------------------------------------
let fallbackTimer = null;

function hideStatusPill() {
    if (!statusPill) return;
    statusPill.style.opacity = "0";
    setTimeout(() => statusPill.style.display = "none", 200);
}

function setFallbackLocation() {
    currentUserLatLng = DEFAULT_CENTER;
    if (userMarker) userMarker.remove();
    userMarker = L.marker(DEFAULT_CENTER, { icon: userMarkerIcon, interactive: false }).addTo(map);
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
}

function setUserLocation() {
    fallbackTimer = setTimeout(() => {
        setFallbackLocation();
        hideStatusPill();
    }, 2000);

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        pos => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
        const user = [pos.coords.latitude, pos.coords.longitude];
        currentUserLatLng = user;

        if (userMarker) userMarker.remove();
        userMarker = L.marker(user, { icon: userMarkerIcon, interactive: false }).addTo(map);

        map.setView(user, DEFAULT_ZOOM);
        hideStatusPill();
        },
        () => {},
        { timeout: 1500 }
    );
}

// ------------------------------------------------------------
// Header Filter Chips
// ------------------------------------------------------------
function renderFilterChips(tags) {
    if (!filterBar) return;
    filterBar.innerHTML = "";

    const all = document.createElement("button");
    all.type = "button";
    all.className = "chip chip--active";
    all.textContent = "Alle";
    all.dataset.tag = "";
    filterBar.appendChild(all);

    tags.forEach(t => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip chip--grad";
        btn.textContent = t;
        btn.dataset.tag = t;
        applyTagVars(btn, TAG_STYLE_BY_TAG[t]);
        filterBar.appendChild(btn);
    });

    filterBar.onclick = (e) => {
        const btn = e.target.closest("button.chip");
        if (!btn) return;
        filterBar.querySelectorAll(".chip").forEach(b => b.classList.remove("chip--active"));
        btn.classList.add("chip--active");

        const tag = btn.dataset.tag;
        applyTagFilter(tag ? tag : null);
        closeSheet();
    };
}

function applyTagFilter(activeTag) {
    // activeTag === null => alle zeigen
    allEvents.forEach((ev) => {
        const marker = markerByEventId.get(ev.id);
        if (!marker) return;

        const tags = Array.isArray(ev.tags) ? ev.tags : [];
        const match = !activeTag || tags.some(t =>
            String(t).trim().toLowerCase() === String(activeTag).trim().toLowerCase()
        );

        if (match) {
            if (!markerLayer.hasLayer(marker)) markerLayer.addLayer(marker);
        } else {
            if (markerLayer.hasLayer(marker)) markerLayer.removeLayer(marker);
        }
    });
}

// ------------------------------------------------------------
// Bottom Sheet
// ------------------------------------------------------------
function openSheet(ev) {
    selectedEvent = ev;

    eventTitleEl.textContent = ev.title;
    const d = distanceMeters(currentUserLatLng, [ev.lat, ev.lng]);
    eventSubEl.textContent = `${ev.startTime} • ${formatDistance(d)}`;
    eventBadgeEl.textContent = `${ev.attendeesCount} Personen gehen hin`;

    eventTagsEl.innerHTML = "";
    (ev.tags || []).forEach(t => {
        const tag = document.createElement("span");
        tag.className = "tag tag--grad";
        applyTagVars(tag, TAG_STYLE_BY_TAG[t]);
        tag.innerHTML = `<span class="tag-dot"></span><span>${t}</span>`;
        eventTagsEl.appendChild(tag);
    });

    bottomSheet.classList.remove("bottom-sheet--hidden");
    sheetBackdrop.classList.remove("backdrop--hidden");
    document.body.classList.add("no-scroll");
}

function closeSheet() {
    bottomSheet.classList.add("bottom-sheet--hidden");
    sheetBackdrop.classList.add("backdrop--hidden");
    document.body.classList.remove("no-scroll");
}

// ------------------------------------------------------------
// Hamburger Menu
// ------------------------------------------------------------
function openMenu() {
    menuDropdown.classList.add("menu--open");
    menuBtn.setAttribute("aria-expanded", "true");

    if (!menuBackdropEl) {
        menuBackdropEl = document.createElement("div");
        menuBackdropEl.className = "menu-backdrop";
        document.body.appendChild(menuBackdropEl);
        menuBackdropEl.onclick = closeMenu;
    }
}

function closeMenu() {
    menuDropdown.classList.remove("menu--open");
    menuBtn.setAttribute("aria-expanded", "false");
    if (menuBackdropEl) menuBackdropEl.remove();
    menuBackdropEl = null;
}

menuBtn?.addEventListener("click", e => {
    e.stopPropagation();
    menuDropdown.classList.contains("menu--open") ? closeMenu() : openMenu();
});

// ------------------------------------------------------------
// Events & Marker
// ------------------------------------------------------------
async function loadEvents() {
    const res = await fetch("./data/events.json");
    return res.json();
}

function addMarkers(events) {
    if(!Array.isArray(events)) return;

    markerLayer.clearLayers();
    markerByEventId.clear();

    events.forEach((ev, i) => {
        setTimeout(() => {
        const m = L.marker([ev.lat, ev.lng], { icon: eventMarkerIcon });
        m.on("click", () => {
            closeMenu();
            openSheet(ev);
        });
        markerLayer.addLayer(m);
        markerByEventId.set(ev.id, m);
        }, 120 + i * 40);
    });
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
(async function init() {
    setUserLocation();

    const events = await loadEvents();
    allEvents = events;

    ORDERED_TAGS = collectUniqueTags(events).sort((a,b)=>a.localeCompare(b,"de"));
    TAG_STYLE_BY_TAG = buildTagStyles(ORDERED_TAGS);

    renderFilterChips(ORDERED_TAGS);
    setTimeout(() => {
        addMarkers(events);
        applyTagFilter(null);
    }, 2000);
})();

// ------------------------------------------------------------
// Listeners
// ------------------------------------------------------------
closeSheetBtn?.addEventListener("click", closeSheet);
sheetBackdrop?.addEventListener("click", closeSheet);

joinBtn?.addEventListener("click", () => {
    if (!selectedEvent) return;

    const url =
        `./chat.html?event=${encodeURIComponent(selectedEvent.id)}` +
        `&title=${encodeURIComponent(selectedEvent.title)}` +
        `&start=${encodeURIComponent(selectedEvent.startTime)}` +
        `&attendees=${encodeURIComponent(selectedEvent.attendeesCount)}`;

    window.location.href = url;
});
