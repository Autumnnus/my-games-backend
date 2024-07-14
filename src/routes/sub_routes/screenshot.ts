import express, { RequestHandler } from "express";
import {
  addScreenShot,
  deleteScreenshot,
  editScreenshot,
  getRandomScreenshots,
  getScreenshot
} from "../../controllers/screenshot";
import upload from "../../helpers/functions/multer";
import {
  getAccessToRoute,
  getGameOwnerAccess,
  getGameSSOwnerAccess
} from "../../middlewares/authorization/auth";
import {
  checkGameExist,
  checkGameSSExist
} from "../../middlewares/database/databaseErrorHelpers";

const router = express.Router();

router.get("/:game_id", getScreenshot);
router.get("/get/random/:count", getRandomScreenshots);
router.post(
  "/add/:game_id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  upload.array("file", 50),
  addScreenShot as RequestHandler
);
router.delete(
  "/delete/:game_id/:screenshot_id",
  [getAccessToRoute, checkGameSSExist, getGameSSOwnerAccess],
  deleteScreenshot
);
router.put(
  "/edit/:game_id/:screenshot_id",
  [getAccessToRoute, checkGameSSExist, getGameSSOwnerAccess],
  upload.single("file"),
  editScreenshot
);

export default router;
