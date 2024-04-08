const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new Schema(
  {
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
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpire: {
      type: Date
    },
    profileImage: {
      type: String
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"]
    }
  },
  { timestamps: true }
);

//* UserSchema Methods
UserSchema.methods.generateJwtFromUser = function () {
  const { ACCESS_TOKEN_SECRET } = process.env;
  const payload = {
    id: this._id,
    name: this.name
  };

  const token = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "10m"
  });
  return token;
};

UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString("hex");
  const resetPasswordToken = crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt("3600000");

  return resetPasswordToken;
};

//* Pre Hooks
UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("User", UserSchema);
