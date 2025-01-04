import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import { validateUsername } from "../utils/validateUsername.js";
import { getHashedPassword } from "../utils/hashPassword.js";
import User from "../models/user.model.js";

export const updateUser = async (req, res, next) => {
  const { username, password, profilePicture } = req.body;
  if (req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "User is unauthorized to make these changes")
    );
  }

  if (password && password.length < 6) {
    return next(errorHandler(400, "Password must be at least 6 characters"));
  }

  try {
    if (username) {
      validateUsername(username);
    }
  } catch (error) {
    return next(error);
  }

  try {
    let hashedPassword;
    if (password) {
      hashedPassword = getHashedPassword(password);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username,
          password: hashedPassword,
          profilePicture,
        },
      },
      { new: true }
    ).lean();

    delete updatedUser.password;
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!(req.user.id === req.params.userId || req.user.isAdmin)) {
    return next(
      errorHandler(401, "User is not authorized to perform this action")
    );
  }

  try {
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(401, "You are not authorized to perform this operation")
    );
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = req.query.limit || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsersCount = await User.countDocuments({});
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsersCount = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      users: usersWithoutPassword,
      totalUsersCount,
      lastMonthUsersCount,
    });
  } catch (error) {
    next(error);
  }
};
