const mongoose = require("mongoose");

const OTPSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // token expires after 5 mins
  }
});

module.exports = mongoose.model("OTPAuth", OTPSchema);
