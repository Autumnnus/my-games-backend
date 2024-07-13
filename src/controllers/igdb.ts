import asyncErrorWrapper from "express-async-handler";
import CustomError from "../helpers/errors/CustomError";
import dotenv from "dotenv";
dotenv.config();

const getIGDBGames = asyncErrorWrapper(async (req, res, next) => {
  const { search } = req.query;
  const fields =
    "fields=name,id,cover.game,cover.url,slug,summary,genres.name,themes.name,player_perspectives.name,game_modes.name,release_dates.date,involved_companies.publisher,involved_companies.developer,aggregated_rating,involved_companies.company.name,aggregated_rating_count";
  fetch(`https://api.igdb.com/v4/games?search=${search}&${fields}`, {
    method: "POST",
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
        data: data
      });
    })
    .catch((error) => {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    });
});
const getIGDBGameCover = asyncErrorWrapper(async (req, res, next) => {
  const { coverId } = req.params;
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
});

export { getIGDBGames, getIGDBGameCover };
