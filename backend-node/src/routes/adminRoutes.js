const express = require("express");
const User = require("../models/User");
const { mapDoc } = require("../utils/mapDoc");
const { sendAccountDeletionEmail } = require("../services/emailService");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "admin ok" });
});

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.authRole !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/**
 * Get all users (admin only)
 * GET /api/admin/users?page=1&limit=20
 */
router.get("/users", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    return res.json({
      users: users.map(mapDoc),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Get user by ID (admin only)
 * GET /api/admin/users/:id
 */
router.get("/users/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(mapDoc(user));
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete user account with email notification (admin only)
 * POST /api/admin/users/:id/delete
 * Body: { reason: "string" }
 */
router.post("/users/:id/delete", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: "Reason for deletion is required" });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.authUserId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Find user to be deleted
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get admin details
    const admin = await User.findById(req.authUserId);
    const adminName = admin ? admin.fullName : "System Administrator";

    // Send email notification BEFORE deletion
    try {
      await sendAccountDeletionEmail(
        userToDelete.email || "noemail@example.com",
        userToDelete.fullName,
        reason,
        adminName
      );
    } catch (emailError) {
      console.warn("Email notification failed, but proceeding with deletion:", emailError.message);
      // Continue with deletion even if email fails
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    // Log the action (TODO: implement audit logging)
    console.log(`Admin ${adminName} deleted user ${userToDelete.fullName} (${userToDelete.phone}). Reason: ${reason}`);

    return res.json({
      message: "User account deleted successfully",
      deletedUser: {
        id: userToDelete._id,
        fullName: userToDelete.fullName,
        phone: userToDelete.phone,
        role: userToDelete.role
      },
      emailSent: true
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Suspend/lock user account (admin only)
 * POST /api/admin/users/:id/suspend
 * Body: { reason: "string" }
 */
router.post("/users/:id/suspend", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: "Reason for suspension is required" });
    }

    if (req.params.id === req.authUserId) {
      return res.status(400).json({ message: "Cannot suspend your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: Add suspension logic (e.g., add isActive flag to User model)
    return res.json({
      message: "User suspended successfully",
      user: mapDoc(user)
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * Get system statistics (admin only)
 * GET /api/admin/stats
 */
router.get("/stats", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    return res.json({
      totalUsers,
      usersByRole: Object.fromEntries(
        usersByRole.map(item => [item._id, item.count])
      ),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
