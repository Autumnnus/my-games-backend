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
const mongoose_1 = __importStar(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const GamesSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Please enter game name"]
    },
    photo: String,
    lastPlay: {
        type: Date,
        default: Date.now
    },
    platform: {
        type: String,
        enum: [
            "steam",
            "epicGames",
            "ubisoft",
            "xboxPc",
            "eaGames",
            "torrent",
            "playstation",
            "xboxSeries",
            "nintendo",
            "mobile",
            "otherPlatforms"
        ],
        required: [true, "Please enter platform"]
    },
    review: String,
    rating: Number,
    status: {
        type: String,
        enum: ["completed", "abandoned", "toBeCompleted", "activePlaying"],
        required: [true, "Please enter status"]
    },
    playTime: {
        type: Number,
        required: [true, "Please enter play time"]
    },
    screenshotSize: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose_1.default.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    firstFinished: Date,
    igdb: {
        id: Number,
        cover: {
            id: Number,
            url: String,
            game: Number
        },
        aggregated_rating: Number,
        aggregated_rating_count: Number,
        game_modes: [
            {
                id: Number,
                name: String
            }
        ],
        genres: [
            {
                id: Number,
                name: String
            }
        ],
        developers: [
            {
                id: Number,
                name: String
            }
        ],
        publishers: [
            {
                id: Number,
                name: String
            }
        ],
        player_perspectives: [
            {
                id: Number,
                name: String
            }
        ],
        release_date: {
            id: Number,
            date: Number
        },
        themes: [
            {
                id: Number,
                name: String
            }
        ]
    },
    slug: String
}, { timestamps: true });
GamesSchema.pre("save", function (next) {
    if (!this.isModified("name")) {
        next();
    }
    this.slug = this.makeSlug();
    next();
});
GamesSchema.methods.makeSlug = function () {
    return (0, slugify_1.default)(this.name, {
        replacement: "-",
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        strict: false,
        trim: true
    });
};
exports.default = mongoose_1.default.model("Games", GamesSchema);
