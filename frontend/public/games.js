console.log("GAMES.JS LOADED");

const API_BASE = "http://localhost:3001/api";

async function loadAllGames() {
    const response = await fetch(`${API_BASE}/games`);
    const games = await response.json();

    const container = document.getElementById("all-games");
    container.innerHTML = "";

    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card large";

        card.innerHTML = `
      <img src="${game.coverUrl}" alt="${game.name}">
      <p>${game.name}</p>
    `;

        container.appendChild(card);
    });
}

loadAllGames();
