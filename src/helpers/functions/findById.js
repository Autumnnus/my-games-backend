const User = require("../../models/User");
const Games = require("../../models/Games");
const CustomError = require("../errors/CustomError");

async function findUserByIdOrError(id, next) {
  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError("User not found", 404));
  }
  return user;
}
async function findGameByIdOrError(id, next) {
  const game = await Games.findById(id);
  if (!game) {
    return next(new CustomError("Game not found", 404));
  }
  return game;
}

module.exports = {
  findUserByIdOrError,
  findGameByIdOrError
};
