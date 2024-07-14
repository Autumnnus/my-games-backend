"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const games_1 = require("../../controllers/games");
const auth_1 = require("../../middlewares/authorization/auth");
const databaseErrorHelpers_1 = require("../../middlewares/database/databaseErrorHelpers");
const router = express_1.default.Router();
router.post("/add", auth_1.getAccessToRoute, games_1.addNewGame);
router.get("/user/:id", games_1.getUserGames);
router.get("/game/:game_id", games_1.getUserGameDetail);
router.delete("/delete/:id", [auth_1.getAccessToRoute, databaseErrorHelpers_1.checkGameExist, auth_1.getGameOwnerAccess], games_1.deleteGame);
router.put("/edit/:id", [auth_1.getAccessToRoute, databaseErrorHelpers_1.checkGameExist, auth_1.getGameOwnerAccess], games_1.editGame);
exports.default = router;
