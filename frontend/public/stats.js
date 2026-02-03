const API_BASE = "http://localhost:3001/api";

const totalPlaytimeEl = document.getElementById("totalPlaytime");
const totalSessionsEl = document.getElementById("totalSessions");
const topGamesGrid = document.getElementById("topGames");

/* =========================================
   Helper
========================================= */

function formatPlaytime(hours, minutes){
    if(hours === 0) return `${minutes}m`;
    if(minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

/* =========================================
   Load stats
========================================= */

async function loadStats() {

    try {
        const res = await fetch(`${API_BASE}/games/stats/overview`);

        if (!res.ok) {
            throw new Error("Failed to fetch stats");
        }

        const stats = await res.json();

        const { hours, minutes } = stats.totalPlaytime;

        totalPlaytimeEl.innerText = formatPlaytime(hours, minutes);
        totalSessionsEl.innerText = stats.totalSessions;

        renderTopGames(stats.topGames);

    } catch (err) {
        console.error("Stats error:", err);
    }
}

/* =========================================
   Game card
========================================= */

function createGameCard(game){

    const card = document.createElement("div");
    card.className = "game-card";

    const cover = game.coverUrl 

    const { hours, minutes } = game.playtime;

    card.innerHTML = `
        <img src="${cover}" />
        <p>${game.name}</p>
        <small>${formatPlaytime(hours, minutes)}</small>
    `;

    card.onclick = () => {
        window.location.href = `game.html?id=${game.gameId}`;
    };

    return card;
}

/* =========================================
   Render
========================================= */

function renderTopGames(games){

    topGamesGrid.innerHTML = "";

    if(!games.length){
        topGamesGrid.innerHTML = "<p>No stats yet — play some games!</p>";
        return;
    }

    games.forEach(game => {
        topGamesGrid.appendChild(createGameCard(game));
    });
}

loadStats();