"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const screenshot_1 = require("../../controllers/screenshot");
const multer_1 = __importDefault(require("../../helpers/functions/multer"));
const auth_1 = require("../../middlewares/authorization/auth");
const databaseErrorHelpers_1 = require("../../middlewares/database/databaseErrorHelpers");
const router = express_1.default.Router();
router.get("/:game_id", screenshot_1.getScreenshot);
router.get("/get/random/:count", screenshot_1.getRandomScreenshots);
router.post("/add/:game_id", [auth_1.getAccessToRoute, databaseErrorHelpers_1.checkGameExist, auth_1.getGameOwnerAccess], multer_1.default.array("file", 50), screenshot_1.addScreenShot);
router.delete("/delete/:game_id/:screenshot_id", [auth_1.getAccessToRoute, databaseErrorHelpers_1.checkGameSSExist, auth_1.getGameSSOwnerAccess], screenshot_1.deleteScreenshot);
router.put("/edit/:game_id/:screenshot_id", [auth_1.getAccessToRoute, databaseErrorHelpers_1.checkGameSSExist, auth_1.getGameSSOwnerAccess], multer_1.default.single("file"), screenshot_1.editScreenshot);
exports.default = router;
