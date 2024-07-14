"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameSSOwnerAccess = exports.getGameOwnerAccess = exports.getAccessToRoute = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_helper_1 = require("../../helpers/auth/jwt-helper");
const CustomError_1 = __importDefault(require("../../helpers/errors/CustomError"));
const Games_1 = __importDefault(require("../../models/Games"));
const Screenshot_1 = __importDefault(require("../../models/Screenshot"));
dotenv_1.default.config();
const getAccessToRoute = (req, res, next) => {
    const accessToken = (0, jwt_helper_1.getAccessTokenFromHeader)(req);
    if (!(0, jwt_helper_1.isTokenIncluded)(req)) {
        return next(new CustomError_1.default("You are not authorized to access this route", 401));
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        return next(new CustomError_1.default("Something went wrong", 500));
    }
    jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, 
    //@ts-ignore
    (err, decoded) => {
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
exports.getAccessToRoute = getAccessToRoute;
const getGameOwnerAccess = (0, express_async_handler_1.default)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const gameId = req.params.id || req.params.game_id;
    const game = yield Games_1.default.findById(gameId);
    if ((game === null || game === void 0 ? void 0 : game.userId.toString()) !== userId) {
        return next(new CustomError_1.default("Only owner can handle this operation", 403));
    }
    next();
}));
exports.getGameOwnerAccess = getGameOwnerAccess;
const getGameSSOwnerAccess = (0, express_async_handler_1.default)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const gameId = req.params.id || req.params.game_id;
    const game = yield Games_1.default.findById(gameId);
    const screenshot = yield Screenshot_1.default.findById(req.params.screenshot_id);
    if ((game === null || game === void 0 ? void 0 : game.userId.toString()) !== userId) {
        return next(new CustomError_1.default("Only owner can handle this operation", 403));
    }
    if ((screenshot === null || screenshot === void 0 ? void 0 : screenshot.user.toString()) !== userId) {
        return next(new CustomError_1.default("Only owner can handle this operation", 403));
    }
    next();
}));
exports.getGameSSOwnerAccess = getGameSSOwnerAccess;
