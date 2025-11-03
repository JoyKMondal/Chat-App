const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");
const { fileUpload } = require("../middleware/file-upload");

const usersControllers = require("../controllers/users-controllers");

const router = express.Router();

router.get("/", usersControllers.getAllUsersExceptCurrent);

router.get("/:uid", usersControllers.getUserById);

router.use(checkAuth);

router.patch(
  "/:uid",
  fileUpload.single("image"),
  [check("name").not().isEmpty()],
  usersControllers.updateUser
);

module.exports = router;
