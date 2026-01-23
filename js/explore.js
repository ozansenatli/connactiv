// js/explore.js
const DEFAULT_CENTER = [52.5200, 13.4050]; // Berlin
const DEFAULT_ZOOM = 14;

const map = L.map("map", {zoomControl:true}).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

const bottomSheet = document.getElementById("bottomSheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");

const eventTitle = document.getElementById("eventTitle");
const eventSub = document.getElementById("eventSub");
const eventBadge = document.getElementById("eventBadge");

const closeSheetBtn = document.getElementById("closeSheetBtn");

const statusPill = document.getElementById("statusPill");

const joinBtn = document.getElementById("joinBtn");
let selectedEventId = null;

function openSheet(ev) {
    selectetEvent = ev;
    selectedEventId = ev.id;
    eventTitle.textContent = ev.title;
    eventSub.textContent = `${ev.startTime ?? ""}`;
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
    if (!selectedEventId) return;

    const eventId = selectedEventId;
    const attendees = Number(selectedEvent.attendeesCount ?? 0);
    const title = selectedEvent.title ?? "Event Chat";

    window.location.href = 
    `./chat.html?event=${encodeURIComponent(eventId)}` +
    `&attendees=${encodeURIComponent(String(attendees))}` +
    `&title=${encodeURIComponent(title)}`;
});