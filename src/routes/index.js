const express = require("express");
const auth = require("./sub_routes/auth");
const user = require("./sub_routes/user");
const games = require("./sub_routes/games");

const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/games", games);

module.exports = router;
