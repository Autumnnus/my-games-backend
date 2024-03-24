const jwt = require("jsonwebtoken");

const generateAccessToken = (user,res) => {
  const token = user.generateJwtFromUser();
  return res
    .status(200)
    .cookie("access_token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + parseInt("10") * 1000 * 60),
      secure: false
    })
    .json({
      success: true,
      access_token: token,
      data: {
        name: user.name,
        email: user.email
      }
    });
};

const generateRefreshToken = (userInfo) => {
  return jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1y" });
};

module.exports = { generateAccessToken,generateRefreshToken };