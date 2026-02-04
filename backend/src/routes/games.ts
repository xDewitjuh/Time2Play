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

/**
 * GET ALL SESSIONS
 */
router.get("/sessions", async (_req, res) => {
  try {
    const result = await db
      .select({
        id: sessions.id,
        gameId: sessions.gameId,
        startedAt: sessions.startedAt,
        endedAt: sessions.endedAt,
        gameName: games.name,
        coverUrl: games.coverUrl,
      })
      .from(sessions)
      .innerJoin(games, eq(sessions.gameId, games.id))
      .orderBy(desc(sessions.startedAt));

    res.json(result);
  } catch (err) {
    console.error("Failed to fetch sessions:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

/**
 * GET TOTAL PLAYTIME FOR GAME
 */
router.get("/:id/playtime", async (req, res) => {
  const gameId = Number(req.params.id);

  if (Number.isNaN(gameId)) {
    return res.status(400).json({ error: "Invalid game id" });
  }

  try {

    const result = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.gameId, gameId),
          isNotNull(sessions.endedAt)
        )
      );

    let totalMs = 0;

    result.forEach(session => {
      const start = new Date(session.startedAt);
      const end = new Date(session.endedAt!);
      totalMs += end.getTime() - start.getTime();
    });

    const totalMinutes = Math.floor(totalMs / 60000);

    res.json({ totalMinutes });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate playtime" });
  }
});

/* ======================================================
   GAME SESSIONS 
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

/**
 * GET ACTIVE SESSION
 */
router.get("/:id/session/active", async (req, res) => {
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

  res.json(activeSession ?? null);
});

/* ======================================================
   STATS
====================================================== */

router.get("/stats/overview", async (_req, res) => {
  try {

    // Only complete sessions
    const allSessions = await db
      .select()
      .from(sessions)
      .where(isNotNull(sessions.endedAt));

    let totalMs = 0;

    allSessions.forEach(session => {
      const start = new Date(session.startedAt);
      const end = new Date(session.endedAt!);
      totalMs += end.getTime() - start.getTime();
    });

    const totalMinutes = Math.floor(totalMs / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const totalSessions = allSessions.length;

    // Top 6 games
    const sessionWithGames = await db
      .select({
        gameId: sessions.gameId,
        name: games.name,
        coverUrl: games.coverUrl,
        startedAt: sessions.startedAt,
        endedAt: sessions.endedAt,
      })
      .from(sessions)
      .innerJoin(games, eq(sessions.gameId, games.id))
      .where(isNotNull(sessions.endedAt));

    // calculate playtime per game 
    const playtimeMap = new Map<number, any>();

    sessionWithGames.forEach(s => {
      const start = new Date(s.startedAt);
      const end = new Date(s.endedAt!);
      const duration = end.getTime() - start.getTime();

      if (!playtimeMap.has(s.gameId)) {
        playtimeMap.set(s.gameId, {
          gameId: s.gameId,
          name: s.name,
          coverUrl: s.coverUrl,
          totalMs: 0
        });
      }

      playtimeMap.get(s.gameId).totalMs += duration;
    });

    const topGames = [...playtimeMap.values()]
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 6)
      .map(g => {

        const totalMinutes = Math.floor(g.totalMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
          ...g,
          playtime: {
            hours,
            minutes
          }
        };
      });

    res.json({
      totalPlaytime: {
        hours,
        minutes
      },
      totalSessions,
      topGames
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
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