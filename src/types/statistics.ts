type StatisticData = {
  _id: string;
  playTime: number;
  count: number;
};

export type StatisticsResponse = {
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
