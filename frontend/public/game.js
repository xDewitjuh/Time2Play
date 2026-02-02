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

/* =========================
   LOAD SESSION STATE
========================= */
async function loadSessionState() {
  try {
    const response = await fetch(
      `${API_BASE}/games/${gameId}/session/active`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch session state");
    }

    const session = await response.json();

    sessionActive = !!session;

    sessionBtn.textContent = sessionActive
      ? "Stop session"
      : "Start session";

  } catch (err) {
    console.error("Error loading session:", err);
  }
}

// Load both on page start
loadGame();
loadSessionState();

/* =========================
   SESSION TOGGLE
========================= */
sessionBtn.addEventListener("click", async () => {

  // Prevent spam clicking
  sessionBtn.disabled = true;

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

    // Always reload true state from backend
    await loadSessionState();

    alert(sessionActive ? "Session started!" : "Session stopped!");

  } catch (err) {
    console.error("Session toggle failed:", err);
  } finally {

    // Guarantee button re-enables
    sessionBtn.disabled = false;
  }
});