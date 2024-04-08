const User = require("../../models/User");
const Games = require("../../models/Games");
const CustomError = require("../../helpers/errors/CustomError");
const asyncErrorWrapper = require("express-async-handler");

const checkUserExist = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("There is no such user with that id", 400));
  }
  next();
});

const checkGameExist = asyncErrorWrapper(async (req, res, next) => {
  const game_id = req.params.id || req.params.game_id;
  const game = await Games.findById(game_id);

  if (!game) {
    return next(new CustomError("There is no such game with that id", 400));
  }
  next();
});

module.exports = {
  checkUserExist,
  checkGameExist
};
