const express = require("express");
const { login, getCurrentUser, changePassword } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/login")
  .post(login);

router.route("/me")
  .get(authenticateToken, getCurrentUser);

// 인증된 사용자가 본인의 비밀번호를 변경하는 엔드포인트
router.route("/password")
  .patch(authenticateToken, changePassword);

module.exports = router;
