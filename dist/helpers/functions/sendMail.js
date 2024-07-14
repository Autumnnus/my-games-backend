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
/* eslint-disable @typescript-eslint/no-explicit-any */
const mailgen_1 = __importDefault(require("mailgen"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const CustomError_1 = __importDefault(require("../errors/CustomError"));
const sendEmail = (user, subject, content, url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        const MailGenerator = new mailgen_1.default({
            theme: "salted",
            product: {
                name: "Mailgen",
                link: "https://mailgen.js/"
            }
        });
        const response = {
            body: {
                greeting: "Dear User",
                intro: content,
                action: {
                    instructions: `Click the button below to ${subject}:`,
                    button: {
                        color: "#DC4D2F",
                        text: subject,
                        link: url
                    }
                },
                outro: "Thank you for taking the time to ensure the security of your account."
            }
        };
        const mail = MailGenerator.generate(response);
        const message = {
            from: `My Games ${process.env.SMTP_USER}`,
            to: user.email,
            subject: subject,
            html: mail
        };
        const info = yield transporter.sendMail(message);
        return info;
    }
    catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.verificationToken = undefined;
        user.verificationExpire = undefined;
        yield user.save();
        console.error("ERROR: ", err);
        throw new CustomError_1.default(`Email couldn't be Sent: ${err.response}`, err.responseCode);
    }
});
exports.default = sendEmail;
