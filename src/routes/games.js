const express = require("express");
const {
  addNewGame,
  editNewGame,
  getUserGames
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
router.get("/userGame/:id", getUserGames);
router.put(
  "/editGame/:id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  editNewGame
);

module.exports = router;
