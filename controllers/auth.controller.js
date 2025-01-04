import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import { validateUsername } from "../utils/validateUsername.js";
import { getHashedPassword } from "../utils/hashPassword.js";

//Sign Up
export const signUp = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    if (
      !username ||
      !password ||
      !email ||
      username == "" ||
      password == "" ||
      email == ""
    ) {
      next(errorHandler(400, "All fields are required"));
    }

    try {
      validateUsername(username);
    } catch (error) {
      return next(error);
    }
    const hashedPassword = getHashedPassword(password);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    await newUser.save();

    res.status(201).json("Signed up successfully");
  } catch (error) {
    next(error);
  }
};

//Sign In

export async function signIn(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User not Found"));
    }
    const isValidPassword = bcryptjs.compareSync(password, validUser.password);
    if (!isValidPassword) {
      return next(errorHandler(403, "Incorrect Password"));
    }

    const token = jwt.sign(
      { id: validUser.id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET_STRING
    );

    const { password: pass, ...rest } = validUser._doc;
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    console.log(error);
    next(error);
  }
}

//Adding users signed up using Google OAuth, to the database

export async function googleSignUp(req, res, next) {
  const { name, email, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET_STRING
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const username =
        name.toLocaleLowerCase().split(" ").join("") +
        Math.random().toString(9).slice(-4);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET_STRING
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
}

export const signout = async (req, res) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {}
};
