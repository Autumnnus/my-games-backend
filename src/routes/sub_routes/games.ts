import express from "express";
import {
  addNewGame,
  deleteGame,
  editGame,
  getFavoriteGames,
  getUserGameDetail,
  getUserGames,
  setFavoriteGames
} from "../../controllers/games";
import {
  getAccessToRoute,
  getGameOwnerAccess
} from "../../middlewares/authorization/auth";
import { checkGameExist } from "../../middlewares/database/databaseErrorHelpers";

const router = express.Router();

router.post("/add", getAccessToRoute, addNewGame);
router.get("/user/:id", getUserGames);
router.get("/game/:game_id", getUserGameDetail);
router.delete(
  "/delete/:id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  deleteGame
);
router.put(
  "/edit/:id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  editGame
);
router.post("/setFavoriteGames", getAccessToRoute, setFavoriteGames);
router.get("/getFavoriteGames/:user_id",  getFavoriteGames);

export default router;
