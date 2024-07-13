import { NextFunction, Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import CustomError from "../../helpers/errors/CustomError";
import Games from "../../models/Games";
import Screenshot from "../../models/Screenshot";
import User from "../../models/User";

const checkUserExist = asyncErrorWrapper(
  async (req: Request, _: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new CustomError("There is no such user with that id", 400));
    }
    next();
  }
);

const checkGameExist = asyncErrorWrapper(
  async (req: Request, _: Response, next: NextFunction) => {
    const game_id = req.params.id || req.params.game_id;
    const game = await Games.findById(game_id);
    if (!game) {
      return next(new CustomError("There is no such game with that id", 400));
    }
    next();
  }
);

const checkGameSSExist = asyncErrorWrapper(
  async (req: Request, _: Response, next: NextFunction) => {
    const game_id = req.params.id || req.params.game_id;
    const game = await Games.findById(game_id);
    const screenshot = await Screenshot.findById(req.params.screenshot_id);
    if (!game) {
      return next(new CustomError("There is no such game with that id", 400));
    }
    if (!screenshot) {
      return next(
        new CustomError("There is no such screenshot with that id", 400)
      );
    }
    next();
  }
);

const checkIsAdmin = asyncErrorWrapper(
  async (req: Request, _: Response, next: NextFunction) => {
    const user = await User.findById((req as any).user.id);
    const role = user?.role;
    if (role !== "admin") {
      return next(new CustomError("Only admins can access this route", 403));
    }
    next();
  }
);

export { checkGameExist, checkGameSSExist, checkIsAdmin, checkUserExist };
