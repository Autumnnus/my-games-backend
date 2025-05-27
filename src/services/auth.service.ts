/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import sendEmail from '../helpers/functions/sendMail';
import { comparePassword, validateUserInput } from '../helpers/input/inputHelpers';
import User from '../models/User';
import userRepository from '../repository/user.repository';

async function registerService(email: string, name: any, password: string) {
  const existingUser = await userRepository.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  if (!validateUserInput(email, password)) {
    throw new Error('Please check your inputs');
  }
  const newUser = await User.create({ email, name, password });
  return newUser;
}

async function loginService(email: string, password: string) {
  if (!validateUserInput(email, password)) {
    throw new Error('Please check your inputs');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!comparePassword(password, user?.password || '')) {
    throw new Error('Please check your password');
  }
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

async function forgotPasswordService(email: string) {
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  const frontUrl = process.env.FRONTEND_URL || 'https://my-games.netlify.app';
  const resetPasswordToken = user.getResetPasswordTokenFromUser();
  await user.save();
  const resetPasswordUrl = `${frontUrl}/auth/resetPassword?resetPasswordToken=${resetPasswordToken}`;

  const info = await sendEmail(
    user,
    'Reset Password',
    'We received a request to reset the password for your account. If you did not request this change, please ignore this email. No changes will be made to your account.',
    resetPasswordUrl
  );

  return {
    msg: 'Email Sent',
    info: info,
    preview: nodemailer.getTestMessageUrl(info),
  };
}

async function resetPasswordService(resetPasswordToken: string, password: string) {
  if (!resetPasswordToken) {
    throw new Error('Please enter a valid token');
  }
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error('Invalid Token or Session Expired');
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return {
    success: true,
    message: 'Reset Password Process Success',
  };
}

async function editUserService(editInformation: any, userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  //? IF NO CHANGES
  // if (editInformation.email && editInformation.email === user.email) {
  //   return res
  //     .status(400)
  //     .json({ success: false, message: "No changes detected email" });
  // }
  if (editInformation.name && editInformation.name === user?.name) {
    throw new Error('No changes detected name');
  }
  if (editInformation.password && comparePassword(editInformation.password, user.password)) {
    throw new Error('No changes detected password');
  }
  if (editInformation.profileImage && editInformation.profileImage === user.profileImage) {
    throw new Error('No changes detected profileImage');
  }
  //? EDIT
  // if (editInformation.email) {
  //   user.email = editInformation.email;
  // }
  if (editInformation.name) {
    user.name = editInformation.name;
  }
  if (editInformation.password) {
    const salt = await bcrypt.genSalt(10);
    editInformation.password = await bcrypt.hash(editInformation.password, salt);
  }
  if (editInformation.profileImage) {
    user.profileImage = editInformation.profileImage;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, editInformation, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
}

async function validateEmailService(email: string) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('There is no user with that e-mail.');
  }
  if (user.isVerified) {
    throw new Error('This account is already verified.');
  }

  const verificationToken = user.getVerificationTokenFromUser();
  await user.save();
  const verifyAccountUrl = `${process.env.FRONTEND_URL}/api/auth/verifyAccount?verificationToken=${verificationToken}`;
  const info = await sendEmail(
    user,
    'Verify Account',
    'We received a request to verify the email for your account. If you did not request this change, please ignore this email. No changes will be made to your account.',
    verifyAccountUrl
  );

  return {
    msg: 'Email Sent',
    info: info,
    preview: nodemailer.getTestMessageUrl(info),
  };
}

async function verifyAccountService(verificationToken: string) {
  if (!verificationToken) {
    throw new Error('Please enter a valid token');
  }
  const user = await User.findOne({
    verificationToken: verificationToken,
    verificationExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error('Invalid Token or Session Expired');
  }
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpire = undefined;
  await user.save();
  return 'Account Verification Process Success';
}

export default {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  editUserService,
  validateEmailService,
  verifyAccountService,
};
