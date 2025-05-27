import express from 'express';
import {
  addNewGameController,
  deleteGameController,
  editGameController,
  getFavoriteGamesController,
  getUserGameDetailController,
  getUserGamesController,
  setFavoriteGamesController,
} from '../../controllers/games.controller';
import { getAccessToRoute, getGameOwnerAccess } from '../../middlewares/authorization/auth';
import { checkGameExist } from '../../middlewares/database/databaseErrorHelpers';

const router = express.Router();

router.post('/add', getAccessToRoute, addNewGameController);
router.get('/user/:id', getUserGamesController);
router.get('/game/:game_id', getUserGameDetailController);
router.delete(
  '/delete/:id',
  [getAccessToRoute, checkGameExist, getGameOwnerAccess],
  deleteGameController
);
router.put('/edit/:id', [getAccessToRoute, checkGameExist, getGameOwnerAccess], editGameController);
router.post('/setFavoriteGames', getAccessToRoute, setFavoriteGamesController);
router.get('/getFavoriteGames/:user_id', getFavoriteGamesController);

export default router;
