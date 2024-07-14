"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserInput = exports.comparePassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validateUserInput = (email, password) => {
    return email && password;
};
exports.validateUserInput = validateUserInput;
const comparePassword = (password, hashedPassword) => {
    return bcryptjs_1.default.compareSync(password, hashedPassword);
};
exports.comparePassword = comparePassword;
