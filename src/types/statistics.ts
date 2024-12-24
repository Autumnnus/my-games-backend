type StatisticData = {
  _id: string;
  value: number;
};

export type StatisticsResponse = {
  platformPlayTimeStats: StatisticData[];
  platformCountStats: StatisticData[];
  statusPlayTimeStats: StatisticData[];
  statusCountStats: StatisticData[];
  genrePlayTimeStats: StatisticData[];
  genreCountStats: StatisticData[];
  developerPlayTimeStats: StatisticData[];
  developerCountStats: StatisticData[];
  publisherPlayTimeStats: StatisticData[];
  publisherCountStats: StatisticData[];
  gameModePlayTimeStats: StatisticData[];
  gameModeCountStats: StatisticData[];
  ratingPlayTimeStats: StatisticData[];
  ratingCountStats: StatisticData[];
  themePlayTimeStats: StatisticData[];
  themeCountStats: StatisticData[];
  releaseYearPlayTimeStats: StatisticData[];
  releaseYearCountStats: StatisticData[];
  playerPerspectivePlayTimeStats: StatisticData[];
  playerPerspectiveCountStats: StatisticData[];
};
