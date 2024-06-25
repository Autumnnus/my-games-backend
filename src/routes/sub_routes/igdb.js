const express = require("express");
const { getIGDBGames, getIGDBGameCover } = require("../../controllers/igdb");
const { getAccessToRoute } = require("../../middlewares/authorization/auth");

const router = express.Router();

router.get("/", getAccessToRoute, getIGDBGames);
router.get("/cover/:coverId", getIGDBGameCover);

module.exports = router;
