const express = require("express");
const {
  getScreenshot,
  addScreenShot,
  editScreenshot,
  deleteScreenshot,
  getRandomScreenshot
} = require("../../controllers/screenshot");
const {
  getAccessToRoute,
  getGameSSOwnerAccess,
  getGameOwnerAccess
} = require("../../middlewares/authorization/auth");
const {
  checkGameSSExist,
  checkGameExist
} = require("../../middlewares/database/databaseErrorHelpers");
const upload = require("../../helpers/functions/multer");

const router = express.Router();

router.get("/:game_id", getScreenshot);
router.get("/get/random", getRandomScreenshot);
router.post(
  "/add/:game_id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  upload.array("file", 50),
  addScreenShot
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

module.exports = router;
