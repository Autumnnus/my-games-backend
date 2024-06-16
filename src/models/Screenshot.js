const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScreenshotSchema = new Schema(
  {
    name: String,
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    url: {
      type: String,
      required: [true, "Photo is required"]
    },
    thumbnail: String,
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User"
    },
    game: {
      name: {
        type: String,
        required: true
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Games",
        required: true
      }
    },
    status: {
      type: String,
      enum: ["text", "image"],
      required: [true, "Please enter a type"]
    },
    date: Date
  },
  { timestamps: true }
);

ScreenshotSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    next();
  }
  next();
});

module.exports = mongoose.model("Screenshot", ScreenshotSchema);
