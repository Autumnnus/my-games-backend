const express = require("express");
const {
  getScreenshot,
  addScreenShot,
  editScreenshot,
  deleteScreenshot
} = require("../../controllers/screenshot");
const {
  getAccessToRoute,
  getGameOwnerAccess
} = require("../../middlewares/authorization/auth");
const {
  checkGameExist
} = require("../../middlewares/database/databaseErrorHelpers");
const upload = require("../../helpers/functions/multer");

const router = express.Router();

router.get("/:game_id", getScreenshot);
router.post("/addScreenshot/:game_id", getAccessToRoute, upload.single('file'), addScreenShot);
router.delete(
  "/deleteScreenshot/:game_id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  deleteScreenshot
);
router.put(
  "/editScreenshot/:game_id",
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  editScreenshot
);

module.exports = router;
