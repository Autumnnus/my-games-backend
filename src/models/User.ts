import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Schema } from 'mongoose';
import { UserData } from '../types/models';

const UserSchema = new Schema<UserData & Document>(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
    },
    password: {
      type: String,
      minlength: [6, 'Please enter a password with min length 6'],
      required: [true, 'Please enter a password'],
      select: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Please provide a valid email'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    profileImage: String,
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin', 'vip'],
    },
    gameSize: {
      type: Number,
      default: 0,
    },
    completedGameSize: {
      type: Number,
      default: 0,
    },
    screenshotSize: {
      type: Number,
      default: 0,
    },
    favoriteGames: [
      {
        type: mongoose.Schema.ObjectId,
        game: mongoose.Schema.ObjectId,
        ref: 'Games',
      },
    ],
  },
  { timestamps: true }
);

//* UserSchema Methods
UserSchema.methods.generateJwtFromUser = function () {
  const { ACCESS_TOKEN_SECRET } = process.env;
  const payload = {
    id: this._id,
    name: this.name,
  };
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }
  const token = jwt.sign(payload, ACCESS_TOKEN_SECRET);
  return token;
};

UserSchema.methods.getResetPasswordTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString('hex');
  const resetPasswordToken = crypto.createHash('SHA256').update(randomHexString).digest('hex');

  this.resetPasswordToken = resetPasswordToken;
  this.resetPasswordExpire = Date.now() + parseInt('3600000');
  return resetPasswordToken;
};

UserSchema.methods.getVerificationTokenFromUser = function () {
  const randomHexString = crypto.randomBytes(15).toString('hex');
  const verificationToken = crypto.createHash('SHA256').update(randomHexString).digest('hex');

  this.verificationToken = verificationToken;
  this.verificationExpire = Date.now() + parseInt('3600000');
  return verificationToken;
};

//* Pre Hooks
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
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

export default mongoose.model('User', UserSchema);
