import { isErrorData, isSendData } from '../helpers/functions/s3IsSendData';
import Games from '../models/Games';
import Screenshot from '../models/Screenshot';
import User from '../models/User';
import { ScreenshotData } from '../types/models';
import { s3Deletev2, s3Updatev2, s3Uploadv2 } from './s3Service';

type AddScreenShotServiceParams = {
  userId: string;
  gameId: string;
  type: 'text' | 'image';
  name?: string;
  url?: string;
  files?: Express.Multer.File[];
};

type EditScreenShotServiceParams = {
  userId: string;
  gameId: string;
  screenShotId: string;
  type: 'text' | 'image';
  name?: string;
  url?: string;
  file?: Express.Multer.File;
};

async function addScreenshotService(params: AddScreenShotServiceParams) {
  const { userId, gameId, type, name, url, files } = params;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const game = await Games.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  const role = user.role;
  const userScreenshots = await Screenshot.find({ user: userId });
  const gameScreenshots = await Screenshot.find({ game: gameId });

  if (type === 'text') {
    const screenshot = await Screenshot.create({
      name,
      url,
      user: userId,
      game: gameId,
      type: 'text',
    });
    user.screenshotSize = userScreenshots.length + 1;
    game.screenshotSize = gameScreenshots.length + 1;
    await user.save();
    await game.save();
    return screenshot;
  } else if (type === 'image') {
    if (role !== 'admin' && role !== 'vip') {
      throw new Error('You are not authorized to upload image');
    }
    if (!files || files.length === 0) {
      throw new Error('Please upload a file');
    }
    const screenshots = [];
    for (const file of files) {
      const awsFile = await s3Uploadv2(file);
      let screenshot: ScreenshotData | undefined;
      if (isErrorData(awsFile)) {
        if (awsFile.success === false) {
          throw new Error(awsFile.message);
        }
      } else if (isSendData(awsFile)) {
        screenshot = await Screenshot.create({
          name,
          url: awsFile.Location,
          user: userId,
          key: awsFile.Key,
          game: gameId,
          type: 'image',
        });
      }
      screenshots.push(screenshot);
      user.screenshotSize = userScreenshots.length + files.length;
      game.screenshotSize = gameScreenshots.length + files.length;
      await user.save();
      await game.save();
    }
    return screenshots;
  } else {
    throw new Error('Invalid type');
  }
}

async function editScreenshotService(params: EditScreenShotServiceParams) {
  const { userId, gameId, screenShotId, type, name, file, url } = params;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const game = await Games.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  const role = user.role;
  const screenshot = await Screenshot.findById(screenShotId);
  if (!screenshot) {
    throw new Error('Screenshot not found');
  }

  if (type === 'text') {
    screenshot.name = name ? name : undefined;
    screenshot.url = url || '';
    screenshot.type = 'text';
    await screenshot.save();
    return screenshot;
  } else if (type === 'image') {
    if (!file && role !== 'admin' && role !== 'vip') {
      throw new Error('You are not authorized to upload image');
    }
    let urlToUpdate = screenshot.url;
    let keyToUpdate = screenshot.key;
    if (file) {
      const awsFile = await s3Updatev2(screenshot.key || file.originalname, file);
      if (isErrorData(awsFile)) {
        if (!awsFile.success) {
          throw new Error(awsFile.message);
        }
      } else if (isSendData(awsFile)) {
        urlToUpdate = awsFile.Location;
        keyToUpdate = awsFile.Key;
      }
    }
    screenshot.name = name ? name : undefined;
    screenshot.url = urlToUpdate;
    screenshot.type = 'image';
    screenshot.key = keyToUpdate;
    await screenshot.save();
    return screenshot;
  } else {
    throw new Error('Invalid type');
  }
}

async function deleteScreenshotService(params: {
  userId: string;
  gameId: string;
  screenshotId: string;
}) {
  const { userId, gameId, screenshotId } = params;
  const screenshot = await Screenshot.findById(screenshotId);
  if (!screenshot) {
    throw new Error('Screenshot not found');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const game = await Games.findById(gameId);
  if (!game) {
    throw new Error('Game not found');
  }
  const userScreenshots = await Screenshot.find({ user: userId });
  const gameScreenshots = await Screenshot.find({ game: gameId });
  await s3Deletev2(screenshot.key || '');
  await Screenshot.findByIdAndDelete(screenshotId);
  user.screenshotSize = userScreenshots.length - 1;
  game.screenshotSize = gameScreenshots.length - 1;
  await user.save();
  await game.save();
  return `Screenshot ${screenshotId} has been deleted from game ${gameId}`;
}

async function getScreenshotService(game_id: string) {
  return await Screenshot.find({ game: game_id }).sort({
    _id: -1,
  });
}

async function getRandomScreenshotsService(count: string) {
  const allScreenshots = await Screenshot.find();
  const screenshotCount = count ? parseInt(count) : 1;
  if (allScreenshots.length === 0) {
    throw new Error('No screenshots found');
  }

  if (screenshotCount > allScreenshots.length) {
    throw new Error('Requested number of screenshots exceeds the available unique screenshots');
  }

  const selectedScreenshots = [];
  while (selectedScreenshots.length < screenshotCount) {
    const randomIndex = Math.floor(Math.random() * allScreenshots.length);
    const randomScreenshot = allScreenshots.splice(randomIndex, 1)[0];
    selectedScreenshots.push(randomScreenshot);
  }
  return selectedScreenshots;
}

export default {
  addScreenshotService,
  editScreenshotService,
  deleteScreenshotService,
  getScreenshotService,
  getRandomScreenshotsService,
};
