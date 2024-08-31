import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import CustomError from "../helpers/errors/CustomError";
import { findScreenshotByIdOrError } from "../helpers/functions/findById";
import { isErrorData, isSendData } from "../helpers/functions/s3IsSendData";
import Games from "../models/Games";
import Screenshot from "../models/Screenshot";
import User from "../models/User";
import { s3Deletev2, s3Updatev2, s3Uploadv2 } from "../services/s3Service";
import { ScreenshotData } from "../types/models";
import { AuthenticatedRequest } from "../types/request";

type AuthenticatedFileRequest = Request &
  AuthenticatedRequest & {
    files?: Express.Multer.File[];
  };

const addScreenShot = async (
  req: AuthenticatedFileRequest,
  res: Response,
  next: NextFunction
) => {
  const { game_id } = req.params;
  const user = await User.findById(req.user?.id);
  if (!user) {
    return next(new CustomError("User not found", 404));
  }
  const game = await Games.findById(game_id);
  if (!game) {
    return next(new CustomError("Game not found", 404));
  }
  const role = user.role;
  const { name, type, url } = req.body;
  const userScreenshots = await Screenshot.find({ user: req.user?.id });
  const gameScreenshots = await Screenshot.find({ game: game_id });

  if (type === "text") {
    try {
      const screenshot = await Screenshot.create({
        name,
        url,
        user: req.user?.id,
        game: game_id,
        type: "text"
      });
      user.screenshotSize = userScreenshots.length + 1;
      game.screenshotSize = gameScreenshots.length + 1;
      await user.save();
      await game.save();
      return res.status(200).json({
        success: true,
        data: screenshot
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 500));
    }
  } else if (type === "image") {
    if (role !== "admin" && role !== "vip") {
      return next(
        new CustomError("Your role is not support this feature", 401)
      );
    }
    if (!req.files || req.files.length === 0) {
      return next(new CustomError("No file uploaded", 400));
    }
    try {
      const screenshots = [];
      for (const file of req.files) {
        const awsFile = await s3Uploadv2(file);
        let screenshot: ScreenshotData | undefined;
        if (isErrorData(awsFile)) {
          if (awsFile.success === false) {
            return next(new CustomError("Error uploading file", 500));
          }
        } else if (isSendData(awsFile)) {
          screenshot = await Screenshot.create({
            name,
            url: awsFile.Location,
            user: req.user?.id,
            key: awsFile.Key,
            game: game_id,
            type: "image"
          });
        }
        screenshots.push(screenshot);
        user.screenshotSize = userScreenshots.length + req.files.length;
        game.screenshotSize = gameScreenshots.length + req.files.length;
        await user.save();
        await game.save();
      }
      return res.status(200).json({
        success: true,
        data: screenshots
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 500));
    }
  } else {
    return next(new CustomError(`${type} - Invalid Type`, 400));
  }
};

const editScreenshot = asyncErrorWrapper(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { game_id, screenshot_id } = req.params;
    const { name, type, url } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(new CustomError("User not found", 404));
    }
    const game = await Games.findById(game_id);
    if (!game) {
      return next(new CustomError("Game not found", 404));
    }
    const role = user.role;
    const screenshot = await findScreenshotByIdOrError(screenshot_id, next);
    if (!game) {
      return next(new CustomError("Game not found", 404));
    }
    if (!screenshot) {
      return next(new CustomError("Screenshot not found", 404));
    }
    if (type === "text") {
      try {
        screenshot.name = name ? name : null;
        screenshot.url = url;
        screenshot.type = "text";
        await screenshot.save();
        return res.status(200).json({
          success: true,
          data: screenshot
        }) as never;
      } catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError(`Error: ${error}`, 404));
      }
    } else if (type === "image") {
      if (!req.file && role !== "admin" && role !== "vip") {
        return next(
          new CustomError("Your role does not support this feature", 401)
        );
      }
      try {
        let urlToUpdate = screenshot.url;
        let keyToUpdate = screenshot.key;
        if (req.file) {
          const awsFile = await s3Updatev2(
            screenshot.key || req.file.originalname,
            req.file
          );
          if (isErrorData(awsFile)) {
            if (!awsFile.success) {
              return next(new CustomError("Error uploading file", 500));
            }
          } else if (isSendData(awsFile)) {
            urlToUpdate = awsFile.Location;
            keyToUpdate = awsFile.Key;
          }
        }
        screenshot.name = name ? name : null;
        screenshot.url = urlToUpdate;
        screenshot.type = "image";
        screenshot.key = keyToUpdate;
        await screenshot.save();
        return res.status(200).json({
          success: true,
          data: screenshot
        }) as never;
      } catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError(`Error: ${error}`, 404));
      }
    } else {
      return next(new CustomError(`${type} - Invalid Type`, 400));
    }
  }
);

const deleteScreenshot = asyncErrorWrapper(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { game_id, screenshot_id } = req.params;
    const screenshot = await Screenshot.findById(screenshot_id);
    if (!screenshot) {
      return next(new CustomError("Screenshot not found", 404));
    }
    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(new CustomError("User not found", 404));
    }
    const game = await Games.findById(game_id);
    if (!game) {
      return next(new CustomError("Game not found", 404));
    }
    const userScreenshots = await Screenshot.find({ user: req.user?.id });
    const gameScreenshots = await Screenshot.find({ game: game_id });
    await s3Deletev2(screenshot.key || "");
    await Screenshot.findByIdAndDelete(screenshot_id);
    user.screenshotSize = userScreenshots.length - 1;
    game.screenshotSize = gameScreenshots.length - 1;
    await user.save();
    await game.save();
    return res.status(200).json({
      success: true,
      message: `Screenshot ${screenshot_id} has been deleted from game ${game_id}`
    }) as never;
  }
);
const getScreenshot = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { game_id } = req.params;
      const userGames = await Screenshot.find({ game: game_id }).sort({
        _id: -1
      });
      return res.status(200).json({
        success: true,
        data: userGames
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const getRandomScreenshots = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allScreenshots = await Screenshot.find();
      const screenshotCount = req.params.count ? parseInt(req.params.count) : 1;
      if (allScreenshots.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No screenshots found in the collection"
        }) as never;
      }

      if (screenshotCount > allScreenshots.length) {
        return res.status(400).json({
          success: false,
          error:
            "Requested number of screenshots exceeds the available unique screenshots"
        }) as never;
      }

      const selectedScreenshots = [];
      while (selectedScreenshots.length < screenshotCount) {
        const randomIndex = Math.floor(Math.random() * allScreenshots.length);
        const randomScreenshot = allScreenshots.splice(randomIndex, 1)[0];
        selectedScreenshots.push(randomScreenshot);
      }
      return res.status(200).json({
        success: true,
        data: selectedScreenshots
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

export {
  addScreenShot,
  deleteScreenshot,
  editScreenshot,
  getRandomScreenshots,
  getScreenshot
};
