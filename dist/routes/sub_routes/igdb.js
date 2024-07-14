"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const igdb_1 = require("../../controllers/igdb");
const auth_1 = require("../../middlewares/authorization/auth");
const router = express_1.default.Router();
router.get("/", auth_1.getAccessToRoute, igdb_1.getIGDBGames);
router.get("/cover/:coverId", igdb_1.getIGDBGameCover);
exports.default = router;
