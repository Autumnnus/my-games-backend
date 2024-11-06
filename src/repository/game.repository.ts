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
  getGames
};
