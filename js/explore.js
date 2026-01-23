// js/explore.js

const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 14;

let currentUserLatLng = DEFAULT_CENTER;

const TAG_CLASS_MAP = {
    "gratis": "green",
    "free": "green",
    "low pressure": "blue",
    "bring a friend": "blue",
    "casual": "blue",
    "chill": "teal",
    "english friendly": "purple",
    "party": "rose",
    "night": "rose",
    "afterwork": "amber",
    "meetup": "slate",
    "beginner friendly": "green",
    "sports": "teal",
    "coming soon": "amber",
};

// ------------------------------------------------------------
// "Natürliches" Verlaufspalette (links -> rechts)
// ------------------------------------------------------------
const CHIP_GRADIENT = [
    { bg: "rgba(245, 158, 11, 0.14)", fg: "rgba(154, 52, 18, 0.92)" },  // amber
    { bg: "rgba(34, 197, 94, 0.14)",  fg: "rgba(22, 101, 52, 0.92)" },  // green
    { bg: "rgba(20, 184, 166, 0.14)", fg: "rgba(15, 118, 110, 0.92)" }, // teal
    { bg: "rgba(59, 130, 246, 0.14)", fg: "rgba(30, 64, 175, 0.92)" },  // blue
    { bg: "rgba(168, 85, 247, 0.14)", fg: "rgba(107, 33, 168, 0.92)" }, // purple
    { bg: "rgba(236, 72, 153, 0.12)", fg: "rgba(157, 23, 77, 0.92)" },  // rose
];

// ------------------------------------------------------------
// DOM
// ------------------------------------------------------------
const map = L.map("map", { zoomControl: true }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

const bottomSheet   = document.getElementById("bottomSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");

const eventTitleEl  = document.getElementById("eventTitle");
const eventSubEl    = document.getElementById("eventSub");
const eventBadgeEl  = document.getElementById("eventBadge");
const eventTagsEl   = document.getElementById("eventTags");

const filterBar     = document.getElementById("filterBar");

const closeSheetBtn = document.getElementById("closeSheetBtn");
const joinBtn       = document.getElementById("joinBtn");

const statusPill    = document.getElementById("statusPill");

// ------------------------------------------------------------
// State
// ------------------------------------------------------------
let selectedEvent = null;

let TAG_STYLE_BY_TAG = {}; 
let ORDERED_TAGS = [];     

let fallbackTimer = null; 

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function normalizeTag(tag) {
    return String(tag || "").trim().toLowerCase();
}

function collectUniqueTags(events) {
    const set = new Set();
    (events || []).forEach((ev) => {
        const tags = Array.isArray(ev.tags) ? ev.tags : [];
        tags.forEach((t) => {
            const cleaned = String(t || "").trim();
            if (cleaned) set.add(cleaned);
        });
    });
    return Array.from(set);
}

function pickGradientColorByIndex(idx, total) {
    const t = total <= 1 ? 0 : idx / (total - 1);
    const n = CHIP_GRADIENT.length;
    const scaled = t * (n - 1);
    const i = Math.floor(scaled);
    const j = Math.min(i + 1, n - 1);
    const a = scaled - i;

    return a < 0.5 ? CHIP_GRADIENT[i] : CHIP_GRADIENT[j];
}

function buildTagStyleMapFromTags(tagsSorted) {
    const map = {};
    tagsSorted.forEach((t, idx) => {
        const pick = pickGradientColorByIndex(idx, tagsSorted.length);
        map[t] = pick;
    });
    return map;
}

function applyTagStyleVars(el, style) {
    if (!el || !style) return;


    el.style.setProperty("--chip-bg", style.bg);
    el.style.setProperty("--chip-fg", style.fg);
    el.style.setProperty("--tag-bg", style.bg);
    el.style.setProperty("--tag-fg", style.fg);
}

function distanceMeters(a, b) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);

    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
}

