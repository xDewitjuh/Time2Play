console.log("MAIN.JS LOADED");

const API_BASE = "http://localhost:3001/api";

/* =========================
   GENERIC GAME CARD
========================= */
function createGameCard(game, size = "small") {
  const card = document.createElement("div");
  card.className = `game-card ${size}`;

  const img = document.createElement("img");
  img.src = game.coverUrl;
  img.alt = game.name;

  const title = document.createElement("p");
  title.textContent = game.name;

  card.appendChild(img);
  card.appendChild(title);

  return card;
}

/* =========================
   RECENT GAMES (max 6)
========================= */
async function loadRecentGames() {
  try {
    const response = await fetch(`${API_BASE}/games/recent?limit=6`);
    const games = await response.json();

    const container = document.getElementById("recent-games");
    container.innerHTML = "";

    games.forEach(game => {
      container.appendChild(createGameCard(game, "small"));
    });
  } catch (error) {
    console.error("Failed to load recent games", error);
  }
}

/* =========================
   RECOMMENDED GAMES
========================= */
async function loadRecommendedGames() {
  try {
    const response = await fetch(`${API_BASE}/games/recommended`);
    const games = await response.json();

    const container = document.getElementById("recommended-games");
    container.innerHTML = "";

    games.forEach(game => {
      container.appendChild(createGameCard(game, "small"));
    });
  } catch (error) {
    console.error("Failed to load recommended games", error);
  }
}

/* =========================
   INIT
========================= */
loadRecentGames();
loadRecommendedGames();
