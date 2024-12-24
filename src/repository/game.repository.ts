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

  const platformPlayTimeStats = await Games.aggregate([
    matchStage,
    { $group: { _id: "$platform", value: { $sum: "$playTime" } } },
    { $sort: { totalPlayTime: -1 } }
  ]);

  const platformCountStats = await Games.aggregate([
    matchStage,
    { $group: { _id: "$platform", value: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const statusPlayTimeStats = await Games.aggregate([
    matchStage,
    { $group: { _id: "$status", value: { $sum: "$playTime" } } },
    { $sort: { count: -1 } }
  ]);
  const statusCountStats = await Games.aggregate([
    matchStage,
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const genrePlayTimeStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.genres" },
    { $group: { _id: "$igdb.genres.name", value: { $sum: "$playTime" } } },
    { $sort: { count: -1 } }
  ]);
  const genreCountStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.genres" },
    { $group: { _id: "$igdb.genres.name", value: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const developerPlayTimeStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.involved_companies" },
    {
      $match: {
        "igdb.involved_companies.developer": true
      }
    },
    {
      $group: {
        _id: "$igdb.involved_companies.company.name",
        value: { $sum: "$playTime" }
      }
    },
    { $sort: { value: -1 } }
  ]);
  const developerCountStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.involved_companies" },
    {
      $match: {
        "igdb.involved_companies.developer": true
      }
    },
    {
      $group: {
        _id: "$igdb.involved_companies.company.name",
        value: { $sum: 1 }
      }
    },
    { $sort: { value: -1 } }
  ]);
  const publisherPlayTimeStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.involved_companies" },
    {
      $match: {
        "igdb.involved_companies.publisher": true
      }
    },
    {
      $group: {
        _id: "$igdb.involved_companies.company.name",
        value: { $sum: "$playTime" }
      }
    },
    { $sort: { value: -1 } }
  ]);
  const publisherCountStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.involved_companies" },
    {
      $match: {
        "igdb.involved_companies.publisher": true
      }
    },
    {
      $group: {
        _id: "$igdb.involved_companies.company.name",
        value: { $sum: 1 }
      }
    },
    { $sort: { value: -1 } }
  ]);
  const gameModePlayTimeStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.game_modes" },
    { $group: { _id: "$igdb.game_modes.name", value: { $sum: "$playTime" } } },
    { $sort: { count: -1 } }
  ]);
  const gameModeCountStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.game_modes" },
    { $group: { _id: "$igdb.game_modes.name", value: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const ratingPlayTimeStats = await Games.aggregate([
    matchStage,
    { $match: { "igdb.aggregated_rating": { $exists: true } } },
    {
      $bucket: {
        groupBy: "$igdb.aggregated_rating",
        boundaries: [0, 50, 75, 90, 100],
        default: "Others",
        output: { value: { $sum: "$playTime" } }
      }
    }
  ]);
  const ratingCountStats = await Games.aggregate([
    matchStage,
    { $match: { "igdb.aggregated_rating": { $exists: true } } },
    {
      $bucket: {
        groupBy: "$igdb.aggregated_rating",
        boundaries: [0, 50, 75, 90, 100],
        default: "Others",
        output: { value: { $sum: 1 } }
      }
    }
  ]);
  const themePlayTimeStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.themes" },
    { $group: { _id: "$igdb.themes.name", value: { $sum: "$playTime" } } },
    { $sort: { count: -1 } }
  ]);
  const themeCountStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.themes" },
    { $group: { _id: "$igdb.themes.name", value: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const releaseYearPlayTimeStats = await Games.aggregate([
    matchStage,
    {
      $match: {
        "igdb.first_release_date": { $exists: true }
      }
    },
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
        value: { $sum: "$playTime" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const releaseYearCountStats = await Games.aggregate([
    matchStage,
    {
      $match: {
        "igdb.first_release_date": { $exists: true }
      }
    },
    {
      $addFields: {
        firstReleaseDate: {
          $toDate: { $multiply: ["$igdb.first_release_date", 1000] }
        }
      }
    },
    {
      $group: {
        _id: { $year: "$firstReleaseDate" },
        value: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const playerPerspectivePlayTimeStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.player_perspectives" },
    {
      $group: {
        _id: "$igdb.player_perspectives.name",
        value: { $sum: "$playTime" }
      }
    },
    { $sort: { count: -1 } }
  ]);
  const playerPerspectiveCountStats = await Games.aggregate([
    matchStage,
    { $unwind: "$igdb.player_perspectives" },
    { $group: { _id: "$igdb.player_perspectives.name", value: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    platformPlayTimeStats,
    platformCountStats,
    statusPlayTimeStats,
    statusCountStats,
    genrePlayTimeStats,
    genreCountStats,
    developerPlayTimeStats,
    developerCountStats,
    publisherPlayTimeStats,
    publisherCountStats,
    gameModePlayTimeStats,
    gameModeCountStats,
    ratingPlayTimeStats,
    ratingCountStats,
    themePlayTimeStats,
    themeCountStats,
    releaseYearPlayTimeStats,
    releaseYearCountStats,
    playerPerspectivePlayTimeStats,
    playerPerspectiveCountStats
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
