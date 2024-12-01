const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../Models/OTPAuth.mongo");
const sendEmail = require("../Utils/email/sendEmail.email");

require("dotenv").config();

const bcryptSaltRound = parseInt(process.env.BCRYPT_SALT || 10);
async function sendOTP(email) {
  try {
    // Check for existing OTP
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      return {
        status: 400,
        message: "OTP already sent and still valid. Please check your email.",
      };
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Hash OTP and save to DB
    const otpHash = await bcrypt.hash(otp, bcryptSaltRound);
    const otpEntry = new OTP({
      email,
      otp: otpHash,
      createdAt: Date.now(),
    });
    await otpEntry.save();

    // Send OTP via email
    await sendEmail(
      email,
      "Kharon OTP",
      { otp },
      "sendOTP.handlebars"
    );

    console.log("OTP sent:", otp);
    return { status: 200, message: "OTP sent successfully" };
  } catch (err) {
    console.error("Error in sendOTP:", err.message);
    return { status: 500, message: "Failed to send OTP" };
  }
}

module.exports = {
  sendOTP,
};
