/* eslint-disable @typescript-eslint/no-explicit-any */
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

async function getGameStatistics(): Promise<StatisticsResponse> {
  const playTimeStats = await Games.aggregate([
    { $group: { _id: "$platform", totalPlayTime: { $sum: "$playTime" } } },
    { $sort: { totalPlayTime: -1 } }
  ]);

  const platformStats = await Games.aggregate([
    { $group: { _id: "$platform", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const statusStats = await Games.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const genreStats = await Games.aggregate([
    { $unwind: "$igdb.genres" },
    { $group: { _id: "$igdb.genres.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const developerStats = await Games.aggregate([
    { $unwind: "$igdb.developers" },
    { $group: { _id: "$igdb.developers.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const publisherStats = await Games.aggregate([
    { $unwind: "$igdb.publishers" },
    { $group: { _id: "$igdb.publishers.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const gameModeStats = await Games.aggregate([
    { $unwind: "$igdb.game_modes" },
    { $group: { _id: "$igdb.game_modes.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const ratingStats = await Games.aggregate([
    { $match: { "igdb.aggregated_rating": { $exists: true } } },
    {
      $bucket: {
        groupBy: "$igdb.aggregated_rating",
        boundaries: [0, 50, 75, 90, 100],
        default: "Others",
        output: { count: { $sum: 1 } }
      }
    }
  ]);
  const themeStats = await Games.aggregate([
    { $unwind: "$igdb.themes" },
    { $group: { _id: "$igdb.themes.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const releaseYearStats = await Games.aggregate([
    { $match: { "igdb.release_date.date": { $exists: true } } },
    {
      $group: {
        _id: { $year: { $toDate: "$igdb.release_date.date" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const playerPerspectiveStats = await Games.aggregate([
    { $unwind: "$igdb.player_perspectives" },
    { $group: { _id: "$igdb.player_perspectives.name", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    playTimeStats,
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