function formatDistance(meters) {
    if (!Number.isFinite(meters)) return "";
    if (meters < 1000) return `${Math.round(meters)} m entfernt`;
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km entfernt`;
}

function lockMap() {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
    if (map.tap) map.tap.disable();
}

function unlockMap() {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.touchZoom.enable();
    if (map.tap) map.tap.enable();
}

// ------------------------------------------------------------
// UI: Header Chips
// ------------------------------------------------------------
function renderFilterChips(tagsSorted) {
    if (!filterBar) return;

    filterBar.innerHTML = "";

    // "Alle" Chip (neutral)
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "chip chip--active";
    allBtn.textContent = "Alle";
    filterBar.appendChild(allBtn);

    // Tags: Verlauf links -> rechts
    tagsSorted.forEach((t) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip chip--grad";
        btn.textContent = t;

        applyTagStyleVars(btn, TAG_STYLE_BY_TAG[t]);

        filterBar.appendChild(btn);
    });

    filterBar.onclick = (e) => {
        const btn = e.target.closest("button.chip");
        if (!btn) return;

        filterBar.querySelectorAll(".chip").forEach((b) => b.classList.remove("chip--active"));
        btn.classList.add("chip--active");

    };
}

// ------------------------------------------------------------
// UI: Bottom Sheet
// ------------------------------------------------------------
function openSheet(ev) {
    const fallbackId = `dummy-${Math.round(ev.lat * 100000)}-${Math.round(ev.lng * 100000)}`;
    selectedEvent = { ...ev, id: ev.id || fallbackId };

    if (eventTitleEl) eventTitleEl.textContent = ev.title ?? "Event";
    if (eventSubEl) {
        const d = distanceMeters(currentUserLatLng, [ev.lat, ev.lng]);
        const start = ev.startTime ?? "";
        eventSubEl.textContent = start ? `${start} • ${formatDistance(d)}` : formatDistance(d);
    }
    if (eventBadgeEl) eventBadgeEl.textContent = `${ev.attendeesCount ?? 0} Personen gehen hin`;

    // Tags (konsistent zu Header)
    if (eventTagsEl) {
        eventTagsEl.innerHTML = "";

        const tags = Array.isArray(ev.tags) ? ev.tags : [];
        tags.slice(0, 8).forEach((raw) => {
        const t = String(raw || "").trim();
        if (!t) return;

        const pill = document.createElement("span");
        pill.className = "tag tag--grad";

        applyTagStyleVars(pill, TAG_STYLE_BY_TAG[t] || TAG_STYLE_BY_TAG[ORDERED_TAGS[0]]);

        const dot = document.createElement("span");
        dot.className = "tag-dot";
        dot.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.textContent = t;

        pill.appendChild(dot);
        pill.appendChild(text);
        eventTagsEl.appendChild(pill);
        });
    }

    bottomSheet?.classList.remove("bottom-sheet--hidden");
    sheetBackdrop?.classList.remove("backdrop--hidden");

    bottomSheet?.setAttribute("aria-hidden", "false");
    sheetBackdrop?.setAttribute("aria-hidden", "false");

    document.body.classList.add("no-scroll");
    lockMap();
}

function closeSheet() {
    bottomSheet?.classList.add("bottom-sheet--hidden");
    sheetBackdrop?.classList.add("backdrop--hidden");

    bottomSheet?.setAttribute("aria-hidden", "true");
    sheetBackdrop?.setAttribute("aria-hidden", "true");

    document.body.classList.remove("no-scroll");
    unlockMap();
}

// ------------------------------------------------------------
// Map base layer
// ------------------------------------------------------------
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
}).addTo(map);

// ------------------------------------------------------------
// Location: status pill -> nach 2s weg, dann Dummy; wenn echtes GPS früher kommt, gewinnt GPS.
// ------------------------------------------------------------
function hideStatusPill() {
    if (!statusPill) return;
    statusPill.style.opacity = "0";
    statusPill.style.pointerEvents = "none";
    setTimeout(() => {
        statusPill.style.display = "none";
    }, 200);
}

function setFallback() {
    const user = DEFAULT_CENTER;
    currentUserLatLng = user;

    L.circleMarker(user, {
        radius: 8,
        color: "#1452eb",
        weight: 2,
        fillOpacity: 0.8,
    }).addTo(map);

    map.setView(user, DEFAULT_ZOOM);
}

function scheduleFallbackAfter2s() {
    fallbackTimer = setTimeout(() => {
        setFallback();
        hideStatusPill();
    }, 2000);
}

function setUserLocation() {
    scheduleFallbackAfter2s();

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
        if (!statusPill || statusPill.style.display === "none") return;

        if (fallbackTimer) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }

        const user = [pos.coords.latitude, pos.coords.longitude];
        currentUserLatLng = user;

        L.circleMarker(user, {
            radius: 8,
            color: "#1452eb",
            weight: 2,
            fillOpacity: 0.8,
        }).addTo(map);

        map.setView(user, DEFAULT_ZOOM);
        hideStatusPill();
        },
        () => {
        // Fehler ignorieren – Fallback-Timer übernimmt
        },
        { enableHighAccuracy: true, timeout: 1500 }
    );
}

// ------------------------------------------------------------
// Data & Markers
// ------------------------------------------------------------
async function loadEvents() {
    const res = await fetch("./data/events.json");
    if (!res.ok) throw new Error("events.json konnte nicht geladen werden");
    return res.json();
}

function addEventMarkers(events) {
    if (!Array.isArray(events)) return;

    events.forEach((ev, i) => {
        setTimeout(() => {
        const marker = L.marker([ev.lat, ev.lng]).addTo(map);

    
        marker.on("click", () => openSheet(ev));
        }, 120 + i * 40);
    });
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
(async function init() {
    setUserLocation();

    const events = await loadEvents();

    // Tags global vorbereiten (für konsistenten Look überall)
    ORDERED_TAGS = collectUniqueTags(events).sort((a, b) => a.localeCompare(b, "de"));
    TAG_STYLE_BY_TAG = buildTagStyleMapFromTags(ORDERED_TAGS);

    renderFilterChips(ORDERED_TAGS);

    // Marker "poppen" nach 2s (wenn Pill verschwindet und Standort gesetzt wurde)
    setTimeout(() => addEventMarkers(events), 2000);
})();

// ------------------------------------------------------------
// Events: Close / Join
// ------------------------------------------------------------
closeSheetBtn?.addEventListener("click", closeSheet);
sheetBackdrop?.addEventListener("click", closeSheet);

joinBtn?.addEventListener("click", () => {
    if (!selectedEvent?.id) return;

    const attendees = Number(selectedEvent.attendeesCount ?? 0);

    const title = selectedEvent.title ?? "";
    const start = selectedEvent.startTime ?? "";

    window.location.href =
        `./chat.html?event=${encodeURIComponent(selectedEvent.id)}` +
        `&attendees=${encodeURIComponent(attendees)}` +
        `&title=${encodeURIComponent(title)}` +
        `&start=${encodeURIComponent(start)}`;
});