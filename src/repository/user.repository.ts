import User from "../models/User";

async function getUserById(id: string) {
  return await User.findById(id);
}

export default {
  getUserById
};
