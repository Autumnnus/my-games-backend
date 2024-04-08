const User = require("../models/User");
const asyncErrorWrapper = require("express-async-handler");

const getSingleUser = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  return res.status(200).json({
    success: true,
    data: user
  });
});

const getAllUsers = asyncErrorWrapper(async (req, res, next) => {
  return res.status(200).json(res.queryResults);
});

const deleteUser = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  // await User.findByIdAndDelete(id);
  console.log(id);
  return res.status(200).json({
    success: true,
    message: "User deleted"
  });
});

module.exports = {
  getSingleUser,
  getAllUsers,
  deleteUser
};
