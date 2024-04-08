const express = require("express");
const User = require("../models/User");
const { getAllUsers, getSingleUser,deleteUser } = require("../controllers/user");
const userQueryMiddleware = require("../middlewares/query/userQuery");
const {
  checkUserExist
} = require("../middlewares/database/databaseErrorHelpers");
const router = express.Router();

router.get("/", userQueryMiddleware(User), getAllUsers);
router.get("/:id", checkUserExist, getSingleUser);
router.delete("/deleteUser/:id", checkUserExist, deleteUser);
module.exports = router;
