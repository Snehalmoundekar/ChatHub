const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "prefer_not"], required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    isOnline: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    deviceId: { type: String, default: null }


  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
