const User = require('../Models/user.mongo');
const { Strategy } = require("passport-google-oauth20");
require("dotenv").config();


const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_SECRET,
};

const AUTH_OPTIONS = {
  // callbackURL: "/user/auth/google/callback",
  callbackURL: "https://kharon-server.onrender.com/user/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

module.exports = function (passport) {
  
  async function verifyCallback(accessToken, refreshToken, profile, done) {
  
    const email = profile.emails[0].value;
    try {
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          twoFAEnabled: true,
          isEmailVerified: true,
          createdAt: Date.now(),
        });

        await user.save();
      }
      console.log("user is:", user);

      done(null, user);
    } catch (err) {
      done(err, null);
      return { status: 500, message: err.message };
    }
  }

  passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (_id, done) => {
    try {
      const user = await User.findById({ _id });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};