"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./sub_routes/auth"));
const games_1 = __importDefault(require("./sub_routes/games"));
const igdb_1 = __importDefault(require("./sub_routes/igdb"));
const screenshot_1 = __importDefault(require("./sub_routes/screenshot"));
const user_1 = __importDefault(require("./sub_routes/user"));
const router = express_1.default.Router();
router.use("/auth", auth_1.default);
router.use("/users", user_1.default);
router.use("/games", games_1.default);
router.use("/screenshot", screenshot_1.default);
router.use("/igdb", igdb_1.default);
exports.default = router;
