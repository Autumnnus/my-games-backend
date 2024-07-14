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
exports.findGameByIdOrError = findGameByIdOrError;
exports.findScreenshotByIdOrError = findScreenshotByIdOrError;
exports.findUserByIdOrError = findUserByIdOrError;
const Games_1 = __importDefault(require("../../models/Games"));
const Screenshot_1 = __importDefault(require("../../models/Screenshot"));
const User_1 = __importDefault(require("../../models/User"));
const CustomError_1 = __importDefault(require("../errors/CustomError"));
function findUserByIdOrError(id, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findById(id);
        if (!user) {
            return next(new CustomError_1.default("User not found", 404));
        }
        return user;
    });
}
function findGameByIdOrError(id, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const game = yield Games_1.default.findById(id);
        if (!game) {
            return next(new CustomError_1.default("Game not found", 404));
        }
        return game;
    });
}
function findScreenshotByIdOrError(id, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const screenshot = yield Screenshot_1.default.findById(id);
        if (!screenshot) {
            return next(new CustomError_1.default("Screenshot not found", 404));
        }
        return screenshot;
    });
}
