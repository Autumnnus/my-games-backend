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
    const userGames = await Games.find({ userId: req.user.id });
    if (status === "completed") {
      user.completedGameSize =
        userGames.filter((game) => game.status === "completed").length + 1;
    }
    user.gameSize = userGames.length + 1;
    await user.save();
    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error("ERROR: ", error);
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
    const userGames = await Games.find({ userId: req.user.id });
    if (oldStatus !== status) {
      const user = await findUserByIdOrError(game.userId, next);
      if (status === "completed") {
        user.completedGameSize =
          userGames.filter((game) => game.status === "completed").length + 1;
      } else if (oldStatus === "completed" && status !== "completed") {
        user.completedGameSize =
          userGames.filter((game) => game.status === "completed").length - 1;
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
    console.error("ERROR: ", error);
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const deleteGame = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  try {
    const game = await findGameByIdOrError(id, next);
    const user = await findUserByIdOrError(game.userId, next);
    const userGames = await Games.find({ userId: req.user.id });
    if (game.status === "completed") {
      user.completedGameSize =
        userGames.filter((game) => game.status === "completed").length - 1;
      await user.save();
    }
    user.gameSize = userGames.length + 1;
    await Games.findByIdAndDelete(id);
    await user.save();
    res.status(200).json({
      success: true,
      message: `User with id ${id} has been deleted along with their games`
    });
  } catch (error) {
    console.error("ERROR: ", error);
    return next(new CustomError(`Error: ${error}`, 404));
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
    // let userGames;
    // if (sortBy === "screenshots") {
    //   userGames = await Games.aggregate([
    //     {
    //       $match: search ? matchCriteria : {}
    //     },
    //     {
    //       $addFields: {
    //         arrayLength: { $size: "$screenshots" }
    //       }
    //     },
    //     {
    //       $sort: { arrayLength: order === "asc" ? 1 : -1 }
    //     }
    //   ]);
    // } else {
    //   userGames = await Games.find(matchCriteria).sort(sortCriteria);
    // }
    const userGames = await Games.find(matchCriteria).sort(sortCriteria);
    return res.status(200).json({
      success: true,
      data: userGames
    });
  } catch (error) {
    console.error("ERROR: ", error);
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const getUserGameDetail = asyncErrorWrapper(async (req, res, next) => {
  const { game_id } = req.params;
  try {
    const game = await findGameByIdOrError(game_id);

    if (!game) {
      return next(new CustomError(`Game not found with id: ${game_id}`, 404));
    }

    return res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error("ERROR: ", error);
    return next(new CustomError(`Error: ${error.message}`, 500));
  }
});

module.exports = {
  addNewGame,
  editGame,
  deleteGame,
  getUserGameDetail,
  getUserGames
};
