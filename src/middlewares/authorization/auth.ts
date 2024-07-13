import dotenv from "dotenv";
import asyncErrorWrapper from "express-async-handler";
import jwt from "jsonwebtoken";
import {
  getAccessTokenFromHeader,
  isTokenIncluded
} from "../../helpers/auth/jwt-helper";
import CustomError from "../../helpers/errors/CustomError";
import Games from "../../models/Games";
import Screenshot from "../../models/Screenshot";
dotenv.config();

const getAccessToRoute = (req, res, next) => {
  const accessToken = getAccessTokenFromHeader(req);
  if (!isTokenIncluded(req)) {
    return next(
      new CustomError("You are not authorized to access this route", 401)
    );
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token. Please Login" });
    }
    req.user = {
      id: decoded.id,
      name: decoded.name
    };
    next();
  });
};

const getGameOwnerAccess = asyncErrorWrapper(async (req, _, next) => {
  const userId = req.user.id;
  const gameId = req.params.id || req.params.game_id;
  const game = await Games.findById(gameId);
  if (game.userId.toString() !== userId) {
    return next(new CustomError("Only owner can handle this operation", 403));
  }
  next();
});

const getGameSSOwnerAccess = asyncErrorWrapper(async (req, _, next) => {
  const userId = req.user.id;
  const gameId = req.params.id || req.params.game_id;
  const game = await Games.findById(gameId);
  const screenshot = await Screenshot.findById(req.params.screenshot_id);
  if (game.userId.toString() !== userId) {
    return next(new CustomError("Only owner can handle this operation", 403));
  }
  if (screenshot.user.toString() !== userId) {
    return next(new CustomError("Only owner can handle this operation", 403));
  }
  next();
});

export {
  getAccessToRoute,
  getGameOwnerAccess,
  getGameSSOwnerAccess
};

