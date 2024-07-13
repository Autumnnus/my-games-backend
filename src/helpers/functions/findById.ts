import User from "../../models/User";
import Games from "../../models/Games";
import CustomError from "../errors/CustomError";
import Screenshot from "../../models/Screenshot";

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
async function findScreenshotByIdOrError(id, next) {
  const screenshot = await Screenshot.findById(id);
  if (!screenshot) {
    return next(new CustomError("Screenshot not found", 404));
  }
  return screenshot;
}

export = {
  findUserByIdOrError,
  findGameByIdOrError,
  findScreenshotByIdOrError
};
