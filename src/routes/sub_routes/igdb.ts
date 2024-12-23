import express from "express";

import { getIGDBGames } from "../../controllers/igdb.controller";
import { getAccessToRoute } from "../../middlewares/authorization/auth";

const router = express.Router();

router.get("/", getAccessToRoute, getIGDBGames);

export default router;
