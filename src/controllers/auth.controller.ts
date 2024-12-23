import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import { generateAccessToken } from "../helpers/auth/jwt-helper";
import CustomError from "../helpers/errors/CustomError";
import { createResponse } from "../middlewares/error/CreateResponse";
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

const resetPasswordController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const { resetPasswordToken } = req.query;
    const { password } = req.body;
    try {
      const data = await authService.resetPasswordService(
        resetPasswordToken as string,
        password
      );
      res.status(200).json(createResponse(data));
    } catch (error) {
      console.error("ERROR: ", error);
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const editUserController = asyncErrorWrapper(
  async (req: AuthenticatedRequest, res: Response) => {
    const editInformation = req.body;
    const userId = req.user?.id;
    try {
      const data = await authService.editUserService(
        editInformation,
        userId as string
      );
      res.status(200).json(createResponse(data));
    } catch (error) {
      console.error("ERROR: ", error);
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const validateEmailController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const resetEmail = req.body.email;

    try {
      const data = await authService.validateEmailService(resetEmail);
      res.status(200).json(createResponse(data));
    } catch (err) {
      res.status(404).json(createResponse(null, false, `Error: ${err}`));
    }
  }
);

const verifyAccountController = asyncErrorWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { verificationToken } = req.query;
    try {
      const data = await authService.verifyAccountService(
        verificationToken as string
      );
      res.status(200).json(createResponse(data));
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

export {
  editUserController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
  validateEmailController,
  verifyAccountController
};
