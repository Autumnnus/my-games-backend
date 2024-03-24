const express = require("express");
const { generateAccessToken } = require("../helpers/auth/jwt-helper");
const {
  register
//   getUser,
//   login,
//   logout,
//   imageUpload,
//   forgotPassword,
//   resetPassword,
//   editDetails
} = require("../controllers/auth");
// const { getAccessToRoute } = require("../middlewares/authorization/auth");
// const profileImageUpload = require("../middlewares/libraries/profileImageUpload");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Auth routes...");
});

// router.post("/register", (req, res) => {
//   res.send("Register route...");
//   const username = req.body.username;
//   const password = req.body.password;
//   const user = { username: username, password: password };
//   generateAccessToken(user);
// });
router.post("/login", (req, res) => {
  res.send("Register route...");
  const username = req.body.username;
  const password = req.body.password;
  const user = { username: username, password: password };
  generateAccessToken(user);
});

router.post("/register", register);
// router.post("/login", login);
// router.get("/profile", getAccessToRoute, getUser);
// router.get("/logout", getAccessToRoute, logout);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword", resetPassword);
// router.put("/edit", getAccessToRoute, editDetails);
// router.post(
//   "/upload",
//   [getAccessToRoute, profileImageUpload.single("profile_image")],
//   imageUpload
// );

module.exports = router;
