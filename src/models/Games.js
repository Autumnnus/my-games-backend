const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    platform: String,
    review: String,
    rating: Number,
    status: {
      type: String,
      enum: ["completed", "abondoned", "to_be_completed", "active_playing"]
    },
    playTime: Number,
    screenshots: {
      name: {
        type: String
      },
      url: {
        type: String
      }
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

module.exports = mongoose.model("Games", GamesSchema);
