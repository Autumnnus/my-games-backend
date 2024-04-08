const express = require("express");
const auth = require("./auth");
const user = require("./user");
const games = require("./games");

//api
const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/games", games);

module.exports = router;
