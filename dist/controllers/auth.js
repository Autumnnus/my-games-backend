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
exports.verifyAccount = exports.validateEmail = exports.resetPassword = exports.register = exports.logout = exports.login = exports.forgotPassword = exports.editUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const jwt_helper_1 = require("../helpers/auth/jwt-helper");
const CustomError_1 = __importDefault(require("../helpers/errors/CustomError"));
const sendMail_1 = __importDefault(require("../helpers/functions/sendMail"));
const inputHelpers_1 = require("../helpers/input/inputHelpers");
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
const register = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password } = req.body;
    const existingUser = yield User_1.default.findOne({ email });
    if (existingUser) {
        return res
            .status(400)
            .json({ success: false, message: "This user already exists" });
    }
    if (!(0, inputHelpers_1.validateUserInput)(email, password)) {
        return res
            .status(400)
            .json({ success: false, message: "Please check your inputs" });
    }
    const newUser = yield User_1.default.create({ email, name, password });
    (0, jwt_helper_1.generateAccessToken)(newUser, res);
}));
exports.register = register;
const login = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!(0, inputHelpers_1.validateUserInput)(email, password)) {
        return next(new CustomError_1.default("Please check your inputs", 400));
    }
    const user = yield User_1.default.findOne({ email }).select("+password");
    if (!(0, inputHelpers_1.comparePassword)(password, (user === null || user === void 0 ? void 0 : user.password) || "")) {
        return next(new CustomError_1.default("Please check your password", 400));
    }
    if (!user) {
        return next(new CustomError_1.default("User not found", 404));
    }
    (0, jwt_helper_1.generateAccessToken)(user, res);
}));
exports.login = login;
const logout = (0, express_async_handler_1.default)((_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res
            .status(200)
            .cookie("cookieName", "cookieValue", {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure: process.env.NODE_ENV === "development" ? false : true
        })
            .json({
            success: true,
            message: "Logout Successful"
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.logout = logout;
const forgotPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const user = yield User_1.default.findOne({ email });
    if (!user) {
        return next(new CustomError_1.default("There is no user with that e-mail.", 400));
    }
    const resetPasswordToken = user.getResetPasswordTokenFromUser();
    yield user.save();
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/auth/resetPassword?resetPasswordToken=${resetPasswordToken}`;
    try {
        const info = yield (0, sendMail_1.default)(user, "Reset Password", "We received a request to reset the password for your account. If you did not request this change, please ignore this email. No changes will be made to your account.", resetPasswordUrl);
        return res.status(200).json({
            msg: "Email Sent",
            info: info,
            preview: nodemailer_1.default.getTestMessageUrl(info)
        });
    }
    catch (err) {
        return next(err);
    }
}));
exports.forgotPassword = forgotPassword;
const resetPassword = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { resetPasswordToken } = req.query;
    const { password } = req.body;
    try {
        if (!resetPasswordToken) {
            return next(new CustomError_1.default("Please enter a valid token", 400));
        }
        const user = yield User_1.default.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return next(new CustomError_1.default("Invalid Token or Session Expired", 400));
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "Reset Password Process Success"
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.resetPassword = resetPassword;
const editUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const editInformation = req.body;
    try {
        // const user = await findUserByIdOrError(req.user?.id ||"", next);
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        if (!user) {
            return next(new CustomError_1.default("User not found", 404));
        }
        //? IF NO CHANGES
        // if (editInformation.email && editInformation.email === user.email) {
        //   return res
        //     .status(400)
        //     .json({ success: false, message: "No changes detected email" });
        // }
        if (editInformation.name && editInformation.name === (user === null || user === void 0 ? void 0 : user.name)) {
            return res.status(400).json({
                success: false,
                message: "No changes detected name"
            });
        }
        if (editInformation.password &&
            (0, inputHelpers_1.comparePassword)(editInformation.password, user.password)) {
            return res.status(400).json({
                success: false,
                message: "No changes detected password"
            });
        }
        if (editInformation.profileImage &&
            editInformation.profileImage === user.profileImage) {
            return res.status(400).json({
                success: false,
                message: "No changes detected profileImage"
            });
        }
        //? EDIT
        // if (editInformation.email) {
        //   user.email = editInformation.email;
        // }
        if (editInformation.name) {
            user.name = editInformation.name;
        }
        if (editInformation.password) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            editInformation.password = yield bcryptjs_1.default.hash(editInformation.password, salt);
        }
        if (editInformation.profileImage) {
            user.profileImage = editInformation.profileImage;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, editInformation, {
            new: true,
            runValidators: true
        });
        return res.status(200).json({
            success: true,
            message: JSON.stringify(editInformation),
            data: updatedUser
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.editUser = editUser;
const validateEmail = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const resetEmail = req.body.email;
    const user = yield User_1.default.findOne({ email: resetEmail });
    if (!user) {
        return next(new CustomError_1.default("There is no user with that e-mail.", 400));
    }
    if (user.isVerified) {
        return next(new CustomError_1.default("This user already verified", 400));
    }
    const verificationToken = user.getVerificationTokenFromUser();
    yield user.save();
    const verifyAccountUrl = `${process.env.FRONTEND_URL}/api/auth/verifyAccount?verificationToken=${verificationToken}`;
    try {
        const info = yield (0, sendMail_1.default)(user, "Verify Account", "We received a request to verify the email for your account. If you did not request this change, please ignore this email. No changes will be made to your account.", verifyAccountUrl);
        return res.status(200).json({
            msg: "Email Sent",
            info: info,
            preview: nodemailer_1.default.getTestMessageUrl(info)
        });
    }
    catch (err) {
        return next(err);
    }
}));
exports.validateEmail = validateEmail;
const verifyAccount = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { verificationToken } = req.query;
    try {
        if (!verificationToken) {
            return next(new CustomError_1.default("Invalid token", 400));
        }
        const user = yield User_1.default.findOne({
            verificationToken: verificationToken,
            verificationExpire: { $gt: Date.now() }
        });
        if (!user) {
            return next(new CustomError_1.default("Invalid Token or Session Expired", 400));
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpire = undefined;
        yield user.save();
        return res.status(200).json({
            success: true,
            message: "Account Verification Process Success"
        });
    }
    catch (error) {
        console.error("ERROR: ", error);
        return next(new CustomError_1.default(`Error: ${error}`, 404));
    }
}));
exports.verifyAccount = verifyAccount;
