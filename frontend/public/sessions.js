const API_BASE = "http://localhost:3001/api";
const listEl = document.getElementById("sessionsList");

async function loadSessions() {
    try {
        const res = await fetch(`${API_BASE}/games/sessions`);

        if (!res.ok) {
            throw new Error("Failed to fetch sessions");
        }

        const sessions = await res.json();

        renderSessions(sessions);

    } catch (err) {
        console.error(err);
    }
}

function formatDuration(start, end) {
    if (!end) return "Active session";

    const diff = new Date(end) - new Date(start);

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
}

function renderSessions(sessions) {
    listEl.innerHTML = "";

    // Optional but VERY nice UX:
    // Active sessions first
    sessions.sort((a, b) => (!a.endedAt ? -1 : 1));

    sessions.forEach(session => {

        const card = document.createElement("div");
        card.className = "game-card";

        card.innerHTML = `
      <img src="${session.coverUrl}" />
      <p>${session.gameName}</p>
      <p class="session-duration">
  ${formatDuration(session.startedAt, session.endedAt)} </p>
    `;

        // Make card clickable (same behavior as games)
        card.onclick = () => {
            window.location.href = `game.html?id=${session.gameId}`;
        };

        listEl.appendChild(card);
    });
}

loadSessions();