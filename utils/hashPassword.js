import bcryptjs from "bcryptjs";

export const getHashedPassword = (password) => {
  const salt = bcryptjs.genSaltSync();

  const hashedPassword = bcryptjs.hashSync(password, salt);
  return hashedPassword;
};
