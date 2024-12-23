import express from "express";
import {
  deleteUserController,
  getAllUsersController,
  getSingleUserController
} from "../../controllers/user.controller";
import { getAccessToRoute } from "../../middlewares/authorization/auth";
import {
  checkIsAdmin,
  checkUserExist
} from "../../middlewares/database/databaseErrorHelpers";

const router = express.Router();

router.get("/", getAllUsersController);
router.get("/:id", checkUserExist, getSingleUserController);
router.delete(
  "/deleteUser/:id",
  [getAccessToRoute, checkUserExist, checkIsAdmin],
  deleteUserController
);

export default router;
