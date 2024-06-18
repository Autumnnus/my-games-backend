const express = require("express");
const {
  addNewGame,
  editGame,
  getUserGames,
  deleteGame,
  getUserGameDetail
} = require("../../controllers/games");
const {
  getAccessToRoute,
  getGameOwnerAccess
} = require("../../middlewares/authorization/auth");
const {
  checkGameExist
} = require("../../middlewares/database/databaseErrorHelpers");

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

module.exports = router;
