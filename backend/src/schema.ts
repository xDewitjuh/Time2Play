import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),

  igdbId: varchar("igdb_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  coverUrl: varchar("cover_url", { length: 500 }),

  lastPlayedAt: timestamp("last_played_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
