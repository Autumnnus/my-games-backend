const express = require("express");
const User = require("../../models/User");
const {
  getAllUsers,
  getSingleUser,
  deleteUser
} = require("../../controllers/user");
const userQueryMiddleware = require("../../middlewares/query/userQuery");
const {
  checkUserExist,
  checkIsAdmin
} = require("../../middlewares/database/databaseErrorHelpers");
const { getAccessToRoute } = require("../../middlewares/authorization/auth");
const router = express.Router();
router.get("/", userQueryMiddleware(User), getAllUsers);
router.get("/:id", checkUserExist, getSingleUser);
router.delete(
  "/deleteUser/:id",
  [getAccessToRoute, checkUserExist, checkIsAdmin],
  deleteUser
);
module.exports = router;
