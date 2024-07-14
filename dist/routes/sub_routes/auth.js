"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../controllers/auth");
const auth_2 = require("../../middlewares/authorization/auth");
const router = express_1.default.Router();
router.post("/register", auth_1.register);
router.post("/login", auth_1.login);
router.get("/logout", auth_2.getAccessToRoute, auth_1.logout);
router.post("/forgotpassword", auth_1.forgotPassword);
router.put("/resetpassword", auth_1.resetPassword);
router.put("/edit", auth_2.getAccessToRoute, auth_1.editUser);
router.post("/validateEmail", auth_2.getAccessToRoute, auth_1.validateEmail);
router.put("/verifyAccount", auth_1.verifyAccount);
exports.default = router;
