/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import sendEmail from "../helpers/functions/sendMail";
import {
  comparePassword,
  validateUserInput
} from "../helpers/input/inputHelpers";
import User from "../models/User";
import userRepository from "../repository/user.repository";

async function registerService(email: string, name: any, password: string) {
  const existingUser = await userRepository.getUserByEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }
  if (!validateUserInput(email, password)) {
    throw new Error("Please check your inputs");
  }
  const newUser = await User.create({ email, name, password });
  return newUser;
}

async function loginService(email: string, password: string) {
  if (!validateUserInput(email, password)) {
    throw new Error("Please check your inputs");
  }
  const user = await User.findOne({ email }).select("+password");
  if (!comparePassword(password, user?.password || "")) {
    throw new Error("Please check your password");
  }
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

async function forgotPasswordService(email: string) {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new Error("User not found");
  }
  const frontUrl = process.env.FRONTEND_URL || "https://my-games.netlify.app";
  const resetPasswordToken = user.getResetPasswordTokenFromUser();
  await user.save();
  const resetPasswordUrl = `${frontUrl}/auth/resetPassword?resetPasswordToken=${resetPasswordToken}`;

  const info = await sendEmail(
    user,
    "Reset Password",
    "We received a request to reset the password for your account. If you did not request this change, please ignore this email. No changes will be made to your account.",
    resetPasswordUrl
  );

  return {
    msg: "Email Sent",
    info: info,
    preview: nodemailer.getTestMessageUrl(info)
  };
}

export default {
  registerService,
  loginService,
  forgotPasswordService
};
