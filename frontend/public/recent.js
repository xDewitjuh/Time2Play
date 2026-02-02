const API_BASE = "http://localhost:3001/api";
const grid = document.getElementById("recentGames");

async function loadRecentGames() {
    try {
        const res = await fetch(`${API_BASE}/games/recent?limit=18`);

        if (!res.ok) {
            throw new Error("Failed to fetch recent games");
        }

        const games = await res.json();

        renderGames(games);

    } catch (err) {
        console.error(err);
    }
}

function createGameCard(game){

    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
        <img src="${game.coverUrl}" />
        <p>${game.name}</p>
    `;

    card.onclick = () => {
        window.location.href = `game.html?id=${game.id}`;
    };

    return card;
}

function renderGames(games){

    grid.innerHTML = "";

    // Show message if no recent games exist
    if(games.length === 0){
        grid.innerHTML = "<p>No recent games yet — start a session!</p>";
        return;
    }

    games.forEach(game => {
        grid.appendChild(createGameCard(game));
    });
}

loadRecentGames();