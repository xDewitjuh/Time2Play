import express from "express";
import { db } from "./db.js";
import { games } from "./schema.js";

const app = express();
app.use(express.json());

app.get("/games", async (_req, res) => {
  const result = await db.select().from(games);
  res.json(result);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
