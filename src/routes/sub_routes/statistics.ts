import express from 'express';
import {
  getStatisticsController,
  getUserStatisticsController,
  updateStatisticsController,
} from '../../controllers/statistics.controller';
import { getAccessToRoute } from '../../middlewares/authorization/auth';

const router = express.Router();

router.get('/', getStatisticsController);
router.get('/:id', getUserStatisticsController);
router.put('/', getAccessToRoute, updateStatisticsController);

export default router;
