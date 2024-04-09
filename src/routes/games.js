const express = require("express");
const {
  addNewGame,
  editNewGame,
  getUserGames,
  deleteGame,
  getUserGameDetail,
  addScreenShoot,
  editScreenshoot,
  deleteScreenshot
} = require("../controllers/games");
const {
  getAccessToRoute,
  getGameOwnerAccess
} = require("../middlewares/authorization/auth");
const {
  checkGameExist
} = require("../middlewares/database/databaseErrorHelpers");
const userQueryMiddleware = require("../middlewares/query/userQuery");
const Games = require("../models/Games");

const router = express.Router();

router.post("/addNewGame", getAccessToRoute, addNewGame);
router.post("/:game_id/addSS", getAccessToRoute, addScreenShoot);
router.get("/user/:id", userQueryMiddleware(Games), getUserGames);
router.get("/game/:game_id", getUserGameDetail);
router.delete(
  "/deleteGame/:id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  deleteGame
);
router.delete(
  "/:game_id/deleteSS/:screenshotId",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  deleteScreenshot
);
router.put(
  "/editGame/:id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  editNewGame
);
router.put(
  "/:game_id/editSS/:screenshotId",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  editScreenshoot
);

module.exports = router;
