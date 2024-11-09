/* eslint-disable @typescript-eslint/no-explicit-any */
import Games from "../models/Games";
import User from "../models/User";
import gameRepository from "../repository/game.repository";
import userRepository from "../repository/user.repository";
import { GamesData } from "../types/models";

type GetUserGamesParams = {
  id: string;
  sortBy?: string | undefined;
  order?: "asc" | "desc";
  search?: string;
  page?: number;
  limit?: number;
};

type GameFields = {
  name: GamesData["name"];
  photo: GamesData["photo"];
  lastPlay: GamesData["lastPlay"];
  platform: GamesData["platform"];
  review: GamesData["review"];
  rating: GamesData["rating"];
  status: GamesData["status"];
  playTime: GamesData["playTime"];
  firstFinished: GamesData["firstFinished"];
  igdb?: GamesData["igdb"];
};

async function addNewGame(data: any, userId: string) {
  const game = await gameRepository.createGame(data, userId);
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const userGames = await gameRepository.getUserGameById(userId);
  if (data.status === "completed") {
    user.completedGameSize =
      userGames.filter((game) => game.status === "completed").length + 1;
  }
  user.gameSize = userGames.length + 1;
  await user.save();
  return game;
}

async function editGame(data: any, gameId: string, userId: string) {
  const {
    name,
    photo,
    lastPlay,
    platform,
    review,
    rating,
    status,
    playTime,
    firstFinished,
    igdb
  } = data;
  let game = await gameRepository.getGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }
  const updatedIGDB =
    igdb && igdb.cover && Object.keys(igdb.cover).length > 0 ? igdb : game.igdb;

  const updatedGameFields: GameFields = {
    name: name || game.name,
    photo: photo || game.photo,
    lastPlay: lastPlay || game.lastPlay,
    platform: platform || game.platform,
    review: review || game.review,
    rating: rating || game.rating,
    status: status || game.status,
    playTime: playTime || game.playTime,
    firstFinished: firstFinished || game.firstFinished,
    igdb: updatedIGDB
  };
  Object.assign(game, updatedGameFields);
  game = await game.save();

  const oldStatus = game.status;
  const userGames = await gameRepository.getUserGameById(userId);
  if (oldStatus !== status) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (status === "completed") {
      user.completedGameSize =
        userGames.filter((game) => game.status === "completed").length + 1;
    } else if (oldStatus === "completed" && status !== "completed") {
      user.completedGameSize =
        userGames.filter((game) => game.status === "completed").length - 1;
    }
    await user.save();
  }
  return game;
}

async function deleteGame(gameId: string, userId: string) {
  const game = await gameRepository.getGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const userGames = await gameRepository.getUserGameById(userId);
  if (game.status === "completed") {
    user.completedGameSize =
      userGames.filter((game) => game.status === "completed").length - 1;
    await user.save();
  }
  user.gameSize = userGames.length + 1;
  await gameRepository.findGameByIdAndDelete(gameId);
  await user.save();
  return true;
}

async function getGameDetail(gameId: string) {
  const game = await gameRepository.getGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
}

async function setFavoriteGames(userId: string, gameIds: any[]) {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const games = await Promise.all(
    gameIds.map((id) => gameRepository.getGameById(id))
  );

  for (const [index, game] of games.entries()) {
    if (!game) {
      throw new Error(`Game ${index + 1} not found`);
    }
    game.isFavorite = true;
    await game.save();
  }

  await Games.updateMany(
    { _id: { $nin: gameIds }, isFavorite: true },
    { isFavorite: false }
  );

  user.favoriteGames = gameIds;
  await user.save();
  return games.map((game) => ({
    _id: game?._id,
    name: game?.name,
    photo: game?.photo,
    rating: game?.rating
  }));
}

async function getFavoriteGames(userId: string) {
  const user = await User.findById(userId).populate("favoriteGames");
  if (!user) {
    throw new Error("User not found");
  }

  return user.favoriteGames?.map((game) => ({
    _id: game._id,
    name: game.name,
    photo: game.photo,
    rating: game.rating
  }));
}

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
  addNewGame,
  deleteGame,
  getGameDetail,
  getUserGames,
  editGame,
  setFavoriteGames,
  getFavoriteGames
};
