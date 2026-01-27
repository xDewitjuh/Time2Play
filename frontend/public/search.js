console.log("SEARCH.JS LOADED");

const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent accidental form submits / reloads

      const query = searchInput.value.trim();
      if (!query) return;

      // Redirect to games page with search query
      window.location.href = `games.html?q=${encodeURIComponent(query)}`;
    }
  });
}
