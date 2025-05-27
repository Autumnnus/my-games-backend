import { Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createResponse } from '../middlewares/error/CreateResponse';
import statisticsService from '../services/statistics.service';
import { AuthenticatedRequest } from '../types/request';

const getStatisticsController = expressAsyncHandler(
  async (_: AuthenticatedRequest, res: Response) => {
    try {
      const data = await statisticsService.getStatisticsService();
      res.status(200).json(createResponse(data));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getUserStatisticsController = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      const data = await statisticsService.getUserStatisticsService(id);
      res.status(200).json(createResponse(data));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const updateStatisticsController = expressAsyncHandler(
  async (_: AuthenticatedRequest, res: Response) => {
    if (process.env.NODE_ENV !== 'development') {
      res.status(404).json(createResponse('This action is only allowed in development mode'));
    }
    try {
      const data = await statisticsService.updateStatisticsService();
      res.status(200).json(createResponse(data));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

export { getStatisticsController, getUserStatisticsController, updateStatisticsController };
