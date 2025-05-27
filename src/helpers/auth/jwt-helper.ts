import { Request, Response } from 'express';
import { createResponse } from '../../middlewares/error/CreateResponse';
import { UserData } from '../../types/models';

type User = {
  generateJwtFromUser(): string;
  _id: string;
} & UserData;

const generateAccessToken = (user: User, res: Response) => {
  const token = user.generateJwtFromUser();
  const jwtCookie = process.env.JWT_COOKIE;

  if (!jwtCookie) {
    throw new Error('JWT_COOKIE environment variable is not defined.');
  }

  // const expires = new Date(Date.now() + parseInt(jwtCookie) * 1000 * 60);

  return res
    .status(200)
    .cookie('access_token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + parseInt(jwtCookie) * 1000 * 60),
      secure: process.env.NODE_ENV === 'development' ? false : true,
    })
    .json(
      createResponse({
        access_token: token,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        id: user._id,
      })
    );
};

const isTokenIncluded = (req: Request): boolean => {
  return (req.headers.authorization && req.headers.authorization.startsWith('Bearer:')) as never;
};

const getAccessTokenFromHeader = (req: Request): string => {
  const authorization = req.headers.authorization;
  const access_token = authorization?.split(' ')[1];
  return access_token as never;
};

export { generateAccessToken, getAccessTokenFromHeader, isTokenIncluded };
