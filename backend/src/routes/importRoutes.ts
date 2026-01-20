import { Router } from "express";
import { importGamesFromIGDB } from "../services/gameImportService.js";

const router = Router();

router.post("/games", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const result = await importGamesFromIGDB(query);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to import games" });
  }
});

export default router;
