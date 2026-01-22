import { Router } from "express";
import { db } from "../db.js";
import { games } from "../schema.js";
import { searchGames, getGameByIgdbId } from "../services/igdbService.js";
import { desc } from "drizzle-orm";

const router = Router();

/**
 * =========================
 * IGDB
 * =========================
 */

/**
 * GET /api/games/search?q=...
 * Search games via IGDB (not saved yet)
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
 * POST /api/games
 * Add a game to the database using IGDB ID
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
    .onConflictDoNothing()
    .returning();

  res.status(201).json(inserted[0]);
});

/**
 * =========================
 * DATABASE READ API
 * =========================
 */

/**
 * GET /api/games
 * Get all games in database
 */
router.get("/", async (_req, res) => {
  const result = await db.select().from(games);
  res.json(result);
});

/**
 * GET /api/games/recent?limit=6
 * Recently played games
 */
router.get("/recent", async (req, res) => {
  const limit = Number(req.query.limit) || 6;

  const result = await db
    .select()
    .from(games)
    .orderBy(desc(games.lastPlayedAt))
    .limit(limit);

  res.json(result);
});

/**
 * GET /api/games/recommended
 * Recently added games
 */
router.get("/recommended", async (_req, res) => {
  const result = await db
    .select()
    .from(games)
    .orderBy(desc(games.createdAt))
    .limit(6);

  res.json(result);
});

export default router;
