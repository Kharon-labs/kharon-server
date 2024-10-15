const bcrypt = require('bcrypt');
const OTP = require("../Models/OTPAuth.mongo");
const User = require("../Models/user.mongo");
const validator = require("email-validator"); // for email validation

async function verifyOTP(email, otp) {
  const valid = validator.validate(email);
  if (!valid) {
    return {
      success: false,
      message: "Invalid email, Please enter valid email.",
    };
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found in database" };
    }

    // check if OTP exists for the user email
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return {
        success: false,
        message: "OTP not found, try again.",
      };
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
      return {
        success: false,
        message: "Invalid OTP, please try again.",
      };
    }

    // check if OTP is expired
    if (Date.now() > otpRecord.expiresAt) {
      await otpRecord.deleteOne();
      return {
        success: false,
        message: "OTP has expired, please login again.",
      };
    }

    return {
      success: true,
      message: "OTP verified successfully, logging in...",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "OTP verification failed, please try again.",
    };
  }
}

module.exports = { verifyOTP };
