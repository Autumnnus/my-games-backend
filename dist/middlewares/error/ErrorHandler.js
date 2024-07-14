"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = __importDefault(require("../../helpers/errors/CustomError"));
function errorHandler(err, _, res) {
    if (!(err instanceof CustomError_1.default)) {
        err = new CustomError_1.default("Something went wrong", 500);
    }
    res.status(err.status || 500).json({
        message: err.message,
        status: err.status
    });
}
exports.default = errorHandler;
