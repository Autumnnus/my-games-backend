import dotenv from 'dotenv';
import { Request, Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { createResponse } from '../middlewares/error/CreateResponse';
import igdbService from '../services/igdb.service';
dotenv.config();

const getIGDBGamesController = asyncErrorWrapper(async (req: Request, res: Response) => {
  const { search } = req.query;
  try {
    const games = await igdbService.getIGDBGamesService(search as string);
    res.status(200).json(createResponse(games));
  } catch (error) {
    res.status(404).json(createResponse(null, false, `Error: ${error}`));
  }
});

const getIGDBGameController = asyncErrorWrapper(async (req: Request, res: Response) => {
  const { gameId } = req.params;
  try {
    const game = await igdbService.getIGDBGameService(Number(gameId));
    res.status(200).json(createResponse(game));
  } catch (error) {
    res.status(404).json(createResponse(null, false, `Error: ${error}`));
  }
});

const updateGameIGDBDataController = asyncErrorWrapper(async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).json(createResponse('This action is only allowed in development mode'));
  }
  const { mongoId } = req.body;
  try {
    const game = await igdbService.updateGameIGDBDataService(mongoId);
    res.status(200).json(createResponse(game));
  } catch (error) {
    res.status(404).json(createResponse(null, false, `Error: ${error}`));
  }
});
const updateAllGamesIGDBDataController = asyncErrorWrapper(async (_: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).json(createResponse('This action is only allowed in development mode'));
  }
  try {
    const game = await igdbService.updateAllGamesIGDBDataService();
    res.status(200).json(createResponse(game));
  } catch (error) {
    res.status(404).json(createResponse(null, false, `Error: ${error}`));
  }
});

export {
  getIGDBGameController,
  getIGDBGamesController,
  updateAllGamesIGDBDataController,
  updateGameIGDBDataController,
};
