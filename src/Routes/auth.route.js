const {
    loginController,
    verifyOTPController,
    signUpController,
    resetPasswordRequestController,
    resetPasswordController,
} = require("../Controllers/auth.controller");

const router = require("express").Router();

// router.post("/auth/login", loginController);
router.post("/auth/verifyOTP", verifyOTPController);
router.post("/auth/signup", signUpController);
router.post("/auth/resetPassword", resetPasswordController);
router.post("/auth/requestResetPassword", resetPasswordRequestController);

module.exports = router;