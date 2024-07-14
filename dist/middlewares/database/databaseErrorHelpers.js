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
exports.checkUserExist = exports.checkIsAdmin = exports.checkGameSSExist = exports.checkGameExist = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CustomError_1 = __importDefault(require("../../helpers/errors/CustomError"));
const Games_1 = __importDefault(require("../../models/Games"));
const Screenshot_1 = __importDefault(require("../../models/Screenshot"));
const User_1 = __importDefault(require("../../models/User"));
const checkUserExist = (0, express_async_handler_1.default)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield User_1.default.findById(id);
    if (!user) {
        return next(new CustomError_1.default("There is no such user with that id", 400));
    }
    next();
}));
exports.checkUserExist = checkUserExist;
const checkGameExist = (0, express_async_handler_1.default)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    const game_id = req.params.id || req.params.game_id;
    const game = yield Games_1.default.findById(game_id);
    if (!game) {
        return next(new CustomError_1.default("There is no such game with that id", 400));
    }
    next();
}));
exports.checkGameExist = checkGameExist;
const checkGameSSExist = (0, express_async_handler_1.default)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    const game_id = req.params.id || req.params.game_id;
    const game = yield Games_1.default.findById(game_id);
    const screenshot = yield Screenshot_1.default.findById(req.params.screenshot_id);
    if (!game) {
        return next(new CustomError_1.default("There is no such game with that id", 400));
    }
    if (!screenshot) {
        return next(new CustomError_1.default("There is no such screenshot with that id", 400));
    }
    next();
}));
exports.checkGameSSExist = checkGameSSExist;
const checkIsAdmin = (0, express_async_handler_1.default)((req, _, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    const role = user === null || user === void 0 ? void 0 : user.role;
    if (role !== "admin") {
        return next(new CustomError_1.default("Only admins can access this route", 403));
    }
    next();
}));
exports.checkIsAdmin = checkIsAdmin;
