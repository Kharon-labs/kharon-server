const express = require("express");
const passport = require("passport");
const User = require('../Models/user.mongo');
const BlacklistedTokens = require("../Models/blacklistedTokens.mongo");
const { auth } = require("../Middlewares/auth.middleware");
const { loginUser, logoutUser } = require("../Auth/local.auth");
const { dashboard } = require("../Controllers/dashboard.controller");
const { sendOTPWrapper } = require("../Middlewares/sendOTP.middleware");

const router = express.Router();

//  Google OAUTH routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/user/dashboard",
  }),
  async (req, res) => {
    console.log("Google OAUTH callback token:");
  }
);

router.get("/dashboard", auth, dashboard);

router.post("/sendOTP", sendOTPWrapper);

router.post("/login", loginUser);

router.post("/logout", auth, logoutUser);

router.post("/google/logout", auth, (req, res, next) => {
  req.logout(async (err) => {
    if (err) {
      return next(err);
    }
    
    let email = req.body.email;

    let token = req.header("token") || req.header("Authorization");
    if (!token) {
      return res.status(400).json({ message: "no token provided" });
    }

    let user = await User.findOne({ email });
    new BlacklistedTokens({
      userId: user._id,
      token,
    }).save();

    res.redirect("/");
  });
});

module.exports = router;
