import express from "express";
import {
  editUser,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  validateEmail,
  verifyAccount
} from "../../controllers/auth";
import { getAccessToRoute } from "../../middlewares/authorization/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", getAccessToRoute, logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.put("/edit", getAccessToRoute, editUser);
router.post("/validateEmail", getAccessToRoute, validateEmail);
router.put("/verifyAccount", verifyAccount);

export default router;
