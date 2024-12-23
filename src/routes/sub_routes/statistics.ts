import express from "express";
import {
  getStatisticsController,
  getUserStatisticsController
} from "../../controllers/statistics.controller";
import { checkUserExist } from "../../middlewares/database/databaseErrorHelpers";

const router = express.Router();

router.get("/", getStatisticsController);
router.get("/:id", checkUserExist, getUserStatisticsController);

export default router;
