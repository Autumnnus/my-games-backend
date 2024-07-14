import bcrypt from "bcryptjs";

const validateUserInput = (email: string, password: string) => {
  return email && password;
};

const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export { comparePassword, validateUserInput };
