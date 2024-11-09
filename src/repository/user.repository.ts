import User from "../models/User";

async function getUserById(id: string) {
  return await User.findById(id);
}

async function getUserByEmail(email: string) {
  return await User.findOne({ email });
}

export default {
  getUserById,
  getUserByEmail
};
