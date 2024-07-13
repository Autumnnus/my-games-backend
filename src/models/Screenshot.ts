import mongoose, { Document, Schema } from "mongoose";

type ScreenshotData = Document & {
  name?: string;
  url: string;
  thumbnail?: string;
  key?: string;
  user: mongoose.Schema.Types.ObjectId;
  game: mongoose.Schema.Types.ObjectId;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

const ScreenshotSchema = new Schema<ScreenshotData>(
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
    key: String,
    user: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User"
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Games",
      required: true
    },
    type: {
      type: String,
      enum: ["text", "image"],
      required: [true, "Please enter a type"]
    }
  },
  { timestamps: true }
);

ScreenshotSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    next();
  }
  next();
});

export default mongoose.model("Screenshot", ScreenshotSchema);
