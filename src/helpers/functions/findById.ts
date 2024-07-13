import { NextFunction } from "express";
import Games from "../../models/Games";
import Screenshot from "../../models/Screenshot";
import User from "../../models/User";
import CustomError from "../errors/CustomError";

async function findUserByIdOrError(id: string, next: NextFunction) {
  const user = await User.findById(id);
  if (!user) {
    return next(new CustomError("User not found", 404));
  }
  return user;
}
async function findGameByIdOrError(id: string, next: NextFunction) {
  const game = await Games.findById(id);
  if (!game) {
    return next(new CustomError("Game not found", 404));
  }
  return game;
}
async function findScreenshotByIdOrError(id: string, next: NextFunction) {
  const screenshot = await Screenshot.findById(id);
  if (!screenshot) {
    return next(new CustomError("Screenshot not found", 404));
  }
  return screenshot;
}

export { findGameByIdOrError, findScreenshotByIdOrError, findUserByIdOrError };
