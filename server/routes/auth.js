const express = require("express");
const { login, getCurrentUser } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/login")
  .post(login);

router.route("/me")
  .get(authenticateToken, getCurrentUser);

module.exports = router;
