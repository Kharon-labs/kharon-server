const { Strategy } = require("passport-google-oauth20");
const OAuthUser = require("../Models/OAuthUser.mongo");
const passport = require("passport");
require("dotenv").config();

const config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_SECRET,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

async function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log(profile);
  const email = profile.emails[0].value;
  try {
    let user = await OAuthUser.findOne({ email });

    if (!user) {
      user = new OAuthUser({
        email,
      });

      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err, null);
    return { status: 500, message: err.message };
  }
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

passport.serializeUser((user, done) => {
    console.log("Serialized user ID:", user._id);
  done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
    console.log("Deserialized user ID:", _id); 
  try {
    const user = await OAuthUser.findById({ _id });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;