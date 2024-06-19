const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const GamesSchema = new Schema(
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

module.exports = mongoose.model("Games", GamesSchema);
