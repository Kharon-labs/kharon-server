const crypto = require("crypto");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const User = require("../Models/user.mongo");
const Token = require("../Models/token.mongo");
const validator = require("email-validator"); // for email validation
const passwordValidator = require("password-validator");
const sendEmail = require("../Utils/email/sendEmail.email");
// const { sendOTP } = require("../Controllers/sendOTP.controller");

require("dotenv").config();

const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT) || 10;
const clientURL = process.env.CLIENT_URL;
const JWTSecret = process.env.JWT_SECRET;
const tokenExpiryTime = 15 * 60 * 1000; // 15 minutes for password reset token

let schema = new passwordValidator();
//define the password schema
schema
  .is()
  .min(8)
  .is()
  .max(62)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .not()
  .spaces()
  .is()
  .not()
  .oneOf(["password", "Password", "password123", "Password123"]);

  const signup = async (req) => {
    const { email, password, password2 } = req.body;
    try {
      const validatedEmail = validator.validate(email);
      if (!validatedEmail) {
        return { status: 400, message: "Invalid email, please try again or signup" };
      }
  
      if (password !== password2) {
        return { status: 400, message: "Passwords do not match" };
      }
  
      const validatedPassword = schema.validate(password);
      if (!validatedPassword) {
        return { status: 400, message: "Invalid password, please try again" };
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { status: 400, message: "Email is already registered" };
      }
  
      const user = new User({
        email,
        password,
        twoFAEnabled: false,
        createdAt: Date.now(),
      });
  
      await user.save();
  
      const token = JWT.sign({ id: user._id }, JWTSecret, { expiresIn: "1h" });
  
      await new Token({
        userId: user._id,
        token,
      }).save();
  
      return {
        status: 201,
        message: "User created successfully",
        userId: user._id.toString(),
        email: user.email,
      };
    } catch (error) {
      console.error("Signup error:", error.message);
      return { status: 500, message: "Server error", error: error.message };
    }
  };
  
  
  
  const requestPasswordReset = async (email) => {
    if (!validator.validate(email)) {
      return {
        status: 400,
        message: "Invalid email, please try again or signup",
      };
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { status: 400, message: "User does not exist" };
      }
  
      // Remove existing token if any
      let token = await Token.findOne({ userId: user._id });
      if (token) await token.deleteOne();
  
      // Generate reset token
      let resetToken = crypto.randomBytes(32).toString("hex");
      console.log("Generated reset token:", resetToken);
      const hash = await bcrypt.hash(resetToken, bcryptSaltRounds);
      console.log("Generated reset token hash:", hash);
  
      // Save the token
      await new Token({
        userId: user._id,
        token: hash,
        createdAt: Date.now(),
        expiresAt: Date.now() + tokenExpiryTime,
      }).save();
  
      const link = `${clientURL}/api/v1/auth/resetPassword?token=${resetToken}&id=${user._id}`;
      console.log("Password reset link:", link);
      await sendEmail(
        user.email,
        "Password Reset Request",
        { link },
        "requestResetPassword.handlebars",
      );
  
      return { status: 200, message: "Password reset link sent", link };
    } catch (error) {
      console.error("Password reset request error:", error.message);
      return {
        status: 500,
        message: "Server error",
        error: error.message,
      };
    }
  };
  

  const resetPassword = async (req, res) => {
    const { email, password, password2, token, userId } = req.body;
    console.log("reset pwd token", token);
    if (!validator.validate(email)) {
      return {
        status: 400,
        message: "Invalid email, please try again",
      };
    }

    if (password !== password2) {
      return { status: 400, message: "Passwords do not match" };
    }
  
    if (!schema.validate(password)) {
      return {
        status: 400,
        message: "Invalid password, please try again",
      };
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { status: 404, message: "User not found" };
      }

  
      const passwordResetToken = await Token.findOne({ userId: userId });
      console.log("token 2", passwordResetToken.token);
      if (!passwordResetToken) {
        return {
          status: 400,
          message: "Password reset token not found",
        };
      }
  
      // Validate token and expiration
      const isValid = await bcrypt.compare(token, passwordResetToken.token);
      console.log("is valid token?", isValid);
      if (!isValid || Date.now() > passwordResetToken.expiresAt) {
        return {
          status: 400,
          message: "Invalid or expired password reset token",
        };
      }
  
      // Hash new password and update
      const hash = await bcrypt.hash(password, bcryptSaltRounds);
      await User.updateOne({ _id: user._id }, { password: hash });
  
      // Send confirmation email
      await sendEmail(
        user.email,
        "Password Reset Successful",
        {},
        "resetPassword.handlebars"
      );
  
      // Delete the token
      await passwordResetToken.deleteOne();
  
      return { status: 200, message: "Password reset successfully" };
    } catch (error) {
      console.error("Reset password error:", error.message);
      return {
        status: 500,
        message: "Server error",
        error: error.message,
      };
    }
  };
  

module.exports = {
  // login,
  signup,
  requestPasswordReset,
  resetPassword,
};
