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
exports.getIGDBGames = exports.getIGDBGameCover = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CustomError_1 = __importDefault(require("../helpers/errors/CustomError"));
dotenv_1.default.config();
const getIGDBGames = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = req.query;
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_ACCESS_TOKEN) {
        return next(new CustomError_1.default("Please provide IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN", 400));
    }
    const fields = "fields=name,id,cover.game,cover.url,slug,summary,genres.name,themes.name,player_perspectives.name,game_modes.name,release_dates.date,involved_companies.publisher,involved_companies.developer,aggregated_rating,involved_companies.company.name,aggregated_rating_count";
    fetch(`https://api.igdb.com/v4/games?search=${search}&${fields}`, {
        method: "POST",
        headers: {
            "Client-ID": process.env.IGDB_CLIENT_ID,
            Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            Body: "fields *;"
        }
    })
        .then((response) => {
        return response.json();
    })
        .then((data) => {
        return res.status(200).json({
            success: true,
            data: data
        });
    })
        .catch((error) => {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    });
}));
exports.getIGDBGames = getIGDBGames;
const getIGDBGameCover = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { coverId } = req.params;
    if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_ACCESS_TOKEN) {
        return next(new CustomError_1.default("Please provide IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN", 400));
    }
    fetch(`https://api.igdb.com/v4/covers/${coverId}?fields=*`, {
        method: "GET",
        headers: {
            "Client-ID": process.env.IGDB_CLIENT_ID,
            Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            Body: "fields *;"
        }
    })
        .then((response) => {
        return response.json();
    })
        .then((data) => {
        return res.status(200).json({
            success: true,
            data: data[0]
        });
    })
        .catch((error) => {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    });
}));
exports.getIGDBGameCover = getIGDBGameCover;
