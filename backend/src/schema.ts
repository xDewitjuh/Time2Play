import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

/**
 * =========================
 * GAMES
 * =========================
 */
export const games = pgTable("games", {
  id: serial("id").primaryKey(),

  igdbId: varchar("igdb_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  coverUrl: varchar("cover_url", { length: 500 }),

  // Game description (from IGDB summary)
  description: text("description"),

  // Last time a session was started (used for recent games)
  lastPlayedAt: timestamp("last_played_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * =========================
 * SESSIONS
 * =========================
 * One game can have many sessions
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),

  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});
