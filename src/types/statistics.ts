type StatisticData = {
  _id: string;
  name: string;
  count: number;
};

export type StatisticsResponse = {
  playTimeStats: StatisticData[];
  platformStats: StatisticData[];
  statusStats: StatisticData[];
  genreStats: StatisticData[];
  developerStats: StatisticData[];
  publisherStats: StatisticData[];
  gameModeStats: StatisticData[];
  ratingStats: StatisticData[];
  themeStats: StatisticData[];
  releaseYearStats: StatisticData[];
  playerPerspectiveStats: StatisticData[];
};
