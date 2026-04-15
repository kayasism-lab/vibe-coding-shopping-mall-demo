const express = require("express");
const {
  getProducts,
  getPaginatedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeMiddleware");

const router = express.Router();
const adminOnly = [authenticateToken, authorizeAdmin];

router.route("/")
  .get(getProducts)
  .post(...adminOnly, createProduct);

router.get("/paginated", getPaginatedProducts);

router.route("/:productId")
  .get(getProduct)
  .put(...adminOnly, updateProduct)
  .delete(...adminOnly, deleteProduct);

module.exports = router;
