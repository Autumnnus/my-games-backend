const express = require("express");
const {
  register,
  login,
  logout,
  //   getUser,
  //   imageUpload,
  //   forgotPassword,
  //   resetPassword,
  editUser
} = require("../controllers/auth");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
// const profileImageUpload = require("../middlewares/libraries/profileImageUpload");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", getAccessToRoute, logout);
// router.get("/profile", getAccessToRoute, getUser);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword", resetPassword);
router.put("/edit", getAccessToRoute, editUser);
// router.post(
//   "/upload",
//   [getAccessToRoute, profileImageUpload.single("profile_image")],
//   imageUpload
// );

module.exports = router;
