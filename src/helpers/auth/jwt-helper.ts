type User = {
  generateJwtFromUser(): string;
  name: string;
  email: string;
  isVerified: boolean;
  role: string;
  _id: string;
};

const generateAccessToken = (user: any, res: any): any => {
  const token = user.generateJwtFromUser();
  const jwtCookie = process.env.JWT_COOKIE;

  if (!jwtCookie) {
    throw new Error("JWT_COOKIE environment variable is not defined.");
  }

  const expires = new Date(Date.now() + parseInt(jwtCookie) * 1000 * 60);

  return res
    .status(200)
    .cookie("access_token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + parseInt(jwtCookie) * 1000 * 60),
      secure: process.env.NODE_ENV === "development" ? false : true
    })
    .json({
      access_token: token,
      data: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        id: user._id
      }
    });
};

const isTokenIncluded = (req: any): boolean => {
  return (
    req.headers.authorization && req.headers.authorization.startsWith("Bearer:")
  );
};

const getAccessTokenFromHeader = (req: any): string => {
  const authorization = req.headers.authorization;
  const access_token = authorization?.split(" ")[1];
  return access_token;
};

export { generateAccessToken, getAccessTokenFromHeader, isTokenIncluded };
