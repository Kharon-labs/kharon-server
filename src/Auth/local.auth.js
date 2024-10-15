const passport = require("passport");
const User = require("../Models/user.mongo");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    {usernameField: 'email'},
    async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
    try {
        const user = await User.findById({ _id });
        done(null, user);
    } catch(err) {
        done(err, null);
    }
});

module.exports = passport;