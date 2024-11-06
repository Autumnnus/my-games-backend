import gameRepository from "../repository/game.repository";

type GetUserGamesParams = {
  id: string;
  sortBy?: string | undefined;
  order?: "asc" | "desc";
  search?: string;
  page?: number;
  limit?: number;
};

const getGameDetail = async (gameId: string) => {
  const game = await gameRepository.getGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
};

async function getUserGames({
  id,
  sortBy,
  order,
  search,
  page,
  limit
}: GetUserGamesParams) {
  console.log(id, sortBy, order, search, page, limit);
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

  const pageNum = page ? parseInt(String(page), 10) : 1;
  const limitNum = limit ? parseInt(String(limit), 10) : 0;
  const skip = (pageNum - 1) * limitNum;

  const userGamesQuery = await gameRepository.getGames(
    matchCriteria,
    sortCriteria,
    skip,
    limitNum
  );
  return userGamesQuery;
}

export default {
  getGameDetail,
  getUserGames
};
