const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { mapDoc } = require("../utils/mapDoc");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "phone and password are required" });
    }

    const user = await User.findOne({ phone: String(phone).trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let isValid = await bcrypt.compare(password, user.password);

    // Compatibility path for legacy demo users stored in plain text.
    if (!isValid && user.password === password) {
      isValid = true;
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: String(user._id), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: mapDoc(user)
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { phone, fullName, password, role } = req.body;
    if (!phone || !fullName || !password || !role) {
      return res.status(400).json({ message: "phone, fullName, password and role are required" });
    }

    const allowedRoles = ["USER", "GARAGE_OWNER", "SUPPLIER", "ADMIN"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ phone: String(phone).trim() });
    if (existing) {
      return res.status(409).json({ message: "Phone already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone: String(phone).trim(),
      fullName: String(fullName).trim(),
      password: passwordHash,
      role
    });

    return res.status(201).json(mapDoc(user));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
