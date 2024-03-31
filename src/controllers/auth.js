const User = require("../models/User");
const CustomError = require("../helpers/errors/CustomError");
const bcrypt = require("bcryptjs");
const asyncErrorWrapper = require("express-async-handler");
const {
  validateUserInput,
  comparePassword
} = require("../helpers/input/inputHelpers");
const {  generateAccessToken } = require("../helpers/auth/jwt-helper");

const register = asyncErrorWrapper(async (req, res,next) => {
  const { email, name,  password  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'This user already exists' });
  }

  if (!validateUserInput(email, password)) {
    return res.status(400).json({ success: false, message: 'Please check your inputs' });
  }
  const newUser = await User.create({ email, name, password });

  generateAccessToken(newUser, res);
});

const login = asyncErrorWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!validateUserInput(email, password)) {
    return next(new CustomError("Please check your inputs", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!comparePassword(password, user.password)) { 
    return next(new CustomError("Please check your password", 400));
  }
  generateAccessToken(user, res);
});

const logout = asyncErrorWrapper(async (req, res, next) => {
  const { NODE_ENV } = process.env;
  return res
    .status(200)
    .cookie({
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: NODE_ENV === "development" ? false : true
    })
    .json({
      success: true,
      message: "Logout Successful"
    });
});

const getUser = (req, res, next) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name
    }
  });
};

const imageUpload = asyncErrorWrapper(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      profile_image: req.savedProfileImage
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: "Image Upload Success",
    data: user
  });
});

// const forgotPassword = asyncErrorWrapper(async (req, res, next) => {
//   const resetEmail = req.body.email;
//   const user = await User.findOne({ email: resetEmail });

//   if (!user) {
//     return next(new CustomError("There is no user with that e-mail."), 400);
//   }

//   const resetPasswordToken = user.getResetPasswordTokenFromUser();
//   await user.save();

//   const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

//   const emailTemplate = `<h3>Hello world</h3>
//     <p>This <a href="${resetPasswordUrl}" target="_blank">Link</a>will expire in a hour</p>`;

//   try {
//     await sendEmail({
//       from: process.env.SMTP_USER,
//       to: resetEmail,
//       subject: "Reset Your Password",
//       html: emailTemplate
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Token Sent to Your E-mail"
//     });
//   } catch (err) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();
//     return next(new CustomError("Email couldn't be Sent", 500));
//   }
// });

const resetPassword = asyncErrorWrapper(async (req, res, next) => {
  const { resetPasswordToken } = req.query;
  const { password } = req.body;
  if (!resetPasswordToken) {
    return next(new CustomError("Please enter a valid token", 400));
  }
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new CustomError("Invalid Token or Session Expired", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Reset Password Process Success"
  });
});
const editUser = asyncErrorWrapper(async (req, res, next) => {
  const editInformation = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (editInformation.password) {
    const salt = await bcrypt.genSalt(10);
    editInformation.password = await bcrypt.hash(editInformation.password, salt);
  }
  const hasChanges = Object.keys(editInformation).some(field => {
    return user[field] !== editInformation[field];
  });

  if (!hasChanges) {
    return res.status(400).json({ success: false, message: 'No changes detected' });
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, editInformation, {
    new: true,
    runValidators: true
  });
  return res.status(200).json({
    success: true,
    message: JSON.stringify(editInformation),
    data: updatedUser
  });
});

module.exports = {
  register,
  getUser,
  login,
  logout,
  imageUpload,
  //   forgotPassword,
  resetPassword,
  editUser
};
