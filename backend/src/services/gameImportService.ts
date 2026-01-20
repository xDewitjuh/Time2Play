import { db } from "../db.js";
import { games } from "../schema.js";
import { searchGames } from "./igdbService.js";

export async function importGamesFromIGDB(query: string) {
  const igdbGames = await searchGames(query);

  for (const game of igdbGames) {
    await db
      .insert(games)
      .values({
        igdbId: String(game.id),
        name: game.name,
        coverUrl: game.cover?.url ?? null,
      })
      .onConflictDoNothing();
  }

  return {
    imported: igdbGames.length,
  };
}
