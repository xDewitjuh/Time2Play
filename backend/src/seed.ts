import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { games } from "./schema.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  await db.insert(games).values([
    {
      igdbId: "1020",
      name: "Super Mario Bros",
      coverUrl: "https://example.com/mario.jpg",
    },
    {
      igdbId: "7346",
      name: "The Legend of Zelda: Ocarina of Time",
      coverUrl: "https://example.com/zelda.jpg",
    },
  ]);

  console.log("Seed data inserted");
  await pool.end();
}

seed();
