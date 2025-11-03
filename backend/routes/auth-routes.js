const express = require("express");
const { check } = require("express-validator");

const authControllers = require("../controllers/auth-controllers");
const {fileUpload} = require("../middleware/file-upload");

const router = express.Router();

router.post(
  "/signup",
  fileUpload.single("profileImage"),
  [
    check("fullName").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
    check("username").notEmpty().withMessage("The username should be unique."),
  ],
  authControllers.signup
);

router.post("/login", authControllers.login);

module.exports = router;
