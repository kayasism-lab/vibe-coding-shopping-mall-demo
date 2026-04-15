const express = require("express");
const { confirmPayment } = require("../controllers/paymentsController");
const { attachUserIfTokenPresent } = require("../middlewares/authMiddleware");

const router = express.Router();

// 비로그인 사용자도 결제 가능하도록 선택적 인증 미들웨어 사용
router.post("/confirm", attachUserIfTokenPresent, confirmPayment);

module.exports = router;
