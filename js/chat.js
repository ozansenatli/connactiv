async function loadChats() {
    const res = await fetch("./data/chats.json");
    if (!res.ok) throw new Error("chats.json konnte nicht geladen werden");
    return res.json();
}

async function loadEvents() {
    const res = await fetch("./data/events.json");
    if (!res.ok) throw new Error("events.json konnte nicht geladen werden");
    return res.json();
}

function getEventIdFromUrl() {
    // 1) Erst versuchen: Query (?event=...)
    const params = new URLSearchParams(window.location.search);
    const q = params.get("event");
    if (q) return q;

    // 2) Dann: Hash (#event=...)
    const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;

    const hashParams = new URLSearchParams(hash);
    return hashParams.get("event");
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function render(messages) {
    const container = document.getElementById("chatMessages");
    container.innerHTML = "";

    messages.forEach((m) => {
    if (m.type === "system") {
        const div = document.createElement("div");
        div.className = "system";
        div.textContent = m.text;
        container.appendChild(div);
        return;
    }

    const bubble = document.createElement("div");
    bubble.className = `msg ${m.from === "me" ? "msg--me" : "msg--other"}`;

    // Name (nur anzeigen, wenn nicht "me")
    if (m.from && m.from !== "me") {
        const nameEl = document.createElement("div");
        nameEl.className = "msg-name";
        nameEl.textContent = m.from;
        bubble.appendChild(nameEl);
    }
    // Text
    const textEl = document.createElement("div");
    textEl.className = "msg-text";
    textEl.textContent = m.text;
    bubble.appendChild(textEl);

    // Zeit
    if (m.time) {
        const meta = document.createElement("div");
        meta.className = "msg-meta";
        meta.textContent = m.time;
        bubble.appendChild(meta);
    }

    container.appendChild(bubble);
    });

    // Scroll nach unten (wie Chat)
    container.parentElement.scrollTop = container.parentElement.scrollHeight;
}

(async function init() {
    const eventId = getEventIdFromUrl();
    const chatTitleEl = document.getElementById("chatTitle");
    const chatSubtitleEl = document.getElementById("chatSubtitle");

    // 1) Event-Titel: erst aus URL, dann Fallback über events.json
    let eventTitle = getQueryParam("title") || "Event Chat";
    let eventStartTime = "";
    if (eventId) {
        try {
            const events = await loadEvents();
            const match = events.find(e => e.id === eventId);
            if (match) {
                eventTitle = match.title;
                eventStartTime = match.startTime ?? "";
            }
        } catch (e) {
            console.warn("Event-Daten konnten nicht geladen werden");
        }
    }

    const chatTitleNameEl = document.getElementById("chatTitleName");
    const chatTitleTimeEl = document.getElementById("chatTitleTime");

    if (chatTitleNameEl) chatTitleNameEl.textContent = eventTitle;
    else chatTitleEl.textContent = eventTitle;

    if (chatTitleTimeEl) chatTitleTimeEl.textContent = eventStartTime ? `• ${eventStartTime}` : "";   



    // 2) Teilnehmerzahl: direkt aus URL (attendeesCount aus Bottom Sheet)
    const attendeesRaw = getQueryParam("attendees");
    const attendeesFromUrl = Number(attendeesRaw ?? "0");
    const memberCount = Number.isFinite(attendeesFromUrl) ? attendeesFromUrl + 1 : 1;

    if (chatSubtitleEl) {
        chatSubtitleEl.textContent = `${memberCount} Teilnehmer`;
    }

    // 3) System-Message
    const systemIntro = eventId
        ? { type: "system", text: `Du bist jetzt im Chat zu: ${eventTitle}` }
        : { type: "system", text: "Demo-Chat – connecte dich vor dem Event" };

    // 4) Chat-Nachrichten laden (robust)
    let chats = {};
    try {
        chats = await loadChats();
    } catch (e) {
        console.warn("Chats konnten nicht geladen werden");
        chats = {};
    }

    const messages = (eventId && chats[eventId])
        ? chats[eventId]
        : (chats["default"] ?? []);

    const cleanedMessages = messages.filter(m => m.type !== "system");

    render([systemIntro, ...cleanedMessages]);
})();
