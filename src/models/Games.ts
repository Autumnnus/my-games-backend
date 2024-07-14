import mongoose, { Document, Schema } from "mongoose";
import slugify from "slugify";
import { GamesData } from "../types/models";

type slugData = {
  makeSlug(): string;
};

const GamesSchema = new Schema<Document & slugData & GamesData>(
  {
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
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User"
    },
    isFavorite: {
      type: Boolean,
      default: false
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
  },
  { timestamps: true }
);

GamesSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    next();
  }
  this.slug = this.makeSlug();
  next();
});

GamesSchema.methods.makeSlug = function () {
  return slugify(this.name, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: false,
    trim: true
  });
};
export default mongoose.model("Games", GamesSchema);
