import express from "express";
import gamesRouter from "./routes/games.js";
import importRoutes from "./routes/importRoutes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/games", gamesRouter);
app.use("/api/import", importRoutes);

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});
