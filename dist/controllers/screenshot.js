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
exports.getScreenshot = exports.getRandomScreenshots = exports.editScreenshot = exports.deleteScreenshot = exports.addScreenShot = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CustomError_1 = __importDefault(require("../helpers/errors/CustomError"));
const findById_1 = require("../helpers/functions/findById");
const s3IsSendData_1 = require("../helpers/functions/s3IsSendData");
const Games_1 = __importDefault(require("../models/Games"));
const Screenshot_1 = __importDefault(require("../models/Screenshot"));
const User_1 = __importDefault(require("../models/User"));
const s3Service_1 = require("../services/s3Service");
const addScreenShot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { game_id } = req.params;
    const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        return next(new CustomError_1.default("User not found", 404));
    }
    const game = yield Games_1.default.findById(game_id);
    if (!game) {
        return next(new CustomError_1.default("Game not found", 404));
    }
    const role = user.role;
    const { name, type, url } = req.body;
    const userScreenshots = yield Screenshot_1.default.find({ user: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id });
    const gameScreenshots = yield Screenshot_1.default.find({ game: game_id });
    if (type === "text") {
        try {
            const screenshot = yield Screenshot_1.default.create({
                name,
                url,
                user: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                game: game_id,
                type: "text"
            });
            user.screenshotSize = userScreenshots.length + 1;
            game.screenshotSize = gameScreenshots.length + 1;
            yield user.save();
            yield game.save();
            return res.status(200).json({
                success: true,
                data: screenshot
            });
        }
        catch (error) {
            console.error("ERROR: ", error);
            return next(new CustomError_1.default(`Error: ${error}`, 500));
        }
    }
    else if (type === "image") {
        if (role !== "admin" && role !== "vip") {
            return next(new CustomError_1.default("Your role is not support this feature", 401));
        }
        if (!req.files || req.files.length === 0) {
            return next(new CustomError_1.default("No file uploaded", 400));
        }
        try {
            const screenshots = [];
            for (const file of req.files) {
                const awsFile = yield (0, s3Service_1.s3Uploadv2)(file);
                let screenshot;
                if ((0, s3IsSendData_1.isErrorData)(awsFile)) {
                    if (awsFile.success === false) {
                        return next(new CustomError_1.default("Error uploading file", 500));
                    }
                }
                else if ((0, s3IsSendData_1.isSendData)(awsFile)) {
                    screenshot = yield Screenshot_1.default.create({
                        name,
                        url: awsFile.Location,
                        user: (_d = req.user) === null || _d === void 0 ? void 0 : _d.id,
                        key: awsFile.Key,
                        game: game_id,
                        type: "image"
                    });
                }
                screenshots.push(screenshot);
                user.screenshotSize = userScreenshots.length + req.files.length;
                game.screenshotSize = gameScreenshots.length + req.files.length;
                yield user.save();
                yield game.save();
            }
            return res.status(200).json({
                success: true,
                data: screenshots
            });
        }
        catch (error) {
            console.error("ERROR: ", error);
            return next(new CustomError_1.default(`Error: ${error}`, 500));
        }
    }
    else {
        return next(new CustomError_1.default(`${type} - Invalid Type`, 400));
    }
});
exports.addScreenShot = addScreenShot;
const editScreenshot = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { game_id, screenshot_id } = req.params;
    const { name, type, url } = req.body;
    const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        return next(new CustomError_1.default("User not found", 404));
    }
    const game = yield Games_1.default.findById(game_id);
    if (!game) {
        return next(new CustomError_1.default("Game not found", 404));
    }
    const role = user.role;
    const screenshot = yield (0, findById_1.findScreenshotByIdOrError)(screenshot_id, next);
    if (!game) {
        return next(new CustomError_1.default("Game not found", 404));
    }
    if (!screenshot) {
        return next(new CustomError_1.default("Screenshot not found", 404));
    }
    if (type === "text") {
        try {
            screenshot.name = name ? name : null;
            screenshot.url = url;
            screenshot.type = "text";
            yield screenshot.save();
            return res.status(200).json({
                success: true,
                data: screenshot
            });
        }
        catch (error) {
            console.error("ERROR: ", error);
            return next(new CustomError_1.default(`Error: ${error}`, 404));
        }
    }
    else if (type === "image") {
        if (!req.file && role !== "admin" && role !== "vip") {
            return next(new CustomError_1.default("Your role does not support this feature", 401));
        }
        try {
            let urlToUpdate = screenshot.url;
            let keyToUpdate = screenshot.key;
            if (req.file) {
                const awsFile = yield (0, s3Service_1.s3Updatev2)(screenshot.key || req.file.originalname, req.file);
                if ((0, s3IsSendData_1.isErrorData)(awsFile)) {
                    if (!awsFile.success) {
                        return next(new CustomError_1.default("Error uploading file", 500));
                    }
                }
                else if ((0, s3IsSendData_1.isSendData)(awsFile)) {
                    urlToUpdate = awsFile.Location;
                    keyToUpdate = awsFile.Key;
                }
            }
            screenshot.name = name ? name : null;
            screenshot.url = urlToUpdate;
            screenshot.type = "image";
            screenshot.key = keyToUpdate;
            yield screenshot.save();
            return res.status(200).json({
                success: true,
                data: screenshot
            });
        }
        catch (error) {
            console.error("ERROR: ", error);
            return next(new CustomError_1.default(`Error: ${error}`, 404));
        }
    }
    else {
        return next(new CustomError_1.default(`${type} - Invalid Type`, 400));
    }
}));
exports.editScreenshot = editScreenshot;
const deleteScreenshot = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { game_id, screenshot_id } = req.params;
    const screenshot = yield Screenshot_1.default.findById(screenshot_id);
    if (!screenshot) {
        return next(new CustomError_1.default("Screenshot not found", 404));
    }
    const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        return next(new CustomError_1.default("User not found", 404));
    }
    const game = yield Games_1.default.findById(game_id);
    if (!game) {
        return next(new CustomError_1.default("Game not found", 404));
    }
    const userScreenshots = yield Screenshot_1.default.find({ user: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id });
    const gameScreenshots = yield Screenshot_1.default.find({ game: game_id });
    yield (0, s3Service_1.s3Deletev2)(screenshot.key || "");
    yield Screenshot_1.default.findByIdAndDelete(screenshot_id);
    user.screenshotSize = userScreenshots.length - 1;
    game.screenshotSize = gameScreenshots.length - 1;
    yield user.save();
    yield game.save();
    return res.status(200).json({
        success: true,
        message: `Screenshot ${screenshot_id} has been deleted from game ${game_id}`
    });
}));
exports.deleteScreenshot = deleteScreenshot;
const getScreenshot = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { game_id } = req.params;
        const userGames = yield Screenshot_1.default.find({ game: game_id }).sort({
            _id: -1
        });
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
exports.getScreenshot = getScreenshot;
const getRandomScreenshots = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allScreenshots = yield Screenshot_1.default.find();
        const screenshotCount = req.params.count ? parseInt(req.params.count) : 1;
        if (allScreenshots.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No screenshots found in the collection"
            });
        }
        if (screenshotCount > allScreenshots.length) {
            return res.status(400).json({
                success: false,
                error: "Requested number of screenshots exceeds the available unique screenshots"
            });
        }
        const selectedScreenshots = [];
        while (selectedScreenshots.length < screenshotCount) {
            const randomIndex = Math.floor(Math.random() * allScreenshots.length);
            const randomScreenshot = allScreenshots.splice(randomIndex, 1)[0];
            selectedScreenshots.push(randomScreenshot);
        }
        return res.status(200).json({
            success: true,
            data: selectedScreenshots
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.getRandomScreenshots = getRandomScreenshots;
