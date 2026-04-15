const express = require("express");
const {
  getOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus,
} = require("../controllers/ordersController");
const { attachUserIfTokenPresent, authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeMiddleware");

const router = express.Router();
const adminOnly = [authenticateToken, authorizeAdmin];

router.get("/", ...adminOnly, getOrders);
router.get("/mine", authenticateToken, getMyOrders);
router.post("/", attachUserIfTokenPresent, createOrder);
router.put("/:orderId/status", ...adminOnly, updateOrderStatus);

module.exports = router;
