const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { fullName, email, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    const error = new HttpError("Password don't match!", 500);
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Hashing password failed, please try again. ",
      500
    );
    return next(error);
  }

  let imageUrl;
  if (req.file) {
    if (process.env.NODE_ENV === "production") {
      // Prod: Upload from memory buffer
      const { uploadToCloudinary } = require("../middleware/file-upload");
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        console.log("Signup: Cloudinary URL:", imageUrl);
      } catch (err) {
        return next(new HttpError("Image upload failed", 500));
      }
    } else {
      // Dev: Use local path
      imageUrl = req.file.path;
    }
  } else {
    return next(new HttpError("No image provided", 422));
  }

  const createdUser = new User({
    fullName,
    email,
    username,
    password: hashedPassword,
    profileImage: imageUrl,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Saving User failed, please try again.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    token: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Finding user failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!existingUser) {
    const error = new HttpError(
      "User doesn't exists, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your password credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Password isnot valid, could not log you in. ",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Signing in failed, could not log you in. ",
      403
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    token: token,
  });
};

exports.signup = signup;
exports.login = login;
