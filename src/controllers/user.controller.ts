import { Request, Response } from "express";
import asyncErrorWrapper from "express-async-handler";
import { createResponse } from "../middlewares/error/CreateResponse";
import userService from "../services/user.service";
import { AuthenticatedRequest } from "./games.controller";

const getSingleUserController = asyncErrorWrapper(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const game = await userService.getSingleUserService(id);
      res.status(200).json(createResponse(game));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

const getAllUsersController = asyncErrorWrapper(async (_, res: Response) => {
  try {
    const users = await userService.getAllUsersService();
    res.status(200).json(createResponse(users));
  } catch (error) {
    res.status(404).json(createResponse(null, false, `Error: ${error}`));
  }
});

const deleteUserController = asyncErrorWrapper(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
      const data = await userService.deleteUserService(id);
      res.status(200).json(createResponse(data));
    } catch (error) {
      res.status(404).json(createResponse(null, false, `Error: ${error}`));
    }
  }
);

export { deleteUserController, getAllUsersController, getSingleUserController };
