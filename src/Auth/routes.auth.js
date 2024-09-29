const passport = require("./auth");
const express = require("express");

const router = express.Router();

function checkLoggedIn(req, res, next) {
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: "You must be logged in",
    });
  }
  next();
}

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
  }),
  (req, res) => {
    console.log("Google OAUTH callback");
  }
);

router.get("/failure", (req, res) => {
  return res.send("failed to log in");
});

router.get("/logout", (req, res) => {
  req.logout();
  return res.redirect("/");
});

module.exports = router;
