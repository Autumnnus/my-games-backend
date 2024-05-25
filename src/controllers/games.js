const Games = require("../models/Games");
const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/errors/CustomError");
const {
  findUserByIdOrError,
  findGameByIdOrError
} = require("../helpers/functions/findById");

const addNewGame = asyncErrorWrapper(async (req, res, next) => {
  const { status } = req.body;
  try {
    const game = await Games.create({
      ...req.body,
      userId: req.user.id
    });
    const user = await findUserByIdOrError(req.user.id, next);
    if (status === "completed") {
      user.completedGameSize += 1;
    }

    user.gameSize += 1;
    await user.save();
    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const editGame = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, photo, lastPlay, platform, review, rating, status, playTime } =
    req.body;
  try {
    let game = await findGameByIdOrError(id, next);
    const updatedGameFields = {
      name,
      photo,
      lastPlay,
      platform,
      review,
      rating,
      status,
      playTime
    };
    Object.assign(game, updatedGameFields);
    game = await game.save();

    const oldStatus = game.status;
    if (oldStatus !== status) {
      const user = await findUserByIdOrError(game.userId, next);
      if (status === "completed") {
        user.completedGameSize += 1;
      } else if (oldStatus === "completed" && status !== "completed") {
        user.completedGameSize -= 1;
      }
      await user.save();
    }
    return res.status(200).json({
      success: true,
      data: {
        _id: game._id,
        ...updatedGameFields
      }
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const deleteGame = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  try {
    const game = await findGameByIdOrError(id, next);
    if (game.status === "completed") {
      const user = await findUserByIdOrError(game.userId, next);
      user.completedGameSize -= 1;
      await user.save();
    }
    await Games.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: `User with id ${id} has been deleted along with their games`
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const addScreenShoot = asyncErrorWrapper(async (req, res, next) => {
  const { game_id } = req.params;
  const { name, url } = req.body;
  try {
    const game = await findGameByIdOrError(game_id, next);
    const user = await findUserByIdOrError(req.user.id, next);
    user.screenshootSize += 1;
    game.screenshots.push({ name, url });
    await game.save();
    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const editScreenshoot = asyncErrorWrapper(async (req, res, next) => {
  const { game_id, screenshotId } = req.params;
  const { name, url } = req.body;
  try {
    const game = await findGameByIdOrError(game_id, next);
    const updatedScreenshots = game.screenshots.map((screenshot) => {
      if (screenshot._id.toString() === screenshotId) {
        if (name) screenshot.name = name;
        if (url) screenshot.url = url;
      }
      return screenshot;
    });

    if (updatedScreenshots !== game.screenshots) {
      game.screenshots = updatedScreenshots;
      await game.save();
    } else {
      return next(new CustomError("Screenshot not found", 404));
    }

    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

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
const getUserGames = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { order, sortBy, search } = req.query;
  let sortCriteria = {};
  const matchCriteria = { userId: id };

  if (sortBy) {
    sortCriteria = { [sortBy]: order === "asc" ? 1 : -1 };
  }

  if (search) {
    matchCriteria.name = { $regex: search, $options: "i" };
  }

  try {
    let userGames;

    if (sortBy === "screenshots") {
      userGames = await Games.aggregate([
        {
          $match: matchCriteria
        },
        {
          $addFields: {
            arrayLength: { $size: "$screenshots" }
          }
        },
        {
          $sort: { arrayLength: order === "asc" ? 1 : -1 }
        }
      ]);
    } else {
      userGames = await Games.find(matchCriteria).sort(sortCriteria);
    }

    return res.status(200).json({
      success: true,
      data: userGames
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});


const getUserGameDetail = asyncErrorWrapper(async (req, res, next) => {
  const { game_id } = req.params;
  try {
    const game = await findGameByIdOrError(game_id, next);
    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

module.exports = {
  addNewGame,
  editGame,
  deleteGame,
  addScreenShoot,
  editScreenshoot,
  deleteScreenshot,
  getUserGameDetail,
  getUserGames
};
