const express = require("express");
const {
  getEditorials,
  getEditorial,
  getAdminEditorials,
  createEditorial,
  updateEditorial,
  reorderEditorials,
  deleteEditorial,
} = require("../controllers/editorialsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeMiddleware");

const router = express.Router();
const adminOnly = [authenticateToken, authorizeAdmin];

router.get("/", getEditorials);
router.get("/admin/list", ...adminOnly, getAdminEditorials);
router.post("/admin", ...adminOnly, createEditorial);
router.put("/admin/reorder", ...adminOnly, reorderEditorials);
router.put("/admin/:id", ...adminOnly, updateEditorial);
router.delete("/admin/:id", ...adminOnly, deleteEditorial);
router.get("/:slug", getEditorial);

module.exports = router;
