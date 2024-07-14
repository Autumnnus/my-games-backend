"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenIncluded = exports.getAccessTokenFromHeader = exports.generateAccessToken = void 0;
const generateAccessToken = (user, res) => {
    const token = user.generateJwtFromUser();
    const jwtCookie = process.env.JWT_COOKIE;
    if (!jwtCookie) {
        throw new Error("JWT_COOKIE environment variable is not defined.");
    }
    // const expires = new Date(Date.now() + parseInt(jwtCookie) * 1000 * 60);
    return res
        .status(200)
        .cookie("access_token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + parseInt(jwtCookie) * 1000 * 60),
        secure: process.env.NODE_ENV === "development" ? false : true
    })
        .json({
        access_token: token,
        data: {
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            role: user.role,
            id: user._id
        }
    });
};
exports.generateAccessToken = generateAccessToken;
const isTokenIncluded = (req) => {
    return (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer:"));
};
exports.isTokenIncluded = isTokenIncluded;
const getAccessTokenFromHeader = (req) => {
    const authorization = req.headers.authorization;
    const access_token = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
    return access_token;
};
exports.getAccessTokenFromHeader = getAccessTokenFromHeader;
