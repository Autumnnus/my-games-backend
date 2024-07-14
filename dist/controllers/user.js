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
exports.getSingleUser = exports.getAllUsers = exports.deleteUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CustomError_1 = __importDefault(require("../helpers/errors/CustomError"));
const findById_1 = require("../helpers/functions/findById");
const Games_1 = __importDefault(require("../models/Games"));
const Screenshot_1 = __importDefault(require("../models/Screenshot"));
const User_1 = __importDefault(require("../models/User"));
const s3Service_1 = require("../services/s3Service");
const getSingleUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield User_1.default.findById(id);
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.getSingleUser = getSingleUser;
const getAllUsers = (0, express_async_handler_1.default)((_, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().select("-password");
        return res.status(200).json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.getAllUsers = getAllUsers;
const deleteUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        const user = yield (0, findById_1.findUserByIdOrError)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || "", next);
        if ((user === null || user === void 0 ? void 0 : user.role) !== "admin") {
            return next(new CustomError_1.default(" You are not authorized to delete this user", 404));
        }
        if (user.id === id) {
            return next(new CustomError_1.default("You can not delete yourself", 400));
        }
        const screenshots = yield Screenshot_1.default.find({ user: id });
        for (const screenshot of screenshots) {
            const result = yield (0, s3Service_1.s3Deletev2)(screenshot.key || "");
            if (!result.success) {
                console.error(`Failed to delete S3 object with key ${screenshot.key}: ${result.message}`);
            }
        }
        yield Games_1.default.deleteMany({ userId: id });
        yield Screenshot_1.default.deleteMany({ user: id });
        yield User_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: `User with id ${id} has been deleted`
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.deleteUser = deleteUser;
