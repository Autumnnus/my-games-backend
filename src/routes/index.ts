import express from "express";
import auth from "./sub_routes/auth";
import games from "./sub_routes/games";
import igdb from "./sub_routes/igdb";
import screenshot from "./sub_routes/screenshot";
import user from "./sub_routes/user";

const router = express.Router();

router.use("/auth", auth);
router.use("/users", user);
router.use("/games", games);
router.use("/screenshot", screenshot);
router.use("/igdb", igdb);

export default router;
