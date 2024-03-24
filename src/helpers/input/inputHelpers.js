const bcrypt = require("bcryptjs");

const validateUserInput = (email, password) => {
  return email && password; //* Eğer email veya password yoksa false dönecek varsa return edilecek
};

const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { validateUserInput, comparePassword };
