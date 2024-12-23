import dotenv from "dotenv";
import { Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import { createResponse } from "../middlewares/error/CreateResponse";
import igdbService from "../services/igdb.service";
dotenv.config();

const getIGDBGames = asyncErrorWrapper(async (req: Request, res: Response) => {
  const { search } = req.query;
  try {
    const game = await igdbService.getIGDBGames(search as string);
    res.status(200).json(createResponse(game));
  } catch (error) {
    res.status(404).json(createResponse(null, false, `Error: ${error}`));
  }
});

export { getIGDBGames };
