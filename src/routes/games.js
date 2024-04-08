const express = require("express");
const { addNewGame } = require("../controllers/games");
const { getAccessToRoute } = require("../middlewares/authorization/auth");

const router = express.Router();

router.post("/addNewGame", getAccessToRoute, addNewGame);

module.exports = router;
