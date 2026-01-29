import { Router } from "express";
import { db } from "../db.js";
import { games, sessions } from "../schema.js";
import { searchGames, getGameByIgdbId } from "../services/igdbService.js";
import { desc, eq, isNotNull, isNull, and } from "drizzle-orm";

const router = Router();

/* ======================================================
   IGDB
====================================================== */

router.get("/search", async (req, res) => {
  const query = req.query.q as string;

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  const results = await searchGames(query);
  res.json(results);
});

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
      description: game.summary ?? null,
    })
    .onConflictDoNothing()
    .returning();

  res.status(201).json(inserted[0]);
});

/* ======================================================
   DATABASE READ API
====================================================== */

router.get("/", async (_req, res) => {
  const result = await db.select().from(games);
  res.json(result);
});

router.get("/recent", async (req, res) => {
  const limit = Number(req.query.limit) || 6;

  const result = await db
    .select()
    .from(games)
    .where(isNotNull(games.lastPlayedAt))
    .orderBy(desc(games.lastPlayedAt))
    .limit(limit);

  res.json(result);
});

router.get("/recommended", async (_req, res) => {
  const result = await db
    .select()
    .from(games)
    .orderBy(desc(games.createdAt))
    .limit(6);

  res.json(result);
});

/* ======================================================
   GAME SESSIONS (REAL)
====================================================== */

/**
 * START SESSION
 */
router.post("/:id/session/start", async (req, res) => {
  const gameId = Number(req.params.id);

  if (Number.isNaN(gameId)) {
    return res.status(400).json({ error: "Invalid game id" });
  }

  const game = await db
    .select()
    .from(games)
    .where(eq(games.id, gameId))
    .limit(1);

  if (!game.length) {
    return res.status(404).json({ error: "Game not found" });
  }

  const activeSession = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.gameId, gameId),
        isNull(sessions.endedAt)
      )
    )
    .limit(1);

  if (activeSession.length) {
    return res.status(400).json({ error: "Session already active" });
  }

  const createdSession = await db
    .insert(sessions)
    .values({
      gameId,
      startedAt: new Date(),
    })
    .returning();

  // keep lastPlayedAt in sync (for now)
  await db
    .update(games)
    .set({ lastPlayedAt: new Date() })
    .where(eq(games.id, gameId));

  res.status(201).json(createdSession[0]);
});

/**
 * STOP SESSION
 */
router.post("/:id/session/stop", async (req, res) => {
  const gameId = Number(req.params.id);

  if (Number.isNaN(gameId)) {
    return res.status(400).json({ error: "Invalid game id" });
  }

const [activeSession] = await db
  .select()
  .from(sessions)
  .where(
    and(
      eq(sessions.gameId, gameId),
      isNull(sessions.endedAt)
    )
  )
  .limit(1);

if (!activeSession) {
  return res.status(400).json({ error: "No active session" });
}


  const stopped = await db
    .update(sessions)
    .set({ endedAt: new Date() })
    .where(eq(sessions.id, activeSession.id))
    .returning();

  res.json(stopped[0]);
});

/* ======================================================
   SINGLE GAME
====================================================== */

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const result = await db
    .select()
    .from(games)
    .where(eq(games.id, id))
    .limit(1);

  if (!result.length) {
    return res.status(404).json({ error: "Game not found" });
  }

  res.json(result[0]);
});

export default router;
