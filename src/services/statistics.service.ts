import Statistics from '../models/Statistics';
import gameRepository from '../repository/game.repository';
import statisticsRepository from '../repository/statistics.repository';
import userRepository from '../repository/user.repository';

async function getStatisticsService() {
  return await statisticsRepository.getAllStatistics();
}

async function getUserStatisticsService(userId: string) {
  return await statisticsRepository.getStatisticsById(userId);
}

async function updateStatisticsService() {
  try {
    const users = await userRepository.findAllUsers();
    if (!users.length) {
      console.log('No users found.');
      return [];
    }
    const updatedStatistics = [];

    for (const user of users) {
      const statistics = await gameRepository.getGameStatistics(user._id);
      if (statistics) {
        const data = await Statistics.findOneAndUpdate(
          { user: user._id },
          { statistics },
          { upsert: true, new: true }
        );
        updatedStatistics.push(data);
      }
    }

    const overallStatistics = await gameRepository.getGameStatistics();
    if (overallStatistics) {
      const overallData = await Statistics.findOneAndUpdate(
        { user: undefined },
        { statistics: overallStatistics },
        { upsert: true, new: true }
      );
      updatedStatistics.push(overallData);
    }

    return updatedStatistics;
  } catch (error) {
    console.error('Error updating statistics:', error);
    return [];
  }
}

export default {
  getStatisticsService,
  getUserStatisticsService,
  updateStatisticsService,
};
