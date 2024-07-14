import { NextFunction, Request } from "express";
import asyncErrorWrapper from "express-async-handler";
import { s3Deletev2 } from "../../s3Service";
import CustomError from "../helpers/errors/CustomError";
import { findUserByIdOrError } from "../helpers/functions/findById";
import Games from "../models/Games";
import Screenshot from "../models/Screenshot";
import User from "../models/User";
import { AuthenticatedRequest } from "./games";

const getSingleUser = asyncErrorWrapper(
  async (req: Request, res: any, next: NextFunction) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const getAllUsers = asyncErrorWrapper(
  async (_, res: any, next: NextFunction) => {
    try {
      const users = await User.find().select("-password");
      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

const deleteUser = asyncErrorWrapper(
  async (req: AuthenticatedRequest, res: any, next: NextFunction) => {
    const { id } = req.params;
    try {
      const user = await findUserByIdOrError(req.user?.id || "", next);
      if (user?.role !== "admin") {
        return next(
          new CustomError(" You are not authorized to delete this user", 404)
        );
      }
      if (user.id === id) {
        return next(new CustomError("You can not delete yourself", 400));
      }
      const screenshots = await Screenshot.find({ user: id });
      for (const screenshot of screenshots) {
        const result = await s3Deletev2(screenshot.key || "");
        if (!result.success) {
          console.error(
            `Failed to delete S3 object with key ${screenshot.key}: ${result.message}`
          );
        }
      }
      await Games.deleteMany({ userId: id });
      await Screenshot.deleteMany({ user: id });
      await User.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: `User with id ${id} has been deleted`
      });
    } catch (error) {
      console.error("ERROR: ", error);
      return next(new CustomError(`Error: ${error}`, 404));
    }
  }
);

export { deleteUser, getAllUsers, getSingleUser };
