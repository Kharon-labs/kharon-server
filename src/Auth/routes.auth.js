const express = require("express");
const passport = require("./google.auth");
const passportLocal = require("./local.auth");
const { login } = require("../Services/auth.service");

const router = express.Router();

// check if user is logged in
// function checkLoggedIn(req, res, next) {
//   const isLoggedIn = req.isAuthenticated() && req.user;
//   if (!isLoggedIn) {
//     return res.status(401).json({
//       error: "You must be logged in",
//     });
//   }
//   next();
// }

//  Google OAUTH routes
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
    successRedirect: "/dashboard",
  }),
  (req, res) => {
    console.log("Google OAUTH callback");
  }
);

// local users route
router.post("/user/login", async (req, res, next) => {
  passportLocal.authenticate("local", async (err, user) => {

    if (err) {
      return next(err);
      }
      if (!user) {
        return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
        }
        
        try {
          const { email, password } = req.body;
          const response = await login(email, password, req, res);
         
      if (response.status !== 200) {
        return res.status(response.status).json({ message: response.message });
      }

      req.logIn(user, (err) => {
        if (err) {
          return {
            status: 401,
            success: false,
            message: "Login failed!",
          };
        }

        req.session.user = {
          email,
          isLoggedIn: true,
        };

        console.log(req.sessionID);
        req.session.save(function (err) {
          if (err) {
            console.error("Error saving session:", err);
            return res.status(500).json({ message: "Failed to save session" });
          } else {
            console.log(
              "Session saved successfully. Session ID:",
              req.session.user
            );
          }
        });

        return {
          status: 200,
          success: true,
          message: "Login successful",
          redirectTo: "/auth/verifyOTP",
        };
      });
    } catch (err) {
      console.log("Error during custom login: ", err);
      return { status: 500, message: err.message };
    }
  })(req, res, next);
});

// local users log out
router.post("/user/logout", async (req, res) => {
  try {
    await req.session.destroy();
    req.logOut((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  } catch (err) {
    return { status: 500, message: err.message };
  }
});

router.get("/failure", (req, res) => {
  return res.send("failed to log in");
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
