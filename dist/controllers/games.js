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
exports.getUserGames = exports.getUserGameDetail = exports.editGame = exports.deleteGame = exports.addNewGame = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CustomError_1 = __importDefault(require("../helpers/errors/CustomError"));
const findById_1 = require("../helpers/functions/findById");
const Games_1 = __importDefault(require("../models/Games"));
const User_1 = __importDefault(require("../models/User"));
const addNewGame = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { status } = req.body;
    try {
        const game = yield Games_1.default.create(Object.assign(Object.assign({}, req.body), { userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
        const user = yield User_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!user) {
            return next(new CustomError_1.default("User not found", 404));
        }
        const userGames = yield Games_1.default.find({ userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id });
        if (status === "completed") {
            user.completedGameSize =
                userGames.filter((game) => game.status === "completed").length + 1;
        }
        user.gameSize = userGames.length + 1;
        yield user.save();
        return res.status(200).json({
            success: true,
            data: game
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.addNewGame = addNewGame;
const editGame = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { name, photo, lastPlay, platform, review, rating, status, playTime, firstFinished, igdb } = req.body;
    try {
        let game = yield Games_1.default.findById(id);
        if (!game) {
            return next(new CustomError_1.default("Game not found", 404));
        }
        const updatedGameFields = {
            name,
            photo,
            lastPlay,
            platform,
            review,
            rating,
            status,
            playTime,
            firstFinished,
            igdb
        };
        Object.assign(game, updatedGameFields);
        game = yield game.save();
        const oldStatus = game.status;
        const userGames = yield Games_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (oldStatus !== status) {
            const user = yield User_1.default.findById(game.userId);
            if (!user) {
                return next(new CustomError_1.default("User not found", 404));
            }
            if (status === "completed") {
                user.completedGameSize =
                    userGames.filter((game) => game.status === "completed").length + 1;
            }
            else if (oldStatus === "completed" && status !== "completed") {
                user.completedGameSize =
                    userGames.filter((game) => game.status === "completed").length - 1;
            }
            yield user.save();
        }
        return res.status(200).json({
            success: true,
            data: Object.assign({ _id: game._id }, updatedGameFields)
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.editGame = editGame;
const deleteGame = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        const game = yield Games_1.default.findById(id);
        if (!game) {
            return next(new CustomError_1.default("Game not found", 404));
        }
        const user = yield User_1.default.findById(game.userId);
        if (!user) {
            return next(new CustomError_1.default("User not found", 404));
        }
        const userGames = yield Games_1.default.find({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        if (game.status === "completed") {
            user.completedGameSize =
                userGames.filter((game) => game.status === "completed").length - 1;
            yield user.save();
        }
        user.gameSize = userGames.length + 1;
        yield Games_1.default.findByIdAndDelete(id);
        yield user.save();
        res.status(200).json({
            success: true,
            message: `User with id ${id} has been deleted along with their games`
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.deleteGame = deleteGame;
const getUserGames = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { order, sortBy, search } = req.query;
    let sortCriteria = {
        lastPlay: -1
    };
    const matchCriteria = { userId: id };
    if (sortBy) {
        sortCriteria = { [sortBy]: order === "asc" ? 1 : -1 };
    }
    if (search) {
        matchCriteria.name = { $regex: search, $options: "i" };
    }
    try {
        const userGames = yield Games_1.default.find(matchCriteria).sort(sortCriteria);
        return res.status(200).json({
            success: true,
            data: userGames
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.getUserGames = getUserGames;
const getUserGameDetail = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { game_id } = req.params;
    try {
        const game = yield (0, findById_1.findGameByIdOrError)(game_id, next);
        if (!game) {
            return next(new CustomError_1.default(`Game not found with id: ${game_id}`, 404));
        }
        return res.status(200).json({
            success: true,
            data: game
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 500));
    }
}));
exports.getUserGameDetail = getUserGameDetail;
