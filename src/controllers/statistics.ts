import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import CustomError from "../helpers/errors/CustomError";
import Games from "../models/Games";

const getUserGames = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { order, sortBy, search, page, limit } = req.query;

    let sortCriteria: { [key: string]: "asc" | "desc" | 1 | -1 } = {
      lastPlay: -1
    };
    const matchCriteria: {
      [key: string]: string | { $regex: unknown; $options: string };
    } = { userId: id };

    if (sortBy) {
      sortCriteria = { [sortBy as string]: order === "asc" ? 1 : -1 };
    }
    if (search) {
      matchCriteria.name = { $regex: search, $options: "i" };
    }

    try {
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 0;
      const skip = (pageNum - 1) * limitNum;

      const userGamesQuery = Games.find(matchCriteria).sort(sortCriteria);
      if (limitNum > 0) {
        userGamesQuery.skip(skip).limit(limitNum);
      }

      const userGames = await userGamesQuery;
      return res.status(200).json({
        success: true,
        data: userGames
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

export { getUserGames };
