import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import nodemailer from "nodemailer";
import { generateAccessToken } from "../helpers/auth/jwt-helper";
import CustomError from "../helpers/errors/CustomError";
import sendEmail from "../helpers/functions/sendMail";
import { comparePassword } from "../helpers/input/inputHelpers";
import { createResponse } from "../middlewares/error/CreateResponse";
import User from "../models/User";
import authService from "../services/auth.service";
dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const registerController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const { email, name, password } = req.body;
    try {
      const newUser = await authService.registerService(email, name, password);
      // res.status(200).json(createResponse(game));
      generateAccessToken(newUser, res);
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const loginController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await authService.loginService(email, password);
      // res.status(200).json(createResponse(game));
      generateAccessToken(user, res);
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const logoutController = asyncErrorWrapper(
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return res
        .status(200)
        .cookie("cookieName", "cookieValue", {
          httpOnly: true,
          expires: new Date(Date.now()),
          secure: process.env.NODE_ENV === "development" ? false : true
        })
        .json({
          success: true,
          message: "Logout Successful"
        }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const forgotPasswordController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const email = req.body.email;
    try {
      const data = await authService.forgotPasswordService(email);
      res.status(200).json(createResponse(data));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const resetPassword = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetPasswordToken } = req.query;
    const { password } = req.body;
    try {
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
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const editUser = asyncErrorWrapper(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const editInformation = req.body;
    try {
      // const user = await findUserByIdOrError(req.user?.id ||"", next);
      const user = await User.findById(req.user?.id);
      if (!user) {
        return next(new CustomError("User not found", 404));
      }
      //? IF NO CHANGES
      // if (editInformation.email && editInformation.email === user.email) {
      //   return res
      //     .status(400)
      //     .json({ success: false, message: "No changes detected email" });
      // }
      if (editInformation.name && editInformation.name === user?.name) {
        return res.status(400).json({
          success: false,
          message: "No changes detected name"
        }) as never;
      }
      if (
        editInformation.password &&
        comparePassword(editInformation.password, user.password)
      ) {
        return res.status(400).json({
          success: false,
          message: "No changes detected password"
        }) as never;
      }
      if (
        editInformation.profileImage &&
        editInformation.profileImage === user.profileImage
      ) {
        return res.status(400).json({
          success: false,
          message: "No changes detected profileImage"
        }) as never;
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
        editInformation.password = await bcrypt.hash(
          editInformation.password,
          salt
        );
      }
      if (editInformation.profileImage) {
        user.profileImage = editInformation.profileImage;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user?.id,
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
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const validateEmail = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const resetEmail = req.body.email;
    const user = await User.findOne({ email: resetEmail });
    if (!user) {
      return next(new CustomError("There is no user with that e-mail.", 400));
    }
    if (user.isVerified) {
      return next(new CustomError("This user already verified", 400));
    }

    const verificationToken = user.getVerificationTokenFromUser();
    await user.save();
    const verifyAccountUrl = `${process.env.FRONTEND_URL}/api/auth/verifyAccount?verificationToken=${verificationToken}`;

    try {
      const info = await sendEmail(
        user,
        "Verify Account",
        "We received a request to verify the email for your account. If you did not request this change, please ignore this email. No changes will be made to your account.",
        verifyAccountUrl
      );

      return res.status(200).json({
        msg: "Email Sent",
        info: info,
        preview: nodemailer.getTestMessageUrl(info)
      }) as never;
    } catch (err) {
      return next(err);
    }
  }
);

const verifyAccount = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { verificationToken } = req.query;
    try {
      if (!verificationToken) {
        return next(new CustomError("Invalid token", 400));
      }
      const user = await User.findOne({
        verificationToken: verificationToken,
        verificationExpire: { $gt: Date.now() }
      });
      if (!user) {
        return next(new CustomError("Invalid Token or Session Expired", 400));
      }
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpire = undefined;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Account Verification Process Success"
      }) as never;
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

export {
  editUser,
  forgotPasswordController as forgotPassword,
  loginController as login,
  logoutController as logout,
  registerController as register,
  resetPassword,
  validateEmail,
  verifyAccount
};
