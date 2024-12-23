import { Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import { createResponse } from "../middlewares/error/CreateResponse";
import screenshotService from "../services/screenshot.service";
import { AuthenticatedRequest } from "./games.controller";

interface AuthenticatedFileRequest extends Request {
  user?: {
    id: string;
  };
  files?: Express.Multer.File[];
}

const addScreenshotController = async (
  req: AuthenticatedFileRequest,
  res: Response
) => {
  const { game_id } = req.params;
  const { name, type, url } = req.body;
  try {
    const data = await screenshotService.addScreenshotService({
      gameId: game_id,
      userId: req.user?.id || "",
      files: req.files,
      type,
      name,
      url
    });
    res.status(200).json(createResponse(data));
  } catch (err) {
    res.status(404).json(createResponse(null, false, `Error: ${err}`));
  }
};

const editScreenshotController = asyncErrorWrapper(
  async (req: AuthenticatedRequest, res: Response) => {
    const { game_id, screenshot_id } = req.params;
    const { name, type, url } = req.body;
    try {
      const data = await screenshotService.editScreenshotService({
        gameId: game_id,
        userId: req.user?.id || "",
        screenShotId: screenshot_id,
        type,
        name,
        url,
        file: req.file
      });
      res.status(200).json(createResponse(data));
    } catch (err) {
      res.status(404).json(createResponse(null, false, `Error: ${err}`));
    }
  }
);

const deleteScreenshotController = asyncErrorWrapper(
  async (req: AuthenticatedRequest, res: Response) => {
    const { game_id, screenshot_id } = req.params;
    try {
      const data = await screenshotService.deleteScreenshotService({
        gameId: game_id,
        userId: req.user?.id || "",
        screenshotId: screenshot_id as string
      });
      res.status(200).json(createResponse(data));
    } catch (error) {
      console.error("ERROR: ", error);
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getScreenshotController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const { game_id } = req.params;
    try {
      const data = await screenshotService.getScreenshotService(game_id);
      res.status(200).json(createResponse(data));
    } catch (error) {
      console.error("ERROR: ", error);
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getRandomScreenshotsController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    try {
      const data = await screenshotService.getRandomScreenshotsService(
        req.params.count
      );
      res.status(200).json(createResponse(data));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

export {
  addScreenshotController,
  deleteScreenshotController,
  editScreenshotController,
  getRandomScreenshotsController,
  getScreenshotController
};
