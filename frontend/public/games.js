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

        card.innerHTML = `
      <img src="${game.coverUrl}" alt="${game.name}">
      <p>${game.name}</p>
    `;

        card.addEventListener("click", async () => {
            try {
                // Save game to library / database
                await addGameToLibrary(game);

                // Navigate to game detail page with id
                window.location.href = `game.html?id=${game.id}`;
            } catch (err) {
                console.error("Failed to add game before navigation", err);

                // Still navigate, even if saving fails 
                window.location.href = `game.html?id=${game.id}`;
            }
        });

        container.appendChild(card);
    });
}


/* =========================
   ADD TO LIBRARY
========================= */
async function addGameToLibrary(igdbGame) {
    const payload = {
        name: igdbGame.name,
        igdbId: igdbGame.id,
        coverUrl: igdbGame.cover
            ? igdbGame.cover.url.replace("t_thumb", "t_cover_big")
            : null
    };

    const res = await fetch(`${API_BASE}/games`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Failed to add game");
    }
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
