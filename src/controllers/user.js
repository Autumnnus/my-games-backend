const { s3Deletev2 } = require("../../s3Service");
const CustomError = require("../helpers/errors/CustomError");
const { findUserByIdOrError } = require("../helpers/functions/findById");
const Games = require("../models/Games");
const Screenshot = require("../models/Screenshot");
const User = require("../models/User");
const asyncErrorWrapper = require("express-async-handler");

const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
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
});

const getAllUsers = asyncErrorWrapper(async (_, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("ERROR: ", error);
    return next(new CustomError(`Error: ${error}`, 404));
  }
});

const deleteUser = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await findUserByIdOrError(req.user.id, next);
    if (user.role !== "admin") {
      return next(
        new CustomError(" You are not authorized to delete this user", 404)
      );
    }
    if (user.id === id) {
      return next(new CustomError("You can not delete yourself", 400));
    }
    const screenshots = await Screenshot.find({ user: id });
    for (const screenshot of screenshots) {
      const result = await s3Deletev2(screenshot.key);
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
});

module.exports = {
  getSingleUser,
  getAllUsers,
  deleteUser
};
