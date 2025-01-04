import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyUser = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    next(errorHandler(401, "Unauthorized Access"));
  }

  jwt.verify(token, process.env.JWT_SECRET_STRING, (err, user) => {
    if (err) {
      next(errorHandler(401, "Unauthorized Access"));
    }
    req.user = user;
    next();
  });
};
