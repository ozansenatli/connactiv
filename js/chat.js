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
    bubble.textContent = m.text;

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

  // 1) Event-Titel auflösen
  let eventTitle = "Event Chat";

  if (eventId) {
    try {
      const events = await loadEvents();
      const match = events.find(e => e.id === eventId);
      if (match) eventTitle = match.title;
    } catch (e) {
      console.warn("Event-Titel konnte nicht geladen werden");
    }
  }

  chatTitleEl.textContent = eventTitle;

  // 2) Chat-Nachrichten laden
  const chats = await loadChats();
  const messages = (eventId && chats[eventId])
    ? chats[eventId]
    : (chats["default"] ?? []);

  render(messages);
})();
