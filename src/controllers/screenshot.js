const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/errors/CustomError");
const {
  findUserByIdOrError,
  findGameByIdOrError,
  findScreenshotByIdOrError
} = require("../helpers/functions/findById");
const Screenshot = require("../models/Screenshot");
const { s3Uploadv2, s3Updatev2 } = require("../../s3Service");

// const addScreenShot = asyncErrorWrapper(async (req, res, next) => {
//   const { game_id } = req.params;
//   const { name, url } = req.body;
//   try {
//     const game = await findGameByIdOrError(game_id, next);
//     const user = await findUserByIdOrError(req.user.id, next);
//     console.log(game, "game");
//     const screenshot = await Screenshot.create({
//       name,
//       url,
//       user: req.user.id,
//       game: {
//         name: game.name,
//         _id: game_id
//       }
//     });
//     // user.ScreenshotSize += 1;
//     // game.screenshots.push({ name, url });
//     await screenshot.save();
//     return res.status(200).json({
//       success: true,
//       data: screenshot
//     });
//   } catch (error) {
//     return next(new CustomError(`Error: ${error}`, 404));
//   }
// });

const addScreenShot = async (req, res, next) => {
  const { game_id } = req.params;
  const { name } = req.body;
  if (!req.files || req.files.length === 0) {
    return next(new CustomError("No file uploaded", 400));
  }
  try {
    const game = await findGameByIdOrError(game_id, next);
    const screenshots = [];

    for (const file of req.files) {
      const fileUrl = await s3Uploadv2(file);
      const screenshot = await Screenshot.create({
        name,
        url: fileUrl,
        user: req.user.id,
        game: {
          name: game.name,
          _id: game_id
        },
        type: "image"
      });
      screenshots.push(screenshot);
    }

    return res.status(200).json({
      success: true,
      data: screenshots
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 500));
  }
};

const editScreenshot = asyncErrorWrapper(async (req, res, next) => {
  const { game_id } = req.params;
  const { name, type } = req.body;
  if (!req.file) {
    return next(new CustomError("No file uploaded", 400));
  }
  if (type === "text") {
    return next(new CustomError("Please upload an image", 400));
  } else if (type !== "image") {
    try {
      const fileUrl = await s3Updatev2(
        "19cd7c1a-1e95-4f18-9922-39c95ca53f9b-Screenshot 2024-06-11 233651.png",
        req.file
      );
      console.log(fileUrl, "fileUrl");
      const game = await findGameByIdOrError(game_id, next);
      const screenshot = await Screenshot.updateOne({
        name,
        url: fileUrl,
        user: req.user.id,
        game: {
          name: game.name,
          _id: game_id
        }
      });
      return res.status(200).json({
        success: true,
        data: screenshot
      });
    } catch (error) {
      return next(new CustomError(`Error: ${error}`, 404));
    }
  } else {
    return next(new CustomError(`${type} - Invalid Type`, 400));
  }
});
// const editScreenshot = asyncErrorWrapper(async (req, res, next) => {
//   const { game_id, screenshotId } = req.params;
//   const { name, url } = req.body;
//   try {
//     const game = await findGameByIdOrError(game_id, next);
//     const updatedScreenshots = game.screenshots.map((screenshot) => {
//       if (screenshot._id.toString() === screenshotId) {
//         if (name) screenshot.name = name;
//         if (url) screenshot.url = url;
//       }
//       return screenshot;
//     });

//     if (updatedScreenshots === game.screenshots) {
//       return next(new CustomError("Screenshot not found", 404));
//     }
//     game.screenshots = updatedScreenshots;
//     await game.save();
//     const addedScreenshot = game.screenshots[game.screenshots.length - 1];
//     return res.status(200).json({
//       success: true,
//       data: addedScreenshot
//     });
//   } catch (error) {
//     return next(new CustomError(`Error: ${error}`, 404));
//   }
// });

const deleteScreenshot = asyncErrorWrapper(async (req, res, next) => {
  const { game_id, screenshotId } = req.params;

  try {
    const game = await findGameByIdOrError(game_id, next);
    const updatedScreenshots = game.screenshots.filter(
      (screenshot) => screenshot._id.toString() !== screenshotId
    );
    if (updatedScreenshots.length !== game.screenshots.length) {
      game.screenshots = updatedScreenshots;
      await game.save();
      return res.status(200).json({
        success: true,
        message: `Screenshot ${screenshotId} has been deleted from game ${game_id}`
      });
    } else {
      return next(new CustomError("Screenshot not found", 404));
    }
  } catch (error) {
    return next(new CustomError("Internal Server Error", 500));
  }
});
// const deleteScreenshot = asyncErrorWrapper(async (req, res, next) => {
//   const { game_id, screenshotId } = req.params;

//   try {
//     const game = await findGameByIdOrError(game_id, next);
//     const updatedScreenshots = game.screenshots.filter(
//       (screenshot) => screenshot._id.toString() !== screenshotId
//     );
//     if (updatedScreenshots.length !== game.screenshots.length) {
//       game.screenshots = updatedScreenshots;
//       await game.save();
//       return res.status(200).json({
//         success: true,
//         message: `Screenshot ${screenshotId} has been deleted from game ${game_id}`
//       });
//     } else {
//       return next(new CustomError("Screenshot not found", 404));
//     }
//   } catch (error) {
//     return next(new CustomError("Internal Server Error", 500));
//   }
// });
const getScreenshot = asyncErrorWrapper(async (req, res, next) => {
  try {
    const { game_id } = req.params;
    const userGames = await Screenshot;
    return res.status(200).json({
      success: true,
      data: userGames
    });
  } catch (error) {
    console.log(error);
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

module.exports = {
  addScreenShot,
  editScreenshot,
  deleteScreenshot,
  getScreenshot
};
