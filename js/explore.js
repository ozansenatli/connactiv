// js/explore.js
const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 14;
let currentUserLatLng = DEFAULT_CENTER;
const TAG_CLASS_MAP = {
  // Preis / Free
  "gratis": "green",
  "free": "green",

  // Mood / Social
  "low pressure": "blue",
  "bring a friend": "blue",
  "casual": "blue",
  "chill": "teal",

  // Language
  "english friendly": "purple",

  // Occasion
  "party": "rose",
  "night": "rose",
  "afterwork": "amber",

  // Type
  "meetup": "slate",
  "beginner friendly": "green",
  "sports": "teal",

  // Status
  "coming soon": "amber"
};

const CHIP_GRADIENT = [
    { bg: "rgba(245, 158, 11, 0.16)", fg: "rgba(154, 52, 18, 0.92)" }, // warm amber
    { bg: "rgba(34, 197, 94, 0.16)",  fg: "rgba(22, 101, 52, 0.92)" }, // green
    { bg: "rgba(59, 130, 246, 0.16)", fg: "rgba(30, 64, 175, 0.92)" }, // blue
    { bg: "rgba(168, 85, 247, 0.16)", fg: "rgba(107, 33, 168, 0.92)" }, // purple
    { bg: "rgba(236, 72, 153, 0.14)", fg: "rgba(157, 23, 77, 0.92)" }, // pink
];

function getTagClass(tag) {
    const key = String(tag || "").trim().toLowerCase();
    return TAG_CLASS_MAP[key] || "slate";
}

function collectUniqueTags(events) {
    const set = new Set();
    (events || []).forEach((ev) => {
        const tags = Array.isArray(ev.tags) ? ev.tags : [];
        tags.forEach((t) => {
            const tag = String(t || "").trim();
            if (tag) set.add(tag);
        });
    });
    return Array.from(set);
}

function applyGradientStyleByIndex(el, idx, total) {
    // idx: 0..total-1, wir mappen auf 0..1
    const t = total <= 1 ? 0 : idx / (total - 1);

    // wir mappen t auf Palette-Intervalle
    const n = CHIP_GRADIENT.length;
    const scaled = t * (n - 1);
    const i = Math.floor(scaled);
    const j = Math.min(i + 1, n - 1);
    const a = scaled - i;

    // lineare Interpolation auf rgba-Strings wäre aufwendig,
    // daher nehmen wir einen pragmatischen Ansatz:
    // wir “snapen” sanft über die Palette, wirkt trotzdem wie Verlauf.
    const pick = a < 0.5 ? CHIP_GRADIENT[i] : CHIP_GRADIENT[j];

    el.style.setProperty("--chip-bg", pick.bg);
    el.style.setProperty("--chip-fg", pick.fg);
}

function renderFilterChips(tags) {
    if (!filterBar) return;

    filterBar.innerHTML = "";

    // "Alle" Chip
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "chip chip--slate chip--active";
    allBtn.textContent = "Alle";
    filterBar.appendChild(allBtn);

    // Tags alphabetisch
    const sorted = [...tags].sort((a, b) => a.localeCompare(b, "de"));

    sorted.forEach((t, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip chip--grad";
        btn.textContent = t;

        applyGradientStyleByIndex(btn, index, sorted.length);

        filterBar.appendChild(btn);
    });

    // Click-Handling nur einmal binden
    filterBar.onclick = (e) => {
        const btn = e.target.closest("button.chip");
        if (!btn) return;

        filterBar.querySelectorAll(".chip").forEach((b) => b.classList.remove("chip--active"));
        btn.classList.add("chip--active");
    };
}

const map = L.map("map", {zoomControl:true}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

const bottomSheet = document.getElementById("bottomSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const eventTagsEl = document.getElementById("eventTags");
const eventTitle = document.getElementById("eventTitle");
const eventSub = document.getElementById("eventSub");
const eventBadge = document.getElementById("eventBadge");
const filterBar = document.getElementById("filterBar");

const closeSheetBtn = document.getElementById("closeSheetBtn");

const statusPill = document.getElementById("statusPill");

const joinBtn = document.getElementById("joinBtn");
let selectedEvent = null;

function distanceMeters(a, b) {
    // a, b = [lat, lng]
    const R = 6371000; // Erdradius in Metern
    const toRad = (deg) => (deg * Math.PI) / 180;

    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);

    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);

    const h =
        sinDLat * sinDLat +
        Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
}

