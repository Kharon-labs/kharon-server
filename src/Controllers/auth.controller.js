const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const User = require("../Models/user.mongo");
const validator = require("email-validator");
const Token = require("../Models/token.mongo");
const OTP = require("../Models/OTPAuth.mongo");

require('dotenv').config();

const tokenExpiryTime = 15 * 60 * 1000; // 15 minutes for token expiration
const JWTSecret = process.env.JWT_SECRET;

const {
  signup,
  requestPasswordReset,
  resetPassword,
} = require("../Services/auth.service");

// IF YOU NEED TO RENDER THE PAGES LATER, USE res.render('page')
///@notice login deprecated
const loginController = async (req, res, next) => {
  const loginService = await login(req, res);
  return res.json(loginService);
};

const verifyOTPController = async (req, res, next) => {
  const { email, otp } = req.body;
  if (otp.length !== 6)
    return res.status(400).json({ message: "Invalid OTP entry, try again" });

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required.",
    });
  }

  // Validate email format
  if (!validator.validate(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email, please enter a valid email.",
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found in database" });
    }

    // Check if OTP exists for the user email
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found, please try again.",
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP, please try again.",
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpRecord.expiresAt) {
      await otpRecord.deleteOne();
      return res.status(400).json({
        success: false,
        message: "OTP has expired, please login again.",
      });
    }

    //delete existing token
    let storedToken = await Token.findOne({ userId:user._id });
    if(storedToken) {
      await storedToken.deleteOne();
    };

    // OTP is valid, generate JWT token
    const payload = {
      id: user._id,
      email: user.email
    }

    const token = JWT.sign(payload, JWTSecret, { expiresIn: "12h" });

    // Save token in database with expiration
    await new Token({
      userId: user._id,
      token: token,
      createdAt: Date.now(),
      expiresAt: Date.now() + tokenExpiryTime,
    }).save();

    //update user
      user.twoFAEnabled = true,
      user.isEmailVerified = true,
    
      await user.save();

    // Clear OTP record after successful verification
    await otpRecord.deleteOne();

    // Send response with token
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully, logging in...",
      token: token,
    });
  } catch (err) {
    console.error("Error during OTP verification:", err);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed, please try again.",
    });
  }
};

const signUpController = async (req, res) => {
  const signUpService = await signup(req);

  if(signUpService.status >= 400) {
    return res.status(signUpService.status).json({ message: signUpService.message });
  }

  return res.status(signUpService.status).json({
    message: signUpService.message,
    userId: signUpService.userId,
    email: signUpService.email,
  });
};

const resetPasswordRequestController = async (req, res, next) => {
  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );
  return res.json(requestPasswordResetService);
};

const resetPasswordController = async (req, res, next) => {
  const resetPasswordService = await resetPassword(req, res);
  return res.json(resetPasswordService);
};

module.exports = {
  verifyOTPController,
  signUpController,
  resetPasswordRequestController,
  resetPasswordController,
};
