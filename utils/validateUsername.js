import { errorHandler } from "./error.js";

export const validateUsername = (username, next) => {
  if (username.length < 7 || username.length > 20) {
    throw errorHandler(400, "Username must be between 7 and 20 characters");
  }

  if (username.includes(" ")) {
    throw errorHandler(400, "Username should not have space in it");
  }

  if (username !== username.toLocaleLowerCase()) {
    throw errorHandler(400, "Username should only be lowercase");
  }

  if (!username.match(/^[a-zA-Z0-9]+$/)) {
    throw errorHandler(400, "Username should only contain letters and numbers");
  }
};
