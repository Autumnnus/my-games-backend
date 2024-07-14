"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"]
    },
    password: {
        type: String,
        minlength: [6, "Please enter a password with min length 6"],
        required: [true, "Please enter a password"],
        select: true
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "Please provide a valid email"
        ]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profileImage: String,
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "vip"]
    },
    gameSize: {
        type: Number,
        default: 0
    },
    completedGameSize: {
        type: Number,
        default: 0
    },
    screenshotSize: {
        type: Number,
        default: 0
    },
    favoriteGames: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            name: String,
            rating: Number,
            photo: String,
            ref: "Games"
        }
    ]
}, { timestamps: true });
//* UserSchema Methods
UserSchema.methods.generateJwtFromUser = function () {
    const { ACCESS_TOKEN_SECRET } = process.env;
    const payload = {
        id: this._id,
        name: this.name
    };
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }
    const token = jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN_SECRET);
    return token;
};
UserSchema.methods.getResetPasswordTokenFromUser = function () {
    const randomHexString = crypto_1.default.randomBytes(15).toString("hex");
    const resetPasswordToken = crypto_1.default
        .createHash("SHA256")
        .update(randomHexString)
        .digest("hex");
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpire = Date.now() + parseInt("3600000");
    return resetPasswordToken;
};
UserSchema.methods.getVerificationTokenFromUser = function () {
    const randomHexString = crypto_1.default.randomBytes(15).toString("hex");
    const verificationToken = crypto_1.default
        .createHash("SHA256")
        .update(randomHexString)
        .digest("hex");
    this.verificationToken = verificationToken;
    this.verificationExpire = Date.now() + parseInt("3600000");
    return verificationToken;
};
//* Pre Hooks
UserSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
        next();
    }
    bcryptjs_1.default.genSalt(10, (err, salt) => {
        if (err)
            next(err);
        bcryptjs_1.default.hash(this.password, salt, (err, hash) => {
            if (err)
                next(err);
            this.password = hash;
            next();
        });
    });
});
exports.default = mongoose_1.default.model("User", UserSchema);
