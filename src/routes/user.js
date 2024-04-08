const express = require("express");
// const {
//   checkUserExist
// } = require("../middlewares/database/databaseErrorHelpers");
const User = require("../models/User");
const { getAllUsers, getSingleUser } = require("../controllers/user");
const userQueryMiddleware = require("../middlewares/query/userQuery");
const router = express.Router();

router.get("/", userQueryMiddleware(User), getAllUsers);
// router.get("/:id", checkUserExist, getSingleUser);
module.exports = router;