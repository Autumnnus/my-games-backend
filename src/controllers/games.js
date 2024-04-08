const Games = require("../models/Games");
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

const getAllGames = asyncErrorWrapper(async (req, res, next) => {
  return res.status(200).json(res.queryResults);
});
module.exports = {
  addNewGame,
  getAllGames
};
