import Games from '../models/Games';
import Screenshot from '../models/Screenshot';
import User from '../models/User';
import { s3Deletev2 } from './s3Service';

async function getSingleUserService(id: string) {
  return await User.findById(id);
}

async function getAllUsersService() {
  return await User.find().select('-password');
}

async function deleteUserService(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (user?.role !== 'admin') {
    throw new Error('You are not authorized to delete a user');
  }
  if (user.id === userId) {
    throw new Error('You cannot delete yourself');
  }
  const screenshots = await Screenshot.find({ user: userId });
  for (const screenshot of screenshots) {
    const result = await s3Deletev2(screenshot.key || '');
    if (!result.success) {
      console.error(`Failed to delete S3 object with key ${screenshot.key}: ${result.message}`);
    }
  }
  await Games.deleteMany({ userId });
  await Screenshot.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);
  return `User with id ${userId} has been deleted`;
}

export default {
  getSingleUserService,
  getAllUsersService,
  deleteUserService,
};
