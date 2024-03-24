const CustomError = require("../../helpers/errors/CustomError");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const { getAccessTokenFromHeader, isTokenIncluded } = require("../../helpers/auth/jwt-helper");

const getAccessToRoute = (req, res, next) => {
  const accessToken = getAccessTokenFromHeader(req);
  if (!isTokenIncluded(req)) {
    return next(
      new CustomError("You are not authorized to access this route", 401)
    );
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = {
      id: decoded.id,
      name: decoded.name
    };
    next();
  });
};

module.exports = {
  getAccessToRoute
};
