const express = require("express");
const { getHomeContent, updateHomeContent } = require("../controllers/homeContentController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/authorizeMiddleware");

const router = express.Router();

router.get("/", getHomeContent);
router.put("/", authenticateToken, authorizeAdmin, updateHomeContent);

module.exports = router;
