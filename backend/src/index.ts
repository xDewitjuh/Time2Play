import express from "express";
import gamesRouter from "./routes/games.js";
import { db } from "./db.js";
import { games } from "./schema.js";
import importRoutes from "./routes/importRoutes.js";
import { importGamesFromIGDB } from "./services/gameImportService.js";

(async () => {
  const result = await importGamesFromIGDB("Mario");
  console.log(result);
})();

const app = express();
app.use(express.json());
app.use("/api/import", importRoutes);

app.get("/games", async (_req, res) => {
  const result = await db.select().from(games);
  res.json(result);
});

app.use("/games", gamesRouter);

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});
