import { NextFunction, Request, Response } from "express";
import CustomError from "../../helpers/errors/CustomError";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!(err instanceof CustomError)) {
    err = new CustomError("Something went wrong", 500);
  }
  res.status(err.status || 500).json({
    message: err.message,
    status: err.status
  });
}

export default errorHandler;
