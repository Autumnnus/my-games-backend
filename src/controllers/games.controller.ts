import { Request, Response } from "express";
import { default as expressAsyncHandler } from "express-async-handler";
import { createResponse } from "../middlewares/error/CreateResponse";
import gameService from "../services/game.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const addNewGame = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const game = await gameService.addNewGame(req.body, req.user?.id || "");
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const editGame = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const game = await gameService.editGame(req.body, id, req.user?.id || "");
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const deleteGame = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const game = await gameService.deleteGame(id, req.user?.id || "");
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);
const getUserGames = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { order, sortBy, search, page, limit } = req.query;

    try {
      const userGames = await gameService.getUserGames({
        id,
        sortBy: sortBy as string,
        order: order as "asc" | "desc",
        search: search as string,
        page: Number(page),
        limit: Number(limit)
      });
      res.status(200).json(createResponse(userGames));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getUserGameDetail = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { game_id } = req.params;
      const game = await gameService.getGameDetail(game_id);
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const setFavoriteGames = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { first_game, second_game, third_game } = req.body;

    try {
      const game = await gameService.setFavoriteGames(req.user?.id || "", [
        first_game,
        second_game,
        third_game
      ]);
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getFavoriteGames = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { user_id } = req.params;
      const game = await gameService.getFavoriteGames(user_id || "");
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

export {
  addNewGame,
  deleteGame,
  editGame,
  getFavoriteGames,
  getUserGameDetail,
  getUserGames,
  setFavoriteGames
};
