import express from "express";
import { getIGDBGameCover, getIGDBGames } from "../../controllers/igdb";
import { getAccessToRoute } from "../../middlewares/authorization/auth";

const router = express.Router();

router.get("/", getAccessToRoute, getIGDBGames);
router.get("/cover/:coverId", getIGDBGameCover);

export default router;
