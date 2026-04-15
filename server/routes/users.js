const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
} = require("../controllers/usersController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { authorizeAdmin, authorizeSelfOrAdmin } = require("../middlewares/authorizeMiddleware");

const router = express.Router();
const adminOnly = [authenticateToken, authorizeAdmin];
const selfOrAdminByUserId = [authenticateToken, authorizeSelfOrAdmin("userId")];

router.route("/")
  .get(...adminOnly, getUsers)
  .post(createUser);

router.route("/:userId")
  .get(...selfOrAdminByUserId, getUser)
  .put(...selfOrAdminByUserId, updateUser)
  .delete(...selfOrAdminByUserId, deleteUser);

router.route("/:userId/addresses")
  .get(...selfOrAdminByUserId, getUserAddresses)
  .post(...selfOrAdminByUserId, createUserAddress);

router.route("/:userId/addresses/:addressId")
  .put(...selfOrAdminByUserId, updateUserAddress)
  .delete(...selfOrAdminByUserId, deleteUserAddress);

module.exports = router;
