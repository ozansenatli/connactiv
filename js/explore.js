// js/explore.js
const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 14;

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

function renderFilterChips(tags) {
    if (!filterBar) return;

    filterBar.innerHTML = "";

    // “Alle” Chip
    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "chip chip--slate chip--active";
    allBtn.textContent = "Alle";
    filterBar.appendChild(allBtn);

    // Tags alphabetisch
    const sorted = [...tags].sort((a, b) => a.localeCompare(b, "de"));

    sorted.forEach((t) => {
        const cls = getTagClass(t);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `chip chip--${cls}`;
        btn.textContent = t;

        filterBar.appendChild(btn);
    });

    // Click Handling: NUR EINMAL registrieren
    filterBar.addEventListener("click", (e) => {
        const btn = e.target.closest("button.chip");
        if (!btn) return;

        filterBar.querySelectorAll(".chip").forEach((b) => b.classList.remove("chip--active"));
        btn.classList.add("chip--active");
    }, { once: true });
}


const map = L.map("map", {zoomControl:true}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

const bottomSheet = document.getElementById("bottomSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const eventTagsE1 = document.getElementById("eventTags");
const eventTitle = document.getElementById("eventTitle");
const eventSub = document.getElementById("eventSub");
const eventBadge = document.getElementById("eventBadge");
const filterBar = document.getElementById("filterBar");

const closeSheetBtn = document.getElementById("closeSheetBtn");

const statusPill = document.getElementById("statusPill");

const joinBtn = document.getElementById("joinBtn");
let selectedEvent = null;

function openSheet(ev) {
    const fallbackId = `dummy-${Math.round(ev.lat * 100000)}-${Math.round(ev.lng * 100000)}`;
    selectedEvent = {...ev, id: ev.id || fallbackId};
    eventTitle.textContent = ev.title;
    eventSub.textContent = `${ev.startTime ?? ""}`;

    if (eventTagsE1) {
        eventTagsE1.innerHTML = "";
        const tags = Array.isArray(ev.tags) ? ev.tags : [];
        tags.slice(0, 6).forEach((t) => {
            const cls = getTagClass(t);
            const pill = document.createElement("span");
            pill.className = `tag tag--${cls}`;

            const dot = document.createElement("span");
            dot.className = "tag-dot";
            dot.setAttribute("aria-hidden", "true");

            const text = document.createElement("span");
            text.textContent = t;

            pill.appendChild(dot);
            pill.appendChild(text);

            eventTagsE1.appendChild(pill);
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
            const isDummy = ev.isDummy === true;

            let marker;
            if (isDummy) {
                marker = L.circleMarker([ev.lat, ev.lng], {
                    radius: 7,
                    color: "#9aa0a6",
                    weight: 2,
                    fillOpacity: 0.65,
                }).addTo(map);
            } else {
                marker = L.marker([ev.lat, ev.lng]).addTo(map);
            }

            marker.on("click", () => openSheet(ev));
        }, 120 + i*40); // Start nach 120ms, dann alle 40ms ein Marker
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