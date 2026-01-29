console.log("GAME.JS LOADED");

const API_BASE = "http://localhost:3001/api";

const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

if (!gameId) {
  console.error("No game ID found in URL");
}

// Elements
const titleEl = document.getElementById("gameTitle");
const coverEl = document.getElementById("gameCover");
const descEl = document.getElementById("gameDescription");
const sessionBtn = document.getElementById("sessionBtn");

let sessionActive = false;

/* =========================
   LOAD GAME DETAILS
========================= */
async function loadGame() {
  try {
    const response = await fetch(`${API_BASE}/games/${gameId}`);
    if (!response.ok) throw new Error("Failed to fetch game");

    const game = await response.json();

    titleEl.textContent = game.name;
    coverEl.src = game.coverUrl;
    coverEl.alt = game.name;
    descEl.textContent = game.description || "No description available.";
  } catch (err) {
    console.error("Error loading game:", err);
  }
}

loadGame();

/* =========================
   SESSION TOGGLE
========================= */
sessionBtn.addEventListener("click", async () => {
  try {
    const endpoint = sessionActive
      ? "stop"
      : "start";

    const response = await fetch(
      `${API_BASE}/games/${gameId}/session/${endpoint}`,
      { method: "POST" }
    );

    if (!response.ok) {
      throw new Error(`Failed to ${endpoint} session`);
    }

    sessionActive = !sessionActive;
    sessionBtn.textContent = sessionActive
      ? "Stop session"
      : "Start session";

    alert(sessionActive ? "Session started!" : "Session stopped!");
  } catch (err) {
    console.error("Session toggle failed:", err);
  }
});
