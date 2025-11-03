const HttpError = require("../models/http-error");
const User = require("../models/user");
const { uploadToCloudinary } = require('../middleware/file-upload');
const { validationResult } = require("express-validator");
const fs = require('fs');
const path = require('path');

const getAllUsersExceptCurrent = async (req, res, next) => {
  let filteredUsers;
  try {
    filteredUsers = await User.find().select("-password");
  } catch (err) {
    const error = new HttpError("could not found user", 500);
    return next(error);
  }

  res.json({
    users: filteredUsers.map((user) => user.toObject({ getters: true })),
  });
};

const getUserById = async (req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find user for the provided user id.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ user: user.toObject({ getters: true }) });
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { name } = req.body; // Assuming 'name' is fullName
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return next(new HttpError('Could not find user for the provided id.', 404));
    }
  } catch (err) {
    return next(new HttpError('Something went wrong, could not find user.', 500));
  }

  // Image handling
  let imageUrl = user.profileImage; // Keep old by default
  if (req.file) {
    if (process.env.NODE_ENV === 'production') {
      // Prod: Upload from buffer
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        console.log('Update: Cloudinary URL:', imageUrl);
      } catch (err) {
        return next(new HttpError('Image upload failed', 500));
      }
    } else {
      // Dev: Use local path
      imageUrl = req.file.path;
      // Optional: Delete old local file
      if (user.profileImage) {
        const oldPath = path.join(__dirname, '..', user.profileImage);
        fs.unlink(oldPath, (err) => {
          if (err) console.log('Delete old file error:', err);
        });
      }
    }
  }

  // Update fields
  user.fullName = name || user.fullName; // Fallback if no name provided
  user.profileImage = imageUrl;

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError('Could not update user, something went wrong.', 500));
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.getAllUsersExceptCurrent = getAllUsersExceptCurrent;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
