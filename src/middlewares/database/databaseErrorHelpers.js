const User = require("../../models/User");
const Games = require("../../models/Games");
const CustomError = require("../../helpers/errors/CustomError");
const asyncErrorWrapper = require("express-async-handler");
const Screenshot = require("../../models/Screenshot");

const checkUserExist = asyncErrorWrapper(async (req, _, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    return next(new CustomError("There is no such user with that id", 400));
  }
  next();
});

const checkGameExist = asyncErrorWrapper(async (req, _, next) => {
  const game_id = req.params.id || req.params.game_id;
  const game = await Games.findById(game_id);
  if (!game) {
    return next(new CustomError("There is no such game with that id", 400));
  }
  next();
});

const checkGameSSExist = asyncErrorWrapper(async (req, _, next) => {
  const game_id = req.params.id || req.params.game_id;
  const game = await Games.findById(game_id);
  const screenshot = await Screenshot.findById(req.params.screenshot_id);
  if (!game) {
    return next(new CustomError("There is no such game with that id", 400));
  }
  if (!screenshot) {
    return next(
      new CustomError("There is no such screenshot with that id", 400)
    );
  }
  next();
});

const checkIsAdmin = asyncErrorWrapper(async (req, _, next) => {
  const { role } = req.user;
  if (role !== "admin") {
    return next(new CustomError("Only admins can access this route", 403));
  }
  next();
});

module.exports = {
  checkUserExist,
  checkGameExist,
  checkGameSSExist,
  checkIsAdmin
};
