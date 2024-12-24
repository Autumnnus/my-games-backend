import express from "express";

import {
  getIGDBGameController,
  getIGDBGamesController,
  updateAllGamesIGDBDataController,
  updateGameIGDBDataController
} from "../../controllers/igdb.controller";
import { getAccessToRoute } from "../../middlewares/authorization/auth";
import { checkIsAdmin } from "../../middlewares/database/databaseErrorHelpers";

const router = express.Router();

router.get("/", getAccessToRoute, getIGDBGamesController);
router.get("/:gameId", getAccessToRoute, getIGDBGameController);
router.put("/", [getAccessToRoute, checkIsAdmin], updateGameIGDBDataController);
router.put(
  "/all",
  [getAccessToRoute, checkIsAdmin],
  updateAllGamesIGDBDataController
);

export default router;
