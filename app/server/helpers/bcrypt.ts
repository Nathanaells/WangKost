import bcrypt from "bcryptjs";

const hashPassword = async (password: string): Promise<string> => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compareSync(password, hashedPassword);
};

export { hashPassword, comparePassword };
