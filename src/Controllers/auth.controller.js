const {
  login,
  signup,
  requestPasswordReset,
  resetPassword,
} = require("../Services/auth.service");

const { verifyOTP } = require("../Controllers/verifyOTP.controller");

const loginController = async (req, res, next) => {
  const loginService = await login(req, res);
  return res.json(loginService);
};

const verifyOTPController = async (req, res, next) => {
  const { email, otp } = req.body;
  if (otp.length !== 6)
    return res
      .status(400)
      .json({ message: "Invalid OTP entry, try again" });
  const verifyOTPService = await verifyOTP(email, otp);
  return res.json(verifyOTPService);
};

const signUpController = async (req, res, next) => {
  const signUpService = await signup(req, res);
  return res.json(signUpService);
};

const resetPasswordRequestController = async (req, res, next) => {
  const requestPasswordResetService = await requestPasswordReset(
    req.body.email
  );
  return res.json(requestPasswordResetService);
};

const resetPasswordController = async (req, res, next) => {
  const resetPasswordService = await resetPassword(
    req.body.userId,
    req.body.token,
    req.body.password
  );
  return res.json(resetPasswordService);
};

module.exports = {
  loginController,
  verifyOTPController,
  signUpController,
  resetPasswordRequestController,
  resetPasswordController,
};
