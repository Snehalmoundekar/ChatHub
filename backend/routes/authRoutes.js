const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const router = express.Router();

/* ---------------- REGISTER ---------------- */
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, email, phone, gender, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ msg: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username,
      email,
      phone,
      gender,
      password: hashed,
    });

    res.json({ msg: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------- LOGIN ---------------- */
router.post("/login", async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    // ❌ If already logged in from another device →
    if (user.isLoggedIn && user.deviceId !== deviceId) {
      return res.status(403).json({
        msg: "User already logged in on another device. Logout first."
      });
    }

    // ✔ Update session
    user.isLoggedIn = true;
    user.deviceId = deviceId;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ msg: "Login successful", token, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Logout allowed only from same device
    if (user.deviceId === deviceId) {
      user.isLoggedIn = false;
      user.deviceId = null;
      await user.save();
      return res.json({ msg: "Logged out successfully" });
    }

    // If another device tries logout
    return res.status(403).json({ msg: "Cannot logout from another device" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* ---------------- RESET PASSWORD ---------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ msg: "Password reset successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists in backend root
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g. 1731274893000.jpg
  },
});

const upload = multer({ storage });

// ✅ Update profile image route
router.put("/update-profile-image/:id", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image file uploaded" });
    }

    const userId = req.params.id;
    const imagePath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Profile image updated successfully", user: updatedUser });
  } catch (err) {
    console.error("🔥 Error in update-profile-image:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.put("/update-profile-details/:id", async (req, res) => {
  try {
    const { username, fullName, email, phone } = req.body;

    // ✅ Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email address" });
    }

    // ✅ Phone number validation (must be exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ msg: "Phone number must be 10 digits" });
    }

    // ✅ Check duplicate username excluding current user
    const userExists = await User.findOne({ username, _id: { $ne: req.params.id } });
    if (userExists) {
      return res.status(400).json({ msg: "Username already exists" });
    }

    // ✅ Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, fullName, email, phone },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile details" });
  }
});
module.exports = router;
