"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../../controllers/user");
const auth_1 = require("../../middlewares/authorization/auth");
const databaseErrorHelpers_1 = require("../../middlewares/database/databaseErrorHelpers");
const router = express_1.default.Router();
router.get("/", user_1.getAllUsers);
router.get("/:id", databaseErrorHelpers_1.checkUserExist, user_1.getSingleUser);
router.delete("/deleteUser/:id", [auth_1.getAccessToRoute, databaseErrorHelpers_1.checkUserExist, databaseErrorHelpers_1.checkIsAdmin], user_1.deleteUser);
exports.default = router;
