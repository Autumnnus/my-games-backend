import { NextFunction } from "express";
import { createResponse } from "../../middlewares/error/CreateResponse";
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
  try {
    const game = await Games.findById(id);
    if (!game) {
      return next(createResponse(null, false, `Game not found`));
    }

    return game;
  } catch (error) {
    console.log("error", error);
    return next(createResponse(null, false, `Error: ${error}`));
  }
}

async function findScreenshotByIdOrError(id: string, next: NextFunction) {
  const screenshot = await Screenshot.findById(id);
  if (!screenshot) {
    return next(new CustomError("Screenshot not found", 404));
  }
  return screenshot;
}

export { findGameByIdOrError, findScreenshotByIdOrError, findUserByIdOrError };
