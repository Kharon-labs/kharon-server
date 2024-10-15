const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const OTP = require("../Models/OTPAuth.mongo");
const sendEmail = require("../Utils/email/sendEmail.email");

require("dotenv").config();

const bcryptSaltRound = parseInt(process.env.BCRYPT_SALT || 10);
async function sendOTP(req, res, email) {
  try {
    // check if there's an existing OTP request and enforce rate limiting
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      // if the generated OTP is not yet expired
      return res.status(400).json({
        success: false,
        message: "OTP already sent and still valid, Please check your email.",
      });
    }

    // if OTP has been generated before, generate a new one
    let isSaved;
    let otp;
    do {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      isSaved = await OTP.findOne({ otp });
    } while (isSaved);

    //hash OTP
    let otpHash = await bcrypt.hash(otp, bcryptSaltRound);

    // save OTP to DB
    const otpEntry = new OTP({
      email,
      otp: otpHash,
      createdAt: Date.now(),
    });

    await otpEntry.save();

    //send OTP to user email
    try {
      await sendEmail(
        email,
        "Login OTP",
        { otp },
        "../Utils/email/templates/sendOTP.handlebars"
      );
    } catch (emailErr) {
      // if sending email fails, delete otp from DB
      await otpEntry.deleteOne();
      return {
        success: false,
        message: "Failed to send OTP email. Please try again.",
      };
    }
    return res.status(200).json({ success: true, message: "OTP sent!", otp });
  } catch (err) {
    console.log(err);
    return { success: false, message: "Failed to send OTP, please try again." };
  }
}

module.exports = {
  sendOTP,
};
