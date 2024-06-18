const express = require("express");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyAccount,
  editUser,
  validateEmail
} = require("../../controllers/auth");
const { getAccessToRoute } = require("../../middlewares/authorization/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", getAccessToRoute, logout);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.put("/edit", getAccessToRoute, editUser);
router.post("/validateEmail", getAccessToRoute, validateEmail);
router.put("/verifyAccount", verifyAccount);

module.exports = router;
