const CustomError = require("../../helpers/errors/CustomError");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const asyncErrorWrapper = require("express-async-handler");
const Games = require("../../models/Games");
dotenv.config();

const {
  getAccessTokenFromHeader,
  isTokenIncluded
} = require("../../helpers/auth/jwt-helper");

const getAccessToRoute = (req, res, next) => {
  const accessToken = getAccessTokenFromHeader(req);
  if (!isTokenIncluded(req)) {
    return next(
      new CustomError("You are not authorized to access this route", 401)
    );
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = {
      id: decoded.id,
      name: decoded.name
    };
    next();
  });
};

const getGameOwnerAccess = asyncErrorWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const gameId = req.params.id;

  const game = await Games.findById(gameId);
  console.log(game.userId.toString());
  console.log(userId);
  // if (question.user !== userId) {
  //   return next(new CustomError("Only owner can handle this operation", 403));
  // }

  if (game.userId.toString() !== userId) {
    return next(new CustomError("Only owner can handle this operation", 403));
  }
  next();
});

module.exports = {
  getAccessToRoute,
  getGameOwnerAccess
};
