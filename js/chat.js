async function loadChats() {
  const res = await fetch("./data/chats.json");
  if (!res.ok) throw new Error("chats.json konnte nicht geladen werden");
  return res.json();
}

function getEventIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("event");
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

  const chatTitle = document.getElementById("chatTitle");
  chatTitle.textContent = eventId ? `Chat – ${eventId}` : "Event Chat";

  const data = await loadChats();

  // Erwartet: { "<event-id>": [ ...messages ] }
  const messages = (eventId && data[eventId]) ? data[eventId] : (data["default"] ?? []);
  render(messages);
})();