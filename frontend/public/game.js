console.log("GAME.JS LOADED");

const API_BASE = "http://localhost:3001/api";

// Get game ID from URL (?id=4)
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

if (!gameId) {
  console.error("No game ID found in URL");
}

// Load game from backend
async function loadGame() {
  try {
    const response = await fetch(`${API_BASE}/games/${gameId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch game");
    }

    const game = await response.json();
    console.log("Loaded game:", game);

    // Elements
    const titleEl = document.getElementById("gameTitle");
    const coverEl = document.getElementById("gameCover");
    const descEl = document.getElementById("gameDescription");

    // Render data
    titleEl.textContent = game.name;
    coverEl.src = game.coverUrl;
    coverEl.alt = game.name;

    descEl.textContent =
      game.description || "No description available.";

  } catch (err) {
    console.error("Error loading game:", err);
  }
}

loadGame();
