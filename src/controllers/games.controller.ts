import { Request, Response } from "express";
import { default as expressAsyncHandler } from "express-async-handler";
import { createResponse } from "../middlewares/error/CreateResponse";
import gameService from "../services/game.service";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const addNewGameController = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const game = await gameService.addNewGameService(
        req.body,
        req.user?.id || ""
      );
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const editGameController = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      const game = await gameService.editGameService(
        req.body,
        id,
        req.user?.id || ""
      );
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const deleteGameController = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      const game = await gameService.deleteGameService(id, req.user?.id || "");
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);
const getUserGamesController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { order, sortBy, search, page, limit } = req.query;

    try {
      const userGames = await gameService.getUserGamesService({
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

const getUserGameDetailController = expressAsyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { game_id } = req.params;
      const game = await gameService.getGameDetailService(game_id);
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const setFavoriteGamesController = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { first_game, second_game, third_game } = req.body;

    try {
      const game = await gameService.setFavoriteGamesService(
        req.user?.id || "",
        [first_game, second_game, third_game]
      );
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getFavoriteGamesController = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { user_id } = req.params;
    try {
      const game = await gameService.getFavoriteGamesService(user_id || "");
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

export {
  addNewGameController,
  deleteGameController,
  editGameController,
  getFavoriteGamesController,
  getUserGameDetailController,
  getUserGamesController,
  setFavoriteGamesController
};
