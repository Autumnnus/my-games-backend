import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import CustomError from "../helpers/errors/CustomError";
dotenv.config();

const getIGDBGames = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.query;
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_ACCESS_TOKEN) {
      return next(
        new CustomError(
          "Please provide IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN",
          400
        )
      );
    }
    const body = `
      fields name,id,cover.game,cover.url,slug,summary,genres.name,themes.name,player_perspectives.name,game_modes.name,release_dates.date,involved_companies.publisher,involved_companies.developer,aggregated_rating,involved_companies.company.name,aggregated_rating_count,category;
      where category = (0,4,8,9);
      limit 30;
      search "${search}";
    `;
    fetch(`https://api.igdb.com/v4/games`, {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: body
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return res.status(200).json({
          success: true,
          data: data
        });
      })
      .catch((error) => {
        console.error("ERROR: ", error);
        return next(new CustomError(`Error: ${error}`, 404));
      });
  }
);
const getIGDBGameCover = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { coverId } = req.params;
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_ACCESS_TOKEN) {
      return next(
        new CustomError(
          "Please provide IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN",
          400
        )
      );
    }
    fetch(`https://api.igdb.com/v4/covers/${coverId}?fields=*`, {
      method: "GET",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Body: "fields *;"
      }
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return res.status(200).json({
          success: true,
          data: data[0]
        });
      })
      .catch((error) => {
        console.error("ERROR: ", error);
        return next(new CustomError(`Error: ${error}`, 404));
      });
  }
);

export { getIGDBGameCover, getIGDBGames };
