const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "GARAGE_OWNER", "SUPPLIER", "ADMIN"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
