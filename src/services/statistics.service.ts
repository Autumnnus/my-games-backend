import gameRepository from "../repository/game.repository";
import { StatisticsResponse } from "../types/statistics";

async function getStatisticsService(): Promise<StatisticsResponse> {
  return await gameRepository.getGameStatistics();
}

async function getUserStatisticsService(
  userId: string
): Promise<StatisticsResponse> {
  return await gameRepository.getGameStatistics();
}

export default { getStatisticsService, getUserStatisticsService };
