const API_BASE = "http://localhost:3001/api";

const listEl = document.getElementById("sessionsList");
const activeContainer = document.getElementById("activeSessions");

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

/*
    Creates a reusable game-style card
*/
function createCard(session) {

    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
        <img src="${session.coverUrl}" />
        <p>${session.gameName}</p>
        <p class="session-duration">
            ${formatDuration(session.startedAt, session.endedAt)}
        </p>
    `;

    // Click behavior
    card.onclick = () => {
        window.location.href = `game.html?id=${session.gameId}`;
    };

    // Highlight active session
    if (!session.endedAt) {
        card.classList.add("active-session");
    }

    return card;
}

function renderSessions(sessions) {

    listEl.innerHTML = "";
    activeContainer.innerHTML = "";

    const active = sessions.filter(s => !s.endedAt);
    const history = sessions.filter(s => s.endedAt);

    // Hide section if no active sessions
    if (active.length === 0) {
        activeContainer.parentElement.style.display = "none";
    }

    active.forEach(session => {
        activeContainer.appendChild(createCard(session));
    });

    history.forEach(session => {
        listEl.appendChild(createCard(session));
    });
}

loadSessions();