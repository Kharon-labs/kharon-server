const bcrypt = require("bcrypt");
const User = require("../Models/user.mongo");
const validator = require("email-validator"); // For email validation
const passwordValidator = require("password-validator");
const { sendOTP } = require("../Controllers/sendOTP.controller");
const BlacklistedTokens = require("../Models/blacklistedTokens.mongo");

let schema = new passwordValidator();
// Define the password schema
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

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate email
    const isValidEmail = validator.validate(email);
    if (!isValidEmail) {
      return res
        .status(400)
        .json({ message: "Invalid email, please try again" });
    }

    // Validate password
    const isValidPassword = schema.validate(password);
    if (!isValidPassword) {
      return res
        .status(400)
        .json({ message: "Invalid password, please try again" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not registered on Kharon" });
    }

    if (user && user.is_deleted) {
      return res.status(404).json({
        message:
          "This email belongs to a deleted account. Please contact support for assistance.",
      });
    }

    // Compare password using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect password, please try again" });
    }

    // Send OTP
    const response = await sendOTP(email);
    if (response.status !== 200) {
      return res.status(response.status).json({ message: response.message });
    }

    // Redirect to verify OTP route
    return res.status(200).json({
      message: "Login successful, please verify OTP",
      redirect: "/verifyOTP",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
};

const logoutUser = async (req, res) => {
  const { email } = req.body;
  const token = req.header("token") || req.header("Authorization");
  try {
    if (!token) {
      return res.status(400).json({ message: "no token provided" });
    }

    let user = await User.findOne({ email });
    new BlacklistedTokens({
      userId: user.id,
      token,
    }).save();

    // localStorage.removeItem("authToken"); for frontend
    return res
      .status(200)
      .json({ message: "logout successful, redirecting...", redirect: "/" });
  } catch (err) {
    console.log("Log out error", err.message || err);
    return res.status(500).json({ message: "Logout failed"});
  }
};

module.exports = { loginUser, logoutUser };
