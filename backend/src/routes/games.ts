import { Router } from "express";
import { db } from "../db.js";
import { games } from "../schema.js";
import { searchGames, getGameByIgdbId } from "../services/igdbService.js";

const router = Router();

/**
 * Search games via IGDB (not yet saved)
 */
router.get("/search", async (req, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const results = await searchGames(query);
  res.json(results);
});

/**
 * Add game to own database
 */
router.post("/", async (req, res) => {
  const { igdbId } = req.body;

  if (!igdbId) {
    return res.status(400).json({ error: "Missing igdbId" });
  }

  const game = await getGameByIgdbId(Number(igdbId));

  if (!game) {
    return res.status(404).json({ error: "Game not found" });
  }

  const inserted = await db
    .insert(games)
    .values({
      igdbId: String(game.id),
      name: game.name,
      coverUrl: game.cover?.url
        ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
        : null,
    })
    .returning();

  res.status(201).json(inserted[0]);
});

export default router;
