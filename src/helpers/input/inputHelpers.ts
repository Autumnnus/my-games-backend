import bcrypt from "bcryptjs";

const validateUserInput = (email, password) => {
  return email && password;
};

const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export { comparePassword, validateUserInput };
