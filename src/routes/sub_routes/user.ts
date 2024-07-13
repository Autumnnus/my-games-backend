import express from "express";
import { deleteUser, getAllUsers, getSingleUser } from "../../controllers/user";
import { getAccessToRoute } from "../../middlewares/authorization/auth";
import {
  checkIsAdmin,
  checkUserExist
} from "../../middlewares/database/databaseErrorHelpers";
import userQueryMiddleware from "../../middlewares/query/userQuery";
import User from "../../models/User";

const router = express.Router();

router.get("/", userQueryMiddleware(User), getAllUsers);
router.get("/:id", checkUserExist, getSingleUser);
router.delete(
  "/deleteUser/:id",
  [getAccessToRoute, checkUserExist, checkIsAdmin],
  deleteUser
);

export default router;
