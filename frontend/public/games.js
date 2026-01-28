console.log("GAMES.JS LOADED");

const API_BASE = "http://localhost:3001/api";

/* =========================
   STATE
========================= */
let allGames = [];

/* =========================
   RENDER GAMES
========================= */
function renderGames(games) {
    const container = document.getElementById("all-games");
    if (!container) return;

    container.innerHTML = "";

    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card large";

        // Determine cover URL (IGDB vs DB)
        const coverUrl = game.coverUrl
            ? game.coverUrl
            : game.cover?.url
                ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
                : "";

        card.innerHTML = `
      <img src="${coverUrl}" alt="${game.name}">
      <p>${game.name}</p>
    `;

        card.addEventListener("click", async () => {
            try {
                // CASE 1: Game already in database → navigate directly
                if (game.igdbId) {
                    window.location.href = `game.html?id=${game.id}`;
                    return;
                }

                // CASE 2: IGDB game → save first, then navigate
                const response = await fetch(`${API_BASE}/games`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ igdbId: game.id }),
                });

                if (!response.ok) {
                    throw new Error("Failed to add game");
                }

                const savedGame = await response.json();

                window.location.href = `game.html?id=${savedGame.id}`;
            } catch (err) {
                console.error(err);
            }
        });

        container.appendChild(card);
    });
}

/* =========================
   IGDB SEARCH
========================= */
async function searchIgdbGames(query) {
    if (!query) {
        renderGames(allGames);
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE}/games/search?q=${encodeURIComponent(query)}`
        );
        const results = await response.json();

        renderGames(results);
    } catch (err) {
        console.error("IGDB search failed", err);
    }
}

/* =========================
   SEARCH (GLOBAL NAVBAR)
========================= */
function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get("q") || "";

    if (urlQuery) {
        searchInput.value = urlQuery;
        searchIgdbGames(urlQuery);
    }

    searchInput.addEventListener("input", e => {
        const query = e.target.value.trim();
        searchIgdbGames(query);
    });

    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (!query) return;

            window.history.pushState(
                {},
                "",
                `games.html?q=${encodeURIComponent(query)}`
            );

            searchIgdbGames(query);
        }
    });
}


/* =========================
   FETCH ALL GAMES
========================= */
async function loadAllGames() {
    try {
        const response = await fetch(`${API_BASE}/games`);
        allGames = await response.json();

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (query) {
            // Search in IGDB when arriving via search
            await searchIgdbGames(query);

            // Clear URL so refresh/navigation shows all games
            window.history.replaceState({}, "", "games.html");
        } else {
            // No search query → show games from database
            renderGames(allGames);
        }

        setupSearch();
    } catch (err) {
        console.error("Failed to load games", err);
    }
}

/* =========================
   INIT
========================= */
loadAllGames();
