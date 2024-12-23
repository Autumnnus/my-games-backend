import express from "express";
import {
  editUserController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
  validateEmailController,
  verifyAccountController
} from "../../controllers/auth.controller";
import { getAccessToRoute } from "../../middlewares/authorization/auth";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/logout", getAccessToRoute, logoutController);
router.post("/forgotpassword", forgotPasswordController);
router.put("/resetpassword", resetPasswordController);
router.put("/edit", getAccessToRoute, editUserController);
router.post("/validateEmail", getAccessToRoute, validateEmailController);
router.put("/verifyAccount", verifyAccountController);

export default router;
