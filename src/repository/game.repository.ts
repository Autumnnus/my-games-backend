/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import Games from "../models/Games";
import { StatisticsResponse } from "../types/statistics";

type MatchCriteria = {
  [key: string]: string | { $regex: unknown; $options: string };
};

type SortCriteria = {
  [key: string]: "asc" | "desc" | 1 | -1;
};

async function getGameById(id: string) {
  return await Games.findById(id);
}

async function getUserGameById(userId: string) {
  return await Games.find({ userId });
}

async function createGame(data: any, userId: string) {
  return await Games.create({
    ...data,
    userId
  });
}

async function findGameByIdAndDelete(id: string) {
  return await Games.findByIdAndDelete(id);
}

async function getGames(
  matchCriteria: MatchCriteria,
  sortCriteria: SortCriteria,
  skip?: number | undefined,
  limit?: number | undefined
) {
  const query = Games.find(matchCriteria).sort(sortCriteria);

  if (Number(skip) > 0) query.skip(Number(skip));
  if (Number(limit) > 0) query.limit(Number(limit));

  return await query;
}

async function getGameStatistics(userId?: string): Promise<StatisticsResponse> {
  const matchStage = userId
    ? { $match: { userId: new mongoose.Types.ObjectId(userId) } }
    : { $match: {} };

  const results = await Games.aggregate([
    matchStage,
    {
      $facet: {
        platformStats: [
          {
            $group: {
              _id: "$platform",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        statusStats: [
          {
            $group: {
              _id: "$status",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        genreStats: [
          { $unwind: "$igdb.genres" },
          {
            $group: {
              _id: "$igdb.genres.name",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        developerStats: [
          { $unwind: "$igdb.involved_companies" },
          { $match: { "igdb.involved_companies.developer": true } },
          {
            $group: {
              _id: "$igdb.involved_companies.company.name",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        publisherStats: [
          { $unwind: "$igdb.involved_companies" },
          { $match: { "igdb.involved_companies.publisher": true } },
          {
            $group: {
              _id: "$igdb.involved_companies.company.name",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        gameModeStats: [
          { $unwind: "$igdb.game_modes" },
          {
            $group: {
              _id: "$igdb.game_modes.name",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        ratingStats: [
          { $match: { "igdb.aggregated_rating": { $exists: true } } },
          {
            $bucket: {
              groupBy: "$igdb.aggregated_rating",
              boundaries: [0, 50, 75, 90, 100],
              default: "Others",
              output: { playTime: { $sum: "$playTime" }, count: { $sum: 1 } }
            }
          }
        ],
        themeStats: [
          { $unwind: "$igdb.themes" },
          {
            $group: {
              _id: "$igdb.themes.name",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ],
        releaseYearStats: [
          { $match: { "igdb.first_release_date": { $exists: true } } },
          {
            $addFields: {
              releaseDate: {
                $toDate: { $multiply: ["$igdb.first_release_date", 1000] }
              }
            }
          },
          {
            $group: {
              _id: { $year: "$releaseDate" },
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: 1 } }
        ],
        playerPerspectiveStats: [
          { $unwind: "$igdb.player_perspectives" },
          {
            $group: {
              _id: "$igdb.player_perspectives.name",
              playTime: { $sum: "$playTime" },
              count: { $sum: 1 }
            }
          },
          { $sort: { playTime: -1 } }
        ]
      }
    }
  ]);

  const [
    {
      platformStats,
      statusStats,
      genreStats,
      developerStats,
      publisherStats,
      gameModeStats,
      ratingStats,
      themeStats,
      releaseYearStats,
      playerPerspectiveStats
    }
  ] = results;

  return {
    platformStats,
    statusStats,
    genreStats,
    developerStats,
    publisherStats,
    gameModeStats,
    ratingStats,
    themeStats,
    releaseYearStats,
    playerPerspectiveStats
  };
}

export default {
  getGameById,
  getUserGameById,
  getGames,
  createGame,
  findGameByIdAndDelete,
  getGameStatistics
};
