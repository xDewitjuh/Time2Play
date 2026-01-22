type Game = {
  id: number;
  name: string;
  coverUrl: string | null;
};

async function loadRecentGames() {
  const response = await fetch("http://localhost:3001/api/games/recent?limit=6");
  const games: Game[] = await response.json();

  const container = document.getElementById("recent-games");
  if (!container) return;

  container.innerHTML = "";

  for (const game of games) {
    const card = document.createElement("div");
    card.className = "game-card";

    const img = document.createElement("img");
    img.src = game.coverUrl ?? "placeholder.jpg";

    const title = document.createElement("h3");
    title.textContent = game.name;

    card.appendChild(img);
    card.appendChild(title);

    container.appendChild(card);
  }
}

loadRecentGames();
