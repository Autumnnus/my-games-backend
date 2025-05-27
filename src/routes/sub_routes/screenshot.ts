import express, { RequestHandler } from 'express';
import {
  addScreenshotController,
  deleteScreenshotController,
  editScreenshotController,
  getRandomScreenshotsController,
  getScreenshotController,
} from '../../controllers/screenshot.controller';
import upload from '../../helpers/functions/multer';
import {
  getAccessToRoute,
  getGameOwnerAccess,
  getGameSSOwnerAccess,
} from '../../middlewares/authorization/auth';
import { checkGameExist, checkGameSSExist } from '../../middlewares/database/databaseErrorHelpers';

const router = express.Router();

router.get('/:game_id', getScreenshotController);
router.get('/get/random/:count', getRandomScreenshotsController);
router.post(
  '/add/:game_id',
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  upload.array('file', 50),
  addScreenshotController as RequestHandler
);
router.delete(
  '/delete/:game_id/:screenshot_id',
  [getAccessToRoute, checkGameSSExist, getGameSSOwnerAccess],
  deleteScreenshotController
);
router.put(
  '/edit/:game_id/:screenshot_id',
  [getAccessToRoute, checkGameSSExist, getGameSSOwnerAccess],
  upload.single('file'),
  editScreenshotController
);

export default router;
