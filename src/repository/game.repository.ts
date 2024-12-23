/* eslint-disable @typescript-eslint/no-explicit-any */
import Games from "../models/Games";

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

export default {
  getGameById,
  getUserGameById,
  getGames,
  createGame,
  findGameByIdAndDelete
};
