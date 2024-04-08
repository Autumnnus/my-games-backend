const Games = require("../models/Games");
const User = require("../models/User");
const asyncErrorWrapper = require("express-async-handler");

const addNewGame = asyncErrorWrapper(async (req, res, next) => {
  const information = req.body;
  const game = await Games.create({
    ...information,
    userId: req.user.id
  });
  return res.status(200).json({
    success: true,
    data: game
  });
});

const editNewGame = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, photo, lastPlay, platform, review, rating, status, playTime } =
    req.body;
  let game = await Games.findById(id);
  game.name = name;
  game.photo = photo;
  game.lastPlay = lastPlay;
  game.platform = platform;
  game.review = review;
  game.rating = rating;
  game.status = status;
  game.playTime = playTime;

  game = await game.save();

  return res.status(200).json({
    success: true,
    data: game
  });
});

const getUserGames = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;

  const userGames = await Games.find({ userId: id });
  return res.status(200).json({
    success: true,
    data: userGames
  });
});

const getAllGames = asyncErrorWrapper(async (req, res, next) => {
  return res.status(200).json(res.queryResults);
});
module.exports = {
  addNewGame,
  editNewGame,
  getAllGames,
  getUserGames
};