function formatDistance(meters) {
    if (!Number.isFinite(meters)) return "";
    if (meters < 1000) return `${Math.round(meters)} m entfernt`;
    return `${(meters / 1000).toFixed(1).replace(".", ",")} km entfernt`;
}

function openSheet(ev) {
    const fallbackId = `dummy-${Math.round(ev.lat * 100000)}-${Math.round(ev.lng * 100000)}`;
    selectedEvent = {...ev, id: ev.id || fallbackId};
    eventTitle.textContent = ev.title;
    const d = distanceMeters(currentUserLatLng, [ev.lat, ev.lng]);
    eventSub.textContent = `${ev.startTime ?? ""} • ${formatDistance(d)}`;

    if (eventTagsEl) {
        eventTagsEl.innerHTML = "";

        const tags = Array.isArray(ev.tags) ? ev.tags : [];
        const limited = tags.slice(0, 6);

        limited.forEach((t, index) => {
            const pill = document.createElement("span");
            pill.className = "tag tag--grad";

            applyGradientStyleByIndex(pill, index, limited.length);

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


    eventBadge.textContent = `${ev.attendeesCount ?? 0} Personen gehen hin`;

    bottomSheet.classList.remove("bottom-sheet--hidden");
    sheetBackdrop.classList.remove("backdrop--hidden");

    bottomSheet.setAttribute("aria-hidden", "false");
    sheetBackdrop.setAttribute("aria-hidden", "false");

    document.body.classList.add("no-scroll");

    // Leaflet Map sperren
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.touchZoom.disable();
    if (map.tap) map.tap.disable(); // Mobile
}

function closeSheet() {
    bottomSheet.classList.add("bottom-sheet--hidden");
    sheetBackdrop.classList.add("backdrop--hidden");

    bottomSheet.setAttribute("aria-hidden", "true");
    sheetBackdrop.setAttribute("aria-hidden", "true");

    document.body.classList.remove("no-scroll");

// Leaflet Map entsperren
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    map.touchZoom.enable();
    if (map.tap) map.tap.enable(); // Mobile
}

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);

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

function setUserLocation() {
    showFallbackAfter2s();

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            if (!statusPill || statusPill.style.display === "none") return;

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
            // Fehler: Fallback

        },
        {enableHighAccuracy: true, timeout: 1500}
    );
}

function hideStatusPill() {
    if (!statusPill) return;
    statusPill.style.opacity = "0";
    statusPill.style.pointerEvents = "none";
    setTimeout(() => {
        statusPill.style.display = "none";
    }, 200);
}

function showFallbackAfter2s() {
    // Nach 2 Sekunden: Dummy-Standort + Status weg
    setTimeout(() => {
        setFallback();
        hideStatusPill();
    }, 2000);
}

async function loadEvents(){
    const res = await fetch("./data/events.json");
    if (!res.ok) throw new Error("events.json konnte nicht geladen werden");
    return res.json();
}

function addEventMarkers(events) {
    if (!Array.isArray(events)) return;

    events.forEach((ev, i) => {
        setTimeout(() => {
            // Alle Events (auch Dummys) bekommen den gleichen Marker-Look
            const marker = L.marker([ev.lat, ev.lng]).addTo(map);

            marker.on("click", () => openSheet(ev));
        }, 120 + i * 40); // Pop-in Effekt bleibt
    });
}

(async function init() {
    setUserLocation();

    const events = await loadEvents();

    const tags = collectUniqueTags(events);
    renderFilterChips(tags);
    setTimeout(() => {
        addEventMarkers(events);
    }, 2000);
})();

/*  ===============================================
    Bottom Sheet - Close Handling
    ===============================================
*/
closeSheetBtn.addEventListener("click", closeSheet);
sheetBackdrop.addEventListener("click", closeSheet);
joinBtn.addEventListener("click", () => {
    if (!selectedEvent?.id) return;

    const attendees = Number(selectedEvent.attendeesCount ?? 0);

    window.location.href = `./chat.html?event=${encodeURIComponent(selectedEvent.id)}&attendees=${encodeURIComponent(attendees)}`;
});