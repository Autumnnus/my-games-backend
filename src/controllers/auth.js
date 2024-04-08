const User = require("../models/User");
const CustomError = require("../helpers/errors/CustomError");
const bcrypt = require("bcryptjs");
const Mailgen = require("mailgen");
const asyncErrorWrapper = require("express-async-handler");
const {
  validateUserInput,
  comparePassword
} = require("../helpers/input/inputHelpers");
const { generateAccessToken } = require("../helpers/auth/jwt-helper");
const nodemailer = require("nodemailer");

const register = asyncErrorWrapper(async (req, res, next) => {
  const { email, name, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "This user already exists" });
  }

  if (!validateUserInput(email, password)) {
    return res
      .status(400)
      .json({ success: false, message: "Please check your inputs" });
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

const forgotPassword = asyncErrorWrapper(async (req, res, next) => {
  const resetEmail = req.body.email;
  const user = await User.findOne({ email: resetEmail });
  if (!user) {
    return next(new CustomError("There is no user with that e-mail."), 400);
  }

  const resetPasswordToken = user.getResetPasswordTokenFromUser();
  await user.save();

  const resetPasswordUrl = `http://localhost:3000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const MailGenerator = new Mailgen({
    theme: "salted",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/"
    }
  });

  const response = {
    body: {
      greeting: "Dear User",
      intro:
        "We received a request to reset the password for your account ([User's Email Address]) with [Your Company's Name]. If you did not request this change, please ignore this email. No changes will be made to your account.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#DC4D2F",
          text: "Reset Password",
          link: resetPasswordUrl
        }
      },
      outro:
        "Thank you for taking the time to ensure the security of your account."
    }
  };
  const mail = MailGenerator.generate(response);
  const message = {
    from: process.env.SMTP_USER,
    to: resetEmail,
    subject: "Reset Password",
    html: mail
  };

  try {
    transporter.sendMail(message).then((info) => {
      return res.status(200).json({
        msg: "Email Sent",
        info: info,
        preview: nodemailer.getTestMessageUrl(info)
      });
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(
      new CustomError(
        `Email couldn't be Sent: ${err.response}`,
        err.responseCode
      )
    );
  }
});

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
    return res.status(404).json({ success: false, message: "User not found" });
  }
  //? IF NO CHANGES
  if (editInformation.email && editInformation.email === user.email) {
    return res
      .status(400)
      .json({ success: false, message: "No changes detected email" });
  }
  if (
    editInformation.password &&
    comparePassword(editInformation.password, user.password)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "No changes detected password" });
  }
  if (
    editInformation.profileImage &&
    editInformation.profileImage === user.profileImage
  ) {
    return res
      .status(400)
      .json({ success: false, message: "No changes detected profileImage" });
  }

  //? EDIT
  if (editInformation.email) {
    user.email = editInformation.email;
  }
  if (editInformation.password) {
    const salt = await bcrypt.genSalt(10);
    editInformation.password = await bcrypt.hash(
      editInformation.password,
      salt
    );
  }
  if (editInformation.profileImage) {
    user.profileImage = editInformation.profileImage;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    editInformation,
    {
      new: true,
      runValidators: true
    }
  );
  return res.status(200).json({
    success: true,
    message: JSON.stringify(editInformation),
    data: updatedUser
  });
});

module.exports = {
  register,
  login,
  logout,
  resetPassword,
  forgotPassword,
  editUser
};
