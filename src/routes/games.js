const express = require("express");
const {
  addNewGame,
  editNewGame,
  getUserGames,
  getUserGameDetail
} = require("../controllers/games");
const {
  getAccessToRoute,
  getGameOwnerAccess
} = require("../middlewares/authorization/auth");
const {
  checkGameExist
} = require("../middlewares/database/databaseErrorHelpers");

const router = express.Router();

router.post("/addNewGame", getAccessToRoute, addNewGame);
router.get("/user/:id", getUserGames);
router.get("/game/:gameId", getUserGameDetail);
router.put(
  "/editGame/:id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  editNewGame
);

module.exports = router;
