const {
    loginController,
    verifyOTPController,
    signUpController,
    resetPasswordRequestController,
    resetPasswordController,
} = require("../Controllers/auth.controller");

const router = require("express").Router();

// router.post("/auth/login", loginController);
router.post("/verifyOTP", verifyOTPController);
router.post("/signup", signUpController);
router.post("/resetPassword", resetPasswordController);
router.post("/requestResetPassword", resetPasswordRequestController);

module.exports = router;