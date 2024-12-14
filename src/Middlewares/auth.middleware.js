require("dotenv").config();
const JWT = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("../Models/user.mongo");
const Token = require("../Models/token.mongo");
const BlacklistedTokens = require("../Models/blacklistedTokens.mongo");

const auth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("middleware: authenticated");
    return next();
  }
 
  const token =
    req.header("token") || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(400).json({
      error: "UNAUTHORIZED ACCESS",
      message: "Access denied. No token provided ",
    });
  }

  const email = req.body.email || req.query.email;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "No user found" });
  }

  let storedToken = await Token.findOne({ userId: user._id });

  if (!storedToken) {
    return res.status(400).json({ message: "No token found for this user" });
  }

  if (token !== storedToken.token) {
    return res.status(400).json({ message: "Tokens do not match" });
  }

  try {
    const isBlacklisted = await BlacklistedTokens.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    JWT.verify(token, JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(error.status).json({ message: error.message });
      } else {
        req.user = decoded;
        next();
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  auth,
};
