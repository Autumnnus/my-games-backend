import gameRepository from "../repository/game.repository";

const getGameDetail = async (gameId: string) => {
  const game = await gameRepository.getGameById(gameId);
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
};

export default {
  getGameDetail
};
