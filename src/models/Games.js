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
    platform: String,
    review: String,
    rating: Number,
    status: {
      type: String,
      enum: ["completed", "abondoned", "to_be_completed", "active_playing"]
    },
    playTime: Number,
    screenshots: {
      name: String,
      url: String,
      id: mongoose.Schema.ObjectId
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
