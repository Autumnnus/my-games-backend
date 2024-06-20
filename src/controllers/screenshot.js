const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/errors/CustomError");
const {
  findGameByIdOrError,
  findScreenshotByIdOrError,
  findUserByIdOrError
} = require("../helpers/functions/findById");
const Screenshot = require("../models/Screenshot");
const { s3Uploadv2, s3Updatev2, s3Deletev2 } = require("../../s3Service");

const addScreenShot = async (req, res, next) => {
  const { game_id } = req.params;
  const user = await findUserByIdOrError(req.user.id, next);
  const game = await findGameByIdOrError(game_id, next);
  const role = user.role;
  const { name, type, url } = req.body;
  const userScreenshots = await Screenshot.find({ user: req.user.id });
  const gameScreenshots = await Screenshot.find({ game: game_id });
  if (!req.files || req.files.length === 0) {
    return next(new CustomError("No file uploaded", 400));
  }
  if (type === "text") {
    try {
      const screenshot = await Screenshot.create({
        name,
        url,
        user: req.user.id,
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
    try {
      const screenshots = [];
      for (const file of req.files) {
        const awsFile = await s3Uploadv2(file);
        const screenshot = await Screenshot.create({
          name,
          url: awsFile.Location,
          user: req.user.id,
          key: awsFile.key,
          game: game_id,
          type: "image"
        });
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

const editScreenshot = asyncErrorWrapper(async (req, res, next) => {
  const { game_id, screenshot_id } = req.params;
  const { name, type, url } = req.body;
  const game = await findGameByIdOrError(game_id, next);
  const user = await findUserByIdOrError(req.user.id, next);
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
      });
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
        const awsFile = await s3Updatev2(screenshot.key, req.file);
        urlToUpdate = awsFile.Location;
        keyToUpdate = awsFile.key;
      }
      screenshot.name = name ? name : null;
      screenshot.url = urlToUpdate;
      screenshot.type = "image";
      screenshot.key = keyToUpdate;
      await screenshot.save();
      return res.status(200).json({
        success: true,
        data: screenshot
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  } else {
    return next(new CustomError(`${type} - Invalid Type`, 400));
  }
});

const deleteScreenshot = asyncErrorWrapper(async (req, res, next) => {
  const { game_id, screenshot_id } = req.params;
  const screenshot = await findScreenshotByIdOrError(screenshot_id, next);
  const user = await findUserByIdOrError(req.user.id, next);
  const game = await findGameByIdOrError(game_id, next);
  const userScreenshots = await Screenshot.find({ user: req.user.id });
  const gameScreenshots = await Screenshot.find({ game: game_id });
  await s3Deletev2(screenshot.key, req.file);
  await Screenshot.findByIdAndDelete(screenshot_id);
  user.screenshotSize = userScreenshots.length - 1;
  game.screenshotSize = gameScreenshots.length - 1;
  await user.save();
  await game.save();
  return res.status(200).json({
    success: true,
    message: `Screenshot ${screenshot_id} has been deleted from game ${game_id}`
  });
});
const getScreenshot = asyncErrorWrapper(async (req, res, next) => {
  try {
    const { game_id } = req.params;
    const userGames = await Screenshot.find({ game: game_id }).sort({
      createdAt: -1
    });
    return res.status(200).json({
      success: true,
      data: userGames
    });
  } catch (error) {
    console.error("ERROR: ", error);
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

module.exports = {
  addScreenShot,
  editScreenshot,
  deleteScreenshot,
  getScreenshot
};
