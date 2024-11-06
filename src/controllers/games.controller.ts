import { NextFunction, Request, Response } from "express";
import { default as expressAsyncHandler } from "express-async-handler";
import CustomError from "../helpers/errors/CustomError";
import { createResponse } from "../middlewares/error/CreateResponse";
import Games from "../models/Games";
import User from "../models/User";
import gameService from "../services/game.service";
import { GamesData } from "../types/models";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const addNewGame = expressAsyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { status } = req.body;
    try {
      const game = await Games.create({
        ...req.body,
        userId: req.user?.id
      });
      const user = await User.findById(req.user?.id);
      if (!user) {
        return next(new CustomError("User not found", 404));
      }
      const userGames = await Games.find({ userId: req.user?.id });
      if (status === "completed") {
        user.completedGameSize =
          userGames.filter((game) => game.status === "completed").length + 1;
      }
      user.gameSize = userGames.length + 1;
      await user.save();
      return res.status(200).json({
        success: true,
        data: game
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const editGame = expressAsyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    const {
      name,
      photo,
      lastPlay,
      platform,
      review,
      rating,
      status,
      playTime,
      firstFinished,
      igdb
    } = req.body;
    try {
      let game = await Games.findById(id);
      if (!game) {
        return next(new CustomError("Game not found", 404));
      }
      console.log("igdb", igdb);
      console.log("game.igdb", game.igdb);
      const updatedIGDB =
        igdb && igdb.cover && Object.keys(igdb.cover).length > 0
          ? igdb
          : game.igdb;

      const updatedGameFields: {
        name: GamesData["name"];
        photo: GamesData["photo"];
        lastPlay: GamesData["lastPlay"];
        platform: GamesData["platform"];
        review: GamesData["review"];
        rating: GamesData["rating"];
        status: GamesData["status"];
        playTime: GamesData["playTime"];
        firstFinished: GamesData["firstFinished"];
        igdb?: GamesData["igdb"];
      } = {
        name: name || game.name,
        photo: photo || game.photo,
        lastPlay: lastPlay || game.lastPlay,
        platform: platform || game.platform,
        review: review || game.review,
        rating: rating || game.rating,
        status: status || game.status,
        playTime: playTime || game.playTime,
        firstFinished: firstFinished || game.firstFinished,
        igdb: updatedIGDB
      };
      Object.assign(game, updatedGameFields);
      game = await game.save();

      const oldStatus = game.status;
      const userGames = await Games.find({ userId: req.user?.id });
      if (oldStatus !== status) {
        const user = await User.findById(game.userId);
        if (!user) {
          return next(new CustomError("User not found", 404));
        }
        if (status === "completed") {
          user.completedGameSize =
            userGames.filter((game) => game.status === "completed").length + 1;
        } else if (oldStatus === "completed" && status !== "completed") {
          user.completedGameSize =
            userGames.filter((game) => game.status === "completed").length - 1;
        }
        await user.save();
      }
      return res.status(200).json({
        success: true,
        data: {
          _id: game._id,
          ...updatedGameFields
        }
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const deleteGame = expressAsyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const game = await Games.findById(id);
      if (!game) {
        return next(new CustomError("Game not found", 404));
      }
      const user = await User.findById(game.userId);
      if (!user) {
        return next(new CustomError("User not found", 404));
      }
      const userGames = await Games.find({ userId: req.user?.id });
      if (game.status === "completed") {
        user.completedGameSize =
          userGames.filter((game) => game.status === "completed").length - 1;
        await user.save();
      }
      user.gameSize = userGames.length + 1;
      await Games.findByIdAndDelete(id);
      await user.save();
      res.status(200).json({
        success: true,
        message: `User with id ${id} has been deleted along with their games`
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
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
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { first_game, second_game, third_game } = req.body;

    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return next(new CustomError("User not found", 404));
      }

      const gameIds = [first_game, second_game, third_game];
      const games = await Promise.all(gameIds.map((id) => Games.findById(id)));

      for (const [index, game] of games.entries()) {
        if (!game) {
          return next(new CustomError(`Game ${index + 1} not found`, 404));
        }
        game.isFavorite = true;
        await game.save();
      }

      await Games.updateMany(
        { _id: { $nin: gameIds }, isFavorite: true },
        { isFavorite: false }
      );

      user.favoriteGames = gameIds;
      await user.save();
      return res.status(200).json({
        success: true,
        data: games.map((game) => {
          return {
            _id: game?._id,
            name: game?.name,
            photo: game?.photo,
            rating: game?.rating
          };
        })
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 500));
    }
  }
);

const getFavoriteGames = expressAsyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { user_id } = req.params;
      const user = await User.findById(user_id).populate("favoriteGames");
      if (!user) {
        return next(new CustomError("User not found", 404));
      }

      return res.status(200).json({
        success: true,
        data: user.favoriteGames?.map((game) => {
          return {
            _id: game._id,
            name: game.name,
            photo: game.photo,
            rating: game.rating
          };
        })
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 500));
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
